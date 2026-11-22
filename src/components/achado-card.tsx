import Image from "next/image";
import type { Achado } from "@/types/achado";
import {
  calculateDiscountPercentage,
  formatCurrencyBRL,
} from "@/lib/format";
import { UI_COPY } from "@/lib/config";
import { resolveAchadoImageUrl } from "@/lib/supabase/storage";

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
    <a
      href={achado.affiliate_url}
      target="_blank"
      rel="noopener noreferrer sponsored"
      aria-label={`${achado.title} na ${achado.store} por ${formatCurrencyBRL(achado.price_cents)} ${UI_COPY.card.ctaAriaSuffix}`}
      className="card-hover-shadow group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface text-left hover:border-link focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link"
    >
      <div className="relative aspect-square w-full border-b border-surface-2 bg-surface p-2">
        <div className="relative h-full w-full">
          <Image
            src={resolveAchadoImageUrl(achado.image_path)}
            alt={`${achado.title} — oferta em ${achado.store}`}
            fill
            sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, (max-width: 1279px) 25vw, 20vw"
            priority={priority}
            className="object-contain"
          />
        </div>

        {discountPercentage !== null && (
          <span className="absolute top-2 left-2 inline-flex items-center rounded-lg bg-badge-bg px-2 py-0.5 text-[11px] font-semibold leading-tight text-badge-text">
            -{discountPercentage}% {UI_COPY.card.discountSuffix}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3">
        <p className="truncate text-[11px] font-medium text-text-muted sm:text-xs">
          {achado.store}
        </p>

        <h2 className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-snug text-text">
          {achado.title}
        </h2>

        <div className="mt-2.5 flex flex-col">
          {hasOriginalPrice && achado.original_price_cents !== null ? (
            <span className="h-4 text-xs font-normal leading-4 tabular-nums text-text-muted line-through">
              {formatCurrencyBRL(achado.original_price_cents)}
            </span>
          ) : (
            <span className="h-4" aria-hidden="true" />
          )}

          <span className="text-[18px] font-semibold leading-tight tabular-nums text-price sm:text-[20px]">
            {formatCurrencyBRL(achado.price_cents)}
          </span>

          <span className="mt-0.5 min-h-[1.125rem] truncate text-[11px] leading-[1.125rem] text-text-muted sm:text-xs">
            {achado.price_note?.trim() || "\u00A0"}
          </span>
        </div>

        <span className="mt-3 flex min-h-10 w-full items-center justify-center rounded-lg bg-ink px-3 text-sm font-medium text-on-ink transition-colors group-hover:bg-ink-hover">
          {UI_COPY.card.cta}
        </span>
      </div>
    </a>
  );
}
