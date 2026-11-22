import { cacheLife, cacheTag } from "next/cache";
import type { Achado, SiteSettings } from "@/types/achado";
import { MOCK_ACHADOS, MOCK_SITE_SETTINGS } from "@/lib/data/mock-data";
import { SITE_CONFIG, UI_COPY } from "@/lib/config";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { fetchSupabasePublicRest } from "@/lib/supabase/server";

export const ACHADOS_CACHE_TAG = "achados";
export const SITE_SETTINGS_CACHE_TAG = "site-settings";

/**
 * Set to `false` once you want to disable the 3-item development preview fallback.
 * Never activates in production builds (`NODE_ENV === "production"`).
 */
const ENABLE_DEV_MOCK_FALLBACK = process.env.NODE_ENV === "development";

const ACHADOS_SELECT_COLUMNS =
  "id,title,description,price_cents,original_price_cents,price_note,store,affiliate_url,image_path,status,created_at,updated_at,expires_at";

const ACHADOS_SELECT_LEGACY_COLUMNS =
  "id,title,description,price_cents,original_price_cents,store,affiliate_url,image_path,status,created_at,updated_at,expires_at";

function getDevMockAchados(): Achado[] {
  return MOCK_ACHADOS.filter((item) => item.status === "published").sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

/**
 * Fetches published and non-expired deals ordered by newest first.
 * Reads from Supabase when configured; falls back to 3 dev preview items when empty in development.
 */
export async function getPublishedAchados(): Promise<Achado[]> {
  "use cache";
  cacheTag(ACHADOS_CACHE_TAG);
  cacheLife("minutes");

  if (!isSupabaseConfigured()) {
    return ENABLE_DEV_MOCK_FALLBACK ? getDevMockAchados() : [];
  }

  let data = await fetchSupabasePublicRest<Achado[]>(
    `achados?select=${ACHADOS_SELECT_COLUMNS}&status=eq.published&order=created_at.desc`,
  );

  // Graceful fallback if the `price_note` migration has not been applied to Supabase yet
  if (data === null) {
    const legacyRows = await fetchSupabasePublicRest<
      Omit<Achado, "price_note">[]
    >(
      `achados?select=${ACHADOS_SELECT_LEGACY_COLUMNS}&status=eq.published&order=created_at.desc`,
    );
    if (Array.isArray(legacyRows)) {
      data = legacyRows.map((row) => ({ ...row, price_note: null }));
    }
  }

  if (Array.isArray(data) && data.length > 0) {
    return data;
  }

  return ENABLE_DEV_MOCK_FALLBACK ? getDevMockAchados() : [];
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
