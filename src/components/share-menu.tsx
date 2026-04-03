"use client";

import { useState, useRef, useEffect } from "react";
import { Share2, MessageCircle, Mail, Smartphone, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ShareMenuProps {
  /** URL pública do PDF (para histórico) */
  pdfUrl?: string | null;
  /** Blob do PDF (para resultado da conversão) */
  pdfBlob?: Blob;
  filename: string;
  variant?: "default" | "icon";
}

export function ShareMenu({ pdfUrl, pdfBlob, filename, variant = "default" }: ShareMenuProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const shareText = `${filename} - Gerado com PDFfULL`;
  const shareUrl = pdfUrl && !pdfUrl.startsWith("local://") ? pdfUrl : "";

  const handleNativeShare = async () => {
    if (!navigator.share) return false;
    try {
      if (pdfBlob) {
        const file = new File([pdfBlob], filename, { type: "application/pdf" });
        await navigator.share({ title: "PDFfULL", text: shareText, files: [file] });
      } else if (shareUrl) {
        await navigator.share({ title: "PDFfULL", text: shareText, url: shareUrl });
      }
      setOpen(false);
      return true;
    } catch {
      return false;
    }
  };

  const handleWhatsApp = () => {
    const text = shareUrl ? `${shareText}\n${shareUrl}` : shareText;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    setOpen(false);
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`PDF: ${filename}`);
    const body = encodeURIComponent(shareUrl ? `${shareText}\n\n${shareUrl}` : shareText);
    const a = document.createElement("a");
    a.href = `mailto:?subject=${subject}&body=${body}`;
    a.click();
    setOpen(false);
  };

  const handleSMS = () => {
    const text = shareUrl ? `${shareText} ${shareUrl}` : shareText;
    const a = document.createElement("a");
    a.href = `sms:?body=${encodeURIComponent(text)}`;
    a.click();
    setOpen(false);
  };

  const handleCopyLink = async () => {
    if (!shareUrl) {
      toast.error("Link não disponível para este PDF");
      return;
    }
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(false), 2000);
    setOpen(false);
  };

  const handleClick = async () => {
    // Em mobile com blob, tenta share nativo primeiro (com arquivo)
    if (pdfBlob && typeof navigator.share === "function" && navigator.canShare?.({ files: [new File([], "t.pdf")] })) {
      const shared = await handleNativeShare();
      if (shared) return;
    }
    setOpen(!open);
  };

  return (
    <div className="relative" ref={menuRef}>
      {variant === "icon" ? (
        <button
          onClick={handleClick}
          className="shrink-0 rounded-lg border p-2 hover:bg-gray-50 transition"
          title="Compartilhar"
        >
          <Share2 className="h-5 w-5" />
        </button>
      ) : (
        <Button variant="outline" className="flex-1 gap-2" onClick={handleClick}>
          <Share2 className="h-4 w-4" />
          Compartilhar
        </Button>
      )}

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-48 rounded-lg border bg-white shadow-lg py-1 animate-in fade-in-0 zoom-in-95">
          <button
            onClick={handleWhatsApp}
            className="flex w-full items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50"
          >
            <MessageCircle className="h-4 w-4 text-green-600" />
            WhatsApp
          </button>
          <button
            onClick={handleEmail}
            className="flex w-full items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50"
          >
            <Mail className="h-4 w-4 text-blue-600" />
            Email
          </button>
          <button
            onClick={handleSMS}
            className="flex w-full items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50"
          >
            <Smartphone className="h-4 w-4 text-purple-600" />
            SMS
          </button>
          {shareUrl && (
            <>
              <div className="my-1 border-t" />
              <button
                onClick={handleCopyLink}
                className="flex w-full items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4 text-gray-500" />
                )}
                Copiar link
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
