"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Archive,
  CheckCircle2,
  Edit3,
  FileEdit,
  Loader2,
  Trash2,
} from "lucide-react";
import type { Achado, AchadoStatus, Category } from "@/types/achado";
import { formatDatePtBR } from "@/lib/format";
import { resolveAchadoImageUrl } from "@/lib/supabase/storage";
import { Button, buttonClasses } from "@/components/ui/button";

export type BusyKind = "deleting" | AchadoStatus;

const STATUS_LABELS: Record<AchadoStatus, string> = {
  published: "Publicado",
  draft: "Rascunho",
  archived: "Arquivado",
};

const STATUS_BADGE_CLASSES: Record<AchadoStatus, string> = {
  published: "bg-badge-bg text-badge-text border-badge-bg",
  draft: "bg-surface-2 text-text border-border",
  archived: "bg-surface-2 text-text-muted border-border",
};

interface AchadoListItemProps {
  item: Achado;
  categoryMap: Map<string, Category>;
  busyKind?: BusyKind;
  isConfirmingDelete: boolean;
  onStatusChange: (id: string, nextStatus: AchadoStatus) => void;
  onRequestDelete: (id: string) => void;
  onCancelDelete: () => void;
  onConfirmDelete: (id: string) => void;
}

export function AchadoListItem({
  item,
  categoryMap,
  busyKind,
  isConfirmingDelete,
  onStatusChange,
  onRequestDelete,
  onCancelDelete,
  onConfirmDelete,
}: AchadoListItemProps) {
  const isBusy = Boolean(busyKind);

  return (
    <li
      aria-busy={isBusy}
      className={`rounded-lg border border-border bg-surface p-3.5 transition-opacity sm:p-4 ${
        isBusy ? "opacity-70" : ""
      }`}
    >
      <div className="flex gap-3">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-surface-2 bg-surface p-1 sm:h-24 sm:w-24">
          <div className="relative h-full w-full">
            <Image
              src={resolveAchadoImageUrl(item.image_path)}
              alt={item.title}
              fill
              sizes="96px"
              className="object-contain"
            />
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${STATUS_BADGE_CLASSES[item.status]}`}
            >
              {STATUS_LABELS[item.status]}
            </span>
            <span className="text-xs text-text-muted">{item.store}</span>
            <span className="text-xs text-text-muted" aria-hidden="true">
              ·
            </span>
            <span className="text-xs text-text-muted">
              {formatDatePtBR(item.created_at)}
            </span>
          </div>

          <h2 className="line-clamp-2 text-sm font-medium text-text sm:text-base">
            {item.title}
          </h2>

          {(item.category_ids?.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-1 pt-0.5">
              {item.category_ids?.map((catId) => {
                const cat = categoryMap.get(catId);
                if (!cat) return null;
                return (
                  <span
                    key={cat.id}
                    className="inline-flex items-center rounded-full border border-border bg-surface-2 px-2 py-0.5 text-[11px] text-text-muted"
                  >
                    {cat.name}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-surface-2 pt-3">
        <Link
          href={`/admin/achados/${item.id}/editar`}
          aria-disabled={isBusy}
          tabIndex={isBusy ? -1 : undefined}
          className={buttonClasses(
            "secondary",
            "sm",
            isBusy ? "pointer-events-none opacity-50" : "",
          )}
        >
          <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Editar</span>
        </Link>

        {item.status !== "published" && (
          <Button
            variant="primary"
            size="sm"
            disabled={isBusy}
            onClick={() => onStatusChange(item.id, "published")}
          >
            {busyKind === "published" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            <span>
              {busyKind === "published" ? "Publicando..." : "Publicar"}
            </span>
          </Button>
        )}

        {item.status !== "draft" && (
          <Button
            variant="secondary"
            size="sm"
            disabled={isBusy}
            onClick={() => onStatusChange(item.id, "draft")}
          >
            {busyKind === "draft" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <FileEdit className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            <span>{busyKind === "draft" ? "Salvando..." : "Rascunho"}</span>
          </Button>
        )}

        {item.status !== "archived" && (
          <Button
            variant="secondary"
            size="sm"
            disabled={isBusy}
            onClick={() => onStatusChange(item.id, "archived")}
          >
            {busyKind === "archived" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Archive className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            <span>
              {busyKind === "archived" ? "Arquivando..." : "Arquivar"}
            </span>
          </Button>
        )}

        <div className="ml-auto flex items-center gap-2">
          {isConfirmingDelete ? (
            <>
              <Button
                variant="secondary"
                size="sm"
                disabled={isBusy}
                onClick={onCancelDelete}
              >
                Cancelar
              </Button>
              <Button
                variant="danger-solid"
                size="sm"
                disabled={isBusy}
                onClick={() => onConfirmDelete(item.id)}
              >
                {busyKind === "deleting" ? (
                  <Loader2
                    className="h-3.5 w-3.5 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                <span>
                  {busyKind === "deleting"
                    ? "Excluindo..."
                    : "Confirmar exclusão"}
                </span>
              </Button>
            </>
          ) : (
            <Button
              variant="danger-outline"
              size="sm"
              disabled={isBusy}
              aria-label={`Excluir ${item.title}`}
              onClick={() => onRequestDelete(item.id)}
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Excluir</span>
            </Button>
          )}
        </div>
      </div>
    </li>
  );
}
