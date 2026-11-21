import type { Achado, SiteSettings } from "@/types/achado";
import { MOCK_ACHADOS, MOCK_SITE_SETTINGS } from "@/lib/data/mock-data";

/**
 * Fetches published and non-expired deals ordered by newest first.
 * Phase 1 uses curated mock data matching the Supabase schema; Phase 2 swaps this to Supabase.
 */
export async function getPublishedAchados(): Promise<Achado[]> {
  return MOCK_ACHADOS.filter((item) => item.status === "published").sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

/**
 * Fetches public storefront settings (WhatsApp group link and welcome modal config).
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  return MOCK_SITE_SETTINGS;
}
