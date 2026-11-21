"use client";

import { useSyncExternalStore } from "react";
import type { SiteSettings, TrafficSource } from "@/types/achado";
import {
  detectInAppBrowser,
  type InAppBrowserPlatform,
} from "@/lib/detect-in-app-browser";
import { InAppBrowserBanner } from "@/components/in-app-browser-banner";
import { WelcomeModal } from "@/components/welcome-modal";

const IN_APP_DISMISSED_KEY = "sonin_links_in_app_dismissed";

type InAppOverlayState = "ssr" | "none" | InAppBrowserPlatform;

const listeners = new Set<() => void>();

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getClientSnapshot(): InAppOverlayState {
  try {
    if (window.sessionStorage.getItem(IN_APP_DISMISSED_KEY) === "1") {
      return "none";
    }
  } catch {
    // Ignore storage errors in restricted webviews
  }

  const info = detectInAppBrowser(window.navigator.userAgent);
  return info.isInApp && info.platform ? info.platform : "none";
}

function getServerSnapshot(): InAppOverlayState {
  return "ssr";
}

function dismissInAppBanner(): void {
  try {
    window.sessionStorage.setItem(IN_APP_DISMISSED_KEY, "1");
  } catch {
    // Ignore storage errors in restricted webviews
  }

  for (const listener of listeners) {
    listener();
  }
}

interface StorefrontOverlaysProps {
  settings: SiteSettings;
  source?: TrafficSource;
}

export function StorefrontOverlays({
  settings,
  source,
}: StorefrontOverlaysProps) {
  const overlayState = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  const isClient = overlayState !== "ssr";
  const inAppPlatform: InAppBrowserPlatform | null =
    overlayState !== "ssr" && overlayState !== "none" ? overlayState : null;
  const inAppBannerOpen = inAppPlatform !== null;

  return (
    <>
      <InAppBrowserBanner
        open={inAppBannerOpen}
        platform={inAppPlatform}
        source={source}
        onDismiss={dismissInAppBanner}
      />

      <WelcomeModal
        settings={settings}
        canOpen={isClient && !inAppBannerOpen}
      />
    </>
  );
}
