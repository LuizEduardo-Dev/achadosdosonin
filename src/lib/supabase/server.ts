import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

/**
 * Stateless public PostgREST fetch for public storefront reads (respects RLS).
 * Uses `cache: "no-store"` so newly published deals and settings appear immediately.
 */
export async function fetchSupabasePublicRest<T>(
  pathAndQuery: string,
): Promise<T | null> {
  const env = getSupabasePublicEnv();
  const baseUrl = env.url.replace(/\/$/, "");
  const headers: Record<string, string> = {
    apikey: env.anonKey,
    Accept: "application/json",
  };

  // New Supabase publishable keys (sb_publishable_...) are not JWTs and belong only in `apikey`.
  if (!env.anonKey.startsWith("sb_publishable_")) {
    headers.Authorization = `Bearer ${env.anonKey}`;
  }

  try {
    const response = await fetch(`${baseUrl}/rest/v1/${pathAndQuery}`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error("[supabase-rest] request failed:", {
        status: response.status,
        path: pathAndQuery.split("?")[0],
        body: errorText.slice(0, 200),
      });
      return null;
    }

    return (await response.json()) as T;
  } catch (err) {
    console.error("[supabase-rest] network error:", err);
    return null;
  }
}

/**
 * Request-bound server client for authenticated admin pages and Server Actions.
 */
export async function createSupabaseServerClient() {
  const env = getSupabasePublicEnv();
  const cookieStore = await cookies();

  return createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component where cookie writes are handled by proxy.ts
        }
      },
    },
  });
}
