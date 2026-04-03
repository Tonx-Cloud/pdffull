import imageCompression from "browser-image-compression";

const COMPRESSION_OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  fileType: "image/jpeg" as const,
};

export async function compressImage(file: File): Promise<File> {
  // Se já é menor que 1MB, pular compressão
  if (file.size <= 1024 * 1024) {
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
