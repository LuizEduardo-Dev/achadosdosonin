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
import { buttonClasses } from "@/components/ui/button";

type StatusFilter = "all" | AchadoStatus;

const STATUS_LABELS: Record<AchadoStatus, string> = {
  published: "Publicado",
  draft: "Rascunho",
  archived: "Arquivado",
};

const STATUS_BADGE_CLASSES: Record<AchadoStatus, string> = {
  published: "bg-success/15 text-success border-success/40",
  draft: "bg-accent/15 text-accent border-accent/40",
  archived: "bg-surface-2 text-text-muted border-border",
};

interface AchadoListClientProps {
  achados: Achado[];
}

export function AchadoListClient({ achados }: AchadoListClientProps) {
  const [filter, setFilter] = useState<StatusFilter>("all");

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
      <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto pb-1">
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
            className={`shrink-0 cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:text-sm ${
              filter === tab.key
                ? "border-accent bg-accent text-bg font-bold"
                : "border-border bg-surface text-text-muted hover:border-primary hover:text-text"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-8 text-center">
          <p className="text-base font-bold text-text">
            Nenhum achado nessa categoria
          </p>
          <p className="mt-1 text-sm text-text-muted">
            Crie seu primeiro achado para começar a preencher a vitrine.
          </p>
          <Link
            href="/admin/achados/novo"
            className={buttonClasses("accent", "sm", "mt-4 font-bold")}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Novo achado</span>
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((item) => (
            <li
              key={item.id}
              className="rounded-2xl border border-border bg-surface p-3.5 transition-colors hover:border-primary/80 sm:p-4"
            >
              <div className="flex gap-3">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border bg-surface-2 sm:h-24 sm:w-24">
                  <Image
                    src={resolveAchadoImageUrl(item.image_path)}
                    alt={item.title}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${STATUS_BADGE_CLASSES[item.status]}`}
                    >
                      {STATUS_LABELS[item.status]}
                    </span>
                    <span className="rounded-full border border-border bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-text-muted">
                      {item.store}
                    </span>
                    <span className="text-[11px] text-text-muted">
                      {formatDatePtBR(item.created_at)}
                    </span>
                  </div>

                  <h2 className="line-clamp-2 text-sm font-bold text-text sm:text-base">
                    {item.title}
                  </h2>

                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-base font-extrabold tabular-nums text-accent">
                      {formatCurrencyBRL(item.price_cents)}
                    </span>
                    {item.original_price_cents &&
                      item.original_price_cents > item.price_cents && (
                        <span className="text-xs tabular-nums text-text-muted line-through">
                          {formatCurrencyBRL(item.original_price_cents)}
                        </span>
                      )}
                  </div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
                <Link
                  href={`/admin/achados/${item.id}/editar`}
                  className={buttonClasses("secondary", "sm", "text-xs")}
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
                      className={buttonClasses("primary", "sm", "text-xs")}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
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
                      className={buttonClasses("ghost", "sm", "text-xs")}
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
                      className={buttonClasses("ghost", "sm", "text-xs")}
                    >
                      <Archive className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Arquivar</span>
                    </button>
                  </form>
                )}

                <form
                  action={deleteAchadoAction}
                  className="ml-auto"
                  onSubmit={(event) => {
                    if (
                      !window.confirm(
                        `Excluir permanentemente "${item.title}"?`,
                      )
                    ) {
                      event.preventDefault();
                    }
                  }}
                >
                  <input type="hidden" name="id" value={item.id} />
                  <button
                    type="submit"
                    aria-label={`Excluir ${item.title}`}
                    className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-xl border border-danger/40 bg-transparent px-3 text-xs font-semibold text-danger transition-colors hover:bg-danger/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Excluir</span>
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
