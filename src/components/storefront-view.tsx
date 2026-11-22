"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MessageCircle, Search, Tag, X } from "lucide-react";
import type {
  Achado,
  SiteSettings,
  SortOption,
  TrafficSource,
} from "@/types/achado";
import { SITE_CONFIG, SORT_OPTIONS, UI_COPY } from "@/lib/config";
import { AchadoCard } from "@/components/achado-card";
import { StoreFilter } from "@/components/store-filter";
import { SortSelect } from "@/components/sort-select";
import { StorefrontOverlays } from "@/components/storefront-overlays";
import { Button, buttonClasses } from "@/components/ui/button";

function normalizeForSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

interface StorefrontViewProps {
  achados: Achado[];
  settings: SiteSettings;
  source?: TrafficSource;
}

export function StorefrontView({
  achados,
  settings,
  source,
}: StorefrontViewProps) {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  const whatsappUrl = settings.whatsapp_group_url.trim();

  const handleQueryChange = (nextValue: string) => {
    setQuery(nextValue);

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const trimmed = nextValue.trim();
      if (trimmed) {
        url.searchParams.set("q", trimmed);
      } else {
        url.searchParams.delete("q");
      }
      window.history.replaceState(null, "", url.pathname + url.search);
    }
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

  const filteredAndSortedAchados = useMemo(() => {
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
  }, [achados, selectedStore, normalizedQuery, sortBy]);

  const activeSortLabel =
    SORT_OPTIONS.find((option) => option.value === sortBy)?.label ??
    "Novidades";
  const hasActiveFilter = Boolean(selectedStore || normalizedQuery);
  const count = filteredAndSortedAchados.length;
  const countLabel = `${count} ${count === 1 ? "achado" : "achados"}`;

  const clearAllFilters = () => {
    setSelectedStore(null);
    handleQueryChange("");
  };

  return (
    <div className="flex flex-1 flex-col">
      <header className="rounded-b-2xl bg-ink text-on-ink">
        <div className="mx-auto w-full max-w-[1280px] px-3 py-4 sm:px-5 sm:py-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
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

            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={UI_COPY.header.whatsappAriaLabel}
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
              </a>
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

          <div className="mt-4 border-t border-ink-hover pt-3.5 sm:mt-5 sm:pt-4">
            <p className="text-xs font-medium text-accent-sage">
              {UI_COPY.hero.badge}
            </p>
            <h1 className="mt-1 text-xl font-semibold tracking-[-0.01em] text-on-ink sm:text-2xl">
              {UI_COPY.hero.title}
            </h1>
            <p className="mt-1 text-sm text-on-ink-muted">
              {UI_COPY.hero.subtitle}
            </p>
          </div>
        </div>
      </header>

      <StorefrontOverlays settings={settings} source={source} />

      <div className="mx-auto w-full max-w-[1280px] flex-1 space-y-4 px-3 py-4 sm:px-5 sm:py-6">
        <StoreFilter
          stores={stores}
          selectedStore={selectedStore}
          onSelectStore={setSelectedStore}
        />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p
            aria-live="polite"
            className="text-sm font-medium text-text"
          >
            <span>{activeSortLabel}</span>
            <span className="mx-1.5 text-text-muted" aria-hidden="true">
              ·
            </span>
            <span className="text-text-muted">{countLabel}</span>
            {selectedStore && (
              <span className="text-text-muted"> em {selectedStore}</span>
            )}
          </p>

          <SortSelect value={sortBy} onChange={setSortBy} />
        </div>

        {filteredAndSortedAchados.length > 0 ? (
          <section aria-label="Grade de achados">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
              {filteredAndSortedAchados.map((achado, index) => (
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
