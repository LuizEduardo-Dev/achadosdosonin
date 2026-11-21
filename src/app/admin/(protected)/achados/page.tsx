import { Suspense } from "react";
import Link from "next/link";
import { CheckCircle2, Plus } from "lucide-react";
import { getAdminAchados } from "@/lib/data/admin";
import { AchadoListClient } from "@/components/admin/achado-list-client";
import { buttonClasses } from "@/components/ui/button";

interface AdminAchadosPageProps {
  searchParams: Promise<{ saved?: string }>;
}

async function AchadosContent({ searchParams }: AdminAchadosPageProps) {
  const [achados, resolvedParams] = await Promise.all([
    getAdminAchados(),
    searchParams,
  ]);

  const savedBanner =
    resolvedParams.saved === "created"
      ? "Achado criado com sucesso!"
      : resolvedParams.saved === "updated"
        ? "Achado atualizado com sucesso!"
        : null;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-text">
            Achados
          </h1>
          <p className="text-sm text-text-muted">
            Crie, edite, publique, arquive ou exclua ofertas da vitrine.
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

      {savedBanner && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-2xl border border-success/50 bg-success/10 p-3.5 text-sm font-semibold text-text"
        >
          <CheckCircle2
            className="h-4 w-4 shrink-0 text-success"
            aria-hidden="true"
          />
          <span>{savedBanner}</span>
        </div>
      )}

      <AchadoListClient achados={achados} />
    </div>
  );
}

export default function AdminAchadosPage({
  searchParams,
}: AdminAchadosPageProps) {
  return (
    <Suspense
      fallback={
        <div className="space-y-3">
          <div className="h-10 w-52 animate-pulse rounded-xl bg-surface" />
          <div className="h-32 animate-pulse rounded-2xl bg-surface" />
          <div className="h-32 animate-pulse rounded-2xl bg-surface" />
        </div>
      }
    >
      <AchadosContent searchParams={searchParams} />
    </Suspense>
  );
}
