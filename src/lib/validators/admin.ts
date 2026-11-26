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
});

export const updateAchadoStatusSchema = z.object({
  id: z.string().uuid("ID inválido."),
  status: achadoStatusSchema,
});

export const deleteAchadoSchema = z.object({
  id: z.string().uuid("ID inválido."),
});

export const siteSettingsMutationSchema = z.object({
  whatsapp_group_url: z.union([z.literal(""), httpUrlSchema]),
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
