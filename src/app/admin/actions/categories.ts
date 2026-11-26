"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { extractZodFieldErrors, mapSupabaseMutationError } from "@/lib/errors";
import { deleteCategorySchema } from "@/lib/validators/admin";
import type { ActionState, SimpleActionResult } from "@/app/admin/actions/types";
import {
  parseCategoryFormData,
  revalidateStorefrontAndAdmin,
} from "@/app/admin/actions/shared";

export async function createCategoryAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const parsed = parseCategoryFormData(formData);
  if (!parsed.success) {
    return {
      error: "Corrija os campos destacados antes de criar.",
      fieldErrors: extractZodFieldErrors(parsed.error.issues),
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("categories").insert(parsed.data);

  if (error) {
    console.error("[createCategoryAction] Supabase insert error:", {
      code: error.code,
      message: error.message,
      details: error.details,
    });
    return {
      error: mapSupabaseMutationError("criar o departamento", error),
    };
  }

  revalidateStorefrontAndAdmin();
  return { success: "Departamento criado com sucesso!" };
}

export async function updateCategoryAction(
  id: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const idCheck = deleteCategorySchema.safeParse({ id });
  if (!idCheck.success) {
    return { error: "Identificador de departamento inválido." };
  }

  const parsed = parseCategoryFormData(formData);
  if (!parsed.success) {
    return {
      error: "Corrija os campos destacados antes de salvar.",
      fieldErrors: extractZodFieldErrors(parsed.error.issues),
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("categories")
    .update(parsed.data)
    .eq("id", idCheck.data.id);

  if (error) {
    console.error("[updateCategoryAction] Supabase update error:", {
      code: error.code,
      message: error.message,
      details: error.details,
    });
    return {
      error: mapSupabaseMutationError("atualizar o departamento", error),
    };
  }

  revalidateStorefrontAndAdmin();
  return { success: "Departamento atualizado com sucesso!" };
}

export async function deleteCategoryAction(
  id: string,
): Promise<SimpleActionResult> {
  await requireAdmin();

  const parsed = deleteCategorySchema.safeParse({ id });
  if (!parsed.success) {
    return { ok: false, error: "Identificador de departamento inválido." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", parsed.data.id);

  if (error) {
    console.error("[deleteCategoryAction] Supabase delete error:", {
      code: error.code,
      message: error.message,
      details: error.details,
    });
    return {
      ok: false,
      error: mapSupabaseMutationError("excluir o departamento", error),
    };
  }

  revalidateStorefrontAndAdmin();
  return { ok: true };
}
