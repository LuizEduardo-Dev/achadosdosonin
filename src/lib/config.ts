import type { TrafficSource } from "@/types/achado";
import { getClientEnv } from "@/lib/env";

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
  get url() {
    return getClientEnv().NEXT_PUBLIC_SITE_URL;
  },
  get defaultWhatsappGroupUrl() {
    return getClientEnv().NEXT_PUBLIC_WHATSAPP_GROUP_URL;
  },
} as const;

export const WHATSAPP_LINK_CONFIG = {
  /** Keep false to open in a new tab outside in-app browsers; toggle true to test same-tab delivery to the WhatsApp app. */
  openInSameTab: false,
} as const;

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
    title: "Descontos reais, garimpados todo dia",
    subtitle:
      "Achados conferidos a dedo nas maiores lojas — preço baixo de verdade, direto no link.",
  },
  filters: {
    allStores: "Todas",
    storeFilterLabel: "Filtrar por loja",
    clearFilters: "Limpar filtros",
    emptyTitle: "Nenhum achado encontrado",
    emptyFilteredDescription:
      "Não encontramos ofertas com esse filtro ou busca. Limpe os filtros para ver toda a vitrine.",
    emptyDefaultDescription:
      "Ainda não há ofertas publicadas por aqui. Volte em breve.",
  },
  card: {
    cta: "Comprar",
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
