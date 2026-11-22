"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Check, Copy, ExternalLink, X } from "lucide-react";
import type { InAppAppKey, InAppPolicy } from "@/lib/in-app-policy";
import {
  buildAndroidIntentUrl,
  getInAppCopy,
  type MobileOS,
} from "@/lib/detect-in-app-browser";
import { UI_COPY } from "@/lib/config";
import { Button, buttonClasses } from "@/components/ui/button";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

interface InAppBrowserBannerProps {
  open: boolean;
  policy: Exclude<InAppPolicy, "off">;
  appKey: InAppAppKey | null;
  os: MobileOS;
  onDismiss: () => void;
}

export function InAppBrowserBanner({
  open,
  policy,
  appKey,
  os,
  onDismiss,
}: InAppBrowserBannerProps) {
  const [copied, setCopied] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const isStrong = policy === "strong";

  useEffect(() => {
    if (!open || !isStrong) return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const focusableElements = Array.from(
      dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    );
    focusableElements[0]?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onDismiss();
        return;
      }

      if (event.key !== "Tab" || focusableElements.length === 0) {
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [open, isStrong, onDismiss]);

  if (!open) {
    return null;
  }

  const copy = getInAppCopy(appKey);
  const currentHref =
    typeof window !== "undefined" ? window.location.href : "";
  const androidIntentUrl =
    isStrong && os === "android" && currentHref
      ? buildAndroidIntentUrl(currentHref)
      : null;

  const handleCopyUrl = async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}${window.location.search}`;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = shareUrl;
        textArea.setAttribute("readonly", "");
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  if (isStrong) {
    return (
      <div
        className="animate-modal-overlay fixed inset-0 z-50 flex items-end justify-center bg-text/60 sm:items-center sm:p-4"
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            onDismiss();
          }
        }}
      >
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="in-app-strong-title"
          aria-describedby="in-app-strong-desc"
          className="animate-modal-content modal-shadow relative w-full max-w-md rounded-t-2xl border border-border bg-surface p-5 sm:rounded-xl sm:p-6"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1 text-xs font-medium text-text">
              <span>Menu no topo direito</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-link" aria-hidden="true" />
            </span>

            <button
              type="button"
              onClick={onDismiss}
              aria-label={UI_COPY.inAppBanner.closeAriaLabel}
              className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-2 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <h2
            id="in-app-strong-title"
            className="text-lg font-semibold leading-snug text-text sm:text-xl"
          >
            {copy.strongTitle}
          </h2>

          <p
            id="in-app-strong-desc"
            className="mt-2 text-sm leading-relaxed text-text-muted"
          >
            {copy.strongSteps}
          </p>

          <div className="mt-5 flex flex-col gap-2.5">
            {androidIntentUrl && (
              <a
                href={androidIntentUrl}
                className={buttonClasses("primary", "md", "w-full")}
              >
                <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Abrir no navegador</span>
              </a>
            )}

            <Button
              variant="secondary"
              size="md"
              className="w-full"
              onClick={handleCopyUrl}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{UI_COPY.inAppBanner.copiedButton}</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{UI_COPY.inAppBanner.copyButton}</span>
                </>
              )}
            </Button>

            <button
              type="button"
              onClick={onDismiss}
              className="min-h-10 w-full cursor-pointer rounded-lg px-3 text-sm font-medium text-text-muted transition-colors hover:bg-surface-2 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link"
            >
              {UI_COPY.inAppBanner.continueButton}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1280px] px-3 pt-3 sm:px-5">
      <aside
        role="region"
        aria-label="Aviso de navegador embutido"
        className="flex flex-col gap-2.5 rounded-lg border border-border bg-surface-2 px-3.5 py-3 text-sm text-text sm:flex-row sm:items-center sm:justify-between"
      >
        <p className="min-w-0 flex-1 text-xs leading-relaxed text-text sm:text-sm">
          {copy.softMessage}
        </p>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleCopyUrl}>
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{UI_COPY.inAppBanner.copiedButton}</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Copiar link</span>
              </>
            )}
          </Button>

          <button
            type="button"
            onClick={onDismiss}
            aria-label={UI_COPY.inAppBanner.closeAriaLabel}
            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </aside>
    </div>
  );
}
