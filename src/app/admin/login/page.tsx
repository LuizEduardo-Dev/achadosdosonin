import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Tag } from "lucide-react";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { SITE_CONFIG } from "@/lib/config";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { LoginForm } from "@/components/admin/login-form";

async function LoginContent() {
  const admin = await getAuthenticatedAdmin();
  if (admin) {
    redirect("/admin");
  }

  return <LoginForm supabaseConfigured={isSupabaseConfigured()} />;
}

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gradient text-accent shadow-md">
            <Tag className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-text">
            {SITE_CONFIG.name} — Admin
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Acesso exclusivo do curador para gerenciar achados e configurações.
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-surface p-6 shadow-xl">
          <Suspense
            fallback={
              <div className="h-56 animate-pulse rounded-2xl bg-surface-2" />
            }
          >
            <LoginContent />
          </Suspense>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-text-muted transition-colors hover:text-text"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Voltar para a vitrine</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
