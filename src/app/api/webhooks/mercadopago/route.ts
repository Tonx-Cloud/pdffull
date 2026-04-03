import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { createClient } from "@supabase/supabase-js";
import { createHmac } from "crypto";
import { sendUpgradeEmail } from "@/lib/email/resend";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function getMpPaymentApi() {
  const mpClient = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN!,
  });
  return new Payment(mpClient);
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

  // Verificar assinatura HMAC se MP_WEBHOOK_SECRET estiver configurado
  const hasSecret = !!process.env.MP_WEBHOOK_SECRET;
  const verified = hasSecret ? verifyWebhookSignature(request, dataId) : false;

  if (hasSecret && !verified) {
    await logWebhookAttempt(supabase, {
      event_type: String(body.type || "unknown"),
      payment_id: dataId || null,
      status: "rejected",
      ip,
      verified: false,
      details: "Assinatura HMAC inválida",
    });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Mercado Pago envia notificações com type e data.id
  if (body.type !== "payment" || !dataId) {
    await logWebhookAttempt(supabase, {
      event_type: String(body.type || "unknown"),
      payment_id: dataId || null,
      status: "ignored",
      ip,
      verified,
      details: "Tipo não é payment ou sem data.id",
    });
    return NextResponse.json({ received: true });
  }

  const paymentId = Number(dataId);
  const paymentApi = getMpPaymentApi();

  let payment;
  try {
    payment = await paymentApi.get({ id: paymentId });
  } catch (err) {
    await logWebhookAttempt(supabase, {
      event_type: "payment",
      payment_id: dataId,
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
      payment_id: dataId,
      status: "ignored",
      ip,
      verified,
      details: `Status: ${payment?.status || "null"}`,
    });
    return NextResponse.json({ received: true });
  }

  const userId = payment.metadata?.user_id;
  if (!userId) {
    await logWebhookAttempt(supabase, {
      event_type: "payment",
      payment_id: dataId,
      status: "error",
      ip,
      verified,
      details: "user_id ausente no metadata",
    });
    return NextResponse.json({ error: "user_id missing" }, { status: 400 });
  }

  // Criar/atualizar assinatura
  const { error: subError } = await supabase.from("subscriptions").upsert(
    {
      user_id: userId,
      mp_subscription_id: String(paymentId),
      plan: "pro",
      status: "active",
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(
        new Date().setMonth(new Date().getMonth() + 1)
      ).toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (subError) {
    console.error("Webhook MP: erro ao salvar subscription:", subError);
  }

  // Atualizar plano do perfil
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ plan: "pro" })
    .eq("id", userId);

  if (profileError) {
    console.error("Webhook MP: erro ao atualizar profile:", profileError);
  }

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
    event_type: "payment",
    payment_id: dataId,
    status: "processed",
    ip,
    verified,
    details: `Plano Pro ativado para ${userId}`,
  });

  return NextResponse.json({ received: true, status: "processed" });
}
