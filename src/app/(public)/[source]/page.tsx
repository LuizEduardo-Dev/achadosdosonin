import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidTrafficSource } from "@/lib/config";
import { getPublicStorefrontData } from "@/lib/data/storefront";
import { StorefrontView } from "@/components/storefront-view";
import { StorefrontSkeleton } from "@/components/storefront-skeleton";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
  openGraph: {
    url: "/",
  },
};

interface SourcePageProps {
  params: Promise<{ source: string }>;
}

export default async function SourceStorefrontPage({
  params,
}: SourcePageProps) {
  const { source } = await params;

  if (!isValidTrafficSource(source)) {
    notFound();
  }

  const { achados, drawerCategories, settings } =
    await getPublicStorefrontData();

  return (
    <Suspense fallback={<StorefrontSkeleton />}>
      <StorefrontView
        achados={achados}
        categories={drawerCategories}
        settings={settings}
        source={source}
      />
    </Suspense>
  );
}
