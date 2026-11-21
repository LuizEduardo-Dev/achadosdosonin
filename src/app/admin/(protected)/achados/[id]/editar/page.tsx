import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeft } from "lucide-react";
import {
  getAdminAchadoById,
  getExistingStoreSuggestions,
} from "@/lib/data/admin";
import { AchadoForm } from "@/components/admin/achado-form";

interface EditAchadoPageProps {
  params: Promise<{ id: string }>;
}

async function EditAchadoFormLoader({ params }: EditAchadoPageProps) {
  await connection();
  const { id } = await params;
  const [achado, storeSuggestions] = await Promise.all([
    getAdminAchadoById(id),
    getExistingStoreSuggestions(),
  ]);

  if (!achado) {
    notFound();
  }

  return <AchadoForm achado={achado} storeSuggestions={storeSuggestions} />;
}

export default function EditAchadoPage({ params }: EditAchadoPageProps) {
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
          Editar achado
        </h1>
        <p className="text-sm text-text-muted">
          Atualize as informações, preço, status ou imagem desta oferta.
        </p>
      </div>

      <div className="rounded-3xl border border-border bg-surface p-5 sm:p-6">
        <Suspense
          fallback={
            <div className="h-96 animate-pulse rounded-2xl bg-surface-2" />
          }
        >
          <EditAchadoFormLoader params={params} />
        </Suspense>
      </div>
    </div>
  );
}
