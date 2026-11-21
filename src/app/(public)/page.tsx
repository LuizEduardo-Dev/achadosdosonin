import type { Metadata } from "next";
import { getPublishedAchados, getSiteSettings } from "@/lib/data/storefront";
import { StorefrontView } from "@/components/storefront-view";
import { StorefrontOverlays } from "@/components/storefront-overlays";

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
    <>
      <StorefrontView achados={achados} />
      <StorefrontOverlays settings={settings} />
    </>
  );
}
