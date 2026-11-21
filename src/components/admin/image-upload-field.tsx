"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Upload, X } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import {
  ACHADOS_STORAGE_BUCKET,
  compressImageForUpload,
  resolveAchadoImageUrl,
  validateImageFile,
} from "@/lib/supabase/storage";
import { Button } from "@/components/ui/button";

interface ImageUploadFieldProps {
  value: string;
  onChange: (imagePath: string) => void;
  error?: string;
}

export function ImageUploadField({
  value,
  onChange,
  error,
}: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const previewUrl = value ? resolveAchadoImageUrl(value) : "";

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    const validationError = validateImageFile(file);
    if (validationError) {
      setUploadError(validationError);
      event.target.value = "";
      return;
    }

    setUploading(true);
    try {
      const compressed = await compressImageForUpload(file);
      const supabase = createSupabaseBrowserClient();
      const fileName = `${Date.now()}-${crypto.randomUUID()}.${compressed.extension}`;
      const objectPath = `achados/${fileName}`;

      const { error: storageError } = await supabase.storage
        .from(ACHADOS_STORAGE_BUCKET)
        .upload(objectPath, compressed.blob, {
          contentType: compressed.contentType,
          cacheControl: "31536000",
          upsert: false,
        });

      if (storageError) {
        throw new Error(
          "Falha no envio da imagem. Verifique se o bucket achados-images e sua permissão admin estão configurados.",
        );
      }

      onChange(objectPath);
    } catch (err) {
      setUploadError(
        err instanceof Error
          ? err.message
          : "Não foi possível enviar a imagem.",
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <span className="block text-sm font-semibold text-text">
        Imagem do achado *
      </span>

      <input type="hidden" name="image_path" value={value} />

      <div className="rounded-2xl border border-border bg-surface-2/60 p-4">
        {previewUrl ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl border border-border bg-bg">
              <Image
                src={previewUrl}
                alt="Pré-visualização do achado"
                fill
                sizes="112px"
                className="object-cover"
              />
            </div>

            <div className="flex flex-1 flex-col gap-2">
              <p className="break-all text-xs text-text-muted">{value}</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Upload className="h-4 w-4" aria-hidden="true" />
                  )}
                  <span>{uploading ? "Enviando..." : "Trocar imagem"}</span>
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={uploading}
                  onClick={() => onChange("")}
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                  <span>Remover</span>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-surface/60 px-4 py-7 text-center transition-colors hover:border-primary hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60"
          >
            {uploading ? (
              <Loader2
                className="h-7 w-7 animate-spin text-accent"
                aria-hidden="true"
              />
            ) : (
              <ImagePlus className="h-7 w-7 text-accent" aria-hidden="true" />
            )}
            <span className="text-sm font-semibold text-text">
              {uploading
                ? "Comprimindo e enviando imagem..."
                : "Toque para escolher uma imagem"}
            </span>
            <span className="text-xs text-text-muted">
              JPEG, PNG ou WebP até 5 MB (redimensionada automaticamente)
            </span>
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="sr-only"
          aria-label="Selecionar imagem do achado"
        />
      </div>

      {(uploadError || error) && (
        <p role="alert" className="text-xs font-medium text-danger">
          {uploadError || error}
        </p>
      )}
    </div>
  );
}
