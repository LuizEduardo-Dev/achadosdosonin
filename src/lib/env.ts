import { z } from "zod";

const httpUrlSchema = z
  .string()
  .trim()
  .url("must be a valid URL (e.g. https://...)")
  .refine(
    (value) => value.startsWith("https://") || value.startsWith("http://"),
    "must start with http:// or https://",
  );

const optionalHttpUrlSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => value ?? "")
  .refine(
    (value) =>
      value === "" ||
      ((value.startsWith("https://") || value.startsWith("http://")) &&
        URL.canParse(value)),
    "must be empty or a valid http(s):// URL",
  );

const netlifyContextSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => value ?? "")
  .refine(
    (value) =>
      value === "" ||
      value === "production" ||
      value === "deploy-preview" ||
      value === "branch-deploy" ||
      value === "dev",
    "must be production, deploy-preview, branch-deploy, dev, or empty",
  );

export const clientEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: httpUrlSchema,
  NEXT_PUBLIC_SUPABASE_URL: httpUrlSchema.refine((value) => {
    const pathname = new URL(value).pathname;
    return pathname === "/" || pathname === "";
  }, "must be the base project URL without a path (e.g. https://xxxx.supabase.co, without /rest/v1/)"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .trim()
    .min(1, "is required (Supabase Publishable or Anon key)"),
  NEXT_PUBLIC_WHATSAPP_GROUP_URL: optionalHttpUrlSchema,
  NEXT_PUBLIC_NETLIFY_CONTEXT: netlifyContextSchema,
});

export const serverEnvSchema = clientEnvSchema.extend({
  ADMIN_EMAIL: z
    .string()
    .trim()
    .email("must be a valid email address")
    .transform((value) => value.toLowerCase()),
  CONTEXT: netlifyContextSchema,
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

function formatEnvErrors(scope: "client" | "server", error: z.ZodError): string {
  const details = error.issues
    .map((issue) => `  - ${issue.path.join(".") || "ENV"}: ${issue.message}`)
    .join("\n");

  return [
    `[env] Invalid or missing ${scope} environment variables:`,
    details,
    "Check .env.example and configure .env.local (local) or Netlify Environment Variables (deploy).",
  ].join("\n");
}

let cachedClientEnv: ClientEnv | null = null;
let cachedServerEnv: ServerEnv | null = null;

/**
 * Validated public environment variables (safe for browser & server).
 * Uses static `process.env.NEXT_PUBLIC_*` reads so Next.js inlines them in client bundles.
 */
export function getClientEnv(): ClientEnv {
  if (cachedClientEnv) {
    return cachedClientEnv;
  }

  const parsed = clientEnvSchema.safeParse({
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_WHATSAPP_GROUP_URL: process.env.NEXT_PUBLIC_WHATSAPP_GROUP_URL,
    NEXT_PUBLIC_NETLIFY_CONTEXT: process.env.NEXT_PUBLIC_NETLIFY_CONTEXT,
  });

  if (!parsed.success) {
    throw new Error(formatEnvErrors("client", parsed.error));
  }

  cachedClientEnv = parsed.data;
  return cachedClientEnv;
}

/**
 * Validated server-only environment variables (includes secrets like ADMIN_EMAIL).
 * Throws immediately if called from browser code.
 */
export function getServerEnv(): ServerEnv {
  if (typeof window !== "undefined") {
    throw new Error(
      "[env] getServerEnv() was called in the browser. Use getClientEnv() for NEXT_PUBLIC_* variables.",
    );
  }

  if (cachedServerEnv) {
    return cachedServerEnv;
  }

  const parsed = serverEnvSchema.safeParse({
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_WHATSAPP_GROUP_URL: process.env.NEXT_PUBLIC_WHATSAPP_GROUP_URL,
    NEXT_PUBLIC_NETLIFY_CONTEXT:
      process.env.NEXT_PUBLIC_NETLIFY_CONTEXT || process.env.CONTEXT || "",
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    CONTEXT: process.env.CONTEXT,
  });

  if (!parsed.success) {
    throw new Error(formatEnvErrors("server", parsed.error));
  }

  cachedServerEnv = parsed.data;
  return cachedServerEnv;
}

export function isPreviewDeployment(): boolean {
  const ctx =
    (typeof window === "undefined" ? process.env.CONTEXT : "") ||
    process.env.NEXT_PUBLIC_NETLIFY_CONTEXT ||
    "";
  return ctx === "deploy-preview" || ctx === "branch-deploy";
}
