"use client";

import Link from "next/link";
import { Menu, MessageCircle, Search, Tag, X } from "lucide-react";
import { SITE_CONFIG, UI_COPY } from "@/lib/config";
import { WhatsAppLink } from "@/components/whatsapp-link";
import { buttonClasses } from "@/components/ui/button";

interface StorefrontHeaderProps {
  drawerOpen: boolean;
  drawerId: string;
  onOpenDrawer: () => void;
  query: string;
  onQueryChange: (value: string) => void;
  whatsappUrl: string;
}

export function StorefrontHeader({
  drawerOpen,
  drawerId,
  onOpenDrawer,
  query,
  onQueryChange,
  whatsappUrl,
}: StorefrontHeaderProps) {
  return (
    <header className="rounded-b-2xl bg-ink text-on-ink">
      <div className="mx-auto w-full max-w-[1280px] px-3 py-2.5 sm:px-5 sm:py-3">
        <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
          <div className="order-1 flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={onOpenDrawer}
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
                onChange={(event) => onQueryChange(event.target.value)}
                placeholder={UI_COPY.header.searchPlaceholder}
                aria-label={UI_COPY.header.searchAriaLabel}
                className="min-h-10 w-full rounded-lg border border-border bg-surface py-2 pr-9 pl-9 text-sm text-text placeholder:text-text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => onQueryChange("")}
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
  );
}
