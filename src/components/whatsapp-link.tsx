"use client";

import type { ReactNode } from "react";
import { WHATSAPP_LINK_CONFIG } from "@/lib/config";
import { toSafeHttpUrl } from "@/lib/utils/url";
import {
  openWhatsappInAppPrompt,
  shouldInterceptWhatsappClick,
} from "@/lib/in-app-overlay-store";

interface WhatsAppLinkProps {
  href: string;
  ariaLabel?: string;
  className?: string;
  onClick?: () => void;
  children: ReactNode;
}

/**
 * Shared WhatsApp CTA link used across header, WelcomeModal, and /grupo.
 * Inside strong/soft in-app browsers, intercepts navigation so the user sees
 * the 2.5 browser-exit prompt instead of breaking on chat.whatsapp.com inside the webview.
 */
export function WhatsAppLink({
  href,
  ariaLabel,
  className,
  onClick,
  children,
}: WhatsAppLinkProps) {
  const safeHref = toSafeHttpUrl(href);
  if (!safeHref) {
    return null;
  }

  const target = WHATSAPP_LINK_CONFIG.openInSameTab ? undefined : "_blank";
  const rel = WHATSAPP_LINK_CONFIG.openInSameTab
    ? undefined
    : "noopener noreferrer";

  return (
    <a
      href={safeHref}
      target={target}
      rel={rel}
      aria-label={ariaLabel}
      className={className}
      onClick={(event) => {
        if (shouldInterceptWhatsappClick()) {
          event.preventDefault();
          onClick?.();
          openWhatsappInAppPrompt(safeHref);
          return;
        }
        onClick?.();
      }}
    >
      {children}
    </a>
  );
}
