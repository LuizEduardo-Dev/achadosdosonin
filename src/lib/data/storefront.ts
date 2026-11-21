import { cacheLife, cacheTag } from "next/cache";
import type { Achado, SiteSettings } from "@/types/achado";
import { MOCK_ACHADOS, MOCK_SITE_SETTINGS } from "@/lib/data/mock-data";
import { SITE_CONFIG, UI_COPY } from "@/lib/config";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { fetchSupabasePublicRest } from "@/lib/supabase/server";

export const ACHADOS_CACHE_TAG = "achados";
export const SITE_SETTINGS_CACHE_TAG = "site-settings";

/**
 * Fetches published and non-expired deals ordered by newest first.
 * Reads from Supabase when configured; falls back to curated mock data otherwise.
 */
export async function getPublishedAchados(): Promise<Achado[]> {
  "use cache";
  cacheTag(ACHADOS_CACHE_TAG);
  cacheLife("minutes");

  if (!isSupabaseConfigured()) {
    return MOCK_ACHADOS.filter((item) => item.status === "published").sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }

  const data = await fetchSupabasePublicRest<Achado[]>(
    "achados?select=id,title,description,price_cents,original_price_cents,store,affiliate_url,image_path,status,created_at,updated_at,expires_at&status=eq.published&order=created_at.desc",
  );

  return Array.isArray(data) ? data : [];
}

/**
 * Fetches public storefront settings (WhatsApp group link and welcome modal config).
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  "use cache";
  cacheTag(SITE_SETTINGS_CACHE_TAG);
  cacheLife("minutes");

  if (!isSupabaseConfigured()) {
    return MOCK_SITE_SETTINGS;
  }

  const rows = await fetchSupabasePublicRest<SiteSettings[]>(
    "site_settings?select=whatsapp_group_url,modal_enabled,modal_title,modal_message&id=eq.1&limit=1",
  );

  const data = Array.isArray(rows) ? rows[0] : undefined;

  if (!data) {
    return {
      whatsapp_group_url: SITE_CONFIG.defaultWhatsappGroupUrl,
      modal_enabled: true,
      modal_title: UI_COPY.welcomeModal.defaultTitle,
      modal_message: UI_COPY.welcomeModal.defaultMessage,
    };
  }

  return {
    whatsapp_group_url:
      data.whatsapp_group_url?.trim() || SITE_CONFIG.defaultWhatsappGroupUrl,
    modal_enabled: Boolean(data.modal_enabled),
    modal_title: data.modal_title || UI_COPY.welcomeModal.defaultTitle,
    modal_message: data.modal_message || UI_COPY.welcomeModal.defaultMessage,
  };
}
