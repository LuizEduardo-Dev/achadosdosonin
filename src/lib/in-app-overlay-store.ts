"use client";

import type { InAppAppKey } from "@/lib/in-app-policy";
import {
  buildAndroidIntentUrl,
  detectInAppBrowser,
  type MobileOS,
} from "@/lib/detect-in-app-browser";

const STRONG_DISMISSED_KEY = "sonin_links_inapp_strong_dismissed";
const AUTO_INTENT_TRIED_KEY = "sonin_links_inapp_auto_intent_tried";
const SOFT_DISMISSED_KEY = "sonin_links_inapp_soft_dismissed_at";
const SOFT_COOLDOWN_MS = 24 * 60 * 60 * 1000;

let autoIntentWaiting = false;
let pendingWhatsappUrl: string | null = null;
const listeners = new Set<() => void>();

export function notifyOverlayListeners(): void {
  for (const listener of listeners) {
    listener();
  }
}

export function subscribeOverlayStore(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

export function isStrongDismissed(): boolean {
  try {
    return window.sessionStorage.getItem(STRONG_DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

export function isAutoIntentAlreadyTried(): boolean {
  try {
    return window.sessionStorage.getItem(AUTO_INTENT_TRIED_KEY) === "1";
  } catch {
    return false;
  }
}

export function markAutoIntentTried(): void {
  autoIntentWaiting = true;
  try {
    window.sessionStorage.setItem(AUTO_INTENT_TRIED_KEY, "1");
  } catch {
    // Ignore storage errors in restricted webviews
  }
}

export function finishAutoIntentWait(): void {
  autoIntentWaiting = false;
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

export function dismissInAppNotice(policy: "strong" | "soft"): void {
  try {
    if (policy === "strong") {
      window.sessionStorage.setItem(STRONG_DISMISSED_KEY, "1");
    } else {
      window.localStorage.setItem(SOFT_DISMISSED_KEY, String(Date.now()));
    }
  } catch {
    // Ignore storage errors in restricted webviews
  }
  pendingWhatsappUrl = null;
  autoIntentWaiting = false;
  notifyOverlayListeners();
}

export function shouldInterceptWhatsappClick(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  const result = detectInAppBrowser(
    window.navigator.userAgent,
    window.location.search,
  );
  return (
    result.isInApp && (result.policy === "strong" || result.policy === "soft")
  );
}

export function openWhatsappInAppPrompt(url: string): void {
  pendingWhatsappUrl = url;
  notifyOverlayListeners();
}

export function cancelPendingWhatsappPrompt(): void {
  pendingWhatsappUrl = null;
  notifyOverlayListeners();
}

export function continueToPendingWhatsapp(): void {
  const targetUrl = pendingWhatsappUrl;
  pendingWhatsappUrl = null;
  notifyOverlayListeners();

  if (
    targetUrl &&
    /^https?:\/\//i.test(targetUrl) &&
    typeof window !== "undefined"
  ) {
    // External chat.whatsapp.com invite link; intentional same-tab navigation (no target="_blank").
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign(targetUrl);
  }
}

export function getOverlayServerSnapshot(): string {
  return "ssr";
}

/**
 * Primitive snapshot so useSyncExternalStore stays allocation-free and tear-free.
 * Format:
 * - "ssr"
 * - "none"
 * - "pending:<appKey>:<os>"
 * - "whatsapp:<appKey>:<os>:<sim>"
 * - "strong:<appKey>:<os>:<sim>"
 * - "soft:<appKey>:<os>:<sim>"
 */
export function getOverlayClientSnapshot(): string {
  const result = detectInAppBrowser(
    window.navigator.userAgent,
    window.location.search,
  );

  if (!result.isInApp || result.policy === "off" || !result.appKey) {
    pendingWhatsappUrl = null;
    return "none";
  }

  if (pendingWhatsappUrl) {
    return `whatsapp:${result.appKey}:${result.os}:${result.isSimulated ? "1" : "0"}`;
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

export function parseOverlaySnapshot(snapshot: string): {
  mode: string;
  appKey: InAppAppKey | null;
  os: MobileOS;
} {
  const [mode, rawAppKey, rawOs] = snapshot.split(":");
  return {
    mode,
    appKey: (rawAppKey as InAppAppKey | undefined) ?? null,
    os: (rawOs as MobileOS | undefined) ?? "other",
  };
}

export function triggerCurrentPageAndroidIntent(): void {
  const intentUrl = buildAndroidIntentUrl(window.location.href);
  window.location.replace(intentUrl);
}
