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
  if (stores.length < 2) {
    return null;
  }

  return (
    <div
      role="group"
      aria-label={UI_COPY.filters.storeFilterLabel}
      className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-0.5"
    >
      <button
        type="button"
        aria-pressed={selectedStore === null}
        onClick={() => onSelectStore(null)}
        className={`shrink-0 cursor-pointer rounded-full border px-3.5 py-1.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link ${
          selectedStore === null
            ? "border-ink bg-ink font-medium text-on-ink"
            : "border-border bg-surface font-normal text-text hover:bg-surface-2"
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
            className={`shrink-0 cursor-pointer rounded-full border px-3.5 py-1.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link ${
              isActive
                ? "border-ink bg-ink font-medium text-on-ink"
                : "border-border bg-surface font-normal text-text hover:bg-surface-2"
            }`}
          >
            {store}
          </button>
        );
      })}
    </div>
  );
}
