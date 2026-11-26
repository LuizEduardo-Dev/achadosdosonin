"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Edit3,
  Loader2,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import type { Category } from "@/types/achado";
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
  type ActionState,
} from "@/app/admin/actions";
import { slugifyCategoryName } from "@/lib/slug";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const INITIAL_STATE: ActionState = {};

interface CategoryRowEditorProps {
  category: Category;
  onCancel: () => void;
  onSaved: () => void;
}

function CategoryRowEditor({
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

interface CategoriesManagerProps {
  categories: Category[];
}

export function CategoriesManager({ categories }: CategoriesManagerProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [sortOrder, setSortOrder] = useState(() =>
    String(categories.length + 1),
  );
  const [isActive, setIsActive] = useState(true);
  const [createState, setCreateState] = useState<ActionState>(INITIAL_STATE);
  const [isCreating, startCreateTransition] = useTransition();

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

  const handleCreateSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isCreating) return;

    const formData = new FormData(event.currentTarget);
    startCreateTransition(async () => {
      const result = await createCategoryAction(INITIAL_STATE, formData);
      setCreateState(result);
      if (result.success) {
        setName("");
        setSlug("");
        setSlugTouched(false);
        setSortOrder(String(visibleCategories.length + 2));
        setIsActive(true);
        router.refresh();
      }
    });
  };

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
      <section className="rounded-lg border border-border bg-surface p-5 sm:p-6">
        <h2 className="text-base font-semibold text-text">
          Novo departamento
        </h2>

        <form onSubmit={handleCreateSubmit} noValidate className="mt-4 space-y-4">
          {createState.error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-danger bg-surface-2 p-3 text-sm text-danger"
            >
              <AlertCircle
                className="mt-0.5 h-4 w-4 shrink-0"
                aria-hidden="true"
              />
              <span>{createState.error}</span>
            </div>
          )}

          {createState.success && (
            <div
              role="status"
              className="flex items-start gap-2 rounded-lg border border-badge-bg bg-badge-bg p-3 text-sm font-medium text-badge-text"
            >
              <CheckCircle2
                className="mt-0.5 h-4 w-4 shrink-0"
                aria-hidden="true"
              />
              <span>{createState.success}</span>
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
                className={createState.fieldErrors?.name ? "border-danger" : ""}
              />
              {createState.fieldErrors?.name && (
                <p className="text-xs text-danger">
                  {createState.fieldErrors.name}
                </p>
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
                className={createState.fieldErrors?.slug ? "border-danger" : ""}
              />
              {createState.fieldErrors?.slug && (
                <p className="text-xs text-danger">
                  {createState.fieldErrors.slug}
                </p>
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
                className={
                  createState.fieldErrors?.sort_order ? "border-danger" : ""
                }
              />
              {createState.fieldErrors?.sort_order && (
                <p className="text-xs text-danger">
                  {createState.fieldErrors.sort_order}
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

            <Button type="submit" variant="primary" size="md" disabled={isCreating}>
              {isCreating ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Plus className="h-4 w-4" aria-hidden="true" />
              )}
              <span>{isCreating ? "Criando..." : "Criar departamento"}</span>
            </Button>
          </div>
        </form>
      </section>

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
            {visibleCategories.map((category) => {
              const isEditing = editingId === category.id;
              const isConfirming = confirmDeleteId === category.id;
              const isDeleting = deletingId === category.id;

              return (
                <li
                  key={category.id}
                  aria-busy={isDeleting}
                  className={`rounded-lg border border-border bg-surface p-4 ${
                    isDeleting ? "opacity-70" : ""
                  }`}
                >
                  {isEditing ? (
                    <CategoryRowEditor
                      category={category}
                      onCancel={() => setEditingId(null)}
                      onSaved={() => {
                        setEditingId(null);
                        router.refresh();
                      }}
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
                          onClick={() => {
                            setConfirmDeleteId(null);
                            setEditingId(category.id);
                          }}
                        >
                          <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Editar</span>
                        </Button>

                        {isConfirming ? (
                          <>
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              disabled={isDeleting}
                              onClick={() => setConfirmDeleteId(null)}
                            >
                              Cancelar
                            </Button>
                            <Button
                              type="button"
                              variant="danger-solid"
                              size="sm"
                              disabled={isDeleting}
                              onClick={() => handleDelete(category.id)}
                            >
                              {isDeleting ? (
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
                                {isDeleting
                                  ? "Excluindo..."
                                  : "Confirmar exclusão"}
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
                            onClick={() => setConfirmDeleteId(category.id)}
                          >
                            <Trash2
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            />
                            <span>Excluir</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
