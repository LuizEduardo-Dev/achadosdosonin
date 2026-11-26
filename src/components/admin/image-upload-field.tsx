"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Upload, X } from "lucide-react";
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
    <div className="space-y-1.5">
      <span className="block text-sm font-medium text-text">
        Imagem do achado *
      </span>

      <input type="hidden" name="image_path" value={value} />

      <div className="rounded-lg border border-border bg-surface-2/60 p-4">
        {previewUrl ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative aspect-square w-36 max-w-full shrink-0 overflow-hidden rounded-lg border border-border bg-surface p-2">
              <div className="relative h-full w-full">
                <Image
                  src={previewUrl}
                  alt="Pré-visualização do achado"
                  fill
                  sizes="144px"
                  className="object-contain"
                />
              </div>
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
                  <Upload className="h-4 w-4" aria-hidden="true" />
                  <span>{uploading ? "Enviando..." : "Trocar imagem"}</span>
                </Button>

                <Button
                  type="button"
                  variant="secondary"
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
            className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-surface px-4 py-7 text-center transition-colors hover:border-link hover:bg-surface-2/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link disabled:opacity-60"
          >
            <ImagePlus className="h-6 w-6 text-text-muted" aria-hidden="true" />
            <span className="text-sm font-medium text-text">
              {uploading
                ? "Comprimindo e enviando imagem..."
                : "Escolher imagem do produto"}
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

      <p className="text-xs text-text-muted">
        Use fotos quadradas (1:1), mínimo 800x800, produto centralizado e fundo
        branco.
      </p>

      {(uploadError || error) && (
        <p role="alert" className="text-xs font-medium text-danger">
          {uploadError || error}
        </p>
      )}
    </div>
  );
}
