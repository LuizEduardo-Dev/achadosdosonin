"use client";

import type { ReactNode } from "react";
import { toSafeHttpUrl } from "@/lib/utils/url";
import {
  openOfferInAppPrompt,
  shouldInterceptOfferClick,
} from "@/lib/in-app-overlay-store";

interface AffiliateLinkProps {
  href: string;
  storeName: string;
  ariaLabel: string;
  className?: string;
  children: ReactNode;
}

/**
 * Affiliate deal link wrapper.
 * Inside strong in-app browsers (e.g. TikTok), intercepts the tap so the visitor
 * sees options to open in Chrome / store app or copy the offer link instead of
 * getting trapped logged-out inside the WebView.
 */
export function AffiliateLink({
  href,
  storeName,
  ariaLabel,
  className,
  children,
}: AffiliateLinkProps) {
  const safeHref = toSafeHttpUrl(href);
  if (!safeHref) {
    return null;
  }

  return (
    <a
      href={safeHref}
      target="_blank"
      rel="noopener noreferrer sponsored"
      aria-label={ariaLabel}
      className={className}
      onClick={(event) => {
        if (shouldInterceptOfferClick()) {
          event.preventDefault();
          openOfferInAppPrompt(safeHref, storeName);
        }
      }}
    >
      {children}
    </a>
  );
}
