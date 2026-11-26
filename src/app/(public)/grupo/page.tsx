import Link from "next/link";
import type { Metadata } from "next";
import { Check, MessageCircle, Tag } from "lucide-react";
import { SITE_CONFIG, UI_COPY } from "@/lib/config";
import { getSiteSettings } from "@/lib/data/storefront";
import { StorefrontOverlays } from "@/components/storefront-overlays";
import { WhatsAppLink } from "@/components/whatsapp-link";
import { buttonClasses } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Grupo VIP no WhatsApp — ${SITE_CONFIG.name}`,
  description:
    "Entre no grupo do WhatsApp do Sonin Links para receber os achados do dia direto no celular.",
  alternates: {
    canonical: "/grupo",
  },
  openGraph: {
    title: `Grupo VIP no WhatsApp — ${SITE_CONFIG.name}`,
    description:
      "Entre no grupo do WhatsApp do Sonin Links para receber os achados do dia direto no celular.",
    url: "/grupo",
  },
  twitter: {
    card: "summary_large_image",
    title: `Grupo VIP no WhatsApp — ${SITE_CONFIG.name}`,
    description:
      "Entre no grupo do WhatsApp do Sonin Links para receber os achados do dia direto no celular.",
  },
};

export default async function GrupoBridgePage() {
  const settings = await getSiteSettings();
  const whatsappUrl = settings.whatsapp_group_url.trim();
  const title = settings.modal_title || UI_COPY.welcomeModal.defaultTitle;
  const message =
    settings.modal_message || UI_COPY.welcomeModal.defaultMessage;

  return (
    <div className="flex flex-1 flex-col">
      <header className="rounded-b-2xl bg-ink text-on-ink">
        <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between px-3 py-3 sm:px-5">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-2 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-sage"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink-hover text-accent-sage">
              <Tag className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="truncate text-base font-semibold text-on-ink sm:text-lg">
              {SITE_CONFIG.name}
            </span>
          </Link>
        </div>
      </header>

      <StorefrontOverlays settings={settings} disableWelcomeModal />

      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-3 py-8 sm:px-5 sm:py-12">
        <section className="rounded-xl border border-border bg-surface p-6 sm:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-badge-bg px-3 py-1 text-xs font-semibold text-badge-text">
            <MessageCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{UI_COPY.grupo.badge}</span>
          </div>

          <h1 className="text-xl font-semibold leading-snug tracking-[-0.01em] text-text sm:text-2xl">
            {title}
          </h1>

          <p className="mt-2.5 text-sm leading-relaxed text-text-muted sm:text-base">
            {message}
          </p>

          <ul className="mt-5 space-y-2.5 border-t border-border pt-5">
            {UI_COPY.grupo.benefits.map((benefit) => (
              <li
                key={benefit}
                className="flex items-start gap-2.5 text-sm text-text"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-badge-bg text-badge-text">
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-col gap-3">
            {whatsappUrl ? (
              <WhatsAppLink
                href={whatsappUrl}
                className={buttonClasses(
                  "whatsapp",
                  "lg",
                  "w-full font-semibold",
                )}
              >
                <MessageCircle
                  className="h-5 w-5 shrink-0"
                  aria-hidden="true"
                />
                <span>{UI_COPY.grupo.ctaLabel}</span>
              </WhatsAppLink>
            ) : (
              <p className="rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-xs leading-relaxed text-text-muted">
                {UI_COPY.grupo.unavailableNotice}
              </p>
            )}

            <Link
              href="/"
              className={buttonClasses("secondary", "md", "w-full")}
            >
              {UI_COPY.grupo.backToSiteLabel}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
