import type { SortOption, TrafficSource } from "@/types/achado";

export const TRAFFIC_SOURCES = ["tt", "ig", "wpp"] as const satisfies readonly TrafficSource[];

export function isValidTrafficSource(value: string): value is TrafficSource {
  return (TRAFFIC_SOURCES as readonly string[]).includes(value);
}

export const SITE_CONFIG = {
  name: "Sonin Links",
  shortName: "Sonin Links",
  tagline: "Ofertas e achados selecionados todos os dias",
  description:
    "Curadoria diária de promoções, produtos e ofertas nas maiores lojas online. Entre no grupo do WhatsApp para receber em primeira mão.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  defaultWhatsappGroupUrl: process.env.NEXT_PUBLIC_WHATSAPP_GROUP_URL || "",
} as const;

export const SORT_OPTIONS: ReadonlyArray<{ value: SortOption; label: string }> = [
  { value: "newest", label: "Novidades" },
  { value: "price_asc", label: "Menor preço" },
  { value: "price_desc", label: "Maior preço" },
];

export const UI_COPY = {
  header: {
    whatsappCta: "Grupo VIP",
    whatsappAriaLabel: "Entrar no grupo de ofertas no WhatsApp",
    searchPlaceholder: "Buscar achados por nome...",
    searchAriaLabel: "Buscar achados por título",
    clearSearchAriaLabel: "Limpar busca",
  },
  hero: {
    badge: "Curadoria diária",
    title: "Achados que valem o clique",
    subtitle:
      "Promoções conferidas todos os dias nas principais lojas online.",
  },
  filters: {
    allStores: "Todas",
    storeFilterLabel: "Filtrar por loja",
    sortLabel: "Ordenar por",
    clearFilters: "Limpar filtros",
    emptyTitle: "Nenhum achado encontrado",
    emptyFilteredDescription:
      "Não encontramos ofertas com esse filtro ou busca. Limpe os filtros para ver toda a vitrine.",
    emptyDefaultDescription:
      "Ainda não há ofertas publicadas por aqui. Volte em breve.",
  },
  card: {
    cta: "Ver oferta",
    ctaAriaSuffix: "(abre em nova aba)",
    discountSuffix: "OFF",
  },
  footer: {
    disclaimer:
      "Preços e disponibilidade podem mudar. Links podem gerar comissão.",
  },
  welcomeModal: {
    defaultTitle: "Receba os achados no WhatsApp",
    defaultMessage:
      "Entre no grupo do Sonin Links para ver promoções e descontos assim que forem publicados.",
    ctaLabel: "Entrar no grupo",
    dismissLabel: "Agora não",
    closeAriaLabel: "Fechar convite do grupo",
  },
  inAppBanner: {
    copyButton: "Copiar link do site",
    copiedButton: "Link copiado",
    continueButton: "Continuar aqui mesmo assim",
    closeAriaLabel: "Dispensar aviso",
  },
  notFound: {
    code: "404",
    title: "Página não encontrada",
    description:
      "O link que você tentou acessar não existe ou não está mais disponível.",
    backHome: "Voltar para a vitrine",
  },
} as const;
