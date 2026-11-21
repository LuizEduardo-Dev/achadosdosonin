import type { SortOption, TrafficSource } from "@/types/achado";

export const TRAFFIC_SOURCES = ["tt", "ig", "wpp"] as const satisfies readonly TrafficSource[];

export function isValidTrafficSource(value: string): value is TrafficSource {
  return (TRAFFIC_SOURCES as readonly string[]).includes(value);
}

export const SITE_CONFIG = {
  name: "Sonin Links",
  shortName: "Sonin Links",
  tagline: "Os melhores achados e ofertas selecionados todos os dias",
  description:
    "Curadoria diária de promoções, achados e descontos reais nas maiores lojas online. Entre no grupo do WhatsApp para receber em primeira mão.",
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
    whatsappAriaLabel: "Entrar no grupo de achados no WhatsApp",
  },
  hero: {
    badge: "Curadoria diária",
    title: "Achados que valem o clique",
    subtitle:
      "Promoções selecionadas a dedo nas principais lojas. Escolha sua loja favorita ou ordene pelo melhor preço.",
  },
  filters: {
    allStores: "Todas as lojas",
    storeFilterLabel: "Filtrar por loja",
    sortLabel: "Ordenar por",
    clearFilters: "Limpar filtros",
    emptyTitle: "Nenhum achado encontrado",
    emptyDescription:
      "Não encontramos ofertas para esse filtro agora. Tente ver todas as lojas.",
  },
  card: {
    cta: "Ver oferta",
    ctaAriaSuffix: "(abre em nova aba)",
    discountSuffix: "OFF",
  },
  disclaimers: {
    priceNotice: "Preços e disponibilidade podem mudar a qualquer momento.",
    affiliateNotice:
      "Transparência: os links desta vitrine podem gerar uma comissão ao curador, sem nenhum custo extra para você.",
  },
  welcomeModal: {
    defaultTitle: "Entre no grupo do Sonin Links!",
    defaultMessage:
      "Receba os melhores achados, cupons e ofertas relâmpago direto no seu WhatsApp antes de esgotar.",
    ctaLabel: "Entrar no grupo",
    dismissLabel: "Agora não",
    closeAriaLabel: "Fechar aviso de boas-vindas",
  },
  inAppBanner: {
    badge: "Melhor experiência",
    title: "Abra no navegador do seu celular",
    description:
      "O navegador interno do aplicativo costuma bloquear o login das lojas e travar a compra.",
    copyButton: "Copiar link do site",
    copiedButton: "Link copiado!",
    continueButton: "Continuar aqui mesmo assim",
    closeAriaLabel: "Dispensar aviso de navegador embutido",
  },
  notFound: {
    code: "404",
    title: "Página não encontrada",
    description:
      "O link que você tentou acessar não existe ou foi removido.",
    backHome: "Voltar para a vitrine",
  },
} as const;
