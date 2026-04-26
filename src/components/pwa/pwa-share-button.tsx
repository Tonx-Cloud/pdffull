"use client";

import { useEffect, useState } from "react";
import { Share2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function PwaShareButton({ className }: Readonly<{ className?: string }>) {
  const [mounted, setMounted] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    // Detecção pós-hidratação: necessário para evitar mismatch SSR/CSR (React #418)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    setCanShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  const handleShare = async () => {
    const shareData = {
      title: "PDFfULL",
      text: "Converta fotos em PDF com um clique — grátis!",
      url: globalThis.location.origin,
    };

    if (canShare) {
      try {
        await navigator.share(shareData);
        return;
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        // Cai no fallback abaixo
      }
    }

    // Fallback desktop: copia link para a área de transferência
    try {
      await navigator.clipboard.writeText(shareData.url);
      toast.success("Link copiado para a área de transferência");
    } catch {
      toast.error("Não foi possível compartilhar");
    }
  };

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="sm"
        className={`gap-2 ${className ?? ""}`}
        disabled
        suppressHydrationWarning
      >
        <Share2 className="h-4 w-4" />
        Compartilhar
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className={`gap-2 ${className ?? ""}`}
      onClick={handleShare}
    >
      {canShare ? <Share2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      Compartilhar
    </Button>
  );
}
