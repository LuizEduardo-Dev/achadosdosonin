import type { Metadata } from "next";
import Link from "next/link";
import { Home, WifiOff } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";
import { OfflineRetryButton } from "@/components/offline-retry-button";
import { buttonClasses } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Sem conexão",
  description: `Você está offline no momento — ${SITE_CONFIG.name}.`,
  robots: {
    index: false,
    follow: false,
  },
};

export default function OfflinePage() {
  return (
    <section className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <div className="w-full rounded-3xl border border-border bg-surface p-7 shadow-xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2 text-accent">
          <WifiOff className="h-7 w-7" aria-hidden="true" />
        </div>

        <h1 className="text-2xl font-extrabold tracking-tight text-text">
          Você está offline
        </h1>

        <p className="mt-2 text-sm leading-relaxed text-text-muted">
          Não conseguimos carregar os achados mais recentes agora. Verifique sua
          conexão com a internet e tente novamente.
        </p>

        <div className="mt-6 flex flex-col gap-2.5">
          <OfflineRetryButton />
          <Link
            href="/"
            className={buttonClasses("secondary", "md", "w-full")}
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            <span>Ir para a vitrine</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
