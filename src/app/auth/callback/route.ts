import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendWelcomeEmail } from "@/lib/email/resend";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/converter";
  const termsAccepted = searchParams.get("terms") === "1";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        if (termsAccepted) {
          await supabase
            .from("profiles")
            .update({ terms_accepted_at: new Date().toISOString() })
            .eq("id", user.id);
        }

        // Enviar email de boas-vindas para novos usuários
        const { data: profile } = await supabase
          .from("profiles")
          .select("created_at, name")
          .eq("id", user.id)
          .single();

        if (profile) {
          const createdAt = new Date(profile.created_at);
          const now = new Date();
          // Se criou a conta há menos de 2 minutos, é novo
          if (now.getTime() - createdAt.getTime() < 120_000) {
            const name = profile.name || user.email?.split("@")[0] || "usuário";
            sendWelcomeEmail(user.email!, name).catch(() => {});
          }
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Erro: redirecionar para login com mensagem
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
