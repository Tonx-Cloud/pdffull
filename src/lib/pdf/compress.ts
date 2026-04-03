import imageCompression from "browser-image-compression";

const COMPRESSION_OPTIONS = {
  maxSizeMB: 0.8,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  fileType: "image/jpeg" as const,
};

const SUPPORTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/bmp",
  "image/gif",
  "image/tiff",
  "image/heic",
  "image/heif",
];

export function isSupportedImage(file: File): boolean {
  return SUPPORTED_TYPES.includes(file.type) || file.type.startsWith("image/");
}

export async function compressImage(file: File): Promise<File> {
  if (!isSupportedImage(file)) {
    throw new Error(
      `Formato "${file.type || "desconhecido"}" não suportado. Use JPEG, PNG, WebP, BMP ou GIF.`
    );
  }
  // Se já é menor que 800KB, pular compressão
  if (file.size <= 800 * 1024) {
    return file;
  }
  return imageCompression(file, COMPRESSION_OPTIONS);
}

export async function compressImages(
  files: File[],
  onProgress?: (index: number, total: number) => void
): Promise<File[]> {
  const results: File[] = [];
  for (let i = 0; i < files.length; i++) {
    results.push(await compressImage(files[i]));
    onProgress?.(i + 1, files.length);
  }
  return results;
}
