import Link from "next/link";
import { MessageCircle, Tag } from "lucide-react";
import { SITE_CONFIG, UI_COPY } from "@/lib/config";
import { buttonClasses } from "@/components/ui/button";

interface SiteHeaderProps {
  whatsappGroupUrl: string;
}

export function SiteHeader({ whatsappGroupUrl }: SiteHeaderProps) {
  const cleanUrl = whatsappGroupUrl.trim();

  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-surface/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-accent shadow-sm">
            <Tag className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="truncate text-lg font-extrabold tracking-tight text-text">
            {SITE_CONFIG.name}
          </span>
        </Link>

        {cleanUrl && (
          <a
            href={cleanUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={UI_COPY.header.whatsappAriaLabel}
            className={buttonClasses("whatsapp", "sm", "shrink-0 font-bold")}
          >
            <MessageCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{UI_COPY.header.whatsappCta}</span>
          </a>
        )}
      </div>
    </header>
  );
}
