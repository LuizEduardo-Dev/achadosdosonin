import { SITE_CONFIG, UI_COPY } from "@/lib/config";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-1.5 px-3 py-5 text-xs text-text-muted sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <p className="font-medium text-text">{SITE_CONFIG.name}</p>
        <p>{UI_COPY.footer.disclaimer}</p>
      </div>
    </footer>
  );
}
