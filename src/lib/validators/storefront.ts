import { z } from "zod";

export const sortOptionSchema = z.enum(["newest", "price_asc", "price_desc"]);

export const achadoStatusSchema = z.enum(["draft", "published", "archived"]);

export const achadoSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().max(320).nullable(),
  price_cents: z.number().int().nonnegative(),
  original_price_cents: z.number().int().positive().nullable(),
  store: z.string().trim().min(1).max(60),
  affiliate_url: z.string().url(),
  image_path: z.string().trim().min(1),
  status: achadoStatusSchema,
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  expires_at: z.string().datetime().nullable(),
});

export const siteSettingsSchema = z.object({
  whatsapp_group_url: z.string().url().or(z.literal("")),
  modal_enabled: z.boolean(),
  modal_title: z.string().trim().min(1).max(120),
  modal_message: z.string().trim().min(1).max(400),
});
