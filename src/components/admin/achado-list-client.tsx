"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Plus } from "lucide-react";
import type { Achado, AchadoStatus, Category } from "@/types/achado";
import {
  deleteAchadoAction,
  updateAchadoStatusAction,
} from "@/app/admin/actions/achados";
import {
  AchadoListItem,
  type BusyKind,
} from "@/components/admin/achados/achado-list-item";
import { buttonClasses } from "@/components/ui/button";
import { Select } from "@/components/ui/input";

type StatusFilter = "all" | AchadoStatus;

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

  const clearBusy = (id: string) => {
    inFlightRef.current.delete(id);
    setBusyById((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleStatusChange = async (id: string, nextStatus: AchadoStatus) => {
    if (inFlightRef.current.has(id)) return;

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
      clearBusy(id);
    }
  };

  const handleDelete = async (id: string) => {
    if (inFlightRef.current.has(id)) return;

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
      clearBusy(id);
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
          {filtered.map((item) => (
            <AchadoListItem
              key={item.id}
              item={item}
              categoryMap={categoryMap}
              busyKind={busyById[item.id]}
              isConfirmingDelete={confirmingDeleteId === item.id}
              onStatusChange={handleStatusChange}
              onRequestDelete={setConfirmingDeleteId}
              onCancelDelete={() => setConfirmingDeleteId(null)}
              onConfirmDelete={handleDelete}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
