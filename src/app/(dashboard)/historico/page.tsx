"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Conversion } from "@/types";
import {
  FileText,
  Download,
  Trash2,
  Sparkles,
  CheckSquare,
  Square,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareMenu } from "@/components/share-menu";
import { AiAnalysisModal } from "@/components/ai-analysis-modal";
import { toast } from "sonner";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HistoricoPage() {
  const [items, setItems] = useState<Conversion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [aiItem, setAiItem] = useState<Conversion | null>(null);
  const supabase = createClient();

  const fetchItems = useCallback(async () => {
    const { data } = await supabase
      .from("conversions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    setItems((data ?? []) as Conversion[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === items.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(items.map((c) => c.id)));
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting((prev) => new Set(prev).add(id));
    const res = await fetch(`/api/conversions/${id}`, { method: "DELETE" });
    if (res.ok) {
      setItems((prev) => prev.filter((c) => c.id !== id));
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      toast.success("PDF excluído");
    } else {
      toast.error("Erro ao excluir");
    }
    setDeleting((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    const confirmed = window.confirm(
      `Excluir ${selected.size} ${selected.size === 1 ? "PDF" : "PDFs"}?`
    );
    if (!confirmed) return;

    setBulkDeleting(true);
    const ids = Array.from(selected);
    const results = await Promise.allSettled(
      ids.map((id) => fetch(`/api/conversions/${id}`, { method: "DELETE" }))
    );

    const deleted = ids.filter(
      (_, i) => results[i].status === "fulfilled" && (results[i] as PromiseFulfilledResult<Response>).value.ok
    );
    setItems((prev) => prev.filter((c) => !deleted.includes(c.id)));
    setSelected(new Set());
    setBulkDeleting(false);
    toast.success(`${deleted.length} PDF(s) excluído(s)`);
  };

  const handleBulkShare = () => {
    const selectedItems = items.filter((c) => selected.has(c.id));
    const urls = selectedItems
      .filter((c) => c.pdf_url && !c.pdf_url.startsWith("local://"))
      .map((c) => c.pdf_url);

    if (urls.length === 0) {
      toast.error("Nenhum PDF selecionado possui link compartilhável");
      return;
    }

    const text = `📄 ${urls.length} PDFs do PDFfULL:\n${urls.join("\n")}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank"
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Histórico</h1>
          <p className="text-muted-foreground mt-1">Suas últimas conversões</p>
        </div>
        {items.length > 0 && (
          <button
            onClick={toggleSelectAll}
            className="text-sm text-blue-600 hover:underline"
          >
            {selected.size === items.length ? "Desmarcar todos" : "Selecionar todos"}
          </button>
        )}
      </div>

      {/* Barra de ações em lote */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 rounded-xl border bg-blue-50 border-blue-200 p-3">
          <span className="text-sm font-medium text-blue-700">
            {selected.size} selecionado(s)
          </span>
          <div className="flex gap-2 ml-auto">
            <Button
              size="sm"
              variant="outline"
              className="gap-1"
              onClick={handleBulkShare}
            >
              WhatsApp ({selected.size})
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
            >
              {bulkDeleting ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Trash2 className="h-3 w-3" />
              )}
              Excluir ({selected.size})
            </Button>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-40" />
          <p>Nenhuma conversão ainda.</p>
          <a
            href="/converter"
            className="text-blue-600 hover:underline text-sm mt-2 inline-block"
          >
            Fazer primeira conversão
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((c) => (
            <div
              key={c.id}
              className={`flex items-center gap-3 rounded-xl border p-4 bg-white transition ${
                selected.has(c.id) ? "ring-2 ring-blue-300 border-blue-300" : ""
              }`}
            >
              {/* Checkbox */}
              <button
                onClick={() => toggleSelect(c.id)}
                className="shrink-0 text-gray-400 hover:text-blue-600"
              >
                {selected.has(c.id) ? (
                  <CheckSquare className="h-5 w-5 text-blue-600" />
                ) : (
                  <Square className="h-5 w-5" />
                )}
              </button>

              {/* Info */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <FileText className="h-8 w-8 text-blue-600 shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium truncate">{c.filename}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.pages} {c.pages === 1 ? "página" : "páginas"} •{" "}
                    {formatBytes(c.size_bytes)} • {formatDate(c.created_at)}
                  </p>
                </div>
              </div>

              {/* Ações */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setAiItem(c)}
                  className="rounded-lg border p-2 hover:bg-purple-50 transition"
                  title="Análise com IA"
                >
                  <Sparkles className="h-5 w-5 text-purple-600" />
                </button>

                <ShareMenu
                  pdfUrl={c.pdf_url}
                  filename={c.filename}
                  variant="icon"
                />

                {c.pdf_url && !c.pdf_url.startsWith("local://") && (
                  <a
                    href={c.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border p-2 hover:bg-gray-50 transition"
                    title="Baixar"
                  >
                    <Download className="h-5 w-5" />
                  </a>
                )}

                <button
                  onClick={() => handleDelete(c.id)}
                  disabled={deleting.has(c.id)}
                  className="rounded-lg border p-2 hover:bg-red-50 transition text-red-500"
                  title="Excluir"
                >
                  {deleting.has(c.id) ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Trash2 className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal IA */}
      {aiItem && (
        <AiAnalysisModal
          open={!!aiItem}
          onOpenChange={(open) => !open && setAiItem(null)}
          pdfUrl={aiItem.pdf_url}
          filename={aiItem.filename}
        />
      )}
    </div>
  );
}
