"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Archive,
  CheckCircle2,
  Edit3,
  FileEdit,
  Plus,
  Trash2,
} from "lucide-react";
import type { Achado, AchadoStatus } from "@/types/achado";
import {
  deleteAchadoAction,
  updateAchadoStatusAction,
} from "@/app/admin/actions";
import { formatCurrencyBRL, formatDatePtBR } from "@/lib/format";
import { resolveAchadoImageUrl } from "@/lib/supabase/storage";
import { Button, buttonClasses } from "@/components/ui/button";

type StatusFilter = "all" | AchadoStatus;

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

interface AchadoListClientProps {
  achados: Achado[];
}

export function AchadoListClient({ achados }: AchadoListClientProps) {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(
    null,
  );

  const filtered = useMemo(() => {
    if (filter === "all") return achados;
    return achados.filter((item) => item.status === filter);
  }, [achados, filter]);

  const counts = useMemo(
    () => ({
      all: achados.length,
      published: achados.filter((i) => i.status === "published").length,
      draft: achados.filter((i) => i.status === "draft").length,
      archived: achados.filter((i) => i.status === "archived").length,
    }),
    [achados],
  );

  return (
    <div className="space-y-4">
      <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1">
        {(
          [
            { key: "all", label: `Todos (${counts.all})` },
            { key: "published", label: `Publicados (${counts.published})` },
            { key: "draft", label: `Rascunhos (${counts.draft})` },
            { key: "archived", label: `Arquivados (${counts.archived})` },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            type="button"
            aria-pressed={filter === tab.key}
            onClick={() => setFilter(tab.key)}
            className={`shrink-0 cursor-pointer rounded-full border px-3.5 py-1.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link ${
              filter === tab.key
                ? "border-ink bg-ink font-medium text-on-ink"
                : "border-border bg-surface font-normal text-text hover:bg-surface-2"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface p-8 text-center">
          <p className="text-base font-semibold text-text">
            Nenhum achado nesta lista
          </p>
          <p className="mt-1 text-sm text-text-muted">
            Cadastre um novo achado para exibir na vitrine.
          </p>
          <Link
            href="/admin/achados/novo"
            className={buttonClasses("primary", "md", "mt-4")}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Novo achado</span>
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((item) => {
            const isConfirming = confirmingDeleteId === item.id;

            return (
              <li
                key={item.id}
                className="rounded-lg border border-border bg-surface p-3.5 sm:p-4"
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
                      <span className="text-xs text-text-muted">
                        {item.store}
                      </span>
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

                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="text-base font-semibold tabular-nums text-price">
                        {formatCurrencyBRL(item.price_cents)}
                      </span>
                      {item.original_price_cents &&
                        item.original_price_cents > item.price_cents && (
                          <span className="text-xs tabular-nums text-text-muted line-through">
                            {formatCurrencyBRL(item.original_price_cents)}
                          </span>
                        )}
                      {item.price_note && (
                        <span className="text-xs text-text-muted">
                          ({item.price_note})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-surface-2 pt-3">
                  <Link
                    href={`/admin/achados/${item.id}/editar`}
                    className={buttonClasses("secondary", "sm")}
                  >
                    <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Editar</span>
                  </Link>

                  {item.status !== "published" && (
                    <form action={updateAchadoStatusAction}>
                      <input type="hidden" name="id" value={item.id} />
                      <input type="hidden" name="status" value="published" />
                      <button
                        type="submit"
                        className={buttonClasses("primary", "sm")}
                      >
                        <CheckCircle2
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                        <span>Publicar</span>
                      </button>
                    </form>
                  )}

                  {item.status !== "draft" && (
                    <form action={updateAchadoStatusAction}>
                      <input type="hidden" name="id" value={item.id} />
                      <input type="hidden" name="status" value="draft" />
                      <button
                        type="submit"
                        className={buttonClasses("secondary", "sm")}
                      >
                        <FileEdit className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Rascunho</span>
                      </button>
                    </form>
                  )}

                  {item.status !== "archived" && (
                    <form action={updateAchadoStatusAction}>
                      <input type="hidden" name="id" value={item.id} />
                      <input type="hidden" name="status" value="archived" />
                      <button
                        type="submit"
                        className={buttonClasses("secondary", "sm")}
                      >
                        <Archive className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Arquivar</span>
                      </button>
                    </form>
                  )}

                  <div className="ml-auto flex items-center gap-2">
                    {isConfirming ? (
                      <>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setConfirmingDeleteId(null)}
                        >
                          Cancelar
                        </Button>
                        <form action={deleteAchadoAction}>
                          <input type="hidden" name="id" value={item.id} />
                          <button
                            type="submit"
                            className={buttonClasses("danger-solid", "sm")}
                          >
                            Confirmar exclusão
                          </button>
                        </form>
                      </>
                    ) : (
                      <Button
                        variant="danger-outline"
                        size="sm"
                        aria-label={`Excluir ${item.title}`}
                        onClick={() => setConfirmingDeleteId(item.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Excluir</span>
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
