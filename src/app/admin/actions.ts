"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAdminUser, requireAdmin } from "@/lib/auth";
import { ACHADOS_STORAGE_BUCKET } from "@/lib/supabase/storage";
import {
  extractZodFieldErrors,
  mapSupabaseAuthError,
  mapSupabaseMutationError,
} from "@/lib/errors";
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
    const withTimezone = /(Z|[+-]\d{2}:\d{2})$/i.test(expiresAtRaw)
      ? expiresAtRaw
      : `${expiresAtRaw}-03:00`;
    const parsedDate = new Date(withTimezone);
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
      fieldErrors: extractZodFieldErrors(parsed.error.issues),
      values: { email: emailRaw },
    };
  }

  const supabase = await createSupabaseServerClient();
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

    return {
      error: mapSupabaseAuthError(error),
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
  await supabase.auth.signOut();
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
      fieldErrors: extractZodFieldErrors(parsed.error.issues),
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("achados").insert(parsed.data);

  if (error) {
    console.error("[createAchadoAction] Supabase insert error:", {
      code: error.code,
      message: error.message,
      details: error.details,
    });
    return {
      error: mapSupabaseMutationError("criar o achado", error),
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
      fieldErrors: extractZodFieldErrors(parsed.error.issues),
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("achados")
    .update(parsed.data)
    .eq("id", idCheck.data.id);

  if (error) {
    console.error("[updateAchadoAction] Supabase update error:", {
      code: error.code,
      message: error.message,
      details: error.details,
    });
    return {
      error: mapSupabaseMutationError("atualizar o achado", error),
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
      fieldErrors: extractZodFieldErrors(parsed.error.issues),
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("site_settings")
    .upsert({ id: 1, ...parsed.data }, { onConflict: "id" });

  if (error) {
    console.error("[updateSiteSettingsAction] Supabase upsert error:", {
      code: error.code,
      message: error.message,
      details: error.details,
    });
    return {
      error: mapSupabaseMutationError("salvar as configurações", error),
    };
  }

  revalidateStorefrontAndAdmin();
  return { success: "Configurações salvas com sucesso!" };
}
