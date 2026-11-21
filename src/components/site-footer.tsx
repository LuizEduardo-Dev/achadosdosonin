import { SITE_CONFIG, UI_COPY } from "@/lib/config";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/80 bg-surface">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-6 text-xs leading-relaxed text-text-muted sm:px-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-bold text-text">{SITE_CONFIG.name}</p>
          <p>{UI_COPY.disclaimers.priceNotice}</p>
          <p>{UI_COPY.disclaimers.affiliateNotice}</p>
        </div>

        <p className="shrink-0 text-text-muted/80">
          © {SITE_CONFIG.name}
        </p>
      </div>
    </footer>
  );
}
