"use client";

import { useActionState } from "react";
import { AlertCircle, Lock } from "lucide-react";
import { loginAction, type ActionState } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const INITIAL_STATE: ActionState = {};

interface LoginFormProps {
  supabaseConfigured: boolean;
}

export function LoginForm({ supabaseConfigured }: LoginFormProps) {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    INITIAL_STATE,
  );

  return (
    <form action={formAction} className="space-y-4">
      {!supabaseConfigured && (
        <div
          role="alert"
          className="rounded-2xl border border-accent/50 bg-surface-2 p-3.5 text-xs leading-relaxed text-text"
        >
          <p className="font-bold text-accent">
            Supabase ainda não conectado
          </p>
          <p className="mt-1 text-text-muted">
            Configure <code className="text-text">NEXT_PUBLIC_SUPABASE_URL</code> e{" "}
            <code className="text-text">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> no arquivo{" "}
            <code className="text-text">.env.local</code> e reinicie o servidor para fazer login.
          </p>
        </div>
      )}

      {state.error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-2xl border border-danger/60 bg-danger/10 p-3 text-sm text-text"
        >
          <AlertCircle
            className="mt-0.5 h-4 w-4 shrink-0 text-danger"
            aria-hidden="true"
          />
          <span>{state.error}</span>
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="admin-email" className="block text-sm font-semibold text-text">
          E-mail
        </label>
        <Input
          id="admin-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="seu-email@exemplo.com"
          aria-invalid={Boolean(state.fieldErrors?.email)}
        />
        {state.fieldErrors?.email && (
          <p className="text-xs text-danger">{state.fieldErrors.email}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="admin-password" className="block text-sm font-semibold text-text">
          Senha
        </label>
        <Input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          aria-invalid={Boolean(state.fieldErrors?.password)}
        />
        {state.fieldErrors?.password && (
          <p className="text-xs text-danger">{state.fieldErrors.password}</p>
        )}
      </div>

      <Button
        type="submit"
        variant="accent"
        size="lg"
        className="w-full font-bold"
        disabled={isPending || !supabaseConfigured}
      >
        <Lock className="h-4 w-4" aria-hidden="true" />
        <span>{isPending ? "Entrando..." : "Entrar no painel"}</span>
      </Button>
    </form>
  );
}
