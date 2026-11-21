import { cacheLife, cacheTag } from "next/cache";
import type { Achado, SiteSettings } from "@/types/achado";
import { MOCK_ACHADOS, MOCK_SITE_SETTINGS } from "@/lib/data/mock-data";
import { SITE_CONFIG, UI_COPY } from "@/lib/config";
import { createSupabasePublicClient } from "@/lib/supabase/server";

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

  const supabase = createSupabasePublicClient();
  if (!supabase) {
    return MOCK_ACHADOS.filter((item) => item.status === "published").sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }

  const { data, error } = await supabase
    .from("achados")
    .select(
      "id, title, description, price_cents, original_price_cents, store, affiliate_url, image_path, status, created_at, updated_at, expires_at",
    )
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data as Achado[];
}

/**
 * Fetches public storefront settings (WhatsApp group link and welcome modal config).
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  "use cache";
  cacheTag(SITE_SETTINGS_CACHE_TAG);
  cacheLife("minutes");

  const supabase = createSupabasePublicClient();
  if (!supabase) {
    return MOCK_SITE_SETTINGS;
  }

  const { data, error } = await supabase
    .from("site_settings")
    .select("whatsapp_group_url, modal_enabled, modal_title, modal_message")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data) {
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
