"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ExternalLink,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  Package,
  Settings,
  Tag,
} from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";
import { logoutAction } from "@/app/admin/actions/auth";

const NAV_ITEMS = [
  { href: "/admin", label: "Painel", icon: LayoutDashboard, exact: true },
  { href: "/admin/achados", label: "Achados", icon: Package, exact: false },
  {
    href: "/admin/departamentos",
    label: "Departamentos",
    icon: LayoutGrid,
    exact: false,
  },
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
    <header className="sticky top-0 z-30 bg-ink text-on-ink">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-2.5 px-3 py-3 sm:px-5">
        <div className="flex items-center justify-between gap-2">
          <Link
            href="/admin"
            className="flex min-w-0 items-center gap-2 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-sage"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink-hover text-accent-sage">
              <Tag className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-on-ink sm:text-base">
                {SITE_CONFIG.name}{" "}
                <span className="font-normal text-accent-sage">· Admin</span>
              </p>
              <p className="truncate text-[11px] text-on-ink-muted">
                {userEmail}
              </p>
            </div>
          </Link>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-on-ink-muted/40 px-3 text-xs font-medium text-on-ink transition-colors hover:bg-ink-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-sage"
            >
              <span>Vitrine</span>
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>

            <form action={logoutAction}>
              <button
                type="submit"
                aria-label="Sair do painel administrativo"
                className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-on-ink-muted/40 px-3 text-xs font-medium text-on-ink-muted transition-colors hover:bg-ink-hover hover:text-on-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-sage"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </form>
          </div>
        </div>

        <nav
          aria-label="Navegação administrativa"
          className="no-scrollbar flex gap-2 overflow-x-auto pb-0.5"
        >
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
                className={`inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-sage sm:text-sm ${
                  isActive
                    ? "bg-surface text-ink font-semibold"
                    : "bg-ink-hover text-on-ink-muted hover:text-on-ink"
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
