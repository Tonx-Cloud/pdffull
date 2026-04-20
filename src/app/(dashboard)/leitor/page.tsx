"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import {
  FileText,
  Upload,
  Download,
  Sparkles,
  X,
  BookOpen,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareMenu } from "@/components/pwa/share-menu";
import { PwaInstallButton } from "@/components/pwa/pwa-install-button";
import { useSharedFile } from "@/hooks/use-shared-file";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import Link from "next/link";

const AiAnalysisModal = dynamic(
  () =>
    import("@/components/modals/ai-analysis-modal").then(
      (m) => m.AiAnalysisModal
    ),
  { ssr: false }
);

const UpgradeModal = dynamic(
  () =>
    import("@/components/modals/upgrade-modal").then((m) => m.UpgradeModal),
  { ssr: false }
);

export default function LeitorPage() {
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [filename, setFilename] = useState("documento.pdf");
  const [isDragging, setIsDragging] = useState(false);
  const [showAi, setShowAi] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const blobUrlRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { sharedFiles, clearSharedFiles } = useSharedFile();

  // Verificar plano do usuário
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", user.id)
        .single();
      setIsPro(data?.plan === "pro");
    });
  }, []);

  // Receber PDF via File Handler API / Share Target
  useEffect(() => {
    if (sharedFiles.length === 0) return;
    const file = sharedFiles[0];
    loadPdf(file, file.name);
    clearSharedFiles();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sharedFiles]);

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
      toast.error("Selecione um arquivo PDF válido");
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

  const handleAiClick = () => {
    if (!isPro) {
      setShowUpgrade(true);
      return;
    }
    setShowAi(true);
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
              <span className="hidden sm:inline">Baixar</span>
            </Button>
            {pdfBlob && (
              <ShareMenu pdfBlob={pdfBlob} filename={filename} />
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleAiClick}
              className="gap-1"
            >
              <Sparkles className="h-4 w-4 text-orange-500" />
              <span className="hidden sm:inline">Analisar com IA</span>
              {!isPro && (
                <span className="text-[10px] bg-blue-100 text-blue-700 px-1 rounded">
                  Pro
                </span>
              )}
            </Button>
            <Button variant="ghost" size="sm" onClick={closePdf} aria-label="Fechar">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Visualizador de PDF */}
        <div
          className="flex-1 rounded-xl border overflow-hidden bg-gray-100"
          style={{ minHeight: "65vh" }}
        >
          <iframe
            src={`${pdfUrl}#toolbar=1&navpanes=1`}
            className="w-full h-full"
            style={{ minHeight: "65vh", border: "none" }}
            title={filename}
          />
        </div>

        {/* Abrir outro arquivo */}
        <div className="text-center pb-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground text-xs"
            onClick={() => fileInputRef.current?.click()}
          >
            Abrir outro arquivo
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
        </div>

        {showAi && pdfBlob && (
          <AiAnalysisModal
            open={showAi}
            onOpenChange={setShowAi}
            pdfBlob={pdfBlob}
            filename={filename}
          />
        )}
        {showUpgrade && (
          <UpgradeModal open={showUpgrade} onOpenChange={setShowUpgrade} />
        )}
      </div>
    );
  }

  // — Tela inicial / área de drop —
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <BookOpen className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">Leitor de PDF</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Abra, visualize e analise qualquer PDF diretamente no navegador — sem
          instalar nada
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
          <p className="font-semibold">Arraste um PDF aqui</p>
          <p className="text-sm text-muted-foreground mt-1">
            ou clique para selecionar do seu dispositivo
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 gap-2 pointer-events-none">
          <Upload className="h-4 w-4" />
          Selecionar PDF
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
          <p className="font-semibold text-sm mb-2">✅ Plano Gratuito</p>
          <ul className="space-y-1 text-xs text-muted-foreground">
            <li className="flex items-center gap-1.5">
              <CheckCircle className="h-3 w-3 text-green-500 shrink-0" />
              Visualizar qualquer PDF
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle className="h-3 w-3 text-green-500 shrink-0" />
              Navegação por páginas
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle className="h-3 w-3 text-green-500 shrink-0" />
              Download direto
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle className="h-3 w-3 text-green-500 shrink-0" />
              Funciona offline (PWA)
            </li>
          </ul>
        </div>

        <div className="rounded-xl border-2 border-blue-200 bg-blue-50/50 p-4">
          <p className="font-semibold text-sm text-blue-700 mb-2">
            ⭐ Plano Pro
          </p>
          <ul className="space-y-1 text-xs text-muted-foreground">
            <li className="flex items-center gap-1.5">
              <CheckCircle className="h-3 w-3 text-blue-500 shrink-0" />
              Análise de texto com IA
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle className="h-3 w-3 text-blue-500 shrink-0" />
              Extração de conteúdo (OCR)
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle className="h-3 w-3 text-blue-500 shrink-0" />
              Compartilhar por link
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle className="h-3 w-3 text-blue-500 shrink-0" />
              Histórico na nuvem
            </li>
          </ul>
          <Link href="/conta" className="inline-block mt-3">
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-xs h-7"
            >
              Assinar Pro — R$ 9,90/mês
            </Button>
          </Link>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <p className="font-semibold text-sm mb-2">📱 Instale no celular</p>
          <p className="text-xs text-muted-foreground mb-3">
            Instale o PDFfULL e o app aparecerá como opção ao abrir qualquer
            PDF no Android ou PC.
          </p>
          <PwaInstallButton />
        </div>
      </div>
    </div>
  );
}
