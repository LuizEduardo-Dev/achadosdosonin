import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SITE_CONFIG } from "@/lib/config";
import {
  getPublicCategoryBySlug,
  getPublicStorefrontData,
} from "@/lib/data/storefront";
import { StorefrontView } from "@/components/storefront-view";
import { StorefrontSkeleton } from "@/components/storefront-skeleton";

export const dynamic = "force-dynamic";

interface DepartmentPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: DepartmentPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getPublicCategoryBySlug(slug);

  if (!category) {
    return {
      title: "Departamento não encontrado",
    };
  }

  const title = `${category.name} — Achados`;
  const description = `Confira os melhores achados e promoções selecionadas em ${category.name} no ${SITE_CONFIG.name}.`;
  const canonicalPath = `/c/${category.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title,
      description,
      url: canonicalPath,
    },
  };
}

export default async function DepartmentPage({ params }: DepartmentPageProps) {
  const { slug } = await params;
  const [category, storefront] = await Promise.all([
    getPublicCategoryBySlug(slug),
    getPublicStorefrontData(),
  ]);

  if (!category) {
    notFound();
  }

  const departmentAchados = storefront.achados.filter((item) =>
    item.category_ids?.includes(category.id),
  );

  return (
    <Suspense fallback={<StorefrontSkeleton />}>
      <StorefrontView
        achados={departmentAchados}
        categories={storefront.drawerCategories}
        settings={storefront.settings}
        activeCategory={category}
      />
    </Suspense>
  );
}
