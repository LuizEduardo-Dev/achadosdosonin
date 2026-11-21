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
  const hasOriginalPrice =
    achado.original_price_cents !== null &&
    achado.original_price_cents > achado.price_cents;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-primary hover:bg-surface-2/80 sm:rounded-2xl">
      <div className="relative aspect-square w-full overflow-hidden bg-surface-2">
        <Image
          src={achado.image_path}
          alt={`${achado.title} — oferta em ${achado.store}`}
          fill
          sizes="(max-width: 767px) 33vw, 25vw"
          priority={priority}
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />

        {discountPercentage !== null && (
          <span className="absolute top-1.5 left-1.5 inline-flex items-center rounded-md bg-accent px-1.5 py-0.5 text-[10px] font-extrabold leading-none tracking-tight text-bg shadow-sm sm:top-2.5 sm:left-2.5 sm:rounded-full sm:px-2.5 sm:py-1 sm:text-xs">
            -{discountPercentage}%
            <span className="hidden sm:inline">
              &nbsp;{UI_COPY.card.discountSuffix}
            </span>
          </span>
        )}

        <div className="absolute inset-x-1.5 bottom-1.5 flex sm:inset-x-2.5 sm:bottom-2.5">
          <span className="inline-flex max-w-full items-center gap-1 rounded-md border border-border/80 bg-bg/90 px-1.5 py-0.5 text-[10px] font-semibold leading-tight text-text backdrop-blur-xs sm:gap-1.5 sm:rounded-full sm:px-2.5 sm:py-1 sm:text-xs">
            <Store
              className="hidden h-3 w-3 shrink-0 text-text-muted sm:inline-block"
              aria-hidden="true"
            />
            <span className="truncate">{achado.store}</span>
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-2 sm:gap-3 sm:p-3.5">
        <div className="space-y-1">
          <h2 className="line-clamp-2 text-xs font-bold leading-snug text-text sm:text-sm">
            {achado.title}
          </h2>
          {achado.description && (
            <p className="hidden text-xs leading-relaxed text-text-muted sm:line-clamp-2">
              {achado.description}
            </p>
          )}
        </div>

        <div className="mt-auto space-y-2 border-t border-border/60 pt-2 sm:space-y-2.5 sm:pt-3">
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-2">
            {hasOriginalPrice && achado.original_price_cents !== null && (
              <span className="text-[10px] font-medium leading-none tabular-nums text-text-muted line-through sm:order-2 sm:text-xs">
                {formatCurrencyBRL(achado.original_price_cents)}
              </span>
            )}
            <span className="text-sm font-extrabold leading-tight tracking-tight tabular-nums text-accent sm:order-1 sm:text-lg">
              {formatCurrencyBRL(achado.price_cents)}
            </span>
          </div>

          <a
            href={achado.affiliate_url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            aria-label={`${UI_COPY.card.cta}: ${achado.title} na ${achado.store} ${UI_COPY.card.ctaAriaSuffix}`}
            className={buttonClasses(
              "accent",
              "sm",
              "min-h-8 w-full rounded-lg px-2 text-xs font-bold sm:min-h-10 sm:rounded-xl sm:px-3.5 sm:text-sm",
            )}
          >
            <span className="truncate">{UI_COPY.card.cta}</span>
            <ExternalLink
              className="hidden h-3.5 w-3.5 shrink-0 sm:inline-block"
              aria-hidden="true"
            />
          </a>
        </div>
      </div>
    </article>
  );
}
