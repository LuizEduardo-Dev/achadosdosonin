"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Menu, MessageCircle, Search, Tag, X } from "lucide-react";
import type {
  Achado,
  Category,
  SiteSettings,
  TrafficSource,
} from "@/types/achado";
import { SITE_CONFIG, UI_COPY } from "@/lib/config";
import { AchadoCard } from "@/components/achado-card";
import { DepartmentsDrawer } from "@/components/departments-drawer";
import { StoreFilter } from "@/components/store-filter";
import { StorefrontOverlays } from "@/components/storefront-overlays";
import { WhatsAppLink } from "@/components/whatsapp-link";
import { Button, buttonClasses } from "@/components/ui/button";

function normalizeForSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function syncUrlSearchParams(nextQuery: string, nextStore: string | null): void {
  if (typeof window === "undefined") {
    return;
  }

  const url = new URL(window.location.href);
  const trimmedQuery = nextQuery.trim();

  if (trimmedQuery) {
    url.searchParams.set("q", trimmedQuery);
  } else {
    url.searchParams.delete("q");
  }

  if (nextStore) {
    url.searchParams.set("loja", nextStore);
  } else {
    url.searchParams.delete("loja");
  }

  window.history.replaceState(null, "", url.pathname + url.search);
}

interface StorefrontViewProps {
  achados: Achado[];
  categories: Category[];
  settings: SiteSettings;
  source?: TrafficSource;
  activeCategory?: Category;
}

export function StorefrontView({
  achados,
  categories,
  settings,
  source,
  activeCategory,
}: StorefrontViewProps) {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const [selectedStore, setSelectedStore] = useState<string | null>(() => {
    const storeParam = searchParams.get("loja")?.trim();
    return storeParam || null;
  });
  const [drawerOpen, setDrawerOpen] = useState(false);

  const drawerId = "departments-drawer";
  const whatsappUrl = settings.whatsapp_group_url.trim();

  const handleQueryChange = (nextValue: string) => {
    setQuery(nextValue);
    syncUrlSearchParams(nextValue, selectedStore);
  };

  const handleStoreChange = (nextStore: string | null) => {
    setSelectedStore(nextStore);
    syncUrlSearchParams(query, nextStore);
  };

  const stores = useMemo(() => {
    const uniqueStores = new Set<string>();
    for (const item of achados) {
      if (item.store.trim()) {
        uniqueStores.add(item.store.trim());
      }
    }
    return Array.from(uniqueStores).sort((a, b) =>
      a.localeCompare(b, "pt-BR"),
    );
  }, [achados]);

  const normalizedQuery = useMemo(() => normalizeForSearch(query), [query]);

  const filteredAchados = useMemo(() => {
    const filtered = achados.filter((item) => {
      if (selectedStore && item.store !== selectedStore) {
        return false;
      }
      if (
        normalizedQuery &&
        !normalizeForSearch(item.title).includes(normalizedQuery)
      ) {
        return false;
      }
      return true;
    });

    return [...filtered].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }, [achados, selectedStore, normalizedQuery]);

  const hasActiveFilter = Boolean(selectedStore || normalizedQuery);
  const count = filteredAchados.length;
  const countLabel = `${count} ${count === 1 ? "achado" : "achados"}`;

  const clearAllFilters = () => {
    setSelectedStore(null);
    setQuery("");
    syncUrlSearchParams("", null);
  };

  return (
    <div className="flex flex-1 flex-col">
      <header className="rounded-b-2xl bg-ink text-on-ink">
        <div className="mx-auto w-full max-w-[1280px] px-3 py-2.5 sm:px-5 sm:py-3">
          <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
            <div className="order-1 flex min-w-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                aria-label={UI_COPY.header.menuOpenAriaLabel}
                aria-expanded={drawerOpen}
                aria-controls={drawerId}
                className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg text-on-ink transition-colors hover:bg-ink-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-sage"
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </button>

              <Link
                href="/"
                className="flex min-w-0 items-center gap-2 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-sage"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink-hover text-accent-sage">
                  <Tag className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="truncate text-base font-semibold text-on-ink sm:text-lg">
                  {SITE_CONFIG.name}
                </span>
              </Link>
            </div>

            {whatsappUrl && (
              <WhatsAppLink
                href={whatsappUrl}
                ariaLabel={UI_COPY.header.whatsappAriaLabel}
                className={buttonClasses(
                  "whatsapp",
                  "sm",
                  "order-2 shrink-0 font-semibold sm:order-3",
                )}
              >
                <MessageCircle
                  className="h-4 w-4 shrink-0"
                  aria-hidden="true"
                />
                <span>{UI_COPY.header.whatsappCta}</span>
              </WhatsAppLink>
            )}

            <div className="order-3 w-full sm:order-2 sm:max-w-md sm:flex-1">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-text-muted"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => handleQueryChange(event.target.value)}
                  placeholder={UI_COPY.header.searchPlaceholder}
                  aria-label={UI_COPY.header.searchAriaLabel}
                  className="min-h-10 w-full rounded-lg border border-border bg-surface py-2 pr-9 pl-9 text-sm text-text placeholder:text-text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => handleQueryChange("")}
                    aria-label={UI_COPY.header.clearSearchAriaLabel}
                    className="absolute top-1/2 right-2 inline-flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-2 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <DepartmentsDrawer
        open={drawerOpen}
        drawerId={drawerId}
        categories={categories}
        activeCategorySlug={activeCategory?.slug ?? null}
        onClose={() => setDrawerOpen(false)}
      />

      <StorefrontOverlays settings={settings} source={source} />

      <div className="mx-auto w-full max-w-[1280px] flex-1 space-y-4 px-3 py-4 sm:px-5 sm:py-6">
        {activeCategory ? (
          <h1 className="text-xl font-semibold tracking-[-0.01em] text-text sm:text-2xl">
            {activeCategory.name}
          </h1>
        ) : (
          <h1 className="sr-only">Achados</h1>
        )}

        <StoreFilter
          stores={stores}
          selectedStore={selectedStore}
          onSelectStore={handleStoreChange}
        />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p
            aria-live="polite"
            className="text-sm font-medium text-text-muted"
          >
            {activeCategory && (
              <>
                <span className="text-text">{activeCategory.name}</span>
                <span className="mx-1.5" aria-hidden="true">
                  ·
                </span>
              </>
            )}
            <span>{countLabel}</span>
            {selectedStore && <span> em {selectedStore}</span>}
          </p>
        </div>

        {filteredAchados.length > 0 ? (
          <section aria-label="Grade de achados">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
              {filteredAchados.map((achado, index) => (
                <AchadoCard
                  key={achado.id}
                  achado={achado}
                  priority={index < 5}
                />
              ))}
            </div>
          </section>
        ) : (
          <section
            aria-live="polite"
            className="flex flex-col items-center justify-center rounded-lg border border-border bg-surface px-5 py-12 text-center"
          >
            <h2 className="text-base font-semibold text-text">
              {UI_COPY.filters.emptyTitle}
            </h2>
            <p className="mt-1 max-w-md text-sm text-text-muted">
              {hasActiveFilter
                ? UI_COPY.filters.emptyFilteredDescription
                : UI_COPY.filters.emptyDefaultDescription}
            </p>
            {hasActiveFilter && (
              <Button
                variant="secondary"
                size="md"
                className="mt-4"
                onClick={clearAllFilters}
              >
                {UI_COPY.filters.clearFilters}
              </Button>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
