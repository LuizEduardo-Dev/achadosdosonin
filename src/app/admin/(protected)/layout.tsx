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
    <div className="flex min-h-screen flex-col">
      <AdminNav userEmail={admin.email ?? "Administrador"} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">
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
        <div className="flex min-h-screen items-center justify-center bg-bg px-4">
          <p className="text-sm font-medium text-text-muted">
            Verificando sessão...
          </p>
        </div>
      }
    >
      <ProtectedAdminShell>{children}</ProtectedAdminShell>
    </Suspense>
  );
}
