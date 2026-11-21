import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

/**
 * Stateless public PostgREST fetch for `"use cache"` storefront reads (respects RLS).
 * Avoids GoTrueClient's module-scoped session locks inside Next.js 16 Cache Components.
 */
export async function fetchSupabasePublicRest<T>(
  pathAndQuery: string,
): Promise<T | null> {
  const env = getSupabasePublicEnv();
  if (!env) {
    return null;
  }

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
    });

    if (!response.ok) {
      if (process.env.NODE_ENV === "development") {
        console.error(
          "[supabase-rest] request failed:",
          response.status,
          pathAndQuery,
        );
      }
      return null;
    }

    return (await response.json()) as T;
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error("[supabase-rest] network error:", err);
    }
    return null;
  }
}

/**
 * Request-bound server client for authenticated admin pages and Server Actions.
 */
export async function createSupabaseServerClient() {
  const env = getSupabasePublicEnv();
  if (!env) {
    return null;
  }

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
