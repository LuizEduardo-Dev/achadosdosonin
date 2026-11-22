import Link from "next/link";
import { MessageCircle, Tag } from "lucide-react";
import { SITE_CONFIG, UI_COPY } from "@/lib/config";
import { buttonClasses } from "@/components/ui/button";

interface SiteHeaderProps {
  whatsappGroupUrl?: string;
}

export function SiteHeader({ whatsappGroupUrl = "" }: SiteHeaderProps) {
  const cleanUrl = whatsappGroupUrl.trim();

  return (
    <header className="rounded-b-2xl bg-ink text-on-ink">
      <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center justify-between gap-3 px-3 sm:px-5">
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

        {cleanUrl && (
          <a
            href={cleanUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={UI_COPY.header.whatsappAriaLabel}
            className={buttonClasses("whatsapp", "sm", "shrink-0 font-semibold")}
          >
            <MessageCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{UI_COPY.header.whatsappCta}</span>
          </a>
        )}
      </div>
    </header>
  );
}
