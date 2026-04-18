/**
 * Módulo de integração com Mercado Pago Subscriptions.
 * Cria preapproval avulsa (sem preapproval_plan) com external_reference = userId.
 *
 * Fluxo:
 *  1. POST /preapproval com external_reference = userId + auto_recurring inline
 *  2. MP retorna init_point — URL de checkout hospedada pelo MP
 *  3. Redireciona o usuário para o init_point
 *  4. O usuário paga (cartão/PIX/saldo) no checkout do MP
 *  5. MP envia webhook subscription_preapproval com o preapproval_id
 *  6. Webhook busca preapproval → external_reference → ativa o plano Pro
 *
 * IMPORTANTE: Não usar preapproval_plan_id — o MP exige card_token_id
 * ao vincular preapproval a um plano existente, o que impede o fluxo redirect.
 */

const MP_API = "https://api.mercadopago.com";

function getAccessToken(): string {
  const token = (process.env.MP_ACCESS_TOKEN ?? "").trim();
  if (!token) throw new Error("MP_ACCESS_TOKEN não configurado");
  return token;
}

function getAppUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
}

/**
 * Cria uma preapproval avulsa (assinatura recorrente) para o usuário.
 * O external_reference vincula ao userId do Supabase — independente do email do pagador.
 */
export async function createSubscription(
  userId: string,
  userEmail: string
): Promise<{ id: string; init_point: string }> {
  const accessToken = getAccessToken();
  const appUrl = getAppUrl();

  const res = await fetch(`${MP_API}/preapproval`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      payer_email: userEmail,
      external_reference: userId,
      back_url: `${appUrl}/conta?subscription=success`,
      notification_url: `${appUrl}/api/webhooks/mercadopago?source_news=webhooks`,
      reason: "PDFfULL Pro — Conversões Ilimitadas",
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: 9.9,
        currency_id: "BRL",
      },
      status: "pending",
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    const msg =
      (data?.cause as Array<{ description?: string }>)?.[0]?.description ??
      data?.message ??
      "Erro ao criar assinatura no Mercado Pago";
    console.error("[createSubscription] MP error:", JSON.stringify(data));
    throw new Error(msg);
  }

  const initPoint = data.init_point as string | undefined;

  if (!initPoint) {
    console.error("[createSubscription] Sem init_point:", JSON.stringify(data));
    throw new Error("Link de pagamento indisponível. Tente novamente.");
  }

  console.log(
    `[createSubscription] Assinatura criada: ${data.id} para user ${userId}`
  );

  return {
    id: data.id as string,
    init_point: initPoint,
  };
}

/**
 * Cancela uma assinatura no Mercado Pago (PUT /preapproval/{id}).
 */
export async function cancelSubscription(subscriptionId: string): Promise<void> {
  const accessToken = getAccessToken();

  const res = await fetch(`${MP_API}/preapproval/${subscriptionId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status: "cancelled" }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error("[cancelSubscription] Erro MP:", JSON.stringify(err));
    throw new Error("Erro ao cancelar assinatura no Mercado Pago");
  }
}

/**
 * Busca detalhes de uma assinatura no Mercado Pago.
 */
export async function getSubscription(subscriptionId: string) {
  const accessToken = getAccessToken();

  const res = await fetch(`${MP_API}/preapproval/${subscriptionId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error(`Erro ao buscar assinatura: ${res.status}`);
  }

  return res.json();
}
