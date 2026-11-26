"use client";

import { useRef, useState } from "react";
import { ArrowUpRight, Check, Copy, ExternalLink, X } from "lucide-react";
import type { InAppAppKey, InAppPolicy } from "@/lib/in-app-policy";
import {
  buildAndroidIntentUrl,
  getInAppCopy,
  type MobileOS,
} from "@/lib/detect-in-app-browser";
import type { PendingExternalAction } from "@/lib/in-app-overlay-store";
import { UI_COPY } from "@/lib/config";
import { copyTextToClipboard } from "@/lib/utils/clipboard";
import { useDialogFocusTrap } from "@/hooks/use-dialog-focus-trap";
import { Button, buttonClasses } from "@/components/ui/button";

interface InAppBrowserBannerProps {
  open: boolean;
  policy: Exclude<InAppPolicy, "off">;
  appKey: InAppAppKey | null;
  os: MobileOS;
  pendingAction: PendingExternalAction | null;
  onDismiss: () => void;
  onContinuePending?: () => void;
}

export function InAppBrowserBanner({
  open,
  policy,
  appKey,
  os,
  pendingAction,
  onDismiss,
  onContinuePending,
}: InAppBrowserBannerProps) {
  const [copied, setCopied] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  const isStrong = policy === "strong" || Boolean(pendingAction);

  useDialogFocusTrap(dialogRef, open && isStrong, onDismiss);

  if (!open) {
    return null;
  }

  const copy = getInAppCopy(appKey);
  const isOfferPrompt = pendingAction?.kind === "offer";
  const isWhatsappPrompt = pendingAction?.kind === "whatsapp";

  let dialogTitle = copy.strongTitle;
  let dialogDescription = copy.strongSteps;
  let copyButtonLabel: string = UI_COPY.inAppBanner.copyButton;
  let androidIntentLabel = "Abrir no navegador";

  if (isOfferPrompt && pendingAction) {
    dialogTitle = pendingAction.storeName
      ? `Abra no navegador para comprar no app da ${pendingAction.storeName}`
      : "Abra no navegador para comprar pelo app da loja";
    dialogDescription =
      'No TikTok, o link abre fora do app da loja e sem sua conta logada. Toque nos três pontinhos (⋯) no canto superior direito e escolha "Abrir no navegador", ou copie o link da oferta para abrir no Chrome/Safari.';
    copyButtonLabel = "Copiar link da oferta";
    androidIntentLabel = "Abrir oferta no navegador";
  } else if (isWhatsappPrompt) {
    dialogTitle = "Abra no navegador para entrar no WhatsApp";
  }

  const currentHref =
    typeof window !== "undefined" ? window.location.href : "";
  const intentTargetHref =
    isOfferPrompt && pendingAction ? pendingAction.url : currentHref;
  const androidIntentUrl =
    isStrong && os === "android" && intentTargetHref
      ? buildAndroidIntentUrl(intentTargetHref, {
          preferChrome: !isOfferPrompt,
        })
      : null;

  const handleCopyUrl = async () => {
    const targetToCopy =
      isOfferPrompt && pendingAction
        ? pendingAction.url
        : `${window.location.origin}${window.location.pathname}${window.location.search}`;
    const ok = await copyTextToClipboard(targetToCopy);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } else {
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
            {dialogTitle}
          </h2>

          <p
            id="in-app-strong-desc"
            className="mt-2 text-sm leading-relaxed text-text-muted"
          >
            {dialogDescription}
          </p>

          <div className="mt-5 flex flex-col gap-2.5">
            {androidIntentUrl && (
              <div className="space-y-1.5">
                <a
                  href={androidIntentUrl}
                  className={buttonClasses("primary", "md", "w-full")}
                >
                  <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{androidIntentLabel}</span>
                </a>

                {appKey === "tiktok" && (
                  <p className="text-center text-xs text-text-muted">
                    Se o TikTok exibir erro ao abrir direto, use o menu (⋯) no
                    topo direito ou copie o link abaixo.
                  </p>
                )}
              </div>
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
                  <span>{copyButtonLabel}</span>
                </>
              )}
            </Button>

            <button
              type="button"
              onClick={
                pendingAction && onContinuePending
                  ? onContinuePending
                  : onDismiss
              }
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
