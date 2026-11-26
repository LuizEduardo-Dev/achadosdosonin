"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { extractZodFieldErrors, mapSupabaseMutationError } from "@/lib/errors";
import { siteSettingsMutationSchema } from "@/lib/validators/admin";
import type { ActionState } from "@/app/admin/actions/types";
import { revalidateStorefrontAndAdmin } from "@/app/admin/actions/shared";

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
