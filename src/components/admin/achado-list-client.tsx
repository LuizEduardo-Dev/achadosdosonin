"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Archive,
  CheckCircle2,
  Edit3,
  FileEdit,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import type { Achado, AchadoStatus, Category } from "@/types/achado";
import {
  deleteAchadoAction,
  updateAchadoStatusAction,
} from "@/app/admin/actions";
import { formatDatePtBR } from "@/lib/format";
import { resolveAchadoImageUrl } from "@/lib/supabase/storage";
import { Button, buttonClasses } from "@/components/ui/button";
import { Select } from "@/components/ui/input";

type StatusFilter = "all" | AchadoStatus;
type BusyKind = "deleting" | AchadoStatus;

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
  categories: Category[];
}

export function AchadoListClient({
  achados,
  categories,
}: AchadoListClientProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(
    null,
  );
  const [deletedIds, setDeletedIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [statusOverrides, setStatusOverrides] = useState<
    Record<string, AchadoStatus>
  >({});
  const [busyById, setBusyById] = useState<Record<string, BusyKind>>({});
  const [actionError, setActionError] = useState<string | null>(null);
  const inFlightRef = useRef<Set<string>>(new Set());

  const categoryMap = useMemo(
    () => new Map(categories.map((cat) => [cat.id, cat])),
    [categories],
  );

  const effectiveAchados = useMemo(
    () =>
      achados
        .filter((item) => !deletedIds.has(item.id))
        .map((item) =>
          statusOverrides[item.id]
            ? { ...item, status: statusOverrides[item.id] }
            : item,
        ),
    [achados, deletedIds, statusOverrides],
  );

  const filtered = useMemo(() => {
    return effectiveAchados.filter((item) => {
      if (filter !== "all" && item.status !== filter) {
        return false;
      }
      if (
        categoryFilter !== "all" &&
        !(item.category_ids ?? []).includes(categoryFilter)
      ) {
        return false;
      }
      return true;
    });
  }, [effectiveAchados, filter, categoryFilter]);

  const counts = useMemo(
    () => ({
      all: effectiveAchados.length,
      published: effectiveAchados.filter((i) => i.status === "published")
        .length,
      draft: effectiveAchados.filter((i) => i.status === "draft").length,
      archived: effectiveAchados.filter((i) => i.status === "archived").length,
    }),
    [effectiveAchados],
  );

  const handleStatusChange = async (id: string, nextStatus: AchadoStatus) => {
    if (inFlightRef.current.has(id)) {
      return;
    }

    inFlightRef.current.add(id);
    setActionError(null);
    setBusyById((prev) => ({ ...prev, [id]: nextStatus }));

    try {
      const result = await updateAchadoStatusAction(id, nextStatus);
      if (!result.ok) {
        setActionError(result.error);
        return;
      }

      setStatusOverrides((prev) => ({ ...prev, [id]: nextStatus }));
      router.refresh();
    } catch {
      setActionError("Não foi possível atualizar o status. Tente novamente.");
    } finally {
      inFlightRef.current.delete(id);
      setBusyById((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (inFlightRef.current.has(id)) {
      return;
    }

    inFlightRef.current.add(id);
    setActionError(null);
    setBusyById((prev) => ({ ...prev, [id]: "deleting" }));

    try {
      const result = await deleteAchadoAction(id);
      if (!result.ok) {
        setActionError(result.error);
        return;
      }

      setConfirmingDeleteId((current) => (current === id ? null : current));
      setDeletedIds((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
      router.refresh();
    } catch {
      setActionError("Não foi possível excluir o achado. Tente novamente.");
    } finally {
      inFlightRef.current.delete(id);
      setBusyById((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  return (
    <div className="space-y-4">
      {actionError && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-danger bg-surface-2 p-3 text-sm text-danger"
        >
          <AlertCircle
            className="mt-0.5 h-4 w-4 shrink-0 text-danger"
            aria-hidden="true"
          />
          <span>{actionError}</span>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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

        {categories.length > 0 && (
          <div className="w-full sm:w-64">
            <Select
              aria-label="Filtrar por departamento"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option value="all" className="bg-surface text-text">
                Todos os departamentos
              </option>
              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                  className="bg-surface text-text"
                >
                  {category.name}
                  {!category.is_active ? " (inativo)" : ""}
                </option>
              ))}
            </Select>
          </div>
        )}
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
            const busyKind = busyById[item.id];
            const isBusy = Boolean(busyKind);

            return (
              <li
                key={item.id}
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
                      onClick={() => handleStatusChange(item.id, "published")}
                    >
                      {busyKind === "published" ? (
                        <Loader2
                          className="h-3.5 w-3.5 animate-spin"
                          aria-hidden="true"
                        />
                      ) : (
                        <CheckCircle2
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                      )}
                      <span>
                        {busyKind === "published"
                          ? "Publicando..."
                          : "Publicar"}
                      </span>
                    </Button>
                  )}

                  {item.status !== "draft" && (
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={isBusy}
                      onClick={() => handleStatusChange(item.id, "draft")}
                    >
                      {busyKind === "draft" ? (
                        <Loader2
                          className="h-3.5 w-3.5 animate-spin"
                          aria-hidden="true"
                        />
                      ) : (
                        <FileEdit className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                      <span>
                        {busyKind === "draft" ? "Salvando..." : "Rascunho"}
                      </span>
                    </Button>
                  )}

                  {item.status !== "archived" && (
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={isBusy}
                      onClick={() => handleStatusChange(item.id, "archived")}
                    >
                      {busyKind === "archived" ? (
                        <Loader2
                          className="h-3.5 w-3.5 animate-spin"
                          aria-hidden="true"
                        />
                      ) : (
                        <Archive className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                      <span>
                        {busyKind === "archived" ? "Arquivando..." : "Arquivar"}
                      </span>
                    </Button>
                  )}

                  <div className="ml-auto flex items-center gap-2">
                    {isConfirming ? (
                      <>
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={isBusy}
                          onClick={() => setConfirmingDeleteId(null)}
                        >
                          Cancelar
                        </Button>
                        <Button
                          variant="danger-solid"
                          size="sm"
                          disabled={isBusy}
                          onClick={() => handleDelete(item.id)}
                        >
                          {busyKind === "deleting" ? (
                            <Loader2
                              className="h-3.5 w-3.5 animate-spin"
                              aria-hidden="true"
                            />
                          ) : (
                            <Trash2
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            />
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
