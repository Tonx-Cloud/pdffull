"use client";

import { useEffect, useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText, Maximize2, Minimize2, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PdfViewerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pdfBlob?: Blob;
  pdfUrl?: string | null;
  filename: string;
}

export function PdfViewerModal({
  open,
  onOpenChange,
  pdfBlob,
  pdfUrl,
  filename,
}: PdfViewerModalProps) {
  const [viewUrl, setViewUrl] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [loading, setLoading] = useState(false);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!open) {
      // Revogar blob URL anterior ao fechar
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
      setViewUrl(null);
      setFullscreen(false);
      setLoading(false);
      return;
    }

    // Se temos blob, criar URL
    if (pdfBlob) {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
      const url = URL.createObjectURL(pdfBlob);
      blobUrlRef.current = url;
      setViewUrl(url);
      return;
    }

    // Se temos pdfUrl remota, buscar como blob para garantir carregamento
    if (pdfUrl && !pdfUrl.startsWith("local://")) {
      setLoading(true);
      fetch(pdfUrl)
        .then((res) => res.blob())
        .then((blob) => {
          if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
          const url = URL.createObjectURL(blob);
          blobUrlRef.current = url;
          setViewUrl(url);
        })
        .catch(() => {
          // Fallback: usar URL direta
          setViewUrl(pdfUrl);
        })
        .finally(() => setLoading(false));
      return;
    }

    setViewUrl(null);
  }, [open, pdfBlob, pdfUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange} disablePointerDismissal>
      <DialogContent
        className={`flex flex-col ${
          fullscreen
            ? "sm:max-w-[95vw] max-h-[95vh]"
            : "sm:max-w-2xl max-h-[85vh]"
        }`}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 pr-8">
            <FileText className="h-5 w-5 text-blue-600 shrink-0" />
            <span className="truncate flex-1">{filename}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 shrink-0"
              onClick={() => viewUrl && window.open(viewUrl, "_blank")}
              title="Abrir em nova aba"
              disabled={!viewUrl}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 shrink-0"
              onClick={() => setFullscreen(!fullscreen)}
            >
              {fullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-hidden">
          {loading ? (
            <div
              className="flex flex-col items-center justify-center text-muted-foreground gap-3"
              style={{ height: fullscreen ? "80vh" : "60vh" }}
            >
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-sm">Carregando PDF...</p>
            </div>
          ) : viewUrl ? (
            <div className="flex flex-col gap-2 h-full">
              <iframe
                src={viewUrl}
                className="w-full rounded-lg border bg-gray-50"
                style={{ height: fullscreen ? "78vh" : "56vh" }}
                title={`Visualizar ${filename}`}
              />
              <p className="text-xs text-center text-muted-foreground pb-1">
                PDF não apareceu?{" "}
                <button
                  onClick={() => window.open(viewUrl, "_blank")}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Abrir em nova aba
                </button>
              </p>
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center text-muted-foreground gap-3"
              style={{ height: "60vh" }}
            >
              <FileText className="h-12 w-12 opacity-30" />
              <p className="text-sm">PDF não disponível para visualização</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
