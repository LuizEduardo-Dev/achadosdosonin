export interface SupabaseDbErrorLike {
  code?: string;
  message?: string;
  details?: string;
}

export function mapSupabaseMutationError(
  actionDescription: string,
  error: SupabaseDbErrorLike,
): string {
  const message = (error.message ?? "").toLowerCase();

  if (error.code === "PGRST204" || message.includes("price_note")) {
    return "A coluna 'price_note' ainda não existe no banco. Rode a migration 20261122000001_add_price_note.sql no SQL Editor do Supabase.";
  }

  if (
    error.code === "42501" ||
    message.includes("row-level security") ||
    message.includes("permission denied")
  ) {
    return "Permissão negada no banco (RLS ou GRANT). Confira as migrations e se a conta possui app_metadata.role = 'admin'.";
  }

  return `Não foi possível ${actionDescription}. Tente novamente.`;
}
