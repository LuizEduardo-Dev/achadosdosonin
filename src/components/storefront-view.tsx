"use client";

import { useMemo, useState } from "react";
import { Info, SearchX, Sparkles } from "lucide-react";
import type { Achado, SortOption } from "@/types/achado";
import { UI_COPY } from "@/lib/config";
import { formatAchadosCount } from "@/lib/format";
import { AchadoCard } from "@/components/achado-card";
import { StoreFilter } from "@/components/store-filter";
import { SortSelect } from "@/components/sort-select";
import { Button } from "@/components/ui/button";

interface StorefrontViewProps {
  achados: Achado[];
}

export function StorefrontView({ achados }: StorefrontViewProps) {
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("newest");

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

  const filteredAndSortedAchados = useMemo(() => {
    const filtered = selectedStore
      ? achados.filter((item) => item.store === selectedStore)
      : achados;

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "price_asc":
          return a.price_cents - b.price_cents;
        case "price_desc":
          return b.price_cents - a.price_cents;
        case "newest":
        default:
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
      }
    });
  }, [achados, selectedStore, sortBy]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <section
        aria-labelledby="storefront-heading"
        className="relative mb-6 overflow-hidden rounded-3xl border border-border bg-brand-gradient p-5 shadow-lg sm:mb-8 sm:p-7"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-highlight/20 blur-3xl"
        />
        <div className="relative max-w-2xl space-y-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg/60 px-3 py-1 text-xs font-semibold text-accent backdrop-blur-xs">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            {UI_COPY.hero.badge}
          </span>
          <h1
            id="storefront-heading"
            className="text-2xl font-extrabold tracking-tight text-text sm:text-3xl"
          >
            {UI_COPY.hero.title}
          </h1>
          <p className="text-sm leading-relaxed text-text-muted sm:text-base">
            {UI_COPY.hero.subtitle}
          </p>
        </div>
      </section>

      <section
        aria-label="Filtros e ordenação da vitrine"
        className="mb-5 space-y-3 rounded-2xl border border-border/80 bg-surface/80 p-3.5 sm:mb-6 sm:p-4"
      >
        {stores.length > 0 && (
          <StoreFilter
            stores={stores}
            selectedStore={selectedStore}
            onSelectStore={setSelectedStore}
          />
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-3">
          <p
            aria-live="polite"
            className="text-sm font-semibold text-text-muted"
          >
            Exibindo{" "}
            <span className="font-bold text-text">
              {formatAchadosCount(
                filteredAndSortedAchados.length,
                selectedStore,
              )}
            </span>
          </p>

          <SortSelect value={sortBy} onChange={setSortBy} />
        </div>
      </section>

      {filteredAndSortedAchados.length > 0 ? (
        <section aria-label="Lista de achados">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {filteredAndSortedAchados.map((achado, index) => (
              <AchadoCard
                key={achado.id}
                achado={achado}
                priority={index < 3}
              />
            ))}
          </div>
        </section>
      ) : (
        <section
          aria-live="polite"
          className="flex flex-col items-center justify-center rounded-2xl border border-border bg-surface px-6 py-12 text-center"
        >
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-2 text-text-muted">
            <SearchX className="h-6 w-6" aria-hidden="true" />
          </div>
          <h2 className="text-lg font-bold text-text">
            {UI_COPY.filters.emptyTitle}
          </h2>
          <p className="mt-1 max-w-sm text-sm text-text-muted">
            {UI_COPY.filters.emptyDescription}
          </p>
          {selectedStore && (
            <Button
              variant="secondary"
              size="sm"
              className="mt-4"
              onClick={() => setSelectedStore(null)}
            >
              {UI_COPY.filters.clearFilters}
            </Button>
          )}
        </section>
      )}

      <aside
        aria-label="Avisos importantes"
        className="mt-8 rounded-2xl border border-border/70 bg-surface p-4 text-xs leading-relaxed text-text-muted sm:text-sm"
      >
        <div className="flex items-start gap-2.5">
          <Info
            className="mt-0.5 h-4 w-4 shrink-0 text-accent"
            aria-hidden="true"
          />
          <div className="space-y-1">
            <p className="font-semibold text-text">
              {UI_COPY.disclaimers.priceNotice}
            </p>
            <p>{UI_COPY.disclaimers.affiliateNotice}</p>
          </div>
        </div>
      </aside>
    </div>
  );
}
