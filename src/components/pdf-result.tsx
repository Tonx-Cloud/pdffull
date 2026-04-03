"use client";

import { Download, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShareMenu } from "@/components/share-menu";
import { useState } from "react";
import { AiAnalysisModal } from "@/components/ai-analysis-modal";

interface PdfResultProps {
  pdfBlob: Blob;
  filename: string;
  pageCount: number;
  onReset: () => void;
}

export function PdfResult({
  pdfBlob,
  filename,
  pageCount,
  onReset,
}: PdfResultProps) {
  const sizeKB = (pdfBlob.size / 1024).toFixed(0);
  const sizeMB = (pdfBlob.size / (1024 * 1024)).toFixed(1);
  const sizeLabel = pdfBlob.size > 1024 * 1024 ? `${sizeMB} MB` : `${sizeKB} KB`;
  const [showAi, setShowAi] = useState(false);

  const handleDownload = () => {
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="w-full max-w-md overflow-visible">
      <CardContent className="flex flex-col items-center gap-4 pt-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-8 w-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <div className="text-center">
          <h3 className="text-lg font-semibold">PDF Gerado!</h3>
          <p className="text-sm text-muted-foreground">
            {pageCount} {pageCount === 1 ? "página" : "páginas"} • {sizeLabel}
          </p>
          <p className="text-xs text-muted-foreground mt-1 truncate max-w-[250px]">
            {filename}
          </p>
        </div>

        <div className="flex w-full gap-2">
          <Button
            className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4" />
            Baixar PDF
          </Button>
          <ShareMenu pdfBlob={pdfBlob} filename={filename} />
        </div>

        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={() => setShowAi(true)}
        >
          <Sparkles className="h-4 w-4" />
          Análise com IA
        </Button>

        <Button
          variant="ghost"
          className="gap-2 text-muted-foreground"
          onClick={onReset}
        >
          <RotateCcw className="h-4 w-4" />
          Nova conversão
        </Button>

        <AiAnalysisModal
          open={showAi}
          onOpenChange={setShowAi}
          pdfBlob={pdfBlob}
          filename={filename}
        />
      </CardContent>
    </Card>
  );
}
