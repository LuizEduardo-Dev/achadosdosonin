import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeft, Tag } from "lucide-react";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { SITE_CONFIG } from "@/lib/config";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { LoginForm } from "@/components/admin/login-form";
import { buttonClasses } from "@/components/ui/button";

async function LoginContent() {
  await connection();
  const admin = await getAuthenticatedAdmin();
  if (admin) {
    redirect("/admin");
  }

  return <LoginForm supabaseConfigured={isSupabaseConfigured()} />;
}

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-bg px-4 py-10">
      <div className="w-full max-w-md space-y-5">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-ink text-accent-sage">
            <Tag className="h-5 w-5" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-semibold tracking-[-0.01em] text-text sm:text-2xl">
            {SITE_CONFIG.name} · Admin
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Acesso restrito para gerenciar achados e configurações.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-surface p-6">
          <Suspense
            fallback={<div className="h-52 rounded-lg bg-surface-2" />}
          >
            <LoginContent />
          </Suspense>
        </div>

        <div className="text-center">
          <Link href="/" className={buttonClasses("secondary", "sm")}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Voltar para a vitrine</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
