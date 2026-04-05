"use client";

import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function PwaShareButton({ className }: { className?: string }) {
  const canShare =
    typeof navigator !== "undefined" && !!navigator.share;

  if (!canShare) return null;

  const handleShare = async () => {
    try {
      await navigator.share({
        title: "PDFfULL",
        text: "Converta fotos em PDF com um clique — grátis!",
        url: globalThis.location.origin,
      });
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        toast.error("Erro ao compartilhar");
      }
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className={`gap-2 ${className ?? ""}`}
      onClick={handleShare}
    >
      <Share2 className="h-4 w-4" />
      Compartilhar
    </Button>
  );
}
