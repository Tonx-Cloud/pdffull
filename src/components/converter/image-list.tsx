"use client";

import { X, GripVertical, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface ImageListProps {
  images: File[];
  onRemove: (index: number) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

export function ImageList({ images, onRemove, onReorder }: ImageListProps) {
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    const urls = images.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [images]);

  if (images.length === 0) return null;

  return (
    <div className="w-full max-w-md space-y-2">
      <p className="text-sm text-muted-foreground text-center">
        {images.length} {images.length === 1 ? "imagem" : "imagens"} — arraste
        para reordenar
      </p>
      <div className="space-y-2">
        {images.map((file, index) => (
          <div
            key={`${file.name}-${file.size}-${index}`}
            className="flex items-center gap-2 rounded-lg border bg-white p-2"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground shrink-0 cursor-grab" />

            {previews[index] && (
              <img
                src={previews[index]}
                alt={`Imagem ${index + 1}`}
                className="h-12 w-12 rounded object-cover shrink-0"
              />
            )}

            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(0)} KB
              </p>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onReorder(index, index - 1)}
                disabled={index === 0}
                aria-label="Mover para cima"
              >
                <ArrowUp className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onReorder(index, index + 1)}
                disabled={index === images.length - 1}
                aria-label="Mover para baixo"
              >
                <ArrowDown className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-red-500 hover:text-red-700"
                onClick={() => onRemove(index)}
                aria-label="Remover imagem"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
