import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getExistingStoreSuggestions } from "@/lib/data/admin";
import { AchadoForm } from "@/components/admin/achado-form";

async function NewAchadoFormLoader() {
  const storeSuggestions = await getExistingStoreSuggestions();
  return <AchadoForm storeSuggestions={storeSuggestions} />;
}

export default function NewAchadoPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="space-y-1">
        <Link
          href="/admin/achados"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Voltar para achados</span>
        </Link>
        <h1 className="text-2xl font-extrabold tracking-tight text-text">
          Novo achado
        </h1>
        <p className="text-sm text-text-muted">
          Envie a foto e preencha os dados da oferta para publicar na vitrine.
        </p>
      </div>

      <div className="rounded-3xl border border-border bg-surface p-5 sm:p-6">
        <Suspense
          fallback={
            <div className="h-96 animate-pulse rounded-2xl bg-surface-2" />
          }
        >
          <NewAchadoFormLoader />
        </Suspense>
      </div>
    </div>
  );
}
