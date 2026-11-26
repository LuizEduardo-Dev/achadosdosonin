import InAppSpy from "inapp-spy";
import { isPreviewDeployment } from "@/lib/env";
import {
  getInAppPolicy,
  type InAppAppKey,
  type InAppPolicy,
} from "@/lib/in-app-policy";

export type MobileOS = "android" | "ios" | "other";

export interface InAppDetectionResult {
  isInApp: boolean;
  appKey: InAppAppKey | null;
  policy: InAppPolicy;
  os: MobileOS;
  isSimulated: boolean;
}

const DEBUG_ALLOWED_APPS: ReadonlySet<InAppAppKey> = new Set([
  "tiktok",
  "instagram",
  "facebook",
  "messenger",
]);

function isDebugInAppAllowed(): boolean {
  return process.env.NODE_ENV !== "production" || isPreviewDeployment();
}

export function detectMobileOS(userAgent: string): MobileOS {
  if (/Android/i.test(userAgent)) {
    return "android";
  }
  if (/iPhone|iPad|iPod/i.test(userAgent)) {
    return "ios";
  }
  return "other";
}

function mapSpyAppKey(
  rawAppKey: string | undefined,
  userAgent: string,
): InAppAppKey | null {
  if (rawAppKey === "tiktok") return "tiktok";
  if (rawAppKey === "instagram") return "instagram";
  if (rawAppKey === "messenger") return "messenger";
  if (rawAppKey === "facebook") return "facebook";

  // Secondary regex safety net for variants not matched by default
  if (/TikTok|musical_ly|BytedanceWebview/i.test(userAgent)) return "tiktok";
  if (/Instagram/i.test(userAgent)) return "instagram";
  if (/Messenger|FBAV.*Orca|FBAN\/Messenger/i.test(userAgent)) {
    return "messenger";
  }
  if (/FBAN|FBAV|FB_IAB/i.test(userAgent)) return "facebook";

  return rawAppKey ? "other" : null;
}

export function detectInAppBrowser(
  userAgent: string,
  search = "",
): InAppDetectionResult {
  const os = detectMobileOS(userAgent);

  if (search && isDebugInAppAllowed()) {
    const params = new URLSearchParams(search);
    const debugParam = params.get("debugInApp")?.trim().toLowerCase();
    if (debugParam && DEBUG_ALLOWED_APPS.has(debugParam as InAppAppKey)) {
      const appKey = debugParam as InAppAppKey;
      return {
        isInApp: true,
        appKey,
        policy: getInAppPolicy(appKey),
        os,
        isSimulated: true,
      };
    }
  }

  if (!userAgent) {
    return {
      isInApp: false,
      appKey: null,
      policy: "off",
      os,
      isSimulated: false,
    };
  }

  const spy = InAppSpy({ ua: userAgent });
  const appKey = spy.isInApp ? mapSpyAppKey(spy.appKey, userAgent) : mapSpyAppKey(undefined, userAgent);

  if (!appKey) {
    return {
      isInApp: false,
      appKey: null,
      policy: "off",
      os,
      isSimulated: false,
    };
  }

  return {
    isInApp: true,
    appKey,
    policy: getInAppPolicy(appKey),
    os,
    isSimulated: false,
  };
}

/**
 * Builds an Android Intent URI preserving host, path, and query/UTM without hash.
 * Uses standard Chrome/App-Links syntax with S.browser_fallback_url for older/custom webviews.
 */
export function buildAndroidIntentUrl(
  targetHref: string,
  options: { preferChrome?: boolean } = {},
): string {
  const url = new URL(targetHref);
  const scheme = url.protocol.replace(":", "");
  const hostAndPath = `${url.host}${url.pathname}${url.search}`;
  const cleanHref = `${url.origin}${url.pathname}${url.search}`;
  const fallback = encodeURIComponent(cleanHref);
  const packageSegment = options.preferChrome
    ? "package=com.android.chrome;"
    : "";

  return `intent://${hostAndPath}#Intent;scheme=${scheme};action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;${packageSegment}S.browser_fallback_url=${fallback};end`;
}

export interface InAppCopy {
  appName: string;
  strongTitle: string;
  strongSteps: string;
  softMessage: string;
}

export function getInAppCopy(appKey: InAppAppKey | null): InAppCopy {
  switch (appKey) {
    case "tiktok":
      return {
        appName: "TikTok",
        strongTitle: "Abra no navegador para comprar sem travar",
        strongSteps:
          'Toque nos três pontinhos (⋯) no canto superior direito e escolha "Abrir no navegador".',
        softMessage:
          'No TikTok, toque nos três pontinhos (⋯) no canto superior direito e escolha "Abrir no navegador".',
      };
    case "instagram":
      return {
        appName: "Instagram",
        strongTitle: "Abra no navegador para comprar sem travar",
        strongSteps:
          'Toque nos três pontinhos (⋯) no canto superior direito e escolha "Abrir no navegador externo".',
        softMessage:
          'Para comprar sem travar no Instagram, toque nos três pontinhos (⋯) no canto superior direito e escolha "Abrir no navegador externo".',
      };
    case "messenger":
      return {
        appName: "Messenger",
        strongTitle: "Abra no navegador para comprar sem travar",
        strongSteps:
          'Toque nos três pontinhos (⋯) no canto superior direito e escolha "Abrir no navegador externo".',
        softMessage:
          'Para comprar sem travar no Messenger, toque nos três pontinhos (⋯) no canto superior direito e escolha "Abrir no navegador externo".',
      };
    case "facebook":
      return {
        appName: "Facebook",
        strongTitle: "Abra no navegador para comprar sem travar",
        strongSteps:
          'Toque nos três pontinhos (⋯) no canto superior direito e escolha "Abrir no navegador externo".',
        softMessage:
          'Para comprar sem travar no Facebook, toque nos três pontinhos (⋯) no canto superior direito e escolha "Abrir no navegador externo".',
      };
    default:
      return {
        appName: "aplicativo",
        strongTitle: "Abra no navegador para comprar sem travar",
        strongSteps:
          'Toque nos três pontinhos (⋯) no canto superior direito e escolha "Abrir no navegador".',
        softMessage:
          'Para comprar sem travar, toque nos três pontinhos (⋯) no canto superior direito e escolha "Abrir no navegador".',
      };
  }
}
