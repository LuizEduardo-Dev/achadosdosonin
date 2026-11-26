"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { SiteSettings, TrafficSource } from "@/types/achado";
import {
  cancelPendingWhatsappPrompt,
  continueToPendingWhatsapp,
  dismissInAppNotice,
  finishAutoIntentWait,
  getOverlayClientSnapshot,
  getOverlayServerSnapshot,
  isAutoIntentAlreadyTried,
  markAutoIntentTried,
  notifyOverlayListeners,
  parseOverlaySnapshot,
  subscribeOverlayStore,
  triggerCurrentPageAndroidIntent,
} from "@/lib/in-app-overlay-store";
import { InAppBrowserBanner } from "@/components/in-app-browser-banner";
import { WelcomeModal } from "@/components/welcome-modal";

const AUTO_INTENT_FALLBACK_DELAY_MS = 1500;
let autoIntentTimer: number | null = null;

interface StorefrontOverlaysProps {
  settings: SiteSettings;
  source?: TrafficSource;
  disableWelcomeModal?: boolean;
}

export function StorefrontOverlays({
  settings,
  disableWelcomeModal = false,
}: StorefrontOverlaysProps) {
  const snapshot = useSyncExternalStore(
    subscribeOverlayStore,
    getOverlayClientSnapshot,
    getOverlayServerSnapshot,
  );

  const { mode, appKey, os } = parseOverlaySnapshot(snapshot);

  useEffect(() => {
    if (mode !== "pending") {
      return;
    }

    if (autoIntentTimer !== null || isAutoIntentAlreadyTried()) {
      return;
    }

    markAutoIntentTried();
    triggerCurrentPageAndroidIntent();

    autoIntentTimer = window.setTimeout(() => {
      autoIntentTimer = null;
      finishAutoIntentWait();
      if (document.visibilityState === "visible") {
        notifyOverlayListeners();
      }
    }, AUTO_INTENT_FALLBACK_DELAY_MS);
  }, [mode]);

  const isClient = mode !== "ssr";
  const isWhatsappPrompt = mode === "whatsapp";
  const inAppOpen =
    mode === "strong" || mode === "soft" || isWhatsappPrompt;
  const activePolicy =
    mode === "strong" || isWhatsappPrompt ? "strong" : "soft";
  const canOpenWelcomeModal =
    !disableWelcomeModal && isClient && mode === "none";

  return (
    <>
      <InAppBrowserBanner
        open={inAppOpen}
        policy={activePolicy}
        appKey={appKey}
        os={os}
        isWhatsappPrompt={isWhatsappPrompt}
        onDismiss={() => {
          if (isWhatsappPrompt) {
            cancelPendingWhatsappPrompt();
            return;
          }
          dismissInAppNotice(activePolicy);
        }}
        onContinueWhatsapp={continueToPendingWhatsapp}
      />

      {!disableWelcomeModal && (
        <WelcomeModal settings={settings} canOpen={canOpenWelcomeModal} />
      )}
    </>
  );
}
