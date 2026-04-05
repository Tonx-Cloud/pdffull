import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createSubscription } from "@/lib/mercadopago/checkout";
import { rateLimit, getClientIp } from "@/lib/security";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);
  if (!rateLimit(ip, 10, 60_000)) {
    return NextResponse.json(
      { error: "Muitas requisições. Tente novamente em 1 minuto." },
      { status: 429 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  // Verificar se já é Pro
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  if (profile?.plan === "pro") {
    return NextResponse.json(
      { error: "Você já é Pro!" },
      { status: 400 }
    );
  }

  const { init_point } = await createSubscription(
    user.id,
    user.email!
  );

  return NextResponse.json({ url: init_point });
}

// GET para redirect direto (usado pelo botão de upgrade)
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
  }

  const { init_point } = await createSubscription(
    user.id,
    user.email!
  );

  return NextResponse.redirect(init_point);
}
