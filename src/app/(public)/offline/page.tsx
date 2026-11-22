import type { Metadata } from "next";
import Link from "next/link";
import { Home, WifiOff } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";
import { SiteHeader } from "@/components/site-header";
import { OfflineRetryButton } from "@/components/offline-retry-button";
import { buttonClasses } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Sem conexão",
  description: `Você está sem conexão no momento — ${SITE_CONFIG.name}.`,
  robots: {
    index: false,
    follow: false,
  },
};

export default function OfflinePage() {
  return (
    <>
      <SiteHeader />
      <section className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-3 py-14 text-center sm:px-5">
        <div className="w-full rounded-lg border border-border bg-surface p-6">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-text">
            <WifiOff className="h-6 w-6" aria-hidden="true" />
          </div>

          <h1 className="text-xl font-semibold text-text">
            Você está sem conexão
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-text-muted">
            Não foi possível carregar os achados agora. Confira sua internet e
            tente novamente.
          </p>

          <div className="mt-5 flex flex-col gap-2.5">
            <OfflineRetryButton />
            <Link
              href="/"
              className={buttonClasses("secondary", "md", "w-full")}
            >
              <Home className="h-4 w-4" aria-hidden="true" />
              <span>Voltar para a vitrine</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
