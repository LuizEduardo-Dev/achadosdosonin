"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { ACHADOS_STORAGE_BUCKET } from "@/lib/supabase/storage";
import { extractZodFieldErrors, mapSupabaseMutationError } from "@/lib/errors";
import {
  ACHADO_IMAGE_PATH_REGEX,
  deleteAchadoSchema,
  updateAchadoStatusSchema,
} from "@/lib/validators/admin";
import type { ActionState, SimpleActionResult } from "@/app/admin/actions/types";
import {
  parseAchadoFormData,
  revalidateStorefrontAndAdmin,
  syncAchadoCategories,
} from "@/app/admin/actions/shared";

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

  const { category_ids, ...achadoPayload } = parsed.data;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("achados")
    .insert(achadoPayload)
    .select("id")
    .single();

  if (error || !data) {
    console.error("[createAchadoAction] Supabase insert error:", {
      code: error?.code,
      message: error?.message,
      details: error?.details,
    });
    return {
      error: mapSupabaseMutationError("criar o achado", error ?? {}),
    };
  }

  if (category_ids.length > 0) {
    const syncError = await syncAchadoCategories(
      supabase,
      (data as { id: string }).id,
      category_ids,
    );
    if (syncError) {
      return { error: syncError };
    }
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

  const { category_ids, ...achadoPayload } = parsed.data;
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("achados")
    .update(achadoPayload)
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

  const syncError = await syncAchadoCategories(
    supabase,
    idCheck.data.id,
    category_ids,
  );
  if (syncError) {
    return { error: syncError };
  }

  revalidateStorefrontAndAdmin();
  redirect("/admin/achados?saved=updated");
}

export async function updateAchadoStatusAction(
  id: string,
  status: string,
): Promise<SimpleActionResult> {
  await requireAdmin();

  const parsed = updateAchadoStatusSchema.safeParse({ id, status });
  if (!parsed.success) {
    return { ok: false, error: "Dados inválidos para atualizar o status." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("achados")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.id);

  if (error) {
    console.error("[updateAchadoStatusAction] Supabase update error:", {
      code: error.code,
      message: error.message,
      details: error.details,
    });
    return {
      ok: false,
      error: mapSupabaseMutationError("atualizar o status do achado", error),
    };
  }

  revalidateStorefrontAndAdmin();
  return { ok: true };
}

export async function deleteAchadoAction(
  id: string,
): Promise<SimpleActionResult> {
  await requireAdmin();

  const parsed = deleteAchadoSchema.safeParse({ id });
  if (!parsed.success) {
    return { ok: false, error: "Identificador de achado inválido." };
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

  if (error) {
    console.error("[deleteAchadoAction] Supabase delete error:", {
      code: error.code,
      message: error.message,
      details: error.details,
    });
    return {
      ok: false,
      error: mapSupabaseMutationError("excluir o achado", error),
    };
  }

  if (existing?.image_path) {
    const path = existing.image_path.trim();
    if (ACHADO_IMAGE_PATH_REGEX.test(path)) {
      try {
        await supabase.storage.from(ACHADOS_STORAGE_BUCKET).remove([path]);
      } catch (storageErr) {
        console.error(
          "[deleteAchadoAction] Storage cleanup warning:",
          storageErr,
        );
      }
    }
  }

  revalidateStorefrontAndAdmin();
  return { ok: true };
}
