import { NextRequest, NextResponse } from "next/server";

const GEMINI_MODEL = "gemini-2.0-flash";

function getGeminiUrl(): string | null {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) return null;
  return `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`;
}

export async function POST(request: NextRequest) {
  const geminiUrl = getGeminiUrl();
  if (!geminiUrl) {
    return NextResponse.json(
      { error: "Serviço de IA não configurado" },
      { status: 503 }
    );
  }

  const body = await request.json();
  const { imageBase64, mimeType } = body as {
    imageBase64?: string;
    mimeType?: string;
  };

  if (!imageBase64 || !mimeType) {
    return NextResponse.json(
      { error: "Imagem não fornecida" },
      { status: 400 }
    );
  }

  // Limitar a 10MB de base64
  if (imageBase64.length > 10 * 1024 * 1024 * 1.37) {
    return NextResponse.json(
      { error: "Imagem muito grande (máximo 10 MB)" },
      { status: 413 }
    );
  }

  const parts = [
    {
      inline_data: {
        mime_type: mimeType,
        data: imageBase64,
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
    });

    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      console.error("Gemini OCR error:", geminiRes.status, err);
      return NextResponse.json(
        { error: `Erro no OCR (${geminiRes.status})` },
        { status: 502 }
      );
    }

    const data = await geminiRes.json();
    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "[Sem texto detectado]";

    return NextResponse.json({ text });
  } catch (e) {
    console.error("OCR error:", e);
    return NextResponse.json(
      { error: "Erro ao processar OCR" },
      { status: 500 }
    );
  }
}
