"use client";

import { useState, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Eye,
  Edit3,
  Download,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";

function getLineStyle(line: string) {
  if (line.startsWith("### ")) return { fontSize: 14, fontStyle: "bold" as const, extraSpacing: 3 };
  if (line.startsWith("## ")) return { fontSize: 16, fontStyle: "bold" as const, extraSpacing: 4 };
  if (line.startsWith("# ")) return { fontSize: 20, fontStyle: "bold" as const, extraSpacing: 5 };
  return { fontSize: 11, fontStyle: "normal" as const, extraSpacing: 0 };
}

interface MarkdownEditorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialText: string;
  filename: string;
}

export function MarkdownEditorModal({
  open,
  onOpenChange,
  initialText,
  filename,
}: MarkdownEditorModalProps) {
  const [text, setText] = useState(initialText);
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Texto copiado!");
  }, [text]);

  const handleExportPdf = async () => {
    if (!text.trim()) {
      toast.error("Nenhum texto para exportar");
      return;
    }
    setGenerating(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const margin = 15;
      const pageWidth = doc.internal.pageSize.getWidth() - margin * 2;
      const pageHeight = doc.internal.pageSize.getHeight() - margin;
      const lineHeight = 6;
      let y = margin;

      for (const line of text.split("\n")) {
        const { fontSize, fontStyle, extraSpacing } = getLineStyle(line);
        doc.setFontSize(fontSize);
        doc.setFont("helvetica", fontStyle);
        y += extraSpacing;

        const cleanLine = line.replace(/^#{1,3}\s/, "").replaceAll(/\*\*(.*?)\*\*/g, "$1");
        if (!cleanLine.trim()) { y += lineHeight / 2; continue; }

        for (const sl of doc.splitTextToSize(cleanLine, pageWidth)) {
          if (y > pageHeight) { doc.addPage(); y = margin; }
          doc.text(sl, margin, y);
          y += lineHeight;
        }
      }

      doc.save(filename.replace(/\.[^.]+$/, "") + "_editado.pdf");
      toast.success("PDF gerado com sucesso!");
    } catch (e) {
      console.error("Erro ao gerar PDF:", e);
      toast.error("Erro ao gerar PDF");
    }
    setGenerating(false);
  };

  // Preview simples de Markdown → HTML
  const renderPreview = () => {
    const html = text
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll(/^### (.+)$/gm, '<h3 class="text-base font-bold mt-3 mb-1">$1</h3>')
      .replaceAll(/^## (.+)$/gm, '<h3 class="text-lg font-bold mt-4 mb-1">$1</h3>')
      .replaceAll(/^# (.+)$/gm, '<h2 class="text-xl font-bold mt-4 mb-2">$1</h2>')
      .replaceAll(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replaceAll(/\*(.+?)\*/g, "<em>$1</em>")
      .replaceAll("\n", "<br>");
    return html;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Editor de Texto
          </DialogTitle>
          <p className="text-xs text-muted-foreground truncate">{filename}</p>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-1 border-b pb-2">
          <button
            onClick={() => setTab("edit")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition ${
              tab === "edit"
                ? "bg-blue-100 text-blue-700 font-medium"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            <Edit3 className="h-3.5 w-3.5" />
            Editar
          </button>
          <button
            onClick={() => setTab("preview")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition ${
              tab === "preview"
                ? "bg-blue-100 text-blue-700 font-medium"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            Preview
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-75 max-h-[55vh] overflow-y-auto">
          {tab === "edit" ? (
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full h-full min-h-75 rounded-lg border p-3 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="Texto extraído aparecerá aqui..."
            />
          ) : (
            <div
              className="prose prose-sm max-w-none p-3 text-sm"
              dangerouslySetInnerHTML={{ __html: renderPreview() }}
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {copied ? "Copiado" : "Copiar"}
          </Button>
          <Button
            size="sm"
            className="gap-1.5 bg-blue-600 hover:bg-blue-700 ml-auto"
            onClick={handleExportPdf}
            disabled={generating || !text.trim()}
          >
            {generating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            Exportar PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
