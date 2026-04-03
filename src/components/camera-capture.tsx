"use client";

import { useRef } from "react";
import { Camera, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CameraCaptureProps {
  onCapture: (files: File[]) => void;
  multiple?: boolean;
}

export function CameraCapture({
  onCapture,
  multiple = true,
}: CameraCaptureProps) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    onCapture(Array.from(files));
    // Resetar input para permitir selecionar o mesmo arquivo novamente
    e.target.value = "";
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Input câmera (mobile) */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFiles}
        className="hidden"
        aria-label="Tirar foto com câmera"
      />

      {/* Input galeria */}
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleFiles}
        className="hidden"
        aria-label="Selecionar da galeria"
      />

      <Button
        size="lg"
        className="h-20 w-64 text-lg gap-3 rounded-2xl bg-blue-600 hover:bg-blue-700"
        onClick={() => cameraRef.current?.click()}
      >
        <Camera className="h-6 w-6" />
        Tirar Foto
      </Button>

      <Button
        variant="outline"
        size="lg"
        className="h-14 w-64 gap-3 rounded-2xl"
        onClick={() => galleryRef.current?.click()}
      >
        <ImagePlus className="h-5 w-5" />
        Carregar da Galeria
      </Button>
    </div>
  );
}
