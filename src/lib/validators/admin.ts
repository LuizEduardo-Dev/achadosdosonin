import { z } from "zod";
import { achadoStatusSchema } from "@/lib/validators/storefront";

const httpUrlSchema = z
  .string()
  .trim()
  .url("Informe uma URL válida (ex.: https://...).")
  .refine(
    (value) => value.startsWith("https://") || value.startsWith("http://"),
    "A URL deve começar com http:// ou https://.",
  );

export const loginSchema = z.object({
  email: z.string().trim().email("Informe um e-mail válido."),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
});

export const MAX_ACHADO_CATEGORIES = 3;

export const achadoMutationSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "O título deve ter pelo menos 3 caracteres.")
    .max(160, "O título pode ter no máximo 160 caracteres."),
  description: z
    .string()
    .trim()
    .max(320, "A descrição pode ter no máximo 320 caracteres.")
    .nullable(),
  store: z
    .string()
    .trim()
    .min(1, "Informe o nome da loja.")
    .max(60, "O nome da loja pode ter no máximo 60 caracteres."),
  affiliate_url: httpUrlSchema,
  image_path: z
    .string()
    .trim()
    .min(1, "Envie uma imagem para o achado."),
  status: achadoStatusSchema,
  expires_at: z.string().datetime().nullable(),
  category_ids: z
    .array(z.string().uuid("Departamento inválido."))
    .max(
      MAX_ACHADO_CATEGORIES,
      `Selecione no máximo ${MAX_ACHADO_CATEGORIES} departamentos.`,
    ),
});

export const categoryMutationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "O nome do departamento deve ter pelo menos 2 caracteres.")
    .max(80, "O nome do departamento pode ter no máximo 80 caracteres."),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2, "O slug deve ter pelo menos 2 caracteres.")
    .max(80, "O slug pode ter no máximo 80 caracteres.")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Use apenas letras minúsculas, números e hífens no slug.",
    ),
  sort_order: z
    .number()
    .int("A ordem deve ser um número inteiro.")
    .min(0, "A ordem deve ser 0 ou maior.")
    .max(9999, "A ordem deve ser no máximo 9999."),
  is_active: z.boolean(),
});

export const deleteCategorySchema = z.object({
  id: z.string().uuid("Identificador de departamento inválido."),
});

export const updateAchadoStatusSchema = z.object({
  id: z.string().uuid("ID inválido."),
  status: achadoStatusSchema,
});

export const deleteAchadoSchema = z.object({
  id: z.string().uuid("ID inválido."),
});

const WHATSAPP_URL_ERROR =
  "Informe um link de convite válido do WhatsApp (ex.: https://chat.whatsapp.com/CodigoDoGrupo), sem espaços ou parâmetros extras.";

export function normalizeWhatsappGroupUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (/\s/.test(trimmed)) return null;

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }

  if (
    parsed.protocol !== "https:" ||
    parsed.hostname.toLowerCase() !== "chat.whatsapp.com" ||
    parsed.port !== "" ||
    parsed.username !== "" ||
    parsed.password !== "" ||
    parsed.search !== "" ||
    parsed.hash !== ""
  ) {
    return null;
  }

  const segments = parsed.pathname.split("/").filter(Boolean);
  let code = "";
  if (segments.length === 1) {
    code = segments[0];
  } else if (
    segments.length === 2 &&
    segments[0].toLowerCase() === "invite"
  ) {
    code = segments[1];
  } else {
    return null;
  }

  if (!/^[A-Za-z0-9_-]{6,64}$/.test(code)) {
    return null;
  }

  return `https://chat.whatsapp.com/${code}`;
}

const whatsappGroupUrlSchema = z
  .string()
  .trim()
  .transform((value, ctx) => {
    if (!value) return "";
    const normalized = normalizeWhatsappGroupUrl(value);
    if (normalized === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: WHATSAPP_URL_ERROR,
      });
      return z.NEVER;
    }
    return normalized;
  });

export const siteSettingsMutationSchema = z.object({
  whatsapp_group_url: whatsappGroupUrlSchema,
  modal_enabled: z.boolean(),
  modal_title: z
    .string()
    .trim()
    .min(3, "O título do modal deve ter pelo menos 3 caracteres.")
    .max(120, "O título do modal pode ter no máximo 120 caracteres."),
  modal_message: z
    .string()
    .trim()
    .min(5, "A mensagem do modal deve ter pelo menos 5 caracteres.")
    .max(400, "A mensagem do modal pode ter no máximo 400 caracteres."),
});
