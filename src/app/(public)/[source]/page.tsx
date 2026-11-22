import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import type { TrafficSource } from "@/types/achado";
import { isValidTrafficSource, TRAFFIC_SOURCES } from "@/lib/config";
import { getPublishedAchados, getSiteSettings } from "@/lib/data/storefront";
import { StorefrontView } from "@/components/storefront-view";
import { StorefrontSkeleton } from "@/components/storefront-skeleton";

export function generateStaticParams() {
  return TRAFFIC_SOURCES.map((source) => ({ source }));
}

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
  openGraph: {
    url: "/",
  },
};

async function SourceStorefrontLoader({ source }: { source: TrafficSource }) {
  await connection();
  const [achados, settings] = await Promise.all([
    getPublishedAchados(),
    getSiteSettings(),
  ]);

  return (
    <StorefrontView achados={achados} settings={settings} source={source} />
  );
}

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

  return (
    <Suspense fallback={<StorefrontSkeleton />}>
      <SourceStorefrontLoader source={source} />
    </Suspense>
  );
}
