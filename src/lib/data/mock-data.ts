import type { Achado, SiteSettings } from "@/types/achado";
import { SITE_CONFIG, UI_COPY } from "@/lib/config";

/**
 * Temporary development preview data (3 items across Shopee, Mercado Livre, and Amazon).
 * Used ONLY in development when Supabase has 0 published deals or is not configured yet.
 * To remove: delete this file (and `public/images/mock/`) and set `ENABLE_DEV_MOCK_FALLBACK = false`
 * in `src/lib/data/storefront.ts`.
 */
export const MOCK_SITE_SETTINGS: SiteSettings = {
  whatsapp_group_url:
    SITE_CONFIG.defaultWhatsappGroupUrl || "https://chat.whatsapp.com/soninlinks-exemplo",
  modal_enabled: true,
  modal_title: UI_COPY.welcomeModal.defaultTitle,
  modal_message: UI_COPY.welcomeModal.defaultMessage,
};

export const MOCK_ACHADOS: Achado[] = [
  {
    id: "1f9e2b3c-4d5e-4f6a-8b7c-100000000001",
    title: "Fone de Ouvido Bluetooth TWS com Cancelamento de Ruído Ativo",
    description:
      "Bateria para até 32h com o estojo, modo transparência e resistência à água IPX5.",
    price_cents: 12990,
    original_price_cents: 24990,
    price_note: "à vista no PIX",
    store: "Shopee",
    affiliate_url: "https://shopee.com.br/",
    image_path: "/images/mock/fone-tws.png",
    status: "published",
    created_at: "2026-11-22T11:30:00.000Z",
    updated_at: "2026-11-22T11:30:00.000Z",
    expires_at: null,
  },
  {
    id: "1f9e2b3c-4d5e-4f6a-8b7c-100000000002",
    title: "Mini Projetor Portátil Full HD com Android Integrado e Wi-Fi 6",
    description:
      "Tela de até 130 polegadas com foco ajustável e espelhamento sem fio.",
    price_cents: 26900,
    original_price_cents: 45900,
    price_note: "em até 10x sem juros",
    store: "Mercado Livre",
    affiliate_url: "https://www.mercadolivre.com.br/",
    image_path: "/images/mock/mini-projetor.png",
    status: "published",
    created_at: "2026-11-22T09:00:00.000Z",
    updated_at: "2026-11-22T09:00:00.000Z",
    expires_at: null,
  },
  {
    id: "1f9e2b3c-4d5e-4f6a-8b7c-100000000003",
    title: "Garrafa Térmica Inox 1,2L com Alça e Tampa Antivazamento",
    description:
      "Mantém a bebida gelada por até 24 horas e quente por até 12 horas.",
    price_cents: 7990,
    original_price_cents: 13990,
    price_note: null,
    store: "Amazon",
    affiliate_url: "https://www.amazon.com.br/",
    image_path: "/images/mock/garrafa-termica.png",
    status: "published",
    created_at: "2026-11-21T19:45:00.000Z",
    updated_at: "2026-11-21T19:45:00.000Z",
    expires_at: null,
  },
];
