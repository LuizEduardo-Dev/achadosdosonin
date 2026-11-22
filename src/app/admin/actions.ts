"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAdminUser, requireAdmin } from "@/lib/auth";
import {
  ACHADOS_CACHE_TAG,
  SITE_SETTINGS_CACHE_TAG,
} from "@/lib/data/storefront";
import { ACHADOS_STORAGE_BUCKET } from "@/lib/supabase/storage";
import {
  achadoMutationSchema,
  deleteAchadoSchema,
  loginSchema,
  parseBRLInputToCents,
  siteSettingsMutationSchema,
  updateAchadoStatusSchema,
} from "@/lib/validators/admin";

export interface ActionState {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>;
}

function revalidateStorefrontAndAdmin() {
  updateTag(ACHADOS_CACHE_TAG);
  updateTag(SITE_SETTINGS_CACHE_TAG);
  revalidatePath("/");
  revalidatePath("/tt");
  revalidatePath("/ig");
  revalidatePath("/wpp");
  revalidatePath("/admin");
  revalidatePath("/admin/achados");
  revalidatePath("/admin/configuracoes");
}

function parseAchadoFormData(formData: FormData) {
  const priceRaw = String(formData.get("price") ?? "");
  const originalPriceRaw = String(formData.get("original_price") ?? "");
  const priceNoteRaw = String(formData.get("price_note") ?? "").trim();
  const descriptionRaw = String(formData.get("description") ?? "").trim();
  const expiresAtRaw = String(formData.get("expires_at") ?? "").trim();

  const priceCents = parseBRLInputToCents(priceRaw);
  const originalPriceCents = originalPriceRaw.trim()
    ? parseBRLInputToCents(originalPriceRaw)
    : null;

  let expiresAtIso: string | null = null;
  if (expiresAtRaw) {
    const parsedDate = new Date(expiresAtRaw);
    expiresAtIso = Number.isNaN(parsedDate.getTime())
      ? "INVALID_DATE"
      : parsedDate.toISOString();
  }

  return achadoMutationSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    description: descriptionRaw || null,
    price_cents: priceCents ?? -1,
    original_price_cents:
      originalPriceRaw.trim() && originalPriceCents === null
        ? -1
        : originalPriceCents,
    price_note: priceNoteRaw || null,
    store: String(formData.get("store") ?? ""),
    affiliate_url: String(formData.get("affiliate_url") ?? ""),
    image_path: String(formData.get("image_path") ?? ""),
    status: String(formData.get("status") ?? "draft"),
    expires_at: expiresAtIso,
  });
}

function extractFieldErrors(
  issues: ReadonlyArray<{ path: PropertyKey[]; message: string }>,
): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "form");
    if (!fieldErrors[key]) {
      fieldErrors[key] = issue.message;
    }
  }
  return fieldErrors;
}

export async function loginAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const emailRaw = String(formData.get("email") ?? "").trim();
  const parsed = loginSchema.safeParse({
    email: emailRaw,
    password: String(formData.get("password") ?? ""),
  });

  if (!parsed.success) {
    return {
      error: "Verifique os dados informados.",
      fieldErrors: extractFieldErrors(parsed.error.issues),
      values: { email: emailRaw },
    };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return {
      error:
        "Supabase ainda não está configurado. Preencha as variáveis em .env.local.",
      values: { email: emailRaw },
    };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    console.error("[admin login] Supabase auth error:", {
      status: error?.status,
      code: error?.code,
      message: error?.message,
    });

    const msg = error?.message?.toLowerCase() ?? "";
    const code = error?.code?.toLowerCase() ?? "";

    if (
      msg.includes("fetch failed") ||
      msg.includes("enotfound") ||
      msg.includes("timeout") ||
      error?.status === 0
    ) {
      return {
        error:
          "Não foi possível conectar ao Supabase. Verifique NEXT_PUBLIC_SUPABASE_URL no .env.local e sua conexão.",
        values: { email: emailRaw },
      };
    }

    if (msg.includes("api key") || msg.includes("apikey")) {
      return {
        error:
          "Chave da API do Supabase inválida. Verifique NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local.",
        values: { email: emailRaw },
      };
    }

    if (code === "email_not_confirmed") {
      return {
        error: "Este e-mail ainda não foi confirmado no Supabase Auth.",
        values: { email: emailRaw },
      };
    }

    if (code === "email_provider_disabled") {
      return {
        error:
          "O login por e-mail está desativado no Supabase (mantenha Email ativado e desative apenas 'Allow new users to sign up').",
        values: { email: emailRaw },
      };
    }

    if (code === "over_request_rate_limit" || error?.status === 429) {
      return {
        error:
          "Muitas tentativas seguidas. Aguarde alguns minutos e tente novamente.",
        values: { email: emailRaw },
      };
    }

    if (code === "captcha_failed") {
      return {
        error:
          "A proteção CAPTCHA está ativada no Supabase Auth (Authentication → Attack Protection).",
        values: { email: emailRaw },
      };
    }

    return {
      error: "E-mail ou senha inválidos.",
      values: { email: emailRaw },
    };
  }

  if (!isAdminUser(data.user)) {
    await supabase.auth.signOut();
    return {
      error: "Esta conta não tem permissão de administrador.",
      values: { email: emailRaw },
    };
  }

  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}

export async function createAchadoAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const parsed = parseAchadoFormData(formData);
  if (!parsed.success) {
    return {
      error: "Corrija os campos destacados antes de salvar.",
      fieldErrors: extractFieldErrors(parsed.error.issues),
    };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { error: "Supabase não configurado." };
  }

  const { error } = await supabase.from("achados").insert(parsed.data);

  if (error) {
    return {
      error:
        "Não foi possível criar o achado. Confira se sua conta possui permissão de admin (app_metadata.role = 'admin').",
    };
  }

  revalidateStorefrontAndAdmin();
  redirect("/admin/achados?saved=created");
}

export async function updateAchadoAction(
  id: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const idCheck = deleteAchadoSchema.safeParse({ id });
  if (!idCheck.success) {
    return { error: "Identificador de achado inválido." };
  }

  const parsed = parseAchadoFormData(formData);
  if (!parsed.success) {
    return {
      error: "Corrija os campos destacados antes de salvar.",
      fieldErrors: extractFieldErrors(parsed.error.issues),
    };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { error: "Supabase não configurado." };
  }

  const { error } = await supabase
    .from("achados")
    .update(parsed.data)
    .eq("id", idCheck.data.id);

  if (error) {
    return {
      error: "Não foi possível atualizar o achado. Tente novamente.",
    };
  }

  revalidateStorefrontAndAdmin();
  redirect("/admin/achados?saved=updated");
}

export async function updateAchadoStatusAction(
  formData: FormData,
): Promise<void> {
  await requireAdmin();

  const parsed = updateAchadoStatusSchema.safeParse({
    id: String(formData.get("id") ?? ""),
    status: String(formData.get("status") ?? ""),
  });

  if (!parsed.success) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return;

  await supabase
    .from("achados")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.id);

  revalidateStorefrontAndAdmin();
}

export async function deleteAchadoAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const parsed = deleteAchadoSchema.safeParse({
    id: String(formData.get("id") ?? ""),
  });

  if (!parsed.success) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return;

  const { data: existing } = await supabase
    .from("achados")
    .select("image_path")
    .eq("id", parsed.data.id)
    .maybeSingle();

  const { error } = await supabase
    .from("achados")
    .delete()
    .eq("id", parsed.data.id);

  if (!error && existing?.image_path) {
    const path = existing.image_path.trim();
    if (
      path &&
      !path.startsWith("/") &&
      !path.startsWith("http://") &&
      !path.startsWith("https://")
    ) {
      await supabase.storage.from(ACHADOS_STORAGE_BUCKET).remove([path]);
    }
  }

  revalidateStorefrontAndAdmin();
}

export async function updateSiteSettingsAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const parsed = siteSettingsMutationSchema.safeParse({
    whatsapp_group_url: String(formData.get("whatsapp_group_url") ?? ""),
    modal_enabled: formData.get("modal_enabled") === "on",
    modal_title: String(formData.get("modal_title") ?? ""),
    modal_message: String(formData.get("modal_message") ?? ""),
  });

  if (!parsed.success) {
    return {
      error: "Verifique os campos antes de salvar.",
      fieldErrors: extractFieldErrors(parsed.error.issues),
    };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { error: "Supabase não configurado." };
  }

  const { error } = await supabase
    .from("site_settings")
    .upsert({ id: 1, ...parsed.data }, { onConflict: "id" });

  if (error) {
    return {
      error:
        "Não foi possível salvar as configurações. Verifique as políticas RLS.",
    };
  }

  revalidateStorefrontAndAdmin();
  return { success: "Configurações salvas com sucesso!" };
}
