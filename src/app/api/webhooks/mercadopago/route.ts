import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { createClient } from "@supabase/supabase-js";

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

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Mercado Pago envia notificações com type e data.id
  if (body.type !== "payment" || !body.data?.id) {
    return NextResponse.json({ received: true });
  }

  const paymentId = body.data.id;
  const paymentApi = getMpPaymentApi();

  // Buscar detalhes do pagamento na API do MP
  const payment = await paymentApi.get({ id: paymentId });

  if (!payment || payment.status !== "approved") {
    return NextResponse.json({ received: true });
  }

  const userId = payment.metadata?.user_id;
  if (!userId) {
    console.error("Webhook MP: user_id não encontrado no metadata");
    return NextResponse.json({ error: "user_id missing" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

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

  return NextResponse.json({ received: true, status: "processed" });
}
