import type { TrafficSource } from "@/types/achado";

export type InAppBrowserPlatform = "tiktok" | "instagram" | "facebook" | "generic";

export interface InAppBrowserInfo {
  isInApp: boolean;
  platform: InAppBrowserPlatform | null;
}

const TIKTOK_PATTERN = /TikTok|musical_ly|BytedanceWebview/i;
const INSTAGRAM_PATTERN = /Instagram/i;
const FACEBOOK_PATTERN = /FBAN|FBAV|FB_IAB/i;

export function detectInAppBrowser(userAgent: string): InAppBrowserInfo {
  if (!userAgent) {
    return { isInApp: false, platform: null };
  }

  if (TIKTOK_PATTERN.test(userAgent)) {
    return { isInApp: true, platform: "tiktok" };
  }

  if (INSTAGRAM_PATTERN.test(userAgent)) {
    return { isInApp: true, platform: "instagram" };
  }

  if (FACEBOOK_PATTERN.test(userAgent)) {
    return { isInApp: true, platform: "facebook" };
  }

  return { isInApp: false, platform: null };
}

export interface InAppInstruction {
  appName: string;
  steps: [string, string];
}

export function getInAppInstructions(
  platform: InAppBrowserPlatform | null,
  source?: TrafficSource,
): InAppInstruction {
  const effectivePlatform: InAppBrowserPlatform =
    platform ??
    (source === "tt"
      ? "tiktok"
      : source === "ig"
        ? "instagram"
        : "generic");

  switch (effectivePlatform) {
    case "tiktok":
      return {
        appName: "TikTok",
        steps: [
          'Toque nos três pontinhos (⋯) no canto superior direito.',
          'Selecione "Abrir no navegador" (Chrome ou Safari).',
        ],
      };
    case "instagram":
      return {
        appName: "Instagram",
        steps: [
          'Toque nos três pontinhos (⋯) no canto superior direito.',
          'Escolha "Abrir no navegador externo".',
        ],
      };
    case "facebook":
      return {
        appName: "Facebook",
        steps: [
          'Toque nos três pontinhos (⋯) no canto superior direito.',
          'Toque em "Abrir no navegador externo".',
        ],
      };
    default:
      return {
        appName: "aplicativo",
        steps: [
          'Toque no menu de opções (⋯) no canto superior da tela.',
          'Escolha "Abrir no navegador" para finalizar suas compras sem travar.',
        ],
      };
  }
}
