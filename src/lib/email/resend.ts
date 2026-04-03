import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

const FROM_EMAIL = "PDFfULL <onboarding@resend.dev>";

export async function sendWelcomeEmail(to: string, name: string) {
  const resend = getResend();
  if (!resend) {
    console.warn("RESEND_API_KEY não configurada, email não enviado");
    return;
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: "Bem-vindo ao PDFfULL! 📄",
      html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; margin: 0; padding: 20px;">
  <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="background: #2563eb; padding: 24px; text-align: center;">
      <h1 style="color: #fff; margin: 0; font-size: 24px;">PDFfULL</h1>
      <p style="color: #bfdbfe; margin: 8px 0 0; font-size: 14px;">Conversor Instantâneo de PDF</p>
    </div>
    <div style="padding: 24px;">
      <h2 style="margin: 0 0 16px; font-size: 20px; color: #1e293b;">Olá, ${name}! 👋</h2>
      <p style="color: #475569; line-height: 1.6; margin: 0 0 16px;">
        Sua conta no <strong>PDFfULL</strong> foi criada com sucesso! Agora você pode converter fotos em PDF otimizado direto do seu celular.
      </p>
      <div style="background: #eff6ff; border-radius: 8px; padding: 16px; margin: 0 0 16px;">
        <h3 style="margin: 0 0 8px; font-size: 14px; color: #2563eb;">Seu plano: Gratuito</h3>
        <ul style="margin: 0; padding: 0 0 0 16px; color: #475569; font-size: 14px; line-height: 1.8;">
          <li>5 conversões por mês</li>
          <li>Histórico das conversões</li>
          <li>Compartilhe via WhatsApp, Email ou SMS</li>
          <li>Análise com IA (Gemini)</li>
        </ul>
      </div>
      <a href="https://pdffull.vercel.app/converter"
         style="display: block; background: #2563eb; color: #fff; text-decoration: none; text-align: center; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 16px;">
        Fazer minha primeira conversão →
      </a>
      <p style="color: #94a3b8; font-size: 12px; margin: 16px 0 0; text-align: center;">
        Quer conversões ilimitadas? <a href="https://pdffull.vercel.app/conta" style="color: #2563eb;">Conheça o plano Pro</a> por R$ 9,90/mês.
      </p>
    </div>
    <div style="border-top: 1px solid #e2e8f0; padding: 16px; text-align: center;">
      <p style="color: #94a3b8; font-size: 12px; margin: 0;">
        © ${new Date().getFullYear()} PDFfULL — 
        <a href="https://pdffull.vercel.app/termos" style="color: #94a3b8;">Termos</a> • 
        <a href="https://pdffull.vercel.app/privacidade" style="color: #94a3b8;">Privacidade</a>
      </p>
    </div>
  </div>
</body>
</html>`,
    });
  } catch (e) {
    console.error("Erro ao enviar email de boas-vindas:", e);
  }
}

export async function sendUpgradeEmail(to: string, name: string) {
  const resend = getResend();
  if (!resend) return;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: "Você agora é Pro! 🚀 PDFfULL",
      html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; margin: 0; padding: 20px;">
  <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="background: #7c3aed; padding: 24px; text-align: center;">
      <h1 style="color: #fff; margin: 0; font-size: 24px;">PDFfULL Pro ⚡</h1>
    </div>
    <div style="padding: 24px;">
      <h2 style="margin: 0 0 16px; font-size: 20px; color: #1e293b;">Parabéns, ${name}! 🎉</h2>
      <p style="color: #475569; line-height: 1.6;">
        Seu plano Pro foi ativado com sucesso! Agora você tem acesso a:
      </p>
      <ul style="color: #475569; line-height: 2; padding-left: 16px;">
        <li><strong>Conversões ilimitadas</strong></li>
        <li>Histórico completo na nuvem</li>
        <li>PDFs salvos no Cloudflare R2</li>
        <li>Suporte prioritário</li>
      </ul>
      <a href="https://pdffull.vercel.app/converter"
         style="display: block; background: #7c3aed; color: #fff; text-decoration: none; text-align: center; padding: 12px 24px; border-radius: 8px; font-weight: 600;">
        Converter agora →
      </a>
    </div>
    <div style="border-top: 1px solid #e2e8f0; padding: 16px; text-align: center;">
      <p style="color: #94a3b8; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} PDFfULL</p>
    </div>
  </div>
</body>
</html>`,
    });
  } catch (e) {
    console.error("Erro ao enviar email de upgrade:", e);
  }
}
