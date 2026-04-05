import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { rateLimit, getClientIp } from "@/lib/security";
import { sanitizeUserPrompt, sanitizeAiOutput } from "@/lib/security";

const GEMINI_MODEL = "gemini-2.0-flash";

const analyzeSchema = z.object({
  pdfBase64: z.string().optional(),
  pdfUrl: z.string().url().optional(),
  messages: z
    .array(z.object({ role: z.string(), text: z.string().max(4000) }))
    .optional(),
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

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const geminiUrl = getGeminiUrl();
  if (!geminiUrl) {
    return NextResponse.json(
      { error: "Serviço de IA não configurado" },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = analyzeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { pdfBase64, pdfUrl, messages } = parsed.data;

  // Sanitizar texto de mensagens do usuário
  if (messages) {
    for (const msg of messages) {
      if (msg.role === "user") {
        msg.text = sanitizeUserPrompt(msg.text);
      }
    }
  }

  // Construir partes do conteúdo
  const parts: Array<Record<string, unknown>> = [];

  // Primeira mensagem: incluir o PDF
  if (pdfBase64) {
    parts.push({
      inline_data: {
        mime_type: "application/pdf",
        data: pdfBase64,
      },
    });
  } else if (pdfUrl && !pdfUrl.startsWith("local://")) {
    // Tentar baixar o PDF da URL e enviar inline
    try {
      const pdfRes = await fetch(pdfUrl);
      if (pdfRes.ok) {
        const buffer = await pdfRes.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        parts.push({
          inline_data: {
            mime_type: "application/pdf",
            data: base64,
          },
        });
      }
    } catch {
      // PDF não acessível, continuar só com texto
    }
  }

  // Se temos histórico de chat, usar como conversa
  if (messages && messages.length > 0) {
    const lastMessage = messages[messages.length - 1];
    parts.push({ text: lastMessage.text });
  } else {
    // Análise inicial
    parts.push({
      text: `Analise este documento PDF de forma completa e objetiva em português do Brasil. Organize sua resposta em seções:

1. **Resumo**: O que é este documento e qual sua finalidade
2. **Conteúdo Principal**: Os pontos mais importantes do documento
3. **Detalhes Técnicos**: Número de páginas detectado, idioma, tipo de documento (contrato, relatório, formulário, etc)
4. **Observações**: Qualquer informação relevante, problemas de legibilidade, ou sugestões

Seja conciso mas informativo. Se o PDF contiver imagens de texto (scan/foto), tente extrair e descrever o conteúdo visível.`,
    });
  }

  // Montar contents para Gemini (com histórico se houver)
  const contents: Array<Record<string, unknown>> = [];

  if (messages && messages.length > 1) {
    // Reconstruir o histórico de conversa
    // Primeira mensagem sempre inclui o PDF
    const firstParts: Array<Record<string, unknown>> = [];
    if (pdfBase64) {
      firstParts.push({
        inline_data: { mime_type: "application/pdf", data: pdfBase64 },
      });
    }
    firstParts.push({ text: messages[0].text });
    contents.push({ role: "user", parts: firstParts });

    // Histórico intermediário (pares user/model)
    for (let i = 1; i < messages.length; i++) {
      const msg = messages[i];
      contents.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.text }],
      });
    }
  } else {
    contents.push({ role: "user", parts });
  }

  try {
    const geminiRes = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 4096,
        },
      }),
    });

    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      console.error("Gemini API error:", geminiRes.status, err);
      return NextResponse.json(
        { error: `Erro ao analisar com IA (${geminiRes.status})` },
        { status: 502 }
      );
    }

    const data = await geminiRes.json();
    const rawText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Não foi possível gerar análise.";
    const text = sanitizeAiOutput(rawText);

    return NextResponse.json({ analysis: text });
  } catch (e) {
    console.error("Erro na análise IA:", e);
    return NextResponse.json(
      { error: "Erro interno na análise" },
      { status: 500 }
    );
  }
}
