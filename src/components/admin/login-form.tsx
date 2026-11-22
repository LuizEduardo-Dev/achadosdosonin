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
          className="rounded-lg border border-border bg-surface-2 p-3.5 text-xs leading-relaxed text-text"
        >
          <p className="font-semibold text-text">
            Supabase ainda não conectado
          </p>
          <p className="mt-1 text-text-muted">
            Configure <code className="font-medium text-text">NEXT_PUBLIC_SUPABASE_URL</code> e{" "}
            <code className="font-medium text-text">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> no arquivo{" "}
            <code className="font-medium text-text">.env.local</code> e reinicie o servidor para entrar.
          </p>
        </div>
      )}

      {state.error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-danger bg-surface-2 p-3 text-sm text-danger"
        >
          <AlertCircle
            className="mt-0.5 h-4 w-4 shrink-0 text-danger"
            aria-hidden="true"
          />
          <span>{state.error}</span>
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="admin-email" className="block text-sm font-medium text-text">
          E-mail
        </label>
        <Input
          id="admin-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state.values?.email ?? ""}
          placeholder="seu-email@exemplo.com"
          aria-invalid={Boolean(state.fieldErrors?.email)}
        />
        {state.fieldErrors?.email && (
          <p className="text-xs text-danger">{state.fieldErrors.email}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="admin-password" className="block text-sm font-medium text-text">
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
        variant="primary"
        size="lg"
        className="w-full"
        disabled={isPending || !supabaseConfigured}
      >
        <Lock className="h-4 w-4" aria-hidden="true" />
        <span>{isPending ? "Entrando..." : "Entrar no painel"}</span>
      </Button>
    </form>
  );
}
