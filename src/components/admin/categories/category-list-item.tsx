"use client";

import { Edit3, Loader2, Trash2 } from "lucide-react";
import type { Category } from "@/types/achado";
import { CategoryRowEditor } from "@/components/admin/categories/category-row-editor";
import { Button } from "@/components/ui/button";

interface CategoryListItemProps {
  category: Category;
  isEditing: boolean;
  isConfirmingDelete: boolean;
  isDeleting: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaved: () => void;
  onRequestDelete: () => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
}

export function CategoryListItem({
  category,
  isEditing,
  isConfirmingDelete,
  isDeleting,
  onStartEdit,
  onCancelEdit,
  onSaved,
  onRequestDelete,
  onCancelDelete,
  onConfirmDelete,
}: CategoryListItemProps) {
  return (
    <li
      aria-busy={isDeleting}
      className={`rounded-lg border border-border bg-surface p-4 ${
        isDeleting ? "opacity-70" : ""
      }`}
    >
      {isEditing ? (
        <CategoryRowEditor
          category={category}
          onCancel={onCancelEdit}
          onSaved={onSaved}
        />
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-text">
                {category.name}
              </span>
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                  category.is_active
                    ? "border-badge-bg bg-badge-bg text-badge-text"
                    : "border-border bg-surface-2 text-text-muted"
                }`}
              >
                {category.is_active ? "Ativo" : "Inativo"}
              </span>
            </div>
            <p className="text-xs text-text-muted">
              Slug: <code>/c/{category.slug}</code> · Ordem:{" "}
              {category.sort_order}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={isDeleting}
              onClick={onStartEdit}
            >
              <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Editar</span>
            </Button>

            {isConfirmingDelete ? (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={isDeleting}
                  onClick={onCancelDelete}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  variant="danger-solid"
                  size="sm"
                  disabled={isDeleting}
                  onClick={onConfirmDelete}
                >
                  {isDeleting ? (
                    <Loader2
                      className="h-3.5 w-3.5 animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  <span>
                    {isDeleting ? "Excluindo..." : "Confirmar exclusão"}
                  </span>
                </Button>
              </>
            ) : (
              <Button
                type="button"
                variant="danger-outline"
                size="sm"
                disabled={isDeleting}
                aria-label={`Excluir ${category.name}`}
                onClick={onRequestDelete}
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Excluir</span>
              </Button>
            )}
          </div>
        </div>
      )}
    </li>
  );
}
