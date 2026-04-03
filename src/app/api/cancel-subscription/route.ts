import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  // Atualizar status da assinatura
  const { error: subError } = await supabase
    .from("subscriptions")
    .update({ status: "cancelled" })
    .eq("user_id", user.id)
    .eq("status", "active");

  if (subError) {
    console.error("Erro ao cancelar assinatura:", subError);
    return NextResponse.json({ error: "Erro ao cancelar" }, { status: 500 });
  }

  // Reverter plano para free
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ plan: "free" })
    .eq("id", user.id);

  if (profileError) {
    console.error("Erro ao atualizar perfil:", profileError);
    return NextResponse.json({ error: "Erro ao atualizar perfil" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
