"use client";

import { useState } from "react";
import { Check, Copy, X } from "lucide-react";
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

export function InAppBrowserBanner({
  open,
  platform,
  source,
  onDismiss,
}: InAppBrowserBannerProps) {
  const [copied, setCopied] = useState(false);

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
    <div className="mx-auto w-full max-w-[1280px] px-3 pt-3 sm:px-5">
      <aside
        role="region"
        aria-label="Aviso de navegador interno"
        className="flex flex-col gap-3 rounded-lg border border-border bg-surface-2 px-3.5 py-3 text-sm text-text sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="min-w-0 flex-1 pr-2">
          <p className="font-medium text-text">
            Abra no navegador do celular para evitar travas no login das lojas.
          </p>
          <p className="mt-0.5 text-xs text-text-muted">
            No {instructions.appName}: {instructions.steps[0]}{" "}
            {instructions.steps[1]}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button variant="secondary" size="sm" onClick={handleCopyUrl}>
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{UI_COPY.inAppBanner.copiedButton}</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{UI_COPY.inAppBanner.copyButton}</span>
              </>
            )}
          </Button>

          <button
            type="button"
            onClick={onDismiss}
            className="min-h-9 cursor-pointer rounded-lg px-2.5 text-xs font-medium text-text-muted underline underline-offset-2 transition-colors hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link"
          >
            {UI_COPY.inAppBanner.continueButton}
          </button>

          <button
            type="button"
            onClick={onDismiss}
            aria-label={UI_COPY.inAppBanner.closeAriaLabel}
            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </aside>
    </div>
  );
}
