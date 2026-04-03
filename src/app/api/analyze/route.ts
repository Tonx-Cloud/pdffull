import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "Serviço de IA não configurado" },
      { status: 503 }
    );
  }

  const body = await request.json();
  const { pdfBase64, pdfUrl, messages } = body as {
    pdfBase64?: string;
    pdfUrl?: string;
    messages?: Array<{ role: string; text: string }>;
  };

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
    const geminiRes = await fetch(GEMINI_URL, {
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
      console.error("Gemini API error:", err);
      return NextResponse.json(
        { error: "Erro ao analisar com IA" },
        { status: 502 }
      );
    }

    const data = await geminiRes.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Não foi possível gerar análise.";

    return NextResponse.json({ analysis: text });
  } catch (e) {
    console.error("Erro na análise IA:", e);
    return NextResponse.json(
      { error: "Erro interno na análise" },
      { status: 500 }
    );
  }
}
