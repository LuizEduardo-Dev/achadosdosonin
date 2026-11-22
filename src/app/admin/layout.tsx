import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: `Admin — ${SITE_CONFIG.name}`,
    template: `%s | Admin ${SITE_CONFIG.name}`,
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="min-h-screen bg-bg text-text">{children}</div>;
}
