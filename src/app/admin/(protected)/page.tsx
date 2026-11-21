import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import {
  Archive,
  CheckCircle2,
  FileEdit,
  Package,
  Plus,
  Settings,
} from "lucide-react";
import { getAdminAchados } from "@/lib/data/admin";
import { formatCurrencyBRL, formatDatePtBR } from "@/lib/format";
import { buttonClasses } from "@/components/ui/button";

async function DashboardContent() {
  await connection();
  const achados = await getAdminAchados();

  const publishedCount = achados.filter((i) => i.status === "published").length;
  const draftCount = achados.filter((i) => i.status === "draft").length;
  const archivedCount = achados.filter((i) => i.status === "archived").length;
  const recent = achados.slice(0, 5);

  const stats = [
    {
      label: "Publicados",
      value: publishedCount,
      icon: CheckCircle2,
      accent: "text-success",
    },
    {
      label: "Rascunhos",
      value: draftCount,
      icon: FileEdit,
      accent: "text-accent",
    },
    {
      label: "Arquivados",
      value: archivedCount,
      icon: Archive,
      accent: "text-text-muted",
    },
    {
      label: "Total",
      value: achados.length,
      icon: Package,
      accent: "text-primary-hover",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-text">
            Painel
          </h1>
          <p className="text-sm text-text-muted">
            Resumo rápido da vitrine e atalhos para publicar pelo celular.
          </p>
        </div>

        <Link
          href="/admin/achados/novo"
          className={buttonClasses("accent", "md", "font-bold")}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Novo achado</span>
        </Link>
      </div>

      <section
        aria-label="Métricas de achados"
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
      >
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-border bg-surface p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-muted">
                  {stat.label}
                </span>
                <Icon className={`h-4 w-4 ${stat.accent}`} aria-hidden="true" />
              </div>
              <p className="mt-2 text-2xl font-extrabold tabular-nums text-text">
                {stat.value}
              </p>
            </div>
          );
        })}
      </section>

      <section
        aria-label="Ações rápidas"
        className="grid grid-cols-1 gap-3 sm:grid-cols-2"
      >
        <Link
          href="/admin/achados"
          className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-primary hover:bg-surface-2"
        >
          <div>
            <p className="text-base font-bold text-text">Gerenciar achados</p>
            <p className="text-xs text-text-muted">
              Editar, publicar, arquivar ou excluir ofertas
            </p>
          </div>
          <Package className="h-5 w-5 text-accent" aria-hidden="true" />
        </Link>

        <Link
          href="/admin/configuracoes"
          className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-primary hover:bg-surface-2"
        >
          <div>
            <p className="text-base font-bold text-text">
              WhatsApp e modal de boas-vindas
            </p>
            <p className="text-xs text-text-muted">
              Atualizar link do grupo, texto ou ativar/desativar modal
            </p>
          </div>
          <Settings className="h-5 w-5 text-accent" aria-hidden="true" />
        </Link>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-text">Últimos achados</h2>
          <Link
            href="/admin/achados"
            className="text-xs font-semibold text-accent hover:underline"
          >
            Ver todos
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface p-6 text-center text-sm text-text-muted">
            Nenhum achado cadastrado ainda. Toque em &ldquo;Novo achado&rdquo; para começar.
          </div>
        ) : (
          <ul className="divide-y divide-border/70 overflow-hidden rounded-2xl border border-border bg-surface">
            {recent.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 p-3.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-text">
                    {item.title}
                  </p>
                  <p className="text-xs text-text-muted">
                    {item.store} • {formatDatePtBR(item.created_at)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-sm font-extrabold tabular-nums text-accent">
                    {formatCurrencyBRL(item.price_cents)}
                  </span>
                  <Link
                    href={`/admin/achados/${item.id}/editar`}
                    className={buttonClasses("secondary", "sm", "text-xs")}
                  >
                    Editar
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <div className="h-10 w-48 animate-pulse rounded-xl bg-surface" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="h-24 animate-pulse rounded-2xl bg-surface" />
            <div className="h-24 animate-pulse rounded-2xl bg-surface" />
            <div className="h-24 animate-pulse rounded-2xl bg-surface" />
            <div className="h-24 animate-pulse rounded-2xl bg-surface" />
          </div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
