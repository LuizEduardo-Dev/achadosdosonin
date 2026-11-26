import { getClientEnv } from "@/lib/env";

export const ACHADOS_STORAGE_BUCKET = "achados-images";
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const STANDARD_IMAGE_SIZE_PX = 800;
export const MIN_IMAGE_SIDE_PX = 400;
export const TARGET_IMAGE_MAX_BYTES = 150 * 1024; // 150 KB
export const IMAGE_INNER_MARGIN_RATIO = 0.04;
export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

const QUALITY_STEPS = [0.85, 0.78, 0.7, 0.62, 0.54] as const;

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
 * Standardizes an image in the browser before uploading to Supabase Storage:
 * rejects tiny images (< 400 px), renders onto an 800x800 white canvas with
 * ~4% inner margin, and encodes to WebP (JPEG fallback) targeting <= 150 KB.
 */
export async function compressImageForUpload(
  file: File,
): Promise<{ blob: Blob; contentType: string; extension: string }> {
  const bitmap = await createImageBitmap(file);

  if (Math.min(bitmap.width, bitmap.height) < MIN_IMAGE_SIDE_PX) {
    const dimensions = `${bitmap.width}x${bitmap.height}`;
    bitmap.close();
    throw new Error(
      `Imagem muito pequena (${dimensions} px). Envie uma foto com pelo menos ${MIN_IMAGE_SIDE_PX}x${MIN_IMAGE_SIDE_PX} px.`,
    );
  }

  const canvas = document.createElement("canvas");
  canvas.width = STANDARD_IMAGE_SIZE_PX;
  canvas.height = STANDARD_IMAGE_SIZE_PX;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Não foi possível processar a imagem no navegador.");
  }

  // Always paint solid white first so transparent PNGs/WebPs don't turn black in JPEG fallback.
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, STANDARD_IMAGE_SIZE_PX, STANDARD_IMAGE_SIZE_PX);

  const margin = Math.round(STANDARD_IMAGE_SIZE_PX * IMAGE_INNER_MARGIN_RATIO);
  const availableSide = STANDARD_IMAGE_SIZE_PX - margin * 2;
  const scale = Math.min(availableSide / bitmap.width, availableSide / bitmap.height);
  const drawWidth = Math.max(1, Math.round(bitmap.width * scale));
  const drawHeight = Math.max(1, Math.round(bitmap.height * scale));
  const dx = Math.round((STANDARD_IMAGE_SIZE_PX - drawWidth) / 2);
  const dy = Math.round((STANDARD_IMAGE_SIZE_PX - drawHeight) / 2);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, dx, dy, drawWidth, drawHeight);
  bitmap.close();

  const encode = (mimeType: string, quality: number) =>
    new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => resolve(blob), mimeType, quality);
    });

  const firstWebp = await encode("image/webp", QUALITY_STEPS[0]);
  const useWebp = Boolean(firstWebp && firstWebp.type === "image/webp");
  const targetMime = useWebp ? "image/webp" : "image/jpeg";
  const extension = useWebp ? "webp" : "jpg";

  let bestBlob: Blob | null = useWebp ? firstWebp : null;
  if (bestBlob && bestBlob.size <= TARGET_IMAGE_MAX_BYTES) {
    return { blob: bestBlob, contentType: targetMime, extension };
  }

  const startIndex = useWebp ? 1 : 0;
  for (let i = startIndex; i < QUALITY_STEPS.length; i += 1) {
    const candidate = await encode(targetMime, QUALITY_STEPS[i]);
    if (!candidate) continue;
    bestBlob = candidate;
    if (candidate.size <= TARGET_IMAGE_MAX_BYTES) {
      break;
    }
  }

  if (!bestBlob) {
    throw new Error("Falha ao comprimir a imagem antes do envio.");
  }

  return { blob: bestBlob, contentType: targetMime, extension };
}
