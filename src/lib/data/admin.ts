import type { Achado, SiteSettings } from "@/types/achado";
import { SITE_CONFIG, UI_COPY } from "@/lib/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const DEFAULT_STORE_SUGGESTIONS = ["Shopee", "Mercado Livre", "Amazon"];

const ADMIN_SELECT_COLUMNS =
  "id, title, description, price_cents, original_price_cents, price_note, store, affiliate_url, image_path, status, created_at, updated_at, expires_at";

const ADMIN_SELECT_LEGACY_COLUMNS =
  "id, title, description, price_cents, original_price_cents, store, affiliate_url, image_path, status, created_at, updated_at, expires_at";

export async function getAdminAchados(): Promise<Achado[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("achados")
    .select(ADMIN_SELECT_COLUMNS)
    .order("created_at", { ascending: false });

  if (!error && data) {
    return data as Achado[];
  }

  // Fallback if `price_note` migration has not been applied yet
  const legacy = await supabase
    .from("achados")
    .select(ADMIN_SELECT_LEGACY_COLUMNS)
    .order("created_at", { ascending: false });

  if (legacy.error || !legacy.data) {
    return [];
  }

  return (legacy.data as Omit<Achado, "price_note">[]).map((row) => ({
    ...row,
    price_note: null,
  }));
}

export async function getAdminAchadoById(id: string): Promise<Achado | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("achados")
    .select(ADMIN_SELECT_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (!error && data) {
    return data as Achado;
  }

  const legacy = await supabase
    .from("achados")
    .select(ADMIN_SELECT_LEGACY_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (legacy.error || !legacy.data) {
    return null;
  }

  return {
    ...(legacy.data as Omit<Achado, "price_note">),
    price_note: null,
  };
}

export async function getAdminSiteSettings(): Promise<SiteSettings> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return {
      whatsapp_group_url: SITE_CONFIG.defaultWhatsappGroupUrl,
      modal_enabled: true,
      modal_title: UI_COPY.welcomeModal.defaultTitle,
      modal_message: UI_COPY.welcomeModal.defaultMessage,
    };
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
    whatsapp_group_url: data.whatsapp_group_url ?? "",
    modal_enabled: Boolean(data.modal_enabled),
    modal_title: data.modal_title || UI_COPY.welcomeModal.defaultTitle,
    modal_message: data.modal_message || UI_COPY.welcomeModal.defaultMessage,
  };
}

export async function getExistingStoreSuggestions(): Promise<string[]> {
  const supabase = await createSupabaseServerClient();
  const stores = new Set<string>(DEFAULT_STORE_SUGGESTIONS);

  if (!supabase) {
    return Array.from(stores);
  }

  const { data } = await supabase.from("achados").select("store");
  if (data) {
    for (const row of data) {
      if (typeof row.store === "string" && row.store.trim()) {
        stores.add(row.store.trim());
      }
    }
  }

  return Array.from(stores).sort((a, b) => a.localeCompare(b, "pt-BR"));
}
