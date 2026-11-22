export type AchadoStatus = "draft" | "published" | "archived";

export interface Achado {
  id: string;
  title: string;
  description: string | null;
  price_cents: number;
  original_price_cents: number | null;
  price_note: string | null;
  store: string;
  affiliate_url: string;
  image_path: string;
  status: AchadoStatus;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
}

export interface SiteSettings {
  whatsapp_group_url: string;
  modal_enabled: boolean;
  modal_title: string;
  modal_message: string;
}

export type TrafficSource = "tt" | "ig" | "wpp";

export type SortOption = "newest" | "price_asc" | "price_desc";
