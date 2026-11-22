import { PwaRegister } from "@/components/pwa-register";
import { SiteFooter } from "@/components/site-footer";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-bg text-text">
      <PwaRegister />
      <main className="flex flex-1 flex-col">{children}</main>
      <SiteFooter />
    </div>
  );
}
