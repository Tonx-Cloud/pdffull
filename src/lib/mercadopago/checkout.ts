import { MercadoPagoConfig, Preference } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

const preference = new Preference(client);

export async function createCheckoutPreference(
  userId: string,
  userEmail: string
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const result = await preference.create({
    body: {
      items: [
        {
          id: "pdffull-pro",
          title: "PDFfULL Pro — Conversões Ilimitadas",
          quantity: 1,
          unit_price: 9.9,
          currency_id: "BRL",
        },
      ],
      payer: {
        email: userEmail,
      },
      metadata: {
        user_id: userId,
      },
      back_urls: {
        success: `${appUrl}/conta?payment=success`,
        failure: `${appUrl}/conta?payment=failure`,
        pending: `${appUrl}/conta?payment=pending`,
      },
      auto_return: "approved",
      notification_url: `${appUrl}/api/webhooks/mercadopago`,
      statement_descriptor: "PDFFULL PRO",
    },
  });

  return {
    id: result.id!,
    init_point: result.init_point!,
  };
}
