import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, getClientIp } from "@/lib/security";
import { sanitizeAiOutput } from "@/lib/security";

export const runtime = "nodejs";
export const maxDuration = 60;

const GEMINI_MODEL = "gemini-2.0-flash";

const ocrSchema = z.object({
  imageBase64: z.string().optional(),
  mimeType: z.string().optional(),
  pdfUrl: z.string().url().optional(),
});

function getGeminiUrl(): string | null {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) return null;
  return `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`;
}

export async function POST(request: NextRequest) {
  // Rate limit: 20 req/min por IP
  const ip = getClientIp(request.headers);
  if (!rateLimit(ip, 20, 60_000)) {
    return NextResponse.json(
      { error: "Muitas requisições. Tente novamente em 1 minuto." },
      { status: 429 }
    );
  }

  const geminiUrl = getGeminiUrl();
  if (!geminiUrl) {
    return NextResponse.json(
      { error: "Serviço de IA não configurado" },
      { status: 503 }
    );
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = ocrSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { imageBase64, mimeType, pdfUrl } = parsed.data;

  let finalBase64 = imageBase64;
  const finalMime = mimeType || "application/pdf";

  // Se recebeu URL em vez de base64, baixar e converter
  if (!finalBase64 && pdfUrl) {
    try {
      const pdfRes = await fetch(pdfUrl);
      if (!pdfRes.ok) {
        return NextResponse.json(
          { error: "Não foi possível acessar o PDF" },
          { status: 400 }
        );
      }
      const buffer = await pdfRes.arrayBuffer();
      finalBase64 = Buffer.from(buffer).toString("base64");
    } catch {
      return NextResponse.json(
        { error: "Erro ao baixar o PDF" },
        { status: 400 }
      );
    }
  }

  if (!finalBase64) {
    return NextResponse.json(
      { error: "Imagem não fornecida" },
      { status: 400 }
    );
  }

  // Limitar a 10MB de base64
  if (finalBase64.length > 10 * 1024 * 1024 * 1.37) {
    return NextResponse.json(
      { error: "Imagem muito grande (máximo 10 MB)" },
      { status: 413 }
    );
  }

  const parts = [
    {
      inline_data: {
        mime_type: finalMime,
        data: finalBase64,
      },
    },
    {
      text: `Extraia TODO o texto visível nesta imagem. Seja extremamente fiel ao original:
- Mantenha a formatação, quebras de linha e parágrafos exatamente como estão
- Não corrija erros de ortografia do original
- Não adicione texto que não está na imagem
- Se houver tabelas, reproduza-as com Markdown
- Se houver cabeçalhos, use # do Markdown
- Se não houver texto legível, responda apenas: "[Sem texto detectado]"

Retorne APENAS o texto extraído em formato Markdown, sem comentários adicionais.`,
    },
  ];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55_000);

    const geminiRes = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 8192,
        },
      }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      console.error("Gemini OCR error:", geminiRes.status, err);
      return NextResponse.json(
        { error: `Erro no OCR (${geminiRes.status})` },
        { status: 502 }
      );
    }

    const data = await geminiRes.json();
    const rawText =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "[Sem texto detectado]";
    const text = sanitizeAiOutput(rawText);

    return NextResponse.json({ text });
  } catch (e) {
    console.error("OCR error:", e);
    if (e instanceof Error && e.name === "AbortError") {
      return NextResponse.json(
        { error: "O OCR demorou mais que o permitido. Tente um arquivo menor." },
        { status: 504 }
      );
    }
    return NextResponse.json(
      { error: "Erro ao processar OCR" },
      { status: 500 }
    );
  }
}
