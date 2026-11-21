import { getSiteSettings } from "@/lib/data/storefront";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader whatsappGroupUrl={settings.whatsapp_group_url} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
