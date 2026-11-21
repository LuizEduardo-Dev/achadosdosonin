"use client";

import { UI_COPY } from "@/lib/config";

interface StoreFilterProps {
  stores: string[];
  selectedStore: string | null;
  onSelectStore: (store: string | null) => void;
}

export function StoreFilter({
  stores,
  selectedStore,
  onSelectStore,
}: StoreFilterProps) {
  return (
    <div
      role="group"
      aria-label={UI_COPY.filters.storeFilterLabel}
      className="no-scrollbar flex items-center gap-1.5 overflow-x-auto pb-0.5 sm:gap-2"
    >
      <button
        type="button"
        aria-pressed={selectedStore === null}
        onClick={() => onSelectStore(null)}
        className={`shrink-0 cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:px-3.5 sm:py-2 sm:text-sm ${
          selectedStore === null
            ? "border-accent bg-accent text-bg"
            : "border-border bg-surface text-text-muted hover:border-primary hover:bg-surface-2 hover:text-text"
        }`}
      >
        {UI_COPY.filters.allStores}
      </button>

      {stores.map((store) => {
        const isActive = selectedStore === store;
        return (
          <button
            key={store}
            type="button"
            aria-pressed={isActive}
            onClick={() => onSelectStore(isActive ? null : store)}
            className={`shrink-0 cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:px-3.5 sm:py-2 sm:text-sm ${
              isActive
                ? "border-accent bg-accent text-bg"
                : "border-border bg-surface text-text-muted hover:border-primary hover:bg-surface-2 hover:text-text"
            }`}
          >
            {store}
          </button>
        );
      })}
    </div>
  );
}
