"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MessageCircle, Sparkles, X } from "lucide-react";
import type { SiteSettings } from "@/types/achado";
import { UI_COPY } from "@/lib/config";
import { Button, buttonClasses } from "@/components/ui/button";

const STORAGE_KEY = "sonin_links_welcome_modal";
const OPEN_DELAY_MS = 1500;
const DISMISS_COOLDOWN_MS = 24 * 60 * 60 * 1000;
const CTA_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

interface ModalCooldownRecord {
  action: "dismissed" | "clicked_cta";
  timestamp: number;
}

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

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
  const previousFocusRef = useRef<HTMLElement | null>(null);

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
        previousFocusRef.current = document.activeElement as HTMLElement | null;
        setIsOpen(true);
      }
    }, OPEN_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [canOpen, isEligible]);

  useEffect(() => {
    if (!isOpen) return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    const focusableElements = Array.from(
      dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    );
    focusableElements[0]?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeModal("dismissed");
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
  }, [isOpen, closeModal]);

  if (!isOpen || !isEligible) {
    return null;
  }

  return (
    <div
      className="animate-modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-bg/80 p-4 backdrop-blur-xs"
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
        className="animate-modal-content relative w-full max-w-md overflow-hidden rounded-3xl border border-border bg-surface p-6 shadow-2xl"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-14 -right-14 h-36 w-36 rounded-full bg-primary/30 blur-3xl"
        />

        <button
          type="button"
          onClick={() => closeModal("dismissed")}
          aria-label={UI_COPY.welcomeModal.closeAriaLabel}
          className="absolute top-4 right-4 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface-2 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="relative">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gradient text-accent shadow-md">
            <Sparkles className="h-6 w-6" aria-hidden="true" />
          </div>

          <h2
            id="welcome-modal-title"
            className="pr-8 text-xl font-extrabold leading-tight text-text sm:text-2xl"
          >
            {settings.modal_title || UI_COPY.welcomeModal.defaultTitle}
          </h2>

          <p
            id="welcome-modal-message"
            className="mt-2.5 text-sm leading-relaxed text-text-muted sm:text-base"
          >
            {settings.modal_message || UI_COPY.welcomeModal.defaultMessage}
          </p>

          <div className="mt-6 flex flex-col gap-2.5">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => closeModal("clicked_cta")}
              className={buttonClasses("whatsapp", "lg", "w-full font-extrabold")}
            >
              <MessageCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span>{UI_COPY.welcomeModal.ctaLabel}</span>
            </a>

            <Button
              variant="ghost"
              size="md"
              className="w-full"
              onClick={() => closeModal("dismissed")}
            >
              {UI_COPY.welcomeModal.dismissLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
