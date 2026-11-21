import Image from "next/image";
import { ExternalLink, Store } from "lucide-react";
import type { Achado } from "@/types/achado";
import {
  calculateDiscountPercentage,
  formatCurrencyBRL,
} from "@/lib/format";
import { UI_COPY } from "@/lib/config";
import { buttonClasses } from "@/components/ui/button";

interface AchadoCardProps {
  achado: Achado;
  priority?: boolean;
}

export function AchadoCard({ achado, priority = false }: AchadoCardProps) {
  const discountPercentage = calculateDiscountPercentage(
    achado.price_cents,
    achado.original_price_cents,
  );

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-colors hover:border-primary hover:bg-surface-2/80">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-2">
        <Image
          src={achado.image_path}
          alt={`${achado.title} — oferta em ${achado.store}`}
          fill
          sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
          priority={priority}
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />

        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg/90 px-2.5 py-1 text-xs font-semibold text-text backdrop-blur-xs">
            <Store className="h-3.5 w-3.5 text-text-muted" aria-hidden="true" />
            {achado.store}
          </span>

          {discountPercentage !== null && (
            <span className="inline-flex items-center rounded-full bg-accent px-2.5 py-1 text-xs font-extrabold tracking-tight text-bg shadow-sm">
              -{discountPercentage}% {UI_COPY.card.discountSuffix}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex-1 space-y-1.5">
          <h2 className="line-clamp-2 text-base font-bold leading-snug text-text">
            {achado.title}
          </h2>
          {achado.description && (
            <p className="line-clamp-2 text-sm leading-relaxed text-text-muted">
              {achado.description}
            </p>
          )}
        </div>

        <div className="space-y-3 border-t border-border/60 pt-3">
          <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
            <span className="text-2xl font-extrabold tracking-tight tabular-nums text-accent">
              {formatCurrencyBRL(achado.price_cents)}
            </span>
            {achado.original_price_cents !== null &&
              achado.original_price_cents > achado.price_cents && (
                <span className="text-sm font-medium tabular-nums text-text-muted line-through">
                  {formatCurrencyBRL(achado.original_price_cents)}
                </span>
              )}
          </div>

          <a
            href={achado.affiliate_url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            aria-label={`${UI_COPY.card.cta}: ${achado.title} na ${achado.store} ${UI_COPY.card.ctaAriaSuffix}`}
            className={buttonClasses("accent", "md", "w-full font-bold")}
          >
            <span>{UI_COPY.card.cta}</span>
            <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
          </a>
        </div>
      </div>
    </article>
  );
}
