"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { AlertCircle, Loader2, Save } from "lucide-react";
import type { Achado, AchadoStatus } from "@/types/achado";
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
  const [title, setTitle] = useState(achado?.title ?? "");
  const [description, setDescription] = useState(achado?.description ?? "");
  const [price, setPrice] = useState(formatCentsForInput(achado?.price_cents));
  const [originalPrice, setOriginalPrice] = useState(
    formatCentsForInput(achado?.original_price_cents),
  );
  const [priceNote, setPriceNote] = useState(achado?.price_note ?? "");
  const [store, setStore] = useState(achado?.store ?? "");
  const [status, setStatus] = useState<AchadoStatus>(
    achado?.status ?? "published",
  );
  const [affiliateUrl, setAffiliateUrl] = useState(achado?.affiliate_url ?? "");
  const [expiresAt, setExpiresAt] = useState(
    toDateTimeLocalValue(achado?.expires_at),
  );

  const boundAction = achado
    ? updateAchadoAction.bind(null, achado.id)
    : createAchadoAction;

  const [state, formAction, isPending] = useActionState(
    boundAction,
    INITIAL_STATE,
  );

  const fieldErrors = state.fieldErrors;

  return (
    <form
      action={formAction}
      noValidate
      onSubmit={(event) => {
        if (isPending) {
          event.preventDefault();
        }
      }}
      className="space-y-4"
    >
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

      <ImageUploadField
        value={imagePath}
        onChange={setImagePath}
        error={fieldErrors?.image_path}
      />

      <div className="space-y-1.5">
        <label htmlFor="achado-title" className="block text-sm font-medium text-text">
          Título do achado *
        </label>
        <Input
          id="achado-title"
          name="title"
          required
          maxLength={160}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          aria-invalid={Boolean(fieldErrors?.title)}
          className={fieldErrors?.title ? "border-danger" : ""}
          placeholder="Ex.: Fone Bluetooth TWS com Cancelamento de Ruído"
        />
        {fieldErrors?.title && (
          <p className="text-xs text-danger">{fieldErrors.title}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="achado-description"
          className="block text-sm font-medium text-text"
        >
          Descrição curta{" "}
          <span className="font-normal text-text-muted">(opcional)</span>
        </label>
        <Textarea
          id="achado-description"
          name="description"
          maxLength={320}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          aria-invalid={Boolean(fieldErrors?.description)}
          className={fieldErrors?.description ? "border-danger" : ""}
          placeholder="Resumo rápido da oferta..."
        />
        {fieldErrors?.description && (
          <p className="text-xs text-danger">{fieldErrors.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label
            htmlFor="achado-price"
            className="block text-sm font-medium text-text"
          >
            Preço atual (R$) *
          </label>
          <Input
            id="achado-price"
            name="price"
            inputMode="decimal"
            required
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            aria-invalid={Boolean(fieldErrors?.price_cents)}
            className={fieldErrors?.price_cents ? "border-danger" : ""}
            placeholder="129,90"
          />
          {fieldErrors?.price_cents && (
            <p className="text-xs text-danger">{fieldErrors.price_cents}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="achado-original-price"
            className="block text-sm font-medium text-text"
          >
            Preço original (R$){" "}
            <span className="font-normal text-text-muted">(opcional)</span>
          </label>
          <Input
            id="achado-original-price"
            name="original_price"
            inputMode="decimal"
            value={originalPrice}
            onChange={(event) => setOriginalPrice(event.target.value)}
            aria-invalid={Boolean(fieldErrors?.original_price_cents)}
            className={fieldErrors?.original_price_cents ? "border-danger" : ""}
            placeholder="249,90"
          />
          {fieldErrors?.original_price_cents && (
            <p className="text-xs text-danger">
              {fieldErrors.original_price_cents}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="achado-price-note"
          className="block text-sm font-medium text-text"
        >
          Observação do preço{" "}
          <span className="font-normal text-text-muted">
            (opcional, até 40 caracteres)
          </span>
        </label>
        <Input
          id="achado-price-note"
          name="price_note"
          maxLength={40}
          value={priceNote}
          onChange={(event) => setPriceNote(event.target.value)}
          aria-invalid={Boolean(fieldErrors?.price_note)}
          className={fieldErrors?.price_note ? "border-danger" : ""}
          placeholder="Ex.: à vista no PIX ou em até 10x sem juros"
        />
        {fieldErrors?.price_note && (
          <p className="text-xs text-danger">{fieldErrors.price_note}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label
            htmlFor="achado-store"
            className="block text-sm font-medium text-text"
          >
            Loja *
          </label>
          <Input
            id="achado-store"
            name="store"
            list="store-suggestions"
            required
            maxLength={60}
            value={store}
            onChange={(event) => setStore(event.target.value)}
            aria-invalid={Boolean(fieldErrors?.store)}
            className={fieldErrors?.store ? "border-danger" : ""}
            placeholder="Shopee, Mercado Livre, Amazon..."
          />
          <datalist id="store-suggestions">
            {storeSuggestions.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
          {fieldErrors?.store && (
            <p className="text-xs text-danger">{fieldErrors.store}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="achado-status"
            className="block text-sm font-medium text-text"
          >
            Status *
          </label>
          <Select
            id="achado-status"
            name="status"
            value={status}
            onChange={(event) => setStatus(event.target.value as AchadoStatus)}
            aria-invalid={Boolean(fieldErrors?.status)}
            className={fieldErrors?.status ? "border-danger" : ""}
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
          {fieldErrors?.status && (
            <p className="text-xs text-danger">{fieldErrors.status}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="achado-affiliate-url"
          className="block text-sm font-medium text-text"
        >
          Link de afiliado *
        </label>
        <Input
          id="achado-affiliate-url"
          name="affiliate_url"
          type="url"
          required
          value={affiliateUrl}
          onChange={(event) => setAffiliateUrl(event.target.value)}
          aria-invalid={Boolean(fieldErrors?.affiliate_url)}
          className={fieldErrors?.affiliate_url ? "border-danger" : ""}
          placeholder="https://shope.ee/..."
        />
        {fieldErrors?.affiliate_url && (
          <p className="text-xs text-danger">{fieldErrors.affiliate_url}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="achado-expires-at"
          className="block text-sm font-medium text-text"
        >
          Data de expiração{" "}
          <span className="font-normal text-text-muted">(opcional)</span>
        </label>
        <Input
          id="achado-expires-at"
          name="expires_at"
          type="datetime-local"
          value={expiresAt}
          onChange={(event) => setExpiresAt(event.target.value)}
          aria-invalid={Boolean(fieldErrors?.expires_at)}
          className={fieldErrors?.expires_at ? "border-danger" : ""}
        />
        <p className="text-xs text-text-muted">
          Deixe em branco se não tiver prazo. Se definida, o achado sai da
          vitrine após esse horário (fuso de Brasília).
        </p>
        {fieldErrors?.expires_at && (
          <p className="text-xs text-danger">{fieldErrors.expires_at}</p>
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
          variant="primary"
          size="md"
          disabled={isPending}
          className="w-full sm:w-auto"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Save className="h-4 w-4" aria-hidden="true" />
          )}
          <span>
            {isPending
              ? "Salvando..."
              : achado
                ? "Salvar alterações"
                : "Salvar achado"}
          </span>
        </Button>
      </div>
    </form>
  );
}
