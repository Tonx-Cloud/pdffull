import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const renameSchema = z.object({
  filename: z.string().trim().min(1).max(200),
});

export async function PATCH(
  request: NextRequest,
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = renameSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Nome inválido" }, { status: 400 });
  }

  const { filename } = parsed.data;

  const { error } = await supabase
    .from("conversions")
    .update({ filename })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: "Erro ao renomear" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, filename });
}

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

  // Deletar do storage se tiver URL real
  if (conversion.pdf_url && !conversion.pdf_url.startsWith("local://")) {
    const pdfUrl = conversion.pdf_url;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

    if (pdfUrl.includes(supabaseUrl) && pdfUrl.includes("/storage/v1/object/public/pdfs/")) {
      // Supabase Storage — extrair path e deletar
      try {
        const { createClient: createAdmin } = await import("@supabase/supabase-js");
        const admin = createAdmin(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!);
        const path = pdfUrl.split("/storage/v1/object/public/pdfs/")[1];
        if (path) {
          await admin.storage.from("pdfs").remove([path]);
        }
      } catch (e) {
        console.error("Erro ao deletar do Supabase Storage:", e);
      }
    } else {
      // R2 — delete via S3
      try {
        const { DeleteObjectCommand, S3Client } = await import("@aws-sdk/client-s3");
        if (process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID) {
          const r2 = new S3Client({
            region: "auto",
            endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
            credentials: {
              accessKeyId: process.env.R2_ACCESS_KEY_ID!,
              secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
            },
          });
          const url = new URL(pdfUrl);
          const key = url.pathname.replace(/^\//, "");
          await r2.send(
            new DeleteObjectCommand({
              Bucket: process.env.R2_BUCKET_NAME || "pdffull-uploads",
              Key: key,
            })
          );
        }
      } catch (e) {
        console.error("Erro ao deletar do R2:", e);
      }
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
