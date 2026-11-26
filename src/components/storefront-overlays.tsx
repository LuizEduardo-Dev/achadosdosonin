"use client";

import { useSyncExternalStore } from "react";
import type { SiteSettings, TrafficSource } from "@/types/achado";
import {
  cancelPendingExternalAction,
  continueToPendingExternalAction,
  dismissInAppNotice,
  getOverlayClientSnapshot,
  getOverlayServerSnapshot,
  getPendingExternalAction,
  parseOverlaySnapshot,
  subscribeOverlayStore,
} from "@/lib/in-app-overlay-store";
import { InAppBrowserBanner } from "@/components/in-app-browser-banner";
import { WelcomeModal } from "@/components/welcome-modal";

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

  const isClient = mode !== "ssr";
  const hasPendingAction = mode === "whatsapp" || mode === "offer";
  const pendingAction = hasPendingAction ? getPendingExternalAction() : null;
  const inAppOpen =
    mode === "strong" || mode === "soft" || hasPendingAction;
  const activePolicy =
    mode === "strong" || hasPendingAction ? "strong" : "soft";
  const canOpenWelcomeModal =
    !disableWelcomeModal && isClient && mode === "none";

  return (
    <>
      <InAppBrowserBanner
        open={inAppOpen}
        policy={activePolicy}
        appKey={appKey}
        os={os}
        pendingAction={pendingAction}
        onDismiss={() => {
          if (hasPendingAction) {
            cancelPendingExternalAction();
            return;
          }
          dismissInAppNotice(activePolicy);
        }}
        onContinuePending={continueToPendingExternalAction}
      />

      {!disableWelcomeModal && (
        <WelcomeModal settings={settings} canOpen={canOpenWelcomeModal} />
      )}
    </>
  );
}
