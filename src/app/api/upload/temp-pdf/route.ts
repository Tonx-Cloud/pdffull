import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { uploadToR2 } from "@/lib/r2/upload";
import { rateLimit, getClientIp } from "@/lib/security";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB
const PDF_MAGIC = Buffer.from([0x25, 0x50, 0x44, 0x46]); // %PDF

/**
 * Endpoint anônimo para upload temporário de PDFs vindos do TWA Android
 * (Intent ACTION_VIEW / ACTION_SEND). Retorna URL pública que o /leitor
 * consome via ?pdfUrl=. Rate-limited por IP.
 */
export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);
  // Janela estreita: 10 uploads a cada 10 minutos por IP
  if (!rateLimit(`temp-pdf:${ip}`, 10, 10 * 60_000)) {
    return NextResponse.json(
      { error: "Muitos uploads. Tente novamente em alguns minutos." },
      { status: 429 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Formulário inválido" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Arquivo não enviado" }, { status: 400 });
  }

  if (file.type && file.type !== "application/pdf") {
    return NextResponse.json(
      { error: "Apenas PDFs são aceitos" },
      { status: 415 }
    );
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "Arquivo vazio" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "Arquivo muito grande (máx 20 MB)" },
      { status: 413 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  if (buffer.length < 4 || !buffer.subarray(0, 4).equals(PDF_MAGIC)) {
    return NextResponse.json(
      { error: "Arquivo não é um PDF válido" },
      { status: 415 }
    );
  }

  const uid = randomUUID();
  const safeName = `temp-${Date.now()}-${uid}.pdf`;

  try {
    const url = await uploadToR2(buffer, safeName);
    return NextResponse.json({ url });
  } catch (e) {
    console.error("temp-pdf upload error:", e);
    return NextResponse.json(
      { error: "Falha ao armazenar o PDF" },
      { status: 500 }
    );
  }
}
