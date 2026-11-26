import { Suspense } from "react";
import { connection } from "next/server";
import { getAdminCategories } from "@/lib/data/admin";
import { CategoriesManager } from "@/components/admin/categories-manager";

async function CategoriesContent() {
  await connection();
  const categories = await getAdminCategories();
  return <CategoriesManager categories={categories} />;
}

export default function AdminDepartamentosPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-xl font-semibold tracking-[-0.01em] text-text sm:text-2xl">
          Departamentos
        </h1>
        <p className="text-sm text-text-muted">
          Organize os departamentos exibidos no menu da vitrine e associe até 3
          por achado.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="space-y-3">
            <div className="h-44 rounded-lg bg-surface-2" />
            <div className="h-24 rounded-lg bg-surface-2" />
            <div className="h-24 rounded-lg bg-surface-2" />
          </div>
        }
      >
        <CategoriesContent />
      </Suspense>
    </div>
  );
}
