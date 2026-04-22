"use client";

import { useEffect, useState, useRef } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import {
  DialogHeader,
  DialogTitle,
  DialogOverlay,
  DialogPortal,
} from "@/components/ui/dialog";
import { FileText, Maximize2, Minimize2, Loader2, ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

const PdfViewer = dynamic(
  () => import("@/components/leitor/pdf-viewer").then((m) => m.PdfViewer),
  { ssr: false }
);

interface PdfViewerModalProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly pdfBlob?: Blob;
  readonly pdfUrl?: string | null;
  readonly filename: string;
}

export function PdfViewerModal({
  open,
  onOpenChange,
  pdfBlob,
  pdfUrl,
  filename,
}: PdfViewerModalProps) {
  const [viewUrl, setViewUrl] = useState<string | null>(null);
  const [viewBlob, setViewBlob] = useState<Blob | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [loading, setLoading] = useState(false);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!open) {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
      setViewUrl(null);
      setViewBlob(null);
      setFullscreen(false);
      setLoading(false);
      return;
    }

    if (pdfBlob) {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
      const url = URL.createObjectURL(pdfBlob);
      blobUrlRef.current = url;
      setViewUrl(url);
      setViewBlob(pdfBlob);
      return;
    }

    if (pdfUrl && !pdfUrl.startsWith("local://")) {
      setLoading(true);
      fetch(pdfUrl)
        .then((res) => res.blob())
        .then((blob) => {
          if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
          const url = URL.createObjectURL(blob);
          blobUrlRef.current = url;
          setViewUrl(url);
          setViewBlob(blob);
        })
        .catch(() => {
          setViewUrl(pdfUrl);
          setViewBlob(null);
        })
        .finally(() => setLoading(false));
      return;
    }

    setViewUrl(null);
    setViewBlob(null);
  }, [open, pdfBlob, pdfUrl]);

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, []);

  const openInNewTab = () => {
    if (viewUrl) globalThis.open(viewUrl, "_blank");
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Popup
          data-slot="dialog-content"
          className={cn(
            "fixed top-1/2 left-1/2 z-50 flex flex-col -translate-x-1/2 -translate-y-1/2 gap-3 rounded-xl bg-popover p-4 text-sm text-popover-foreground ring-1 ring-foreground/10 outline-none data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
            "w-[calc(100%-1rem)]",
            fullscreen
              ? "h-[95vh] max-w-[95vw]"
              : "h-[85vh] max-w-3xl"
          )}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <span className="truncate flex-1">{filename}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={openInNewTab}
                title="Abrir em nova aba"
                disabled={!viewUrl}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setFullscreen(!fullscreen)}
              >
                {fullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => onOpenChange(false)}
                title="Fechar"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 min-h-0 overflow-hidden rounded-lg border">
            {loading && (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="text-sm">Carregando PDF...</p>
              </div>
            )}
            {!loading && viewBlob && <PdfViewer blob={viewBlob} />}
            {!loading && !viewBlob && viewUrl && (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
                <FileText className="h-12 w-12 opacity-30" />
                <p className="text-sm text-center">
                  Não foi possível carregar o PDF.
                </p>
                <Button onClick={openInNewTab} className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Abrir em nova aba
                </Button>
              </div>
            )}
            {!loading && !viewUrl && (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
                <FileText className="h-12 w-12 opacity-30" />
                <p className="text-sm">PDF não disponível para visualização</p>
              </div>
            )}
          </div>
        </DialogPrimitive.Popup>
      </DialogPortal>
    </DialogPrimitive.Root>
  );
}
