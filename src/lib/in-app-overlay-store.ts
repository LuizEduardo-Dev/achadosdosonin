"use client";

import type { InAppAppKey } from "@/lib/in-app-policy";
import {
  detectInAppBrowser,
  type MobileOS,
} from "@/lib/detect-in-app-browser";

const STRONG_DISMISSED_KEY = "sonin_links_inapp_strong_dismissed";
const SOFT_DISMISSED_KEY = "sonin_links_inapp_soft_dismissed_at";
const SOFT_COOLDOWN_MS = 24 * 60 * 60 * 1000;

export type PendingActionKind = "whatsapp" | "offer";

export interface PendingExternalAction {
  kind: PendingActionKind;
  url: string;
  storeName?: string;
}

let pendingAction: PendingExternalAction | null = null;
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
  pendingAction = null;
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

export function shouldInterceptOfferClick(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  const result = detectInAppBrowser(
    window.navigator.userAgent,
    window.location.search,
  );
  return result.isInApp && result.policy === "strong";
}

export function openWhatsappInAppPrompt(url: string): void {
  pendingAction = { kind: "whatsapp", url };
  notifyOverlayListeners();
}

export function openOfferInAppPrompt(url: string, storeName?: string): void {
  pendingAction = { kind: "offer", url, storeName };
  notifyOverlayListeners();
}

export function getPendingExternalAction(): PendingExternalAction | null {
  return pendingAction;
}

export function cancelPendingExternalAction(): void {
  pendingAction = null;
  notifyOverlayListeners();
}

export function continueToPendingExternalAction(): void {
  const action = pendingAction;
  pendingAction = null;
  notifyOverlayListeners();

  if (
    action?.url &&
    /^https?:\/\//i.test(action.url) &&
    typeof window !== "undefined"
  ) {
    // Intentional same-tab navigation when user chooses to continue inside the in-app browser.
    window.location.assign(action.url);
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
 * - "whatsapp:<appKey>:<os>:<sim>"
 * - "offer:<appKey>:<os>:<sim>"
 * - "strong:<appKey>:<os>:<sim>"
 * - "soft:<appKey>:<os>:<sim>"
 */
export function getOverlayClientSnapshot(): string {
  const result = detectInAppBrowser(
    window.navigator.userAgent,
    window.location.search,
  );

  if (!result.isInApp || result.policy === "off" || !result.appKey) {
    pendingAction = null;
    return "none";
  }

  if (pendingAction) {
    return `${pendingAction.kind}:${result.appKey}:${result.os}:${result.isSimulated ? "1" : "0"}`;
  }

  if (result.policy === "strong") {
    if (isStrongDismissed()) {
      return "none";
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
