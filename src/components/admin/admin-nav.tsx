"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  Tag,
} from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";
import { logoutAction } from "@/app/admin/actions";

const NAV_ITEMS = [
  { href: "/admin", label: "Painel", icon: LayoutDashboard, exact: true },
  { href: "/admin/achados", label: "Achados", icon: Package, exact: false },
  {
    href: "/admin/configuracoes",
    label: "Configurações",
    icon: Settings,
    exact: false,
  },
] as const;

interface AdminNavProps {
  userEmail: string;
}

export function AdminNav({ userEmail }: AdminNavProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-2">
          <Link
            href="/admin"
            className="flex min-w-0 items-center gap-2 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-accent">
              <Tag className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold text-text sm:text-base">
                {SITE_CONFIG.name}{" "}
                <span className="font-semibold text-accent">Admin</span>
              </p>
              <p className="truncate text-[11px] text-text-muted">{userEmail}</p>
            </div>
          </Link>

          <div className="flex shrink-0 items-center gap-1.5">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-border bg-surface-2 px-3 text-xs font-semibold text-text transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <span>Vitrine</span>
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>

            <form action={logoutAction}>
              <button
                type="submit"
                aria-label="Sair do painel administrativo"
                className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-xl border border-border bg-transparent px-3 text-xs font-semibold text-text-muted transition-colors hover:border-danger hover:text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </form>
          </div>
        </div>

        <nav aria-label="Navegação administrativa" className="no-scrollbar flex gap-1.5 overflow-x-auto pb-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:text-sm ${
                  isActive
                    ? "bg-accent text-bg font-bold"
                    : "bg-surface-2/70 text-text-muted hover:bg-surface-2 hover:text-text"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
