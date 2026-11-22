import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { getPublishedAchados, getSiteSettings } from "@/lib/data/storefront";
import { StorefrontView } from "@/components/storefront-view";
import { StorefrontSkeleton } from "@/components/storefront-skeleton";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
  openGraph: {
    url: "/",
  },
};

async function HomeStorefrontLoader() {
  await connection();
  const [achados, settings] = await Promise.all([
    getPublishedAchados(),
    getSiteSettings(),
  ]);

  return <StorefrontView achados={achados} settings={settings} />;
}

export default function HomePage() {
  return (
    <Suspense fallback={<StorefrontSkeleton />}>
      <HomeStorefrontLoader />
    </Suspense>
  );
}
