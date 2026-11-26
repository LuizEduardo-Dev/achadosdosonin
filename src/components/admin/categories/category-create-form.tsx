"use client";

import { useState, useTransition } from "react";
import { AlertCircle, CheckCircle2, Loader2, Plus } from "lucide-react";
import { createCategoryAction } from "@/app/admin/actions/categories";
import type { ActionState } from "@/app/admin/actions/types";
import { slugifyCategoryName } from "@/lib/slug";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const INITIAL_STATE: ActionState = {};

interface CategoryCreateFormProps {
  defaultSortOrder: number;
  onCreated: () => void;
}

export function CategoryCreateForm({
  defaultSortOrder,
  onCreated,
}: CategoryCreateFormProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [sortOrder, setSortOrder] = useState(() => String(defaultSortOrder));
  const [isActive, setIsActive] = useState(true);
  const [state, setState] = useState<ActionState>(INITIAL_STATE);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isPending) return;

    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await createCategoryAction(INITIAL_STATE, formData);
      setState(result);
      if (result.success) {
        setName("");
        setSlug("");
        setSlugTouched(false);
        setSortOrder(String(defaultSortOrder + 1));
        setIsActive(true);
        onCreated();
      }
    });
  };

  return (
    <section className="rounded-lg border border-border bg-surface p-5 sm:p-6">
      <h2 className="text-base font-semibold text-text">Novo departamento</h2>

      <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-4">
        {state.error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-danger bg-surface-2 p-3 text-sm text-danger"
          >
            <AlertCircle
              className="mt-0.5 h-4 w-4 shrink-0"
              aria-hidden="true"
            />
            <span>{state.error}</span>
          </div>
        )}

        {state.success && (
          <div
            role="status"
            className="flex items-start gap-2 rounded-lg border border-badge-bg bg-badge-bg p-3 text-sm font-medium text-badge-text"
          >
            <CheckCircle2
              className="mt-0.5 h-4 w-4 shrink-0"
              aria-hidden="true"
            />
            <span>{state.success}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <label
              htmlFor="new-cat-name"
              className="block text-sm font-medium text-text"
            >
              Nome *
            </label>
            <Input
              id="new-cat-name"
              name="name"
              required
              maxLength={80}
              value={name}
              onChange={(event) => {
                const nextName = event.target.value;
                setName(nextName);
                if (!slugTouched) {
                  setSlug(slugifyCategoryName(nextName));
                }
              }}
              placeholder="Ex.: Eletrônicos/Tecnologia"
              className={state.fieldErrors?.name ? "border-danger" : ""}
            />
            {state.fieldErrors?.name && (
              <p className="text-xs text-danger">{state.fieldErrors.name}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="new-cat-slug"
              className="block text-sm font-medium text-text"
            >
              Slug *
            </label>
            <Input
              id="new-cat-slug"
              name="slug"
              required
              maxLength={80}
              value={slug}
              onChange={(event) => {
                const raw = event.target.value;
                if (!raw.trim()) {
                  setSlugTouched(false);
                  setSlug("");
                  return;
                }
                setSlugTouched(true);
                setSlug(raw.toLowerCase());
              }}
              placeholder="eletronicos-tecnologia"
              className={state.fieldErrors?.slug ? "border-danger" : ""}
            />
            {state.fieldErrors?.slug && (
              <p className="text-xs text-danger">{state.fieldErrors.slug}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="new-cat-order"
              className="block text-sm font-medium text-text"
            >
              Ordem
            </label>
            <Input
              id="new-cat-order"
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

          <Button type="submit" variant="primary" size="md" disabled={isPending}>
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Plus className="h-4 w-4" aria-hidden="true" />
            )}
            <span>{isPending ? "Criando..." : "Criar departamento"}</span>
          </Button>
        </div>
      </form>
    </section>
  );
}
