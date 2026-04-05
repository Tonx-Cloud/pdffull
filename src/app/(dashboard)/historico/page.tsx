"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
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
  Pencil,
  Check,
  X,
  Eye,
  Merge,
} from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { ShareMenu } from "@/components/pwa/share-menu";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

const AiAnalysisModal = dynamic(
  () => import("@/components/modals/ai-analysis-modal").then((m) => m.AiAnalysisModal),
  { ssr: false }
);

const PdfViewerModal = dynamic(
  () => import("@/components/modals/pdf-viewer-modal").then((m) => m.PdfViewerModal),
  { ssr: false }
);

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
  const [merging, setMerging] = useState(false);
  const [aiItem, setAiItem] = useState<Conversion | null>(null);
  const [viewerItem, setViewerItem] = useState<Conversion | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const supabase = createClient();
  const t = useTranslations("History");

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
      toast.success(t("pdfDeleted"));
    } else {
      toast.error(t("deleteError"));
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
      t("confirmBulkDelete", { count: selected.size })
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
    toast.success(t("bulkDeleted", { count: deleted.length }));
  };

  const handleBulkShare = () => {
    const selectedItems = items.filter((c) => selected.has(c.id));
    const urls = selectedItems
      .filter((c) => c.pdf_url && !c.pdf_url.startsWith("local://"))
      .map((c) => c.pdf_url);

    if (urls.length === 0) {
      toast.error(t("noShareableLink"));
      return;
    }

    const text = `📄 ${urls.length} PDFs do PDFfULL:\n${urls.join("\n")}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank"
    );
  };

  const startRename = (c: Conversion) => {
    setEditingId(c.id);
    setEditName(c.filename);
  };

  const handleMerge = async () => {
    const selectedItems = items.filter((c) => selected.has(c.id));
    const urls = selectedItems
      .map((c) => c.pdf_url)
      .filter((url): url is string => !!url && !url.startsWith("local://"));

    if (urls.length < 2) {
      toast.error(t("mergeMinTwo"));
      return;
    }

    setMerging(true);
    try {
      const merged = await PDFDocument.create();
      for (const url of urls) {
        const res = await fetch(url);
        const bytes = await res.arrayBuffer();
        const doc = await PDFDocument.load(bytes);
        const pages = await merged.copyPages(doc, doc.getPageIndices());
        pages.forEach((p) => merged.addPage(p));
      }
      const pdfBytes = await merged.save();
      const blob = new Blob([pdfBytes as unknown as ArrayBuffer], { type: "application/pdf" });
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `merged_${urls.length}_pdfs.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      toast.success(t("mergeSuccess", { count: urls.length }));
    } catch {
      toast.error(t("mergeError"));
    } finally {
      setMerging(false);
    }
  };

  const handleRename = async () => {
    if (!editingId || !editName.trim()) return;
    const res = await fetch(`/api/conversions/${editingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: editName.trim() }),
    });
    if (res.ok) {
      setItems((prev) =>
        prev.map((c) =>
          c.id === editingId ? { ...c, filename: editName.trim() } : c
        )
      );
      toast.success(t("pdfRenamed"));
    } else {
      toast.error(t("renameError"));
    }
    setEditingId(null);
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
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground mt-1">{t("subtitle")}</p>
        </div>
        {items.length > 0 && (
          <button
            onClick={toggleSelectAll}
            className="text-sm text-blue-600 hover:underline"
          >
            {selected.size === items.length ? t("deselectAll") : t("selectAll")}
          </button>
        )}
      </div>

      {/* Barra de ações em lote */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 rounded-xl border bg-blue-50 border-blue-200 p-3">
          <span className="text-sm font-medium text-blue-700">
            {t("selected", { count: selected.size })}
          </span>
          <div className="flex gap-2 ml-auto flex-wrap">
            <Button
              size="sm"
              variant="outline"
              className="gap-1"
              onClick={handleMerge}
              disabled={merging}
            >
              {merging ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Merge className="h-3 w-3" />
              )}
              {t("mergePdfs")} ({selected.size})
            </Button>
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
              {t("bulkDelete")} ({selected.size})
            </Button>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-40" />
          <p>{t("noConversions")}</p>
          <a
            href="/converter"
            className="text-blue-600 hover:underline text-sm mt-2 inline-block"
          >
            {t("firstConversion")}
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((c) => (
            <div
              key={c.id}
              className={`rounded-xl border p-4 bg-white transition ${
                selected.has(c.id) ? "ring-2 ring-blue-300 border-blue-300" : ""
              }`}
            >
              {/* Linha 1: Checkbox + Ícone + Título/meta */}
              <div className="flex items-center gap-3">
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

                <FileText className="h-8 w-8 text-blue-600 shrink-0" />

                <div className="min-w-0 flex-1">
                  {editingId === c.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleRename();
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        className="h-7 rounded border px-2 text-sm font-medium w-full max-w-[200px]"
                        autoFocus
                      />
                      <button
                        onClick={handleRename}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1 text-gray-400 hover:bg-gray-50 rounded"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <p className="font-medium truncate">{c.filename}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {c.pages} {c.pages === 1 ? "página" : "páginas"} •{" "}
                    {formatBytes(c.size_bytes)} • {formatDate(c.created_at)}
                  </p>
                </div>
              </div>

              {/* Linha 2: Botões de ação */}
              <div className="flex items-center gap-1 mt-3 pl-8 flex-wrap">
                <button
                  onClick={() => startRename(c)}
                  className="rounded-lg border p-2 hover:bg-blue-50 transition"
                  title="Renomear"
                >
                  <Pencil className="h-4 w-4 text-blue-600" />
                </button>

                {c.pdf_url && !c.pdf_url.startsWith("local://") && (
                  <button
                    onClick={() => setViewerItem(c)}
                    className="rounded-lg border p-2 hover:bg-green-50 transition"
                    title="Visualizar PDF"
                  >
                    <Eye className="h-4 w-4 text-green-600" />
                  </button>
                )}

                <button
                  onClick={() => setAiItem(c)}
                  className="rounded-lg border p-2 hover:bg-purple-50 transition"
                  title="Análise com IA"
                >
                  <Sparkles className="h-4 w-4 text-purple-600" />
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
                    <Download className="h-4 w-4" />
                  </a>
                )}

                <button
                  onClick={() => handleDelete(c.id)}
                  disabled={deleting.has(c.id)}
                  className="rounded-lg border p-2 hover:bg-red-50 transition text-red-500"
                  title="Excluir"
                >
                  {deleting.has(c.id) ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
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

      {/* Modal Leitor PDF */}
      {viewerItem && (
        <PdfViewerModal
          open={!!viewerItem}
          onOpenChange={(open) => !open && setViewerItem(null)}
          pdfUrl={viewerItem.pdf_url}
          filename={viewerItem.filename}
        />
      )}
    </div>
  );
}
