/**
 * Módulo de integração com Mercado Pago Subscriptions.
 * Usa preapproval_plan (plano de assinatura genérico) + fetch direto na API REST.
 *
 * Fluxo:
 *  1. Cria (ou reutiliza) um preapproval_plan no MP (plano genérico, sem e-mail do pagador)
 *  2. Obtém o init_point do plano — URL de checkout hospedada pelo MP
 *  3. Redireciona o usuário para o init_point
 *  4. O MP cria o preapproval individual quando o usuário conclui o checkout
 *  5. O MP redireciona de volta para back_url com preapproval_id
 *  6. Webhook recebe subscription_preapproval para ativar o plano
 */

const MP_API = "https://api.mercadopago.com";

/** ID do plano no MP, cached em memória para evitar criar duplicatas */
let cachedPlanId: string | null = null;

function getAccessToken(): string {
  const token = (process.env.MP_ACCESS_TOKEN ?? "").trim();
  if (!token) throw new Error("MP_ACCESS_TOKEN não configurado");
  return token;
}

function getAppUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
}

/**
 * Cria um preapproval_plan no Mercado Pago (plano de assinatura recorrente).
 * Se já existir um plano em cache, reutiliza.
 */
async function getOrCreatePlan(): Promise<string> {
  if (cachedPlanId) {
    // Verificar se o plano ainda existe no MP
    const accessToken = getAccessToken();
    const check = await fetch(`${MP_API}/preapproval_plan/${cachedPlanId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (check.ok) return cachedPlanId;
    cachedPlanId = null;
  }

  const accessToken = getAccessToken();
  const appUrl = getAppUrl();

  const res = await fetch(`${MP_API}/preapproval_plan`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      reason: "PDFfULL Pro — Conversões Ilimitadas",
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: 9.9,
        currency_id: "BRL",
      },
      back_url: `${appUrl}/conta?subscription=success`,
      notification_url: `${appUrl}/api/webhooks/mercadopago?source_news=webhooks`,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    const msg =
      (data?.cause as Array<{ description?: string }>)?.[0]?.description ??
      data?.message ??
      "Erro ao criar plano de assinatura no Mercado Pago";
    console.error("[getOrCreatePlan] MP error:", JSON.stringify(data));
    throw new Error(msg);
  }

  cachedPlanId = data.id as string;
  console.log("[getOrCreatePlan] Plano criado:", cachedPlanId);
  return cachedPlanId;
}

/**
 * Cria uma assinatura individual (preapproval) para o usuário,
 * vinculada ao plano genérico, com external_reference = userId.
 * O MP gera um init_point exclusivo para essa assinatura.
 */
export async function createSubscription(
  userId: string,
  userEmail: string
): Promise<{ id: string; init_point: string }> {
  const planId = await getOrCreatePlan();
  const accessToken = getAccessToken();
  const appUrl = getAppUrl();

  // Criar preapproval individual com external_reference = userId
  const res = await fetch(`${MP_API}/preapproval`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      preapproval_plan_id: planId,
      payer_email: userEmail,
      external_reference: userId,
      back_url: `${appUrl}/conta?subscription=success`,
      reason: "PDFfULL Pro — Conversões Ilimitadas",
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
    // Limpar cache do plano se for erro de plano inválido
    if (res.status === 404 || res.status === 400) {
      cachedPlanId = null;
    }
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
