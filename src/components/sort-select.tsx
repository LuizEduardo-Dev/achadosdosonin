"use client";

import { ArrowUpDown } from "lucide-react";
import type { SortOption } from "@/types/achado";
import { SORT_OPTIONS, UI_COPY } from "@/lib/config";

interface SortSelectProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <label
        htmlFor="storefront-sort"
        className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-text-muted sm:gap-1.5 sm:text-sm"
      >
        <ArrowUpDown className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="sr-only sm:not-sr-only">
          {UI_COPY.filters.sortLabel}:
        </span>
      </label>

      <select
        id="storefront-sort"
        value={value}
        onChange={(event) => onChange(event.target.value as SortOption)}
        className="min-h-9 cursor-pointer rounded-xl border border-border bg-surface-2 px-2.5 py-1 text-xs font-semibold text-text transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:min-h-10 sm:px-3 sm:py-1.5 sm:text-sm"
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
