import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  // Verificar limites
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, conversions_this_month, conversions_reset_at")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });
  }

  // Reset mensal
  const resetAt = new Date(profile.conversions_reset_at);
  let usedThisMonth = profile.conversions_this_month;
  if (new Date() >= resetAt) {
    usedThisMonth = 0;
    await supabase
      .from("profiles")
      .update({
        conversions_this_month: 0,
        conversions_reset_at: new Date(
          new Date().getFullYear(),
          new Date().getMonth() + 1,
          1
        ).toISOString(),
      })
      .eq("id", user.id);
  }

  if (profile.plan === "free" && usedThisMonth >= 5) {
    return NextResponse.json(
      { error: "Limite mensal atingido. Faça upgrade para o Pro." },
      { status: 429 }
    );
  }

  const body = await request.json();
  const { filename, pdf_url, pages, size_bytes } = body;

  if (!filename || !pdf_url || !pages) {
    return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
  }

  // Registrar conversão
  const { error: insertError } = await supabase.from("conversions").insert({
    user_id: user.id,
    filename: String(filename).slice(0, 200),
    pdf_url: String(pdf_url),
    pages: Number(pages),
    size_bytes: Number(size_bytes) || 0,
  });

  if (insertError) {
    console.error("Erro ao registrar conversão:", insertError);
    return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 });
  }

  // Incrementar contador
  await supabase
    .from("profiles")
    .update({ conversions_this_month: usedThisMonth + 1 })
    .eq("id", user.id);

  return NextResponse.json({ url: pdf_url, filename, pages });
}
