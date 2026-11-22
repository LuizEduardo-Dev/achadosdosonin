import { Suspense } from "react";
import { connection } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { AdminNav } from "@/components/admin/admin-nav";

async function ProtectedAdminShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await connection();
  const admin = await requireAdmin();

  return (
    <div className="flex min-h-screen flex-col bg-bg text-text">
      <AdminNav userEmail={admin.email ?? "Administrador"} />
      <main className="mx-auto w-full max-w-[1280px] flex-1 px-3 py-5 sm:px-5 sm:py-6">
        {children}
      </main>
    </div>
  );
}

export default function AdminProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-bg">
          <div className="h-24 bg-ink" />
          <div className="mx-auto max-w-[1280px] space-y-4 px-3 py-6 sm:px-5">
            <div className="h-8 w-44 rounded-lg bg-surface-2" />
            <div className="h-32 w-full rounded-lg bg-surface-2" />
          </div>
        </div>
      }
    >
      <ProtectedAdminShell>{children}</ProtectedAdminShell>
    </Suspense>
  );
}
