"use client";

import { Download, RotateCcw, Sparkles, UserPlus, Pencil, Check, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShareMenu } from "@/components/share-menu";
import { useState } from "react";
import { AiAnalysisModal } from "@/components/ai-analysis-modal";
import { PdfViewerModal } from "@/components/pdf-viewer-modal";

interface PdfResultProps {
  pdfBlob: Blob;
  filename: string;
  pageCount: number;
  onReset: () => void;
  isAnon?: boolean;
}

export function PdfResult({
  pdfBlob,
  filename,
  pageCount,
  onReset,
  isAnon = false,
}: PdfResultProps) {
  const sizeKB = (pdfBlob.size / 1024).toFixed(0);
  const sizeMB = (pdfBlob.size / (1024 * 1024)).toFixed(1);
  const sizeLabel = pdfBlob.size > 1024 * 1024 ? `${sizeMB} MB` : `${sizeKB} KB`;
  const [showAi, setShowAi] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [currentName, setCurrentName] = useState(filename);

  const handleDownload = () => {
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = currentName;
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
          <div className="flex items-center justify-center gap-1 mt-1">
            {editingName ? (
              <>
                <input
                  type="text"
                  value={currentName}
                  onChange={(e) => setCurrentName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") setEditingName(false);
                    if (e.key === "Escape") {
                      setCurrentName(filename);
                      setEditingName(false);
                    }
                  }}
                  className="h-6 rounded border px-2 text-xs max-w-[200px]"
                  autoFocus
                />
                <button
                  onClick={() => setEditingName(false)}
                  className="p-0.5 text-green-600"
                >
                  <Check className="h-3 w-3" />
                </button>
              </>
            ) : (
              <>
                <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                  {currentName}
                </p>
                <button
                  onClick={() => setEditingName(true)}
                  className="p-0.5 text-gray-400 hover:text-blue-600"
                  title="Renomear"
                >
                  <Pencil className="h-3 w-3" />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex w-full gap-2">
          <Button
            className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4" />
            Baixar PDF
          </Button>
          <ShareMenu pdfBlob={pdfBlob} filename={currentName} />
        </div>

        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={() => setShowViewer(true)}
        >
          <Eye className="h-4 w-4" />
          Visualizar PDF
        </Button>

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

        {isAnon && (
          <a
            href="/register"
            className="w-full rounded-xl border-2 border-blue-200 bg-blue-50 p-4 text-center hover:bg-blue-100 transition block"
          >
            <div className="flex items-center justify-center gap-2 text-blue-700 font-medium text-sm">
              <UserPlus className="h-4 w-4" />
              Cadastre-se grátis e ganhe +3 conversões
            </div>
            <p className="text-xs text-blue-600 mt-1">
              Salve na nuvem, compartilhe e acesse o histórico
            </p>
          </a>
        )}

        <AiAnalysisModal
          open={showAi}
          onOpenChange={setShowAi}
          pdfBlob={pdfBlob}
          filename={currentName}
        />

        <PdfViewerModal
          open={showViewer}
          onOpenChange={setShowViewer}
          pdfBlob={pdfBlob}
          filename={currentName}
        />
      </CardContent>
    </Card>
  );
}
