"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import type { Category } from "@/types/achado";
import { deleteCategoryAction } from "@/app/admin/actions/categories";
import { CategoryCreateForm } from "@/components/admin/categories/category-create-form";
import { CategoryListItem } from "@/components/admin/categories/category-list-item";

interface CategoriesManagerProps {
  categories: Category[];
}

export function CategoriesManager({ categories }: CategoriesManagerProps) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletedIds, setDeletedIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const inFlightDeleteRef = useRef<Set<string>>(new Set());

  const visibleCategories = categories.filter(
    (category) => !deletedIds.has(category.id),
  );

  const handleDelete = async (id: string) => {
    if (inFlightDeleteRef.current.has(id)) return;

    inFlightDeleteRef.current.add(id);
    setDeleteError(null);
    setDeletingId(id);

    try {
      const result = await deleteCategoryAction(id);
      if (!result.ok) {
        setDeleteError(result.error);
        return;
      }

      setConfirmDeleteId((curr) => (curr === id ? null : curr));
      setDeletedIds((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
      router.refresh();
    } catch {
      setDeleteError("Não foi possível excluir o departamento.");
    } finally {
      inFlightDeleteRef.current.delete(id);
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <CategoryCreateForm
        defaultSortOrder={visibleCategories.length + 1}
        onCreated={() => router.refresh()}
      />

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-text">
            Departamentos cadastrados ({visibleCategories.length})
          </h2>
        </div>

        {deleteError && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-danger bg-surface-2 p-3 text-sm text-danger"
          >
            <AlertCircle
              className="mt-0.5 h-4 w-4 shrink-0"
              aria-hidden="true"
            />
            <span>{deleteError}</span>
          </div>
        )}

        {visibleCategories.length === 0 ? (
          <div className="rounded-lg border border-border bg-surface p-6 text-center text-sm text-text-muted">
            Nenhum departamento encontrado. Crie o primeiro acima ou aplique a
            migration de departamentos no Supabase.
          </div>
        ) : (
          <ul className="space-y-2.5">
            {visibleCategories.map((category) => (
              <CategoryListItem
                key={category.id}
                category={category}
                isEditing={editingId === category.id}
                isConfirmingDelete={confirmDeleteId === category.id}
                isDeleting={deletingId === category.id}
                onStartEdit={() => {
                  setConfirmDeleteId(null);
                  setEditingId(category.id);
                }}
                onCancelEdit={() => setEditingId(null)}
                onSaved={() => {
                  setEditingId(null);
                  router.refresh();
                }}
                onRequestDelete={() => setConfirmDeleteId(category.id)}
                onCancelDelete={() => setConfirmDeleteId(null)}
                onConfirmDelete={() => handleDelete(category.id)}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
