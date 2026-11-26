"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import type { SiteSettings } from "@/types/achado";
import { UI_COPY } from "@/lib/config";
import { useDialogFocusTrap } from "@/hooks/use-dialog-focus-trap";
import { Button, buttonClasses } from "@/components/ui/button";
import { WhatsAppLink } from "@/components/whatsapp-link";

const STORAGE_KEY = "sonin_links_welcome_modal";
const OPEN_DELAY_MS = 1500;
const DISMISS_COOLDOWN_MS = 24 * 60 * 60 * 1000;
const CTA_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

interface ModalCooldownRecord {
  action: "dismissed" | "clicked_cta";
  timestamp: number;
}

function isWithinCooldown(): boolean {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as Partial<ModalCooldownRecord>;
    if (typeof parsed.timestamp !== "number") return false;

    const cooldownMs =
      parsed.action === "clicked_cta" ? CTA_COOLDOWN_MS : DISMISS_COOLDOWN_MS;
    return Date.now() - parsed.timestamp < cooldownMs;
  } catch {
    return false;
  }
}

function saveCooldown(action: ModalCooldownRecord["action"]): void {
  try {
    const record: ModalCooldownRecord = {
      action,
      timestamp: Date.now(),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Ignore storage errors in restricted browsing modes
  }
}

interface WelcomeModalProps {
  settings: SiteSettings;
  canOpen: boolean;
}

export function WelcomeModal({ settings, canOpen }: WelcomeModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  const whatsappUrl = settings.whatsapp_group_url.trim();
  const isEligible = settings.modal_enabled && Boolean(whatsappUrl);

  const closeModal = useCallback((action: ModalCooldownRecord["action"]) => {
    saveCooldown(action);
    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (!canOpen || !isEligible || isWithinCooldown()) {
      return;
    }

    const timer = window.setTimeout(() => {
      if (!isWithinCooldown()) {
        setIsOpen(true);
      }
    }, OPEN_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [canOpen, isEligible]);

  useDialogFocusTrap(
    dialogRef,
    isOpen && isEligible,
    useCallback(() => closeModal("dismissed"), [closeModal]),
  );

  if (!isOpen || !isEligible) {
    return null;
  }

  return (
    <div
      className="animate-modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-text/60 p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          closeModal("dismissed");
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-modal-title"
        aria-describedby="welcome-modal-message"
        className="animate-modal-content modal-shadow relative w-full max-w-md rounded-xl border border-border bg-surface p-6"
      >
        <button
          type="button"
          onClick={() => closeModal("dismissed")}
          aria-label={UI_COPY.welcomeModal.closeAriaLabel}
          className="absolute top-3.5 right-3.5 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-2 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-badge-bg text-badge-text">
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
        </div>

        <h2
          id="welcome-modal-title"
          className="pr-8 text-lg font-semibold leading-snug text-text sm:text-xl"
        >
          {settings.modal_title || UI_COPY.welcomeModal.defaultTitle}
        </h2>

        <p
          id="welcome-modal-message"
          className="mt-2 text-sm leading-relaxed text-text-muted"
        >
          {settings.modal_message || UI_COPY.welcomeModal.defaultMessage}
        </p>

        <div className="mt-5 flex flex-col gap-2.5">
          <WhatsAppLink
            href={whatsappUrl}
            onClick={() => closeModal("clicked_cta")}
            className={buttonClasses("whatsapp", "md", "w-full font-semibold")}
          >
            <MessageCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{UI_COPY.welcomeModal.ctaLabel}</span>
          </WhatsAppLink>

          <Button
            variant="secondary"
            size="md"
            className="w-full"
            onClick={() => closeModal("dismissed")}
          >
            {UI_COPY.welcomeModal.dismissLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
