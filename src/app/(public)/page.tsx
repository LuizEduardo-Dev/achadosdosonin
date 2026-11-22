import { Suspense } from "react";
import type { Metadata } from "next";
import { getPublishedAchados, getSiteSettings } from "@/lib/data/storefront";
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

export default async function HomePage() {
  const [achados, settings] = await Promise.all([
    getPublishedAchados(),
    getSiteSettings(),
  ]);

  return (
    <Suspense fallback={<StorefrontSkeleton />}>
      <StorefrontView achados={achados} settings={settings} />
    </Suspense>
  );
}
