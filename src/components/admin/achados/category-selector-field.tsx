"use client";

import type { Category } from "@/types/achado";
import { MAX_ACHADO_CATEGORIES } from "@/lib/validators/admin";

interface CategorySelectorFieldProps {
  categories: Category[];
  selectedIds: string[];
  onToggle: (categoryId: string) => void;
  error?: string;
}

export function CategorySelectorField({
  categories,
  selectedIds,
  onToggle,
  error,
}: CategorySelectorFieldProps) {
  const selectableCategories = categories.filter(
    (category) => category.is_active || selectedIds.includes(category.id),
  );
  const maxCategoriesReached = selectedIds.length >= MAX_ACHADO_CATEGORIES;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="block text-sm font-medium text-text">
          Departamentos{" "}
          <span className="font-normal text-text-muted">
            (opcional, máx. {MAX_ACHADO_CATEGORIES})
          </span>
        </span>
        <span className="text-xs text-text-muted">
          Selecionados: {selectedIds.length}/{MAX_ACHADO_CATEGORIES}
        </span>
      </div>

      {selectableCategories.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selectableCategories.map((category) => {
            const isSelected = selectedIds.includes(category.id);
            const isDisabled = maxCategoriesReached && !isSelected;

            return (
              <label
                key={category.id}
                className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors sm:text-sm ${
                  isSelected
                    ? "cursor-pointer border-ink bg-ink text-on-ink"
                    : isDisabled
                      ? "cursor-not-allowed border-border bg-surface-2 text-text-muted opacity-55"
                      : "cursor-pointer border-border bg-surface text-text hover:bg-surface-2"
                }`}
              >
                <input
                  type="checkbox"
                  name="category_ids"
                  value={category.id}
                  checked={isSelected}
                  disabled={isDisabled}
                  onChange={() => onToggle(category.id)}
                  className="sr-only"
                />
                <span>
                  {category.name}
                  {!category.is_active ? " (inativo)" : ""}
                </span>
              </label>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-text-muted">
          Nenhum departamento cadastrado ainda. Você pode criá-los na aba
          Departamentos.
        </p>
      )}

      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
