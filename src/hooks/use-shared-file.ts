"use client";

import { useEffect, useState, useCallback } from "react";

const SHARED_FILES_CACHE = "shared-files";

/**
 * Hook que captura arquivos PDF recebidos via:
 * 1. File Handling API (launchQueue) — "Abrir com..." no Android
 * 2. Web Share Target API (Cache API) — "Compartilhar" de outros apps
 *
 * Retorna os arquivos recebidos e uma função para limpar.
 */
export function useSharedFile() {
  const [sharedFiles, setSharedFiles] = useState<File[]>([]);

  useEffect(() => {
    // 1. File Handling API — escuta o launchQueue
    if ("launchQueue" in globalThis) {
      (globalThis as unknown as { launchQueue: LaunchQueue }).launchQueue.setConsumer(
        async (launchParams: LaunchParams) => {
          if (launchParams.files && launchParams.files.length > 0) {
            const files: File[] = [];
            for (const fileHandle of launchParams.files) {
              try {
                const file = await fileHandle.getFile();
                if (file.type === "application/pdf") {
                  files.push(file);
                }
              } catch (err) {
                console.error("[FileHandler] Erro ao ler arquivo:", err);
              }
            }
            if (files.length > 0) {
              setSharedFiles((prev) => [...prev, ...files]);
            }
          }
        }
      );
    }

    // 2. Web Share Target — verifica se há arquivo no Cache API
    checkSharedCache();
  }, []);

  async function checkSharedCache() {
    try {
      if (!("caches" in globalThis)) return;

      const searchParams = new URLSearchParams(globalThis.location.search);
      if (!searchParams.has("shared")) return;

      const cache = await caches.open(SHARED_FILES_CACHE);
      const response = await cache.match("/shared-pdf");

      if (response) {
        const blob = await response.blob();
        const fileName = decodeURIComponent(
          response.headers.get("X-File-Name") || "compartilhado.pdf"
        );
        const file = new File([blob], fileName, { type: "application/pdf" });
        setSharedFiles((prev) => [...prev, file]);

        // Limpar cache após consumir
        await cache.delete("/shared-pdf");

        // Remover query param ?shared=1 da URL sem recarregar
        const url = new URL(globalThis.location.href);
        url.searchParams.delete("shared");
        globalThis.history.replaceState({}, "", url.pathname);
      }
    } catch (err) {
      console.error("[ShareTarget] Erro ao ler cache compartilhado:", err);
    }
  }

  const clearSharedFiles = useCallback(() => {
    setSharedFiles([]);
  }, []);

  return { sharedFiles, clearSharedFiles };
}

// Tipos do File Handling API (não incluídos no TypeScript padrão)
interface LaunchQueue {
  setConsumer(consumer: (params: LaunchParams) => void): void;
}

interface LaunchParams {
  files: FileSystemFileHandle[];
}
