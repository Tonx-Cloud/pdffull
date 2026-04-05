import { MercadoPagoConfig, PreApproval } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

const preApproval = new PreApproval(client);

/**
 * Cria uma assinatura recorrente (PreApproval) no Mercado Pago.
 * Modelo: sem plano associado, pagamento pendente.
 * O usuário é redirecionado ao MP para escolher o meio de pagamento.
 * Cobranças seguintes são automáticas (R$ 9,90/mês).
 */
export async function createSubscription(
  userId: string,
  userEmail: string
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // notification_url não está na tipagem do SDK, mas é aceito pela API REST
  // e é obrigatório para assinaturas (não suportado via painel "Suas integrações")
  const body = {
    reason: "PDFfULL Pro — Conversões Ilimitadas",
    external_reference: userId,
    payer_email: userEmail,
    auto_recurring: {
      frequency: 1,
      frequency_type: "months",
      transaction_amount: 9.9,
      currency_id: "BRL",
    },
    back_url: `${appUrl}/conta?subscription=success`,
    notification_url: `${appUrl}/api/webhooks/mercadopago?source_news=webhooks`,
    status: "pending",
  };

  const result = await preApproval.create({
    body: body as Parameters<typeof preApproval.create>[0]["body"],
  });

  return {
    id: result.id!,
    init_point: result.init_point!,
  };
}

/**
 * Cancela uma assinatura no Mercado Pago.
 */
export async function cancelSubscription(subscriptionId: string) {
  return preApproval.update({
    id: subscriptionId,
    body: { status: "cancelled" },
  });
}

/**
 * Busca detalhes de uma assinatura no Mercado Pago.
 */
export async function getSubscription(subscriptionId: string) {
  return preApproval.get({ id: subscriptionId });
}
