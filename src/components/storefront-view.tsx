"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type {
  Achado,
  Category,
  SiteSettings,
  TrafficSource,
} from "@/types/achado";
import { UI_COPY } from "@/lib/config";
import {
  normalizeForSearch,
  syncStorefrontSearchParams,
} from "@/lib/utils/search";
import { AchadoCard } from "@/components/achado-card";
import { DepartmentsDrawer } from "@/components/departments-drawer";
import { StoreFilter } from "@/components/store-filter";
import { StorefrontHeader } from "@/components/storefront-header";
import { StorefrontOverlays } from "@/components/storefront-overlays";
import { Button } from "@/components/ui/button";

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
    syncStorefrontSearchParams(nextValue, selectedStore);
  };

  const handleStoreChange = (nextStore: string | null) => {
    setSelectedStore(nextStore);
    syncStorefrontSearchParams(query, nextStore);
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
    syncStorefrontSearchParams("", null);
  };

  return (
    <div className="flex flex-1 flex-col">
      <StorefrontHeader
        drawerOpen={drawerOpen}
        drawerId={drawerId}
        onOpenDrawer={() => setDrawerOpen(true)}
        query={query}
        onQueryChange={handleQueryChange}
        whatsappUrl={whatsappUrl}
      />

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
