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
import { buttonClasses } from "@/components/ui/button";

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
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-[-0.01em] text-text sm:text-2xl">
            Editar achado
          </h1>
          <p className="text-sm text-text-muted">
            Atualize preço, observação, status ou imagem desta oferta.
          </p>
        </div>

        <Link
          href="/admin/achados"
          className={buttonClasses("secondary", "sm")}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Voltar</span>
        </Link>
      </div>

      <div className="rounded-lg border border-border bg-surface p-5 sm:p-6">
        <Suspense
          fallback={<div className="h-96 rounded-lg bg-surface-2" />}
        >
          <EditAchadoFormLoader params={params} />
        </Suspense>
      </div>
    </div>
  );
}
