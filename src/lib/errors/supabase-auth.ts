export interface SupabaseAuthErrorLike {
  status?: number;
  code?: string;
  message?: string;
}

export function mapSupabaseAuthError(
  error: SupabaseAuthErrorLike | null | undefined,
): string {
  const message = error?.message?.toLowerCase() ?? "";
  const code = error?.code?.toLowerCase() ?? "";

  if (
    message.includes("fetch failed") ||
    message.includes("enotfound") ||
    message.includes("timeout") ||
    error?.status === 0
  ) {
    return "Não foi possível conectar ao Supabase. Verifique NEXT_PUBLIC_SUPABASE_URL e sua conexão.";
  }

  if (message.includes("api key") || message.includes("apikey")) {
    return "Chave da API do Supabase inválida. Verifique NEXT_PUBLIC_SUPABASE_ANON_KEY.";
  }

  if (code === "email_not_confirmed") {
    return "Este e-mail ainda não foi confirmado no Supabase Auth.";
  }

  if (code === "email_provider_disabled") {
    return "O login por e-mail está desativado no Supabase (mantenha Email ativado e desative apenas 'Allow new users to sign up').";
  }

  if (code === "over_request_rate_limit" || error?.status === 429) {
    return "Muitas tentativas seguidas. Aguarde alguns minutos e tente novamente.";
  }

  if (code === "captcha_failed") {
    return "A proteção CAPTCHA está ativada no Supabase Auth (Authentication → Attack Protection).";
  }

  return "E-mail ou senha inválidos.";
}
