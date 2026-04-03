import { jsPDF } from "jspdf";

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function getImageDimensions(
  dataUrl: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = reject;
    img.src = dataUrl;
  });
}

export async function generatePdf(
  images: File[],
  onProgress?: (current: number, total: number) => void
): Promise<Blob> {
  if (images.length === 0) {
    throw new Error("Nenhuma imagem fornecida");
  }

  let pdf: jsPDF | null = null;

  for (let i = 0; i < images.length; i++) {
    const dataUrl = await readFileAsDataURL(images[i]);
    const dims = await getImageDimensions(dataUrl);

    // Detectar orientação: paisagem ou retrato
    const isLandscape = dims.width > dims.height;
    const orientation = isLandscape ? "landscape" : "portrait";

    if (i === 0) {
      pdf = new jsPDF({ orientation, unit: "mm", format: "a4" });
    } else {
      pdf!.addPage("a4", orientation);
    }

    const pageWidth = pdf!.internal.pageSize.getWidth();
    const pageHeight = pdf!.internal.pageSize.getHeight();

    // Calcular dimensões mantendo proporção
    const imgRatio = dims.width / dims.height;
    const pageRatio = pageWidth / pageHeight;

    let renderWidth: number;
    let renderHeight: number;

    if (imgRatio > pageRatio) {
      // Imagem mais larga que a página proporcionalmente
      renderWidth = pageWidth;
      renderHeight = pageWidth / imgRatio;
    } else {
      // Imagem mais alta que a página proporcionalmente
      renderHeight = pageHeight;
      renderWidth = pageHeight * imgRatio;
    }

    // Centralizar na página
    const x = (pageWidth - renderWidth) / 2;
    const y = (pageHeight - renderHeight) / 2;

    pdf!.addImage(dataUrl, "JPEG", x, y, renderWidth, renderHeight);
    onProgress?.(i + 1, images.length);
  }

  return pdf!.output("blob");
}

export function getPdfFilename(originalName?: string): string {
  const base = originalName
    ? originalName.replace(/\.[^/.]+$/, "")
    : "documento";
  const date = new Date().toISOString().slice(0, 10);
  return `${base}-${date}.pdf`;
}
