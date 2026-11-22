"use client";

import type { SortOption } from "@/types/achado";
import { SORT_OPTIONS, UI_COPY } from "@/lib/config";

interface SortSelectProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="storefront-sort"
        className="sr-only text-sm font-medium text-text-muted sm:not-sr-only"
      >
        {UI_COPY.filters.sortLabel}
      </label>

      <select
        id="storefront-sort"
        value={value}
        onChange={(event) => onChange(event.target.value as SortOption)}
        className="min-h-10 cursor-pointer rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text transition-colors hover:border-link focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link"
      >
        {SORT_OPTIONS.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-surface text-text"
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
