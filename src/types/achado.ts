export type AchadoStatus = "draft" | "published" | "archived";

export interface Category {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AchadoCategoryLink {
  achado_id: string;
  category_id: string;
}

export interface Achado {
  id: string;
  title: string;
  description: string | null;
  price_cents: number | null;
  original_price_cents: number | null;
  price_note: string | null;
  store: string;
  affiliate_url: string;
  image_path: string;
  status: AchadoStatus;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
  category_ids?: string[];
}

export interface SiteSettings {
  whatsapp_group_url: string;
  modal_enabled: boolean;
  modal_title: string;
  modal_message: string;
}

export type TrafficSource = "tt" | "ig" | "wpp";
