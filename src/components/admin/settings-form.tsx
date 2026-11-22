"use client";

import { useActionState } from "react";
import { AlertCircle, CheckCircle2, Save } from "lucide-react";
import type { SiteSettings } from "@/types/achado";
import {
  updateSiteSettingsAction,
  type ActionState,
} from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";

const INITIAL_STATE: ActionState = {};

interface SettingsFormProps {
  settings: SiteSettings;
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateSiteSettingsAction,
    INITIAL_STATE,
  );

  return (
    <form action={formAction} className="space-y-4">
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

      {state.success && (
        <div
          role="status"
          className="flex items-start gap-2 rounded-lg border border-badge-bg bg-badge-bg p-3 text-sm font-medium text-badge-text"
        >
          <CheckCircle2
            className="mt-0.5 h-4 w-4 shrink-0 text-badge-text"
            aria-hidden="true"
          />
          <span>{state.success}</span>
        </div>
      )}

      <div className="space-y-1.5">
        <label
          htmlFor="settings-whatsapp"
          className="block text-sm font-medium text-text"
        >
          Link do grupo de WhatsApp
        </label>
        <Input
          id="settings-whatsapp"
          name="whatsapp_group_url"
          type="url"
          defaultValue={settings.whatsapp_group_url}
          placeholder="https://chat.whatsapp.com/..."
        />
        <p className="text-xs text-text-muted">
          Usado no botão do topo e no modal de boas-vindas da vitrine.
        </p>
        {state.fieldErrors?.whatsapp_group_url && (
          <p className="text-xs text-danger">
            {state.fieldErrors.whatsapp_group_url}
          </p>
        )}
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-surface-2/60 p-3.5">
        <input
          type="checkbox"
          name="modal_enabled"
          defaultChecked={settings.modal_enabled}
          className="mt-0.5 h-4 w-4 accent-ink"
        />
        <div>
          <span className="block text-sm font-medium text-text">
            Modal de boas-vindas ativo
          </span>
          <span className="mt-0.5 block text-xs text-text-muted">
            Exibe o convite para o grupo do WhatsApp após 1,5 s (com intervalo
            de 24 h ao fechar ou 7 dias ao clicar).
          </span>
        </div>
      </label>

      <div className="space-y-1.5">
        <label
          htmlFor="settings-modal-title"
          className="block text-sm font-medium text-text"
        >
          Título do modal *
        </label>
        <Input
          id="settings-modal-title"
          name="modal_title"
          required
          maxLength={120}
          defaultValue={settings.modal_title}
        />
        {state.fieldErrors?.modal_title && (
          <p className="text-xs text-danger">{state.fieldErrors.modal_title}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="settings-modal-message"
          className="block text-sm font-medium text-text"
        >
          Mensagem do modal *
        </label>
        <Textarea
          id="settings-modal-message"
          name="modal_message"
          required
          maxLength={400}
          defaultValue={settings.modal_message}
        />
        {state.fieldErrors?.modal_message && (
          <p className="text-xs text-danger">
            {state.fieldErrors.modal_message}
          </p>
        )}
      </div>

      <div className="flex justify-end border-t border-border pt-4">
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={isPending}
          className="w-full sm:w-auto"
        >
          <Save className="h-4 w-4" aria-hidden="true" />
          <span>{isPending ? "Salvando..." : "Salvar configurações"}</span>
        </Button>
      </div>
    </form>
  );
}
