import Image from "next/image";
import type { Achado } from "@/types/achado";
import { UI_COPY } from "@/lib/config";
import { resolveAchadoImageUrl } from "@/lib/supabase/storage";

interface AchadoCardProps {
  achado: Achado;
  priority?: boolean;
}

export function AchadoCard({ achado, priority = false }: AchadoCardProps) {
  return (
    <a
      href={achado.affiliate_url}
      target="_blank"
      rel="noopener noreferrer sponsored"
      aria-label={`Comprar ${achado.title} na ${achado.store}`}
      className="card-hover-shadow group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface text-left hover:border-link focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link"
    >
      <div className="relative aspect-square w-full bg-surface p-2">
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

        <span className="absolute top-2 left-2 z-10 inline-flex max-w-[calc(100%-1rem)] items-center truncate rounded-full border border-border bg-surface px-2.5 py-0.5 text-[11px] font-medium leading-tight text-text sm:text-xs">
          {achado.store}
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-between px-3 pt-1 pb-3">
        <h2 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-snug text-text">
          {achado.title}
        </h2>

        <span className="mt-3 flex min-h-10 w-full items-center justify-center rounded-lg border border-ink bg-transparent px-3 text-sm font-medium text-ink transition-colors duration-150 group-hover:bg-ink group-hover:text-on-ink group-focus-visible:bg-ink group-focus-visible:text-on-ink">
          {UI_COPY.card.cta}
        </span>
      </div>
    </a>
  );
}
