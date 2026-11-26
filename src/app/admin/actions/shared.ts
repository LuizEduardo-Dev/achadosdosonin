import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mapSupabaseMutationError } from "@/lib/errors";
import { parseDateTimeLocalToIso } from "@/lib/utils/date";
import {
  achadoMutationSchema,
  categoryMutationSchema,
} from "@/lib/validators/admin";

export function revalidateStorefrontAndAdmin() {
  revalidatePath("/");
  revalidatePath("/tt");
  revalidatePath("/ig");
  revalidatePath("/wpp");
  revalidatePath("/c/[slug]", "page");
  revalidatePath("/grupo");
  revalidatePath("/admin");
  revalidatePath("/admin/achados");
  revalidatePath("/admin/departamentos");
  revalidatePath("/admin/configuracoes");
}

export function parseAchadoFormData(formData: FormData) {
  const descriptionRaw = String(formData.get("description") ?? "").trim();
  const expiresAtIso = parseDateTimeLocalToIso(
    String(formData.get("expires_at") ?? ""),
  );

  const rawCategoryIds = formData
    .getAll("category_ids")
    .map((value) => String(value).trim())
    .filter(Boolean);
  const uniqueCategoryIds = Array.from(new Set(rawCategoryIds));

  return achadoMutationSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    description: descriptionRaw || null,
    store: String(formData.get("store") ?? ""),
    affiliate_url: String(formData.get("affiliate_url") ?? ""),
    image_path: String(formData.get("image_path") ?? ""),
    status: String(formData.get("status") ?? "draft"),
    expires_at: expiresAtIso,
    category_ids: uniqueCategoryIds,
  });
}

export function parseCategoryFormData(formData: FormData) {
  const sortOrderRaw = String(formData.get("sort_order") ?? "0").trim();
  const parsedSortOrder = sortOrderRaw === "" ? 0 : Number(sortOrderRaw);

  return categoryMutationSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    sort_order: Number.isFinite(parsedSortOrder) ? parsedSortOrder : -1,
    is_active: formData.get("is_active") === "on",
  });
}

export async function syncAchadoCategories(
  supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>,
  achadoId: string,
  categoryIds: string[],
): Promise<string | null> {
  const { error: deleteError } = await supabase
    .from("achado_categories")
    .delete()
    .eq("achado_id", achadoId);

  if (deleteError) {
    // Allow editing existing achados with no categories when migration hasn't been applied yet.
    const isMissingTable =
      deleteError.code === "PGRST205" || deleteError.code === "42P01";
    if (isMissingTable && categoryIds.length === 0) {
      return null;
    }

    console.error("[syncAchadoCategories] Supabase delete error:", {
      code: deleteError.code,
      message: deleteError.message,
      details: deleteError.details,
    });
    return mapSupabaseMutationError(
      "atualizar os departamentos do achado",
      deleteError,
    );
  }

  if (categoryIds.length === 0) {
    return null;
  }

  const rows = categoryIds.map((categoryId) => ({
    achado_id: achadoId,
    category_id: categoryId,
  }));

  const { error: insertError } = await supabase
    .from("achado_categories")
    .insert(rows);

  if (insertError) {
    console.error("[syncAchadoCategories] Supabase insert error:", {
      code: insertError.code,
      message: insertError.message,
      details: insertError.details,
    });
    return mapSupabaseMutationError(
      "vincular os departamentos do achado",
      insertError,
    );
  }

  return null;
}
