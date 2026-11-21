"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { AlertCircle, Save } from "lucide-react";
import type { Achado } from "@/types/achado";
import {
  createAchadoAction,
  updateAchadoAction,
  type ActionState,
} from "@/app/admin/actions";
import { formatCentsForInput } from "@/lib/validators/admin";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { Button, buttonClasses } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";

const INITIAL_STATE: ActionState = {};

function toDateTimeLocalValue(isoDate: string | null | undefined): string {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "";

  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

interface AchadoFormProps {
  achado?: Achado;
  storeSuggestions: string[];
}

export function AchadoForm({ achado, storeSuggestions }: AchadoFormProps) {
  const [imagePath, setImagePath] = useState(achado?.image_path ?? "");
  const boundAction = achado
    ? updateAchadoAction.bind(null, achado.id)
    : createAchadoAction;

  const [state, formAction, isPending] = useActionState(
    boundAction,
    INITIAL_STATE,
  );

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-2xl border border-danger/60 bg-danger/10 p-3.5 text-sm text-text"
        >
          <AlertCircle
            className="mt-0.5 h-4 w-4 shrink-0 text-danger"
            aria-hidden="true"
          />
          <span>{state.error}</span>
        </div>
      )}

      <ImageUploadField
        value={imagePath}
        onChange={setImagePath}
        error={state.fieldErrors?.image_path}
      />

      <div className="space-y-1.5">
        <label htmlFor="achado-title" className="block text-sm font-semibold text-text">
          Título do achado *
        </label>
        <Input
          id="achado-title"
          name="title"
          required
          maxLength={160}
          defaultValue={achado?.title ?? ""}
          placeholder="Ex.: Fone Bluetooth TWS com Cancelamento de Ruído"
        />
        {state.fieldErrors?.title && (
          <p className="text-xs text-danger">{state.fieldErrors.title}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="achado-description"
          className="block text-sm font-semibold text-text"
        >
          Descrição curta{" "}
          <span className="font-normal text-text-muted">(opcional)</span>
        </label>
        <Textarea
          id="achado-description"
          name="description"
          maxLength={320}
          defaultValue={achado?.description ?? ""}
          placeholder="Resumo rápido do diferencial da oferta..."
        />
        {state.fieldErrors?.description && (
          <p className="text-xs text-danger">{state.fieldErrors.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label
            htmlFor="achado-price"
            className="block text-sm font-semibold text-text"
          >
            Preço atual (R$) *
          </label>
          <Input
            id="achado-price"
            name="price"
            inputMode="decimal"
            required
            defaultValue={formatCentsForInput(achado?.price_cents)}
            placeholder="129,90"
          />
          {state.fieldErrors?.price_cents && (
            <p className="text-xs text-danger">
              {state.fieldErrors.price_cents}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="achado-original-price"
            className="block text-sm font-semibold text-text"
          >
            Preço original (R$){" "}
            <span className="font-normal text-text-muted">(opcional)</span>
          </label>
          <Input
            id="achado-original-price"
            name="original_price"
            inputMode="decimal"
            defaultValue={formatCentsForInput(achado?.original_price_cents)}
            placeholder="249,90"
          />
          {state.fieldErrors?.original_price_cents && (
            <p className="text-xs text-danger">
              {state.fieldErrors.original_price_cents}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label
            htmlFor="achado-store"
            className="block text-sm font-semibold text-text"
          >
            Loja *
          </label>
          <Input
            id="achado-store"
            name="store"
            list="store-suggestions"
            required
            maxLength={60}
            defaultValue={achado?.store ?? ""}
            placeholder="Shopee, Mercado Livre, Amazon..."
          />
          <datalist id="store-suggestions">
            {storeSuggestions.map((store) => (
              <option key={store} value={store} />
            ))}
          </datalist>
          {state.fieldErrors?.store && (
            <p className="text-xs text-danger">{state.fieldErrors.store}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="achado-status"
            className="block text-sm font-semibold text-text"
          >
            Status *
          </label>
          <Select
            id="achado-status"
            name="status"
            defaultValue={achado?.status ?? "published"}
          >
            <option value="published" className="bg-surface text-text">
              Publicado (visível na vitrine)
            </option>
            <option value="draft" className="bg-surface text-text">
              Rascunho (oculto)
            </option>
            <option value="archived" className="bg-surface text-text">
              Arquivado
            </option>
          </Select>
          {state.fieldErrors?.status && (
            <p className="text-xs text-danger">{state.fieldErrors.status}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="achado-affiliate-url"
          className="block text-sm font-semibold text-text"
        >
          Link de afiliado *
        </label>
        <Input
          id="achado-affiliate-url"
          name="affiliate_url"
          type="url"
          required
          defaultValue={achado?.affiliate_url ?? ""}
          placeholder="https://shope.ee/..."
        />
        {state.fieldErrors?.affiliate_url && (
          <p className="text-xs text-danger">
            {state.fieldErrors.affiliate_url}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="achado-expires-at"
          className="block text-sm font-semibold text-text"
        >
          Data de expiração{" "}
          <span className="font-normal text-text-muted">(opcional)</span>
        </label>
        <Input
          id="achado-expires-at"
          name="expires_at"
          type="datetime-local"
          defaultValue={toDateTimeLocalValue(achado?.expires_at)}
        />
        <p className="text-xs text-text-muted">
          Se definida, o achado deixa de aparecer automaticamente na vitrine após esse horário.
        </p>
        {state.fieldErrors?.expires_at && (
          <p className="text-xs text-danger">{state.fieldErrors.expires_at}</p>
        )}
      </div>

      <div className="flex flex-col-reverse gap-2.5 border-t border-border pt-4 sm:flex-row sm:justify-end">
        <Link
          href="/admin/achados"
          className={buttonClasses("secondary", "md", "w-full sm:w-auto")}
        >
          Cancelar
        </Link>
        <Button
          type="submit"
          variant="accent"
          size="md"
          disabled={isPending}
          className="w-full font-bold sm:w-auto"
        >
          <Save className="h-4 w-4" aria-hidden="true" />
          <span>
            {isPending
              ? "Salvando..."
              : achado
                ? "Salvar alterações"
                : "Publicar achado"}
          </span>
        </Button>
      </div>
    </form>
  );
}
