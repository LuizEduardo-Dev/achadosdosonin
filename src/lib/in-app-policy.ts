export type InAppPolicy = "strong" | "soft" | "off";

export type InAppAppKey =
  | "tiktok"
  | "instagram"
  | "facebook"
  | "messenger"
  | "other";

/**
 * Single centralized policy table for in-app browsers (AGENTS.md section 2.5).
 */
export const IN_APP_POLICY: Record<InAppAppKey, InAppPolicy> = {
  tiktok: "strong",
  instagram: "soft",
  facebook: "soft",
  messenger: "soft",
  other: "off",
};

export function getInAppPolicy(appKey: InAppAppKey | null): InAppPolicy {
  if (!appKey) {
    return "off";
  }

  return IN_APP_POLICY[appKey] ?? "off";
}
