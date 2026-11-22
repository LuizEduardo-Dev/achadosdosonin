"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { SiteSettings, TrafficSource } from "@/types/achado";
import type { InAppAppKey } from "@/lib/in-app-policy";
import {
  buildAndroidIntentUrl,
  detectInAppBrowser,
  type MobileOS,
} from "@/lib/detect-in-app-browser";
import { InAppBrowserBanner } from "@/components/in-app-browser-banner";
import { WelcomeModal } from "@/components/welcome-modal";

const STRONG_DISMISSED_KEY = "sonin_links_inapp_strong_dismissed";
const AUTO_INTENT_TRIED_KEY = "sonin_links_inapp_auto_intent_tried";
const SOFT_DISMISSED_KEY = "sonin_links_inapp_soft_dismissed_at";
const SOFT_COOLDOWN_MS = 24 * 60 * 60 * 1000;
const AUTO_INTENT_FALLBACK_DELAY_MS = 1500;

let autoIntentWaiting = false;
let autoIntentTimer: number | null = null;
const listeners = new Set<() => void>();

function notifyListeners(): void {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function isStrongDismissed(): boolean {
  try {
    return window.sessionStorage.getItem(STRONG_DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

function isAutoIntentAlreadyTried(): boolean {
  try {
    return window.sessionStorage.getItem(AUTO_INTENT_TRIED_KEY) === "1";
  } catch {
    return false;
  }
}

function isSoftWithinCooldown(): boolean {
  try {
    const raw = window.localStorage.getItem(SOFT_DISMISSED_KEY);
    if (!raw) return false;
    const timestamp = Number(raw);
    return Number.isFinite(timestamp) && Date.now() - timestamp < SOFT_COOLDOWN_MS;
  } catch {
    return false;
  }
}

function dismissNotice(policy: "strong" | "soft"): void {
  try {
    if (policy === "strong") {
      window.sessionStorage.setItem(STRONG_DISMISSED_KEY, "1");
    } else {
      window.localStorage.setItem(SOFT_DISMISSED_KEY, String(Date.now()));
    }
  } catch {
    // Ignore storage errors in restricted webviews
  }
  autoIntentWaiting = false;
  notifyListeners();
}

/**
 * Encoded primitive snapshot so useSyncExternalStore remains tear-free and allocation-free.
 * Format: "ssr" | "none" | "pending:<appKey>:<os>" | "strong:<appKey>:<os>:<sim>" | "soft:<appKey>:<os>:<sim>"
 */
function getClientSnapshot(): string {
  const result = detectInAppBrowser(
    window.navigator.userAgent,
    window.location.search,
  );

  if (!result.isInApp || result.policy === "off" || !result.appKey) {
    return "none";
  }

  if (result.policy === "strong") {
    if (isStrongDismissed()) {
      return "none";
    }

    const shouldAutoRedirect =
      result.os === "android" &&
      !result.isSimulated &&
      !isAutoIntentAlreadyTried();

    if (shouldAutoRedirect || autoIntentWaiting) {
      return `pending:${result.appKey}:${result.os}`;
    }

    return `strong:${result.appKey}:${result.os}:${result.isSimulated ? "1" : "0"}`;
  }

  if (result.policy === "soft") {
    if (isSoftWithinCooldown()) {
      return "none";
    }
    return `soft:${result.appKey}:${result.os}:${result.isSimulated ? "1" : "0"}`;
  }

  return "none";
}

function getServerSnapshot(): string {
  return "ssr";
}

interface StorefrontOverlaysProps {
  settings: SiteSettings;
  source?: TrafficSource;
}

export function StorefrontOverlays({ settings }: StorefrontOverlaysProps) {
  const snapshot = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  const [mode, rawAppKey, rawOs] = snapshot.split(":");
  const appKey = (rawAppKey as InAppAppKey | undefined) ?? null;
  const os = (rawOs as MobileOS | undefined) ?? "other";

  useEffect(() => {
    if (mode !== "pending") {
      return;
    }

    if (autoIntentTimer !== null || isAutoIntentAlreadyTried()) {
      return;
    }

    autoIntentWaiting = true;
    try {
      window.sessionStorage.setItem(AUTO_INTENT_TRIED_KEY, "1");
    } catch {
      // Ignore storage errors in restricted webviews
    }

    const intentUrl = buildAndroidIntentUrl(window.location.href);
    window.location.replace(intentUrl);

    autoIntentTimer = window.setTimeout(() => {
      autoIntentTimer = null;
      autoIntentWaiting = false;
      if (document.visibilityState === "visible") {
        notifyListeners();
      }
    }, AUTO_INTENT_FALLBACK_DELAY_MS);
  }, [mode]);

  const isClient = mode !== "ssr";
  const inAppOpen = mode === "strong" || mode === "soft";
  const activePolicy = mode === "strong" ? "strong" : "soft";
  const canOpenWelcomeModal = isClient && mode === "none";

  return (
    <>
      <InAppBrowserBanner
        open={inAppOpen}
        policy={activePolicy}
        appKey={appKey}
        os={os}
        onDismiss={() => dismissNotice(activePolicy)}
      />

      <WelcomeModal settings={settings} canOpen={canOpenWelcomeModal} />
    </>
  );
}
