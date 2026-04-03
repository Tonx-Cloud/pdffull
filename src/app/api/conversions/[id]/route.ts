import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  // Buscar conversão (RLS garante que só o dono pode ver)
  const { data: conversion, error: fetchError } = await supabase
    .from("conversions")
    .select("id, pdf_url, user_id")
    .eq("id", id)
    .single();

  if (fetchError || !conversion) {
    return NextResponse.json({ error: "Conversão não encontrada" }, { status: 404 });
  }

  if (conversion.user_id !== user.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  // Deletar do R2 se tiver URL real
  if (conversion.pdf_url && !conversion.pdf_url.startsWith("local://")) {
    try {
      const { DeleteObjectCommand, S3Client } = await import("@aws-sdk/client-s3");
      const r2 = new S3Client({
        region: "auto",
        endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID!,
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
        },
      });
      // Extrair key da URL
      const url = new URL(conversion.pdf_url);
      const key = url.pathname.replace(/^\//, "");
      await r2.send(
        new DeleteObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME || "pdffull-uploads",
          Key: key,
        })
      );
    } catch (e) {
      console.error("Erro ao deletar do R2:", e);
      // Continua para deletar do banco mesmo se R2 falhar
    }
  }

  // Deletar do banco
  const { error: deleteError } = await supabase
    .from("conversions")
    .delete()
    .eq("id", id);

  if (deleteError) {
    return NextResponse.json({ error: "Erro ao excluir" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
