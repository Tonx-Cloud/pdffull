import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment, PreApproval } from "mercadopago";
import { createClient } from "@supabase/supabase-js";
import { createHmac } from "crypto";
import { sendUpgradeEmail } from "@/lib/email/resend";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function getMpClient() {
  return new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN!,
  });
}

function verifyWebhookSignature(
  request: NextRequest,
  dataId: string
): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) return false;

  const xSignature = request.headers.get("x-signature");
  const xRequestId = request.headers.get("x-request-id");
  if (!xSignature || !xRequestId) return false;

  const parts = xSignature.split(",");
  let ts = "";
  let hash = "";

  for (const part of parts) {
    const [key, value] = part.trim().split("=");
    if (key === "ts") ts = value;
    if (key === "v1") hash = value;
  }

  if (!ts || !hash) return false;

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const hmac = createHmac("sha256", secret);
  hmac.update(manifest);
  const expectedHash = hmac.digest("hex");

  return expectedHash === hash;
}

async function logWebhookAttempt(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  data: {
    event_type: string;
    payment_id: string | null;
    status: string;
    ip: string | null;
    verified: boolean;
    details: string | null;
  }
) {
  await supabase.from("webhook_logs").insert(data).then(({ error }) => {
    if (error) console.error("Erro ao salvar webhook_log:", error);
  });
}

export async function POST(request: NextRequest) {
  const supabase = getSupabaseAdmin();
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || null;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    await logWebhookAttempt(supabase, {
      event_type: "invalid_json",
      payment_id: null,
      status: "rejected",
      ip,
      verified: false,
      details: "Body não é JSON válido",
    });
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const dataId = String((body.data as Record<string, unknown>)?.id || "");
  const eventType = String(body.type || "unknown");

  // Verificar assinatura HMAC — MP_WEBHOOK_SECRET é OBRIGATÓRIO em produção
  if (!process.env.MP_WEBHOOK_SECRET) {
    console.error("[SECURITY] MP_WEBHOOK_SECRET não configurado");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 503 }
    );
  }

  const verified = verifyWebhookSignature(request, dataId);

  if (!verified) {
    await logWebhookAttempt(supabase, {
      event_type: eventType,
      payment_id: dataId || null,
      status: "rejected",
      ip,
      verified: false,
      details: "Assinatura HMAC inválida",
    });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rotear por tipo de evento
  if (eventType === "subscription_preapproval" && dataId) {
    return handleSubscriptionEvent(supabase, dataId, ip, verified);
  }

  if (eventType === "payment" && dataId) {
    return handlePaymentEvent(supabase, dataId, ip, verified);
  }

  // Evento não tratado — aceitar silenciosamente
  await logWebhookAttempt(supabase, {
    event_type: eventType,
    payment_id: dataId || null,
    status: "ignored",
    ip,
    verified,
    details: `Tipo '${eventType}' não tratado`,
  });
  return NextResponse.json({ received: true });
}

/**
 * Trata eventos de assinatura (subscription_preapproval).
 * Quando a assinatura é autorizada, ativa o plano Pro.
 * Quando cancelada/pausada, reverte para Free.
 */
async function handleSubscriptionEvent(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  subscriptionId: string,
  ip: string | null,
  verified: boolean
) {
  const mpClient = getMpClient();
  const preApprovalApi = new PreApproval(mpClient);

  let subscription;
  try {
    subscription = await preApprovalApi.get({ id: subscriptionId });
  } catch (err) {
    await logWebhookAttempt(supabase, {
      event_type: "subscription_preapproval",
      payment_id: subscriptionId,
      status: "error",
      ip,
      verified,
      details: `Erro ao buscar assinatura: ${err instanceof Error ? err.message : "unknown"}`,
    });
    return NextResponse.json({ error: "Subscription fetch failed" }, { status: 500 });
  }

  const userId = subscription.external_reference;

  if (!userId) {
    await logWebhookAttempt(supabase, {
      event_type: "subscription_preapproval",
      payment_id: subscriptionId,
      status: "error",
      ip,
      verified,
      details: `external_reference ausente (payer_email: ${subscription.payer_email || "null"}) — rejeitado por segurança`,
    });
    return NextResponse.json({ error: "user_id missing" }, { status: 400 });
  }

  const mpStatus = subscription.status; // authorized, pending, paused, cancelled

  if (mpStatus === "authorized") {
    // Ativar plano Pro
    await supabase.from("subscriptions").upsert(
      {
        user_id: userId,
        mp_subscription_id: subscriptionId,
        plan: "pro",
        status: "active",
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      { onConflict: "user_id" }
    );

    await supabase.from("profiles").update({ plan: "pro" }).eq("id", userId);

    // Enviar email de upgrade
    const { data: profileData } = await supabase
      .from("profiles")
      .select("email, name")
      .eq("id", userId)
      .single();
    if (profileData?.email) {
      sendUpgradeEmail(
        profileData.email,
        profileData.name || profileData.email.split("@")[0]
      ).catch(() => {});
    }

    await logWebhookAttempt(supabase, {
      event_type: "subscription_preapproval",
      payment_id: subscriptionId,
      status: "processed",
      ip,
      verified,
      details: `Assinatura autorizada → Plano Pro ativado para ${userId}`,
    });
  } else if (mpStatus === "cancelled" || mpStatus === "paused") {
    // Desativar plano
    await supabase
      .from("subscriptions")
      .update({ status: "cancelled" })
      .eq("user_id", userId)
      .eq("status", "active");

    await supabase.from("profiles").update({ plan: "free" }).eq("id", userId);

    await logWebhookAttempt(supabase, {
      event_type: "subscription_preapproval",
      payment_id: subscriptionId,
      status: "processed",
      ip,
      verified,
      details: `Assinatura ${mpStatus} → Plano Free para ${userId}`,
    });
  } else {
    await logWebhookAttempt(supabase, {
      event_type: "subscription_preapproval",
      payment_id: subscriptionId,
      status: "ignored",
      ip,
      verified,
      details: `Status da assinatura: ${mpStatus}`,
    });
  }

  return NextResponse.json({ received: true, status: "processed" });
}

/**
 * Trata eventos de pagamento individual.
 * Cada cobrança recorrente da assinatura gera um evento payment.
 * Quando aprovado, garante que o plano Pro está ativo e renova o período.
 */
async function handlePaymentEvent(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  paymentIdStr: string,
  ip: string | null,
  verified: boolean
) {
  const paymentId = Number(paymentIdStr);
  const mpClient = getMpClient();
  const paymentApi = new Payment(mpClient);

  let payment;
  try {
    payment = await paymentApi.get({ id: paymentId });
  } catch (err) {
    await logWebhookAttempt(supabase, {
      event_type: "payment",
      payment_id: paymentIdStr,
      status: "error",
      ip,
      verified,
      details: `Erro ao buscar pagamento: ${err instanceof Error ? err.message : "unknown"}`,
    });
    return NextResponse.json({ error: "Payment fetch failed" }, { status: 500 });
  }

  if (!payment || payment.status !== "approved") {
    await logWebhookAttempt(supabase, {
      event_type: "payment",
      payment_id: paymentIdStr,
      status: "ignored",
      ip,
      verified,
      details: `Status: ${payment?.status || "null"}`,
    });
    return NextResponse.json({ received: true });
  }

  // Identificar o usuário via metadata, external_reference ou payer_email
  let userId =
    payment.metadata?.user_id || payment.external_reference || null;

  // Fallback: buscar user pelo payer_email se disponível
  if (!userId && payment.payer?.email) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", payment.payer.email)
      .single();
    if (profile) {
      userId = profile.id;
      console.log(
        `[webhook payment] user encontrado por payer.email: ${payment.payer.email} → ${userId}`
      );
    }
  }

  if (!userId) {
    await logWebhookAttempt(supabase, {
      event_type: "payment",
      payment_id: paymentIdStr,
      status: "error",
      ip,
      verified,
      details: "user_id ausente no metadata e external_reference",
    });
    return NextResponse.json({ error: "user_id missing" }, { status: 400 });
  }

  // Renovar período da assinatura
  const { error: subError } = await supabase.from("subscriptions").upsert(
    {
      user_id: userId,
      mp_subscription_id: String(paymentId),
      plan: "pro",
      status: "active",
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (subError) {
    console.error("Webhook MP: erro ao salvar subscription:", subError);
  }

  // Garantir plano Pro ativo
  await supabase.from("profiles").update({ plan: "pro" }).eq("id", userId);

  await logWebhookAttempt(supabase, {
    event_type: "payment",
    payment_id: paymentIdStr,
    status: "processed",
    ip,
    verified,
    details: `Pagamento aprovado → período renovado para ${userId}`,
  });

  return NextResponse.json({ received: true, status: "processed" });
}
