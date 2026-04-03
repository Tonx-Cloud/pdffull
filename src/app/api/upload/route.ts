import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { uploadToR2 } from "@/lib/r2/upload";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

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

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const filename = (formData.get("filename") as string) || "documento.pdf";
  const pages = parseInt((formData.get("pages") as string) || "1", 10);

  if (!file) {
    return NextResponse.json({ error: "Arquivo não enviado" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "Arquivo muito grande (máx 20 MB)" },
      { status: 413 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const pdfUrl = await uploadToR2(buffer, filename);

  // Registrar conversão
  const { error: insertError } = await supabase.from("conversions").insert({
    user_id: user.id,
    filename,
    pdf_url: pdfUrl,
    pages,
    size_bytes: file.size,
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

  return NextResponse.json({ url: pdfUrl, filename, pages });
}
