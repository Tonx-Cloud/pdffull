"use client";

import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Send, Loader2, User, Bot, ScanText } from "lucide-react";
import { MarkdownEditorModal } from "@/components/modals/markdown-editor-modal";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  text: string;
}

interface AiAnalysisModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Blob do PDF (para resultado da conversão) */
  pdfBlob?: Blob;
  /** URL do PDF (para histórico) */
  pdfUrl?: string | null;
  filename: string;
}

export function AiAnalysisModal({
  open,
  onOpenChange,
  pdfBlob,
  pdfUrl,
  filename,
}: AiAnalysisModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<"analyze" | "ocr">("analyze");
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrText, setOcrText] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  // Converter blob para base64 quando abrir
  useEffect(() => {
    if (!open) return;
    setMessages([]);
    setInput("");
    setPdfBase64(null);

    async function loadPdf() {
      if (pdfBlob) {
        // Limite de ~10MB para enviar como base64 
        if (pdfBlob.size > 10 * 1024 * 1024) {
          setMessages([
            {
              role: "assistant",
              text: "⚠️ O PDF é muito grande para análise (máximo 10 MB).",
            },
          ]);
          return;
        }

        // PDFs > 3MB: upload temporário ao Supabase e enviar só URL
        // (base64 de 3MB ≈ 4MB JSON, perto do limite do Vercel)
        if (pdfBlob.size > 3 * 1024 * 1024) {
          try {
            const { createClient } = await import("@/lib/supabase/client");
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              const tmpName = `ai-tmp/${user.id}/${Date.now()}.pdf`;
              const { error } = await supabase.storage
                .from("pdfs")
                .upload(tmpName, pdfBlob, { contentType: "application/pdf", upsert: true });
              if (!error) {
                const { data: urlData } = supabase.storage
                  .from("pdfs")
                  .getPublicUrl(tmpName);
                if (urlData?.publicUrl) {
                  doAnalysis(null, urlData.publicUrl);
                  return;
                }
              }
            }
          } catch {
            // Fallback: tenta enviar como base64 mesmo
          }
        }

        const buffer = await pdfBlob.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        let binary = "";
        const chunkSize = 8192;
        for (let i = 0; i < bytes.length; i += chunkSize) {
          binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
        }
        const base64 = btoa(binary);
        setPdfBase64(base64);
        // Auto-análise
        doAnalysis(base64, null);
      } else if (pdfUrl && !pdfUrl.startsWith("local://")) {
        // Para histórico, enviar apenas a URL — a API busca o conteúdo
        doAnalysis(null, pdfUrl);
      } else {
        setMessages([
          {
            role: "assistant",
            text: "⚠️ Não foi possível acessar o PDF para análise. O arquivo não está disponível na nuvem.",
          },
        ]);
      }
    }

    loadPdf();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const doAnalysis = async (
    base64: string | null,
    url: string | null,
    chatMessages?: Message[]
  ) => {
    setLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pdfBase64: base64,
          pdfUrl: url,
          messages: chatMessages,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erro na análise");
      }

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.analysis },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `❌ ${e instanceof Error ? e.message : "Erro ao analisar"}`,
        },
      ]);
    }
    setLoading(false);
  };

  const handleOcr = async () => {
    if (!pdfBlob && !pdfUrl) {
      toast.error("Nenhum PDF disponível para OCR");
      return;
    }
    setOcrLoading(true);
    setOcrText(null);
    try {
      let base64: string;
      let mime: string;

      if (pdfBlob) {
        // PDFs > 3MB: upload temporário ao Supabase e servir via URL
        if (pdfBlob.size > 3 * 1024 * 1024) {
          try {
            const { createClient } = await import("@/lib/supabase/client");
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              const tmpName = `ai-tmp/${user.id}/${Date.now()}-ocr.pdf`;
              const { error } = await supabase.storage
                .from("pdfs")
                .upload(tmpName, pdfBlob, { contentType: "application/pdf", upsert: true });
              if (!error) {
                const { data: urlData } = supabase.storage
                  .from("pdfs")
                  .getPublicUrl(tmpName);
                if (urlData?.publicUrl) {
                  // Baixar na API para converter a base64 lá
                  const res = await fetch("/api/ocr", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ pdfUrl: urlData.publicUrl, mimeType: "application/pdf" }),
                  });
                  if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error(data.error || "Erro no OCR");
                  }
                  const data = await res.json();
                  setOcrText(data.text);
                  setOcrLoading(false);
                  return;
                }
              }
            }
          } catch {
            // Fallback: tenta enviar como base64 mesmo
          }
        }

        const buffer = await pdfBlob.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        let binary = "";
        const chunkSize = 8192;
        for (let i = 0; i < bytes.length; i += chunkSize) {
          binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
        }
        base64 = btoa(binary);
        mime = "application/pdf";
      } else if (pdfUrl && !pdfUrl.startsWith("local://")) {
        const res = await fetch(pdfUrl);
        const buffer = await res.arrayBuffer();
        base64 = btoa(
          new Uint8Array(buffer).reduce(
            (acc, b) => acc + String.fromCharCode(b),
            ""
          )
        );
        mime = "application/pdf";
      } else {
        toast.error("PDF não acessível");
        setOcrLoading(false);
        return;
      }

      const res = await fetch("/api/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType: mime }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erro no OCR");
      }

      const data = await res.json();
      setOcrText(data.text);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao extrair texto");
    }
    setOcrLoading(false);
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", text: input.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    await doAnalysis(pdfBase64, pdfUrl ?? null, updated);
    inputRef.current?.focus();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Análise com IA
          </DialogTitle>
          <p className="text-xs text-muted-foreground truncate">{filename}</p>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-1 border-b pb-2">
          <button
            onClick={() => setActiveTab("analyze")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition ${
              activeTab === "analyze"
                ? "bg-purple-100 text-purple-700 font-medium"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Análise
          </button>
          <button
            onClick={() => {
              setActiveTab("ocr");
              if (!ocrText && !ocrLoading) handleOcr();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition ${
              activeTab === "ocr"
                ? "bg-blue-100 text-blue-700 font-medium"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            <ScanText className="h-3.5 w-3.5" />
            Extrair Texto
          </button>
        </div>

        {activeTab === "analyze" ? (
          <>
            {/* Chat area */}
        <div className="flex-1 overflow-y-auto space-y-3 py-2 min-h-[200px] max-h-[50vh]">
          {messages.length === 0 && loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Analisando documento...
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-2 ${
                msg.role === "user" ? "justify-end" : ""
              }`}
            >
              {msg.role === "assistant" && (
                <Bot className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
              )}
              <div
                className={`rounded-lg px-3 py-2 text-sm max-w-[90%] ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <div className="whitespace-pre-wrap break-words">{msg.text}</div>
              </div>
              {msg.role === "user" && (
                <User className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              )}
            </div>
          ))}

          {loading && messages.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Pensando...
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input de chat */}
        <div className="flex gap-2 pt-2 border-t">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Pergunte algo sobre o PDF..."
            disabled={loading}
            className="flex-1 h-10 rounded-lg border border-input bg-background px-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Button
            size="sm"
            className="h-10 w-10 bg-purple-600 hover:bg-purple-700"
            onClick={handleSend}
            disabled={loading || !input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
          </>
        ) : (
          /* OCR Tab */
          <div className="flex-1 flex flex-col gap-3 min-h-[200px]">
            {ocrLoading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="text-sm text-muted-foreground">
                  Extraindo texto com IA...
                </p>
              </div>
            ) : ocrText ? (
              <>
                <div className="flex-1 overflow-y-auto max-h-[50vh] rounded-lg border bg-gray-50 p-3">
                  <pre className="text-sm whitespace-pre-wrap font-mono">
                    {ocrText}
                  </pre>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => {
                      navigator.clipboard.writeText(ocrText);
                      toast.success("Texto copiado!");
                    }}
                  >
                    Copiar
                  </Button>
                  <Button
                    size="sm"
                    className="gap-1.5 bg-blue-600 hover:bg-blue-700 ml-auto"
                    onClick={() => setShowEditor(true)}
                  >
                    Editar e Exportar PDF
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
                <ScanText className="h-8 w-8 opacity-40" />
                <p className="text-sm">Clique para extrair texto do PDF</p>
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={handleOcr}
                >
                  Extrair Texto
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Markdown Editor Modal */}
        {ocrText && (
          <MarkdownEditorModal
            open={showEditor}
            onOpenChange={setShowEditor}
            initialText={ocrText}
            filename={filename}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
