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

  if (error.code === "23505" || message.includes("duplicate key")) {
    return "Já existe um departamento com esse slug.";
  }

  if (error.code === "23514" || message.includes("no máximo 3 departamentos")) {
    return "Um achado pode pertencer a no máximo 3 departamentos.";
  }

  if (error.code === "PGRST205" || error.code === "42P01") {
    return "Tabela não encontrada no banco. Rode a migration mais recente em supabase/migrations/ no SQL Editor do Supabase.";
  }

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
