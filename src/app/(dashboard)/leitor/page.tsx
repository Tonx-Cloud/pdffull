"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import {
  FileText,
  Upload,
  Download,
  X,
  BookOpen,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareMenu } from "@/components/pwa/share-menu";
import { PwaInstallButton } from "@/components/pwa/pwa-install-button";
import { useSharedFile } from "@/hooks/use-shared-file";
import { toast } from "sonner";
import Link from "next/link";
import { useTranslations } from "next-intl";

const PdfViewer = dynamic(
  () => import("@/components/leitor/pdf-viewer").then((m) => m.PdfViewer),
  { ssr: false }
);

export default function LeitorPage() {
  const t = useTranslations("Leitor");
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [filename, setFilename] = useState("documento.pdf");
  const [isDragging, setIsDragging] = useState(false);
  const blobUrlRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { sharedFiles, clearSharedFiles } = useSharedFile();

  // Receber PDF via File Handler API / Share Target
  useEffect(() => {
    if (sharedFiles.length === 0) return;
    const file = sharedFiles[0];
    loadPdf(file, file.name);
    clearSharedFiles();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sharedFiles]);

  // Receber PDF via URL remota (TWA Android Intent handler → /leitor?pdfUrl=...)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const remoteUrl = params.get("pdfUrl");
    if (!remoteUrl) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(remoteUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const blob = await res.blob();
        if (cancelled) return;
        const name =
          decodeURIComponent(remoteUrl.split("/").pop() || "documento.pdf")
            .replace(/\?.*$/, "") || "documento.pdf";
        loadPdf(blob, name);
        // Limpar query param para evitar re-carga ao navegar
        const url = new URL(window.location.href);
        url.searchParams.delete("pdfUrl");
        window.history.replaceState({}, "", url.pathname + url.search);
      } catch (err) {
        console.error("[Leitor] Erro ao baixar PDF remoto:", err);
        toast.error(t("errorRemoteLoad"));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [t]);

  function loadPdf(file: Blob, name: string) {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
    }
    const url = URL.createObjectURL(file);
    blobUrlRef.current = url;
    setPdfBlob(file);
    setPdfUrl(url);
    setFilename(name);
  }

  function closePdf() {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    setPdfBlob(null);
    setPdfUrl(null);
    setFilename("documento.pdf");
  }

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      toast.error(t("errorInvalidPdf"));
      return;
    }
    loadPdf(file, file.name);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );

  const handleDownload = () => {
    if (!pdfUrl) return;
    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // — Visualizador ativo —
  if (pdfUrl) {
    return (
      <div className="flex flex-col gap-3 h-full">
        {/* Barra de ferramentas */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="h-5 w-5 text-blue-600 shrink-0" />
            <span className="text-sm font-medium truncate max-w-45 sm:max-w-xs">
              {filename}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="gap-1"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">{t("download")}</span>
            </Button>
            {pdfBlob && (
              <ShareMenu pdfBlob={pdfBlob} filename={filename} />
            )}
            <Button variant="ghost" size="sm" onClick={closePdf} aria-label={t("closeLabel")}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Visualizador de PDF */}
        <div
          className="flex-1 rounded-xl border overflow-hidden bg-gray-100"
          style={{ minHeight: "65vh" }}
        >
          {pdfBlob && <PdfViewer blob={pdfBlob} />}
        </div>

        {/* Abrir outro arquivo */}
        <div className="text-center pb-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground text-xs"
            onClick={() => fileInputRef.current?.click()}
          >
            {t("openAnother")}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
        </div>
      </div>
    );
  }

  // — Tela inicial / área de drop —
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <BookOpen className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">{t("title")}</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          {t("subtitle")}
        </p>
      </div>

      {/* Área de drag-and-drop */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-12 cursor-pointer transition-colors ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-200 hover:border-blue-400 hover:bg-blue-50/50"
        }`}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100">
          <FileText className="h-8 w-8 text-blue-600" />
        </div>
        <div className="text-center">
          <p className="font-semibold">{t("dropHere")}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {t("orClickSelect")}
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 gap-2 pointer-events-none">
          <Upload className="h-4 w-4" />
          {t("selectPdf")}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
        />
      </div>

      {/* Cards de funcionalidades */}
      <div className="grid gap-4 sm:grid-cols-3 mt-2">
        <div className="rounded-xl border bg-white p-4">
          <p className="font-semibold text-sm mb-2">{t("freePlanTitle")}</p>
          <ul className="space-y-1 text-xs text-muted-foreground">
            <li className="flex items-center gap-1.5">
              <CheckCircle className="h-3 w-3 text-green-500 shrink-0" />
              {t("freeViewPdf")}
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle className="h-3 w-3 text-green-500 shrink-0" />
              {t("freeNav")}
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle className="h-3 w-3 text-green-500 shrink-0" />
              {t("freeDownload")}
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle className="h-3 w-3 text-green-500 shrink-0" />
              {t("freeOffline")}
            </li>
          </ul>
        </div>

        <div className="rounded-xl border-2 border-blue-200 bg-blue-50/50 p-4">
          <p className="font-semibold text-sm text-blue-700 mb-2">
            {t("proPlanTitle")}
          </p>
          <ul className="space-y-1 text-xs text-muted-foreground">
            <li className="flex items-center gap-1.5">
              <CheckCircle className="h-3 w-3 text-blue-500 shrink-0" />
              {t("proShareLink")}
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle className="h-3 w-3 text-blue-500 shrink-0" />
              {t("proCloudHistory")}
            </li>
          </ul>
          <Link href="/conta" className="inline-block mt-3">
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-xs h-7"
            >
              {t("subscribePro")}
            </Button>
          </Link>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <p className="font-semibold text-sm mb-2">{t("installTitle")}</p>
          <p className="text-xs text-muted-foreground mb-3">
            {t("installDesc")}
          </p>
          <PwaInstallButton />
        </div>
      </div>
    </div>
  );
}
