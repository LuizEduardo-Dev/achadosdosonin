import type {
  Achado,
  AchadoCategoryLink,
  Category,
  SiteSettings,
} from "@/types/achado";
import { SITE_CONFIG, UI_COPY } from "@/lib/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const DEFAULT_STORE_SUGGESTIONS = ["Shopee", "Mercado Livre", "Amazon"];

const ADMIN_SELECT_COLUMNS =
  "id, title, description, price_cents, original_price_cents, price_note, store, affiliate_url, image_path, status, created_at, updated_at, expires_at";

const ADMIN_SELECT_LEGACY_COLUMNS =
  "id, title, description, price_cents, original_price_cents, store, affiliate_url, image_path, status, created_at, updated_at, expires_at";

export async function getAdminCategories(): Promise<Category[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, sort_order, is_active, created_at, updated_at")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data as Category[];
}

export async function getAdminAchados(): Promise<Achado[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const [primary, linksResult] = await Promise.all([
    supabase
      .from("achados")
      .select(ADMIN_SELECT_COLUMNS)
      .order("created_at", { ascending: false }),
    supabase.from("achado_categories").select("achado_id, category_id"),
  ]);

  let rows: Achado[] = [];
  if (!primary.error && primary.data) {
    rows = primary.data as Achado[];
  } else {
    // Fallback if `price_note` migration has not been applied yet
    const legacy = await supabase
      .from("achados")
      .select(ADMIN_SELECT_LEGACY_COLUMNS)
      .order("created_at", { ascending: false });

    if (legacy.error || !legacy.data) {
      return [];
    }

    rows = (legacy.data as Omit<Achado, "price_note">[]).map((row) => ({
      ...row,
      price_note: null,
    }));
  }

  const categoriesByAchado = new Map<string, string[]>();
  if (!linksResult.error && Array.isArray(linksResult.data)) {
    for (const link of linksResult.data as AchadoCategoryLink[]) {
      const current = categoriesByAchado.get(link.achado_id) ?? [];
      current.push(link.category_id);
      categoriesByAchado.set(link.achado_id, current);
    }
  }

  return rows.map((row) => ({
    ...row,
    category_ids: categoriesByAchado.get(row.id) ?? [],
  }));
}

export async function getAdminAchadoById(id: string): Promise<Achado | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const [primary, linksResult] = await Promise.all([
    supabase
      .from("achados")
      .select(ADMIN_SELECT_COLUMNS)
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("achado_categories")
      .select("category_id")
      .eq("achado_id", id),
  ]);

  let item: Achado | null = null;
  if (!primary.error && primary.data) {
    item = primary.data as Achado;
  } else {
    const legacy = await supabase
      .from("achados")
      .select(ADMIN_SELECT_LEGACY_COLUMNS)
      .eq("id", id)
      .maybeSingle();

    if (legacy.error || !legacy.data) {
      return null;
    }

    item = {
      ...(legacy.data as Omit<Achado, "price_note">),
      price_note: null,
    };
  }

  const categoryIds =
    !linksResult.error && Array.isArray(linksResult.data)
      ? linksResult.data.map(
          (row) => (row as { category_id: string }).category_id,
        )
      : [];

  return {
    ...item,
    category_ids: categoryIds,
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
