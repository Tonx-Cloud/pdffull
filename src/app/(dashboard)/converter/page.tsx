"use client";

import { useState, useCallback } from "react";
import { CameraCapture } from "@/components/camera-capture";
import { ImageList } from "@/components/image-list";
import { PdfResult } from "@/components/pdf-result";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { FileText, Loader2, AlertTriangle } from "lucide-react";
import { compressImages } from "@/lib/pdf/compress";
import { generatePdf, getPdfFilename } from "@/lib/pdf/generate";
import { useConversionLimit } from "@/hooks/use-conversion-limit";
import { UpgradeModal } from "@/components/upgrade-modal";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

type Stage = "capture" | "processing" | "done";

export default function ConverterPage() {
  const [images, setImages] = useState<File[]>([]);
  const [stage, setStage] = useState<Stage>("capture");
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfFilename, setPdfFilename] = useState("");
  const [showUpgrade, setShowUpgrade] = useState(false);
  const limit = useConversionLimit();

  const handleCapture = useCallback((files: File[]) => {
    setImages((prev) => [...prev, ...files]);
  }, []);

  const handleRemove = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleReorder = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (toIndex < 0 || toIndex >= images.length) return;
      setImages((prev) => {
        const updated = [...prev];
        const [moved] = updated.splice(fromIndex, 1);
        updated.splice(toIndex, 0, moved);
        return updated;
      });
    },
    [images.length]
  );

  const handleConvert = async () => {
    if (images.length === 0) {
      toast.error("Adicione pelo menos uma imagem");
      return;
    }

    if (!limit.canConvert) {
      setShowUpgrade(true);
      return;
    }

    setStage("processing");
    setProgress(0);

    try {
      // Etapa 1: Comprimir imagens
      setProgressLabel("Comprimindo imagens...");
      const compressed = await compressImages(images, (current, total) => {
        setProgress(Math.round((current / total) * 40));
      });

      // Etapa 2: Gerar PDF
      setProgressLabel("Gerando PDF...");
      const blob = await generatePdf(compressed, (current, total) => {
        setProgress(40 + Math.round((current / total) * 40));
      });

      const filename = getPdfFilename(images[0]?.name);

      // Etapa 3: Upload direto ao Supabase Storage via signed URL
      // (evita limite de 4.5MB do body nas serverless functions)
      setProgressLabel("Salvando na nuvem...");
      setProgress(80);

      // 3a. Obter signed upload URL do servidor
      const signedRes = await fetch("/api/upload/signed-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename }),
      });

      if (!signedRes.ok) {
        const signedData = await signedRes.json().catch(() => ({}));
        throw new Error(signedData.error || "Erro ao preparar upload");
      }

      const { signedUrl, token, storageKey, filename: sanitizedName } =
        await signedRes.json();

      // 3b. Upload do PDF direto ao Storage (sem passar pelo serverless)
      setProgress(85);
      const supabase = createClient();
      const { error: uploadError } = await supabase.storage
        .from("pdfs")
        .uploadToSignedUrl(storageKey, token, blob, {
          contentType: "application/pdf",
        });

      if (uploadError) {
        throw new Error("Erro ao salvar arquivo. Tente novamente.");
      }

      setProgress(92);

      // 3c. Obter URL pública
      const {
        data: { publicUrl },
      } = supabase.storage.from("pdfs").getPublicUrl(storageKey);

      // 3d. Registrar conversão via API leve (sem enviar arquivo)
      const res = await fetch("/api/conversions/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: sanitizedName,
          pdf_url: publicUrl,
          pages: images.length,
          size_bytes: blob.size,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erro ao registrar conversão");
      }

      setProgress(100);
      setPdfBlob(blob);
      setPdfFilename(filename);
      setStage("done");
      limit.refresh();
      toast.success("PDF gerado com sucesso!");
    } catch (error) {
      console.error("Erro na conversão:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao converter. Tente novamente.");
      setStage("capture");
    }
  };

  const handleReset = () => {
    setImages([]);
    setPdfBlob(null);
    setPdfFilename("");
    setProgress(0);
    setProgressLabel("");
    setStage("capture");
  };

  // Tela de resultado
  if (stage === "done" && pdfBlob) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <PdfResult
          pdfBlob={pdfBlob}
          filename={pdfFilename}
          pageCount={images.length}
          onReset={handleReset}
        />
      </div>
    );
  }

  // Tela de processamento
  if (stage === "processing") {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-6">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <div className="w-full max-w-xs space-y-2">
          <Progress value={progress} className="h-3" />
          <p className="text-sm text-center text-muted-foreground">
            {progressLabel} {progress}%
          </p>
        </div>
      </div>
    );
  }

  // Tela de captura
  return (
    <div className="flex flex-col items-center gap-8 py-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Converter para PDF</h1>
        <p className="text-muted-foreground mt-2">
          Tire uma foto ou carregue da galeria
        </p>
      </div>

      {/* Banner de limite */}
      {!limit.loading && limit.plan === "free" && (
        <div className={`w-full max-w-md rounded-xl border p-4 text-sm ${
          limit.canConvert ? "bg-blue-50 border-blue-200" : "bg-red-50 border-red-200"
        }`}>
          <div className="flex items-center gap-2">
            {!limit.canConvert && <AlertTriangle className="h-4 w-4 text-red-600" />}
            <span className={limit.canConvert ? "text-blue-700" : "text-red-700"}>
              {limit.canConvert
                ? `${limit.used}/5 conversões usadas este mês`
                : "Limite mensal atingido"}
            </span>
          </div>
          {!limit.canConvert && (
            <button
              onClick={() => setShowUpgrade(true)}
              className="text-blue-600 hover:underline text-xs mt-1 inline-block"
            >
              Fazer upgrade para Pro →
            </button>
          )}
        </div>
      )}

      <CameraCapture onCapture={handleCapture} />

      <ImageList
        images={images}
        onRemove={handleRemove}
        onReorder={handleReorder}
      />

      {images.length > 0 && (
        <Button
          size="lg"
          className="h-14 w-64 text-lg gap-3 rounded-2xl bg-green-600 hover:bg-green-700"
          onClick={handleConvert}
        >
          <FileText className="h-5 w-5" />
          Gerar PDF ({images.length}{" "}
          {images.length === 1 ? "imagem" : "imagens"})
        </Button>
      )}

      <UpgradeModal open={showUpgrade} onOpenChange={setShowUpgrade} />
    </div>
  );
}
