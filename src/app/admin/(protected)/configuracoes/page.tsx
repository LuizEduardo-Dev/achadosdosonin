import { Suspense } from "react";
import { connection } from "next/server";
import { getAdminSiteSettings } from "@/lib/data/admin";
import { SettingsForm } from "@/components/admin/settings-form";

async function SettingsLoader() {
  await connection();
  const settings = await getAdminSiteSettings();
  return <SettingsForm settings={settings} />;
}

export default function AdminSettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-xl font-semibold tracking-[-0.01em] text-text sm:text-2xl">
          Configurações
        </h1>
        <p className="text-sm text-text-muted">
          Gerencie o link do grupo de WhatsApp e o modal de boas-vindas da vitrine.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-surface p-5 sm:p-6">
        <Suspense
          fallback={<div className="h-72 rounded-lg bg-surface-2" />}
        >
          <SettingsLoader />
        </Suspense>
      </div>
    </div>
  );
}
