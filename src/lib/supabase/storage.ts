import { getClientEnv } from "@/lib/env";

export const ACHADOS_STORAGE_BUCKET = "achados-images";
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export function resolveAchadoImageUrl(imagePath: string): string {
  const trimmed = imagePath.trim();
  if (!trimmed) {
    return "/icons/icon-512x512.png";
  }

  if (
    trimmed.startsWith("/") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://")
  ) {
    return trimmed;
  }

  const cleanBase = getClientEnv().NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, "");
  const cleanPath = trimmed.replace(/^\/+/, "");
  return `${cleanBase}/storage/v1/object/public/${ACHADOS_STORAGE_BUCKET}/${cleanPath}`;
}

export function validateImageFile(file: File): string | null {
  if (
    !(ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(file.type)
  ) {
    return "Formato inválido. Use apenas imagens JPEG, PNG ou WebP.";
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return "A imagem excede o limite de 5 MB.";
  }

  return null;
}

/**
 * Resizes and compresses an image directly in the browser before uploading to Supabase Storage.
 * Keeps uploads fast on mobile networks and avoids routing binaries through Netlify functions.
 */
export async function compressImageForUpload(
  file: File,
  maxDimension = 1200,
  quality = 0.82,
): Promise<{ blob: Blob; contentType: string; extension: string }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Não foi possível processar a imagem no navegador.");
  }

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const tryEncode = (mimeType: string) =>
    new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => resolve(blob), mimeType, quality);
    });

  const webpBlob = await tryEncode("image/webp");
  if (webpBlob && webpBlob.type === "image/webp") {
    return { blob: webpBlob, contentType: "image/webp", extension: "webp" };
  }

  const jpegBlob = await tryEncode("image/jpeg");
  if (!jpegBlob) {
    throw new Error("Falha ao comprimir a imagem antes do envio.");
  }

  return { blob: jpegBlob, contentType: "image/jpeg", extension: "jpg" };
}
