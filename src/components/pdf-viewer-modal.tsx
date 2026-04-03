"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText, Maximize2, Minimize2 } from "lucide-react";
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
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    if (!open) {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      setBlobUrl(null);
      setFullscreen(false);
      return;
    }

    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      setBlobUrl(url);
    }

    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, pdfBlob]);

  const viewUrl = blobUrl || (pdfUrl && !pdfUrl.startsWith("local://") ? pdfUrl : null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`flex flex-col ${
          fullscreen
            ? "sm:max-w-[95vw] max-h-[95vh]"
            : "sm:max-w-2xl max-h-[85vh]"
        }`}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span className="truncate">{filename}</span>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto h-7 w-7 p-0"
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

        <div className="flex-1 min-h-100">
          {viewUrl ? (
            <iframe
              src={viewUrl}
              className="w-full h-full min-h-100 rounded-lg border"
              style={{ height: fullscreen ? "80vh" : "60vh" }}
              title={`Visualizar ${filename}`}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
              <FileText className="h-12 w-12 opacity-30" />
              <p className="text-sm">PDF não disponível para visualização</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
