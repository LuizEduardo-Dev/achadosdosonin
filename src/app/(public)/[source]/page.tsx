import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidTrafficSource, TRAFFIC_SOURCES } from "@/lib/config";
import { getPublishedAchados, getSiteSettings } from "@/lib/data/storefront";
import { StorefrontView } from "@/components/storefront-view";
import { StorefrontOverlays } from "@/components/storefront-overlays";

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

  const [achados, settings] = await Promise.all([
    getPublishedAchados(),
    getSiteSettings(),
  ]);

  return (
    <>
      <StorefrontView achados={achados} />
      <StorefrontOverlays settings={settings} source={source} />
    </>
  );
}
