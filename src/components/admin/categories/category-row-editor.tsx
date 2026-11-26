"use client";

import { useState, useTransition } from "react";
import { AlertCircle, Loader2, Save, X } from "lucide-react";
import type { Category } from "@/types/achado";
import { updateCategoryAction } from "@/app/admin/actions/categories";
import type { ActionState } from "@/app/admin/actions/types";
import { slugifyCategoryName } from "@/lib/slug";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const INITIAL_STATE: ActionState = {};

interface CategoryRowEditorProps {
  category: Category;
  onCancel: () => void;
  onSaved: () => void;
}

export function CategoryRowEditor({
  category,
  onCancel,
  onSaved,
}: CategoryRowEditorProps) {
  const [name, setName] = useState(category.name);
  const [slug, setSlug] = useState(category.slug);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(true);
  const [sortOrder, setSortOrder] = useState(String(category.sort_order));
  const [isActive, setIsActive] = useState(category.is_active);
  const [state, setState] = useState<ActionState>(INITIAL_STATE);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isPending) return;

    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await updateCategoryAction(
        category.id,
        INITIAL_STATE,
        formData,
      );
      setState(result);
      if (result.success) {
        onSaved();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3">
      {state.error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-danger bg-surface-2 p-2.5 text-xs text-danger"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{state.error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="space-y-1">
          <label
            htmlFor={`edit-cat-name-${category.id}`}
            className="block text-xs font-medium text-text"
          >
            Nome *
          </label>
          <Input
            id={`edit-cat-name-${category.id}`}
            name="name"
            required
            maxLength={80}
            value={name}
            onChange={(event) => {
              const nextName = event.target.value;
              setName(nextName);
              if (!slugManuallyEdited) {
                setSlug(slugifyCategoryName(nextName));
              }
            }}
            className={state.fieldErrors?.name ? "border-danger" : ""}
          />
          {state.fieldErrors?.name && (
            <p className="text-xs text-danger">{state.fieldErrors.name}</p>
          )}
        </div>

        <div className="space-y-1">
          <label
            htmlFor={`edit-cat-slug-${category.id}`}
            className="block text-xs font-medium text-text"
          >
            Slug *
          </label>
          <Input
            id={`edit-cat-slug-${category.id}`}
            name="slug"
            required
            maxLength={80}
            value={slug}
            onChange={(event) => {
              setSlugManuallyEdited(true);
              setSlug(event.target.value.toLowerCase());
            }}
            className={state.fieldErrors?.slug ? "border-danger" : ""}
          />
          {state.fieldErrors?.slug && (
            <p className="text-xs text-danger">{state.fieldErrors.slug}</p>
          )}
        </div>

        <div className="space-y-1">
          <label
            htmlFor={`edit-cat-order-${category.id}`}
            className="block text-xs font-medium text-text"
          >
            Ordem
          </label>
          <Input
            id={`edit-cat-order-${category.id}`}
            name="sort_order"
            type="number"
            min={0}
            max={9999}
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
            className={state.fieldErrors?.sort_order ? "border-danger" : ""}
          />
          {state.fieldErrors?.sort_order && (
            <p className="text-xs text-danger">
              {state.fieldErrors.sort_order}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-text">
          <input
            type="checkbox"
            name="is_active"
            checked={isActive}
            onChange={(event) => setIsActive(event.target.checked)}
            className="h-4 w-4 rounded border-border accent-ink"
          />
          <span>Departamento ativo</span>
        </label>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={isPending}
            onClick={onCancel}
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Cancelar</span>
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={isPending}>
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            <span>{isPending ? "Salvando..." : "Salvar"}</span>
          </Button>
        </div>
      </div>
    </form>
  );
}
