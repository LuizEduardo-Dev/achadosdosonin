"use client";

import { useRef } from "react";
import Link from "next/link";
import { LayoutGrid, X } from "lucide-react";
import type { Category } from "@/types/achado";
import { UI_COPY } from "@/lib/config";
import { useDialogFocusTrap } from "@/hooks/use-dialog-focus-trap";

interface DepartmentsDrawerProps {
  open: boolean;
  drawerId: string;
  categories: Category[];
  activeCategorySlug?: string | null;
  onClose: () => void;
}

export function DepartmentsDrawer({
  open,
  drawerId,
  categories,
  activeCategorySlug = null,
  onClose,
}: DepartmentsDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useDialogFocusTrap(panelRef, open, onClose);

  if (!open) {
    return null;
  }

  const isAllActive = !activeCategorySlug;

  return (
    <div
      className="animate-modal-overlay fixed inset-0 z-50 flex justify-start bg-text/60"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        id={drawerId}
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="departments-drawer-title"
        className="modal-shadow flex h-full w-72 max-w-[85vw] flex-col border-r border-border bg-surface text-text motion-reduce:transition-none"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4 text-link" aria-hidden="true" />
            <h2
              id="departments-drawer-title"
              className="text-base font-semibold text-text"
            >
              {UI_COPY.header.departmentsHeading}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={UI_COPY.header.menuCloseAriaLabel}
            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-2 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav
          aria-label="Lista de departamentos"
          className="flex-1 space-y-1 overflow-y-auto p-3"
        >
          <Link
            href="/"
            onClick={onClose}
            aria-current={isAllActive ? "page" : undefined}
            className={`flex min-h-10 items-center rounded-lg px-3 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link ${
              isAllActive
                ? "bg-ink font-semibold text-on-ink"
                : "font-medium text-text hover:bg-surface-2"
            }`}
          >
            {UI_COPY.header.allDealsLabel}
          </Link>

          {categories.map((category) => {
            const isCurrent = activeCategorySlug === category.slug;

            return (
              <Link
                key={category.id}
                href={`/c/${category.slug}`}
                onClick={onClose}
                aria-current={isCurrent ? "page" : undefined}
                className={`flex min-h-10 items-center rounded-lg px-3 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link ${
                  isCurrent
                    ? "bg-ink font-semibold text-on-ink"
                    : "font-normal text-text hover:bg-surface-2"
                }`}
              >
                {category.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
