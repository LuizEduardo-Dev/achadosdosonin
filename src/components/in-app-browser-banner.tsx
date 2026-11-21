"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Compass, Copy, ExternalLink, X } from "lucide-react";
import type { TrafficSource } from "@/types/achado";
import {
  getInAppInstructions,
  type InAppBrowserPlatform,
} from "@/lib/detect-in-app-browser";
import { UI_COPY } from "@/lib/config";
import { Button } from "@/components/ui/button";

interface InAppBrowserBannerProps {
  open: boolean;
  platform: InAppBrowserPlatform | null;
  source?: TrafficSource;
  onDismiss: () => void;
}

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

export function InAppBrowserBanner({
  open,
  platform,
  source,
  onDismiss,
}: InAppBrowserBannerProps) {
  const [copied, setCopied] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const dialog = dialogRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onDismiss();
        return;
      }

      if (event.key !== "Tab" || !dialog) {
        return;
      }

      const focusableElements = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );
      if (focusableElements.length === 0) return;

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
      previouslyFocused?.focus();
    };
  }, [open, onDismiss]);

  if (!open) {
    return null;
  }

  const instructions = getInAppInstructions(platform, source);

  const handleCopyUrl = async () => {
    const shareUrl = `${window.location.origin}/`;

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

  return (
    <div
      className="animate-modal-overlay fixed inset-0 z-50 flex items-end justify-center bg-bg/80 p-4 backdrop-blur-xs sm:items-center"
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="in-app-browser-title"
        aria-describedby="in-app-browser-desc"
        className="animate-modal-content relative w-full max-w-md rounded-3xl border border-border bg-surface p-5 shadow-2xl sm:p-6"
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onDismiss}
          aria-label={UI_COPY.inAppBanner.closeAriaLabel}
          className="absolute top-4 right-4 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface-2 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-3 py-1 text-xs font-semibold text-accent">
          <Compass className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{UI_COPY.inAppBanner.badge}</span>
        </div>

        <h2
          id="in-app-browser-title"
          className="pr-8 text-xl font-extrabold leading-tight text-text"
        >
          {UI_COPY.inAppBanner.title}
        </h2>

        <p
          id="in-app-browser-desc"
          className="mt-2 text-sm leading-relaxed text-text-muted"
        >
          {UI_COPY.inAppBanner.description}
        </p>

        <ol className="mt-4 space-y-2.5 rounded-2xl border border-border/80 bg-surface-2/80 p-3.5 text-sm text-text">
          <li className="flex items-start gap-2.5">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-text">
              1
            </span>
            <span className="pt-0.5 leading-snug">{instructions.steps[0]}</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-text">
              2
            </span>
            <span className="pt-0.5 leading-snug">{instructions.steps[1]}</span>
          </li>
        </ol>

        <div className="mt-5 flex flex-col gap-2.5">
          <Button
            variant="accent"
            size="md"
            className="w-full font-bold"
            onClick={handleCopyUrl}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" aria-hidden="true" />
                <span>{UI_COPY.inAppBanner.copiedButton}</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" aria-hidden="true" />
                <span>{UI_COPY.inAppBanner.copyButton}</span>
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            size="md"
            className="w-full"
            onClick={onDismiss}
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            <span>{UI_COPY.inAppBanner.continueButton}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
