import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { CheckCircle2, Plus } from "lucide-react";
import { getAdminAchados } from "@/lib/data/admin";
import { AchadoListClient } from "@/components/admin/achado-list-client";
import { buttonClasses } from "@/components/ui/button";

interface AdminAchadosPageProps {
  searchParams: Promise<{ saved?: string }>;
}

async function AchadosContent({ searchParams }: AdminAchadosPageProps) {
  await connection();
  const [achados, resolvedParams] = await Promise.all([
    getAdminAchados(),
    searchParams,
  ]);

  const savedBanner =
    resolvedParams.saved === "created"
      ? "Achado criado com sucesso."
      : resolvedParams.saved === "updated"
        ? "Achado atualizado com sucesso."
        : null;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-[-0.01em] text-text sm:text-2xl">
            Achados
          </h1>
          <p className="text-sm text-text-muted">
            Crie, edite, publique, arquive ou exclua ofertas da vitrine.
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

      {savedBanner && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-lg border border-badge-bg bg-badge-bg p-3 text-sm font-medium text-badge-text"
        >
          <CheckCircle2
            className="h-4 w-4 shrink-0 text-badge-text"
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
          <div className="h-9 w-48 rounded-lg bg-surface-2" />
          <div className="h-32 rounded-lg bg-surface-2" />
          <div className="h-32 rounded-lg bg-surface-2" />
        </div>
      }
    >
      <AchadosContent searchParams={searchParams} />
    </Suspense>
  );
}
