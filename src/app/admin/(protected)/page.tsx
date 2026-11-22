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
      iconClass: "text-success",
    },
    {
      label: "Rascunhos",
      value: draftCount,
      icon: FileEdit,
      iconClass: "text-link",
    },
    {
      label: "Arquivados",
      value: archivedCount,
      icon: Archive,
      iconClass: "text-text-muted",
    },
    {
      label: "Total",
      value: achados.length,
      icon: Package,
      iconClass: "text-text",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-[-0.01em] text-text sm:text-2xl">
            Painel
          </h1>
          <p className="text-sm text-text-muted">
            Resumo da vitrine e atalhos para publicar ofertas.
          </p>
        </div>

        <Link
          href="/admin/achados/novo"
          className={buttonClasses("primary", "md")}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Novo achado</span>
        </Link>
      </div>

      <section
        aria-label="Resumo de achados"
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
      >
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-lg border border-border bg-surface p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-text-muted">
                  {stat.label}
                </span>
                <Icon
                  className={`h-4 w-4 ${stat.iconClass}`}
                  aria-hidden="true"
                />
              </div>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-text">
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
          className="card-hover-shadow flex items-center justify-between rounded-lg border border-border bg-surface p-4 hover:border-link focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link"
        >
          <div>
            <p className="text-sm font-semibold text-text sm:text-base">
              Gerenciar achados
            </p>
            <p className="text-xs text-text-muted">
              Editar, publicar, arquivar ou excluir ofertas
            </p>
          </div>
          <Package className="h-5 w-5 text-link" aria-hidden="true" />
        </Link>

        <Link
          href="/admin/configuracoes"
          className="card-hover-shadow flex items-center justify-between rounded-lg border border-border bg-surface p-4 hover:border-link focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link"
        >
          <div>
            <p className="text-sm font-semibold text-text sm:text-base">
              WhatsApp e modal de boas-vindas
            </p>
            <p className="text-xs text-text-muted">
              Atualizar link do grupo, texto ou ativar/desativar modal
            </p>
          </div>
          <Settings className="h-5 w-5 text-link" aria-hidden="true" />
        </Link>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-text sm:text-lg">
            Últimos achados
          </h2>
          <Link
            href="/admin/achados"
            className="text-xs font-medium text-link hover:underline"
          >
            Ver todos
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="rounded-lg border border-border bg-surface p-6 text-center text-sm text-text-muted">
            Nenhum achado cadastrado ainda. Use &ldquo;Novo achado&rdquo; para
            começar.
          </div>
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
            {recent.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 p-3.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-text">
                    {item.title}
                  </p>
                  <p className="text-xs text-text-muted">
                    {item.store} · {formatDatePtBR(item.created_at)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-sm font-semibold tabular-nums text-price">
                    {formatCurrencyBRL(item.price_cents)}
                  </span>
                  <Link
                    href={`/admin/achados/${item.id}/editar`}
                    className={buttonClasses("secondary", "sm")}
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
          <div className="h-9 w-44 rounded-lg bg-surface-2" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="h-24 rounded-lg bg-surface-2" />
            <div className="h-24 rounded-lg bg-surface-2" />
            <div className="h-24 rounded-lg bg-surface-2" />
            <div className="h-24 rounded-lg bg-surface-2" />
          </div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
