import type {
  Achado,
  AchadoCategoryLink,
  Category,
  SiteSettings,
} from "@/types/achado";
import { UI_COPY } from "@/lib/config";
import { getClientEnv } from "@/lib/env";
import { fetchSupabasePublicRest } from "@/lib/supabase/server";

const ACHADOS_SELECT_COLUMNS =
  "id,title,description,price_cents,original_price_cents,price_note,store,affiliate_url,image_path,status,created_at,updated_at,expires_at";

const ACHADOS_SELECT_LEGACY_COLUMNS =
  "id,title,description,price_cents,original_price_cents,store,affiliate_url,image_path,status,created_at,updated_at,expires_at";

const CATEGORIES_SELECT_COLUMNS =
  "id,name,slug,sort_order,is_active,created_at,updated_at";

/**
 * Fetches published and non-expired deals ordered by newest first directly from Supabase (RLS enforced).
 */
export async function getPublishedAchados(): Promise<Achado[]> {
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

  return Array.isArray(data) ? data : [];
}

/**
 * Fetches active departments ordered by sort_order then name (returns [] if table not migrated yet).
 */
export async function getPublicCategories(): Promise<Category[]> {
  const rows = await fetchSupabasePublicRest<Category[]>(
    `categories?select=${CATEGORIES_SELECT_COLUMNS}&is_active=eq.true&order=sort_order.asc,name.asc`,
  );

  return Array.isArray(rows) ? rows : [];
}

/**
 * Fetches a single active category by slug, or null when missing/inactive.
 */
export async function getPublicCategoryBySlug(
  slug: string,
): Promise<Category | null> {
  const encodedSlug = encodeURIComponent(slug.trim().toLowerCase());
  if (!encodedSlug) return null;

  const rows = await fetchSupabasePublicRest<Category[]>(
    `categories?select=${CATEGORIES_SELECT_COLUMNS}&slug=eq.${encodedSlug}&is_active=eq.true&limit=1`,
  );

  return Array.isArray(rows) && rows[0] ? rows[0] : null;
}

/**
 * Fetches category assignments for published achados (RLS enforced).
 */
export async function getPublicAchadoCategoryLinks(): Promise<
  AchadoCategoryLink[]
> {
  const rows = await fetchSupabasePublicRest<AchadoCategoryLink[]>(
    "achado_categories?select=achado_id,category_id",
  );

  return Array.isArray(rows) ? rows : [];
}

/**
 * Loads storefront deals with category_ids attached, active categories having >= 1 published deal, and site settings.
 */
export async function getPublicStorefrontData(): Promise<{
  achados: Achado[];
  drawerCategories: Category[];
  settings: SiteSettings;
}> {
  const [rawAchados, activeCategories, links, settings] = await Promise.all([
    getPublishedAchados(),
    getPublicCategories(),
    getPublicAchadoCategoryLinks(),
    getSiteSettings(),
  ]);

  const categoriesByAchado = new Map<string, string[]>();
  const activeCategoryIds = new Set(activeCategories.map((cat) => cat.id));
  const publishedAchadoIds = new Set(rawAchados.map((item) => item.id));
  const publishedCountByCategory = new Map<string, number>();

  for (const link of links) {
    if (
      !activeCategoryIds.has(link.category_id) ||
      !publishedAchadoIds.has(link.achado_id)
    ) {
      continue;
    }

    const list = categoriesByAchado.get(link.achado_id) ?? [];
    if (!list.includes(link.category_id)) {
      list.push(link.category_id);
      categoriesByAchado.set(link.achado_id, list);
      publishedCountByCategory.set(
        link.category_id,
        (publishedCountByCategory.get(link.category_id) ?? 0) + 1,
      );
    }
  }

  const achados = rawAchados.map((item) => ({
    ...item,
    category_ids: categoriesByAchado.get(item.id) ?? [],
  }));

  const drawerCategories = activeCategories.filter(
    (category) => (publishedCountByCategory.get(category.id) ?? 0) > 0,
  );

  return {
    achados,
    drawerCategories,
    settings,
  };
}

/**
 * Fetches public storefront settings (WhatsApp group link and welcome modal config).
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  const defaultWhatsappUrl = getClientEnv().NEXT_PUBLIC_WHATSAPP_GROUP_URL;

  const rows = await fetchSupabasePublicRest<SiteSettings[]>(
    "site_settings?select=whatsapp_group_url,modal_enabled,modal_title,modal_message&id=eq.1&limit=1",
  );

  const data = Array.isArray(rows) ? rows[0] : undefined;

  if (!data) {
    return {
      whatsapp_group_url: defaultWhatsappUrl,
      modal_enabled: true,
      modal_title: UI_COPY.welcomeModal.defaultTitle,
      modal_message: UI_COPY.welcomeModal.defaultMessage,
    };
  }

  return {
    whatsapp_group_url: data.whatsapp_group_url?.trim() || defaultWhatsappUrl,
    modal_enabled: Boolean(data.modal_enabled),
    modal_title: data.modal_title || UI_COPY.welcomeModal.defaultTitle,
    modal_message: data.modal_message || UI_COPY.welcomeModal.defaultMessage,
  };
}
