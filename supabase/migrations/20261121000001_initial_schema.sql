-- Sonin Links — Initial MVP schema, RLS policies, and Storage bucket
-- Apply this file in the Supabase SQL Editor (or via `supabase db push`).

create extension if not exists pgcrypto;

-- 1. Helper function: check whether the authenticated JWT belongs to an admin.
-- Never trusts user-editable `user_metadata`; only reads server-controlled `app_metadata`.
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

-- 2. Trigger helper to automatically keep `updated_at` fresh
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 3. `achados` table
create table if not exists public.achados (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text null,
  price_cents integer not null check (price_cents >= 0),
  original_price_cents integer null check (
    original_price_cents is null or original_price_cents > 0
  ),
  store text not null,
  affiliate_url text not null,
  image_path text not null,
  status text not null default 'draft' check (
    status in ('draft', 'published', 'archived')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz null
);

create index if not exists achados_status_created_at_idx
  on public.achados (status, created_at desc);

create index if not exists achados_store_idx
  on public.achados (store);

drop trigger if exists achados_set_updated_at on public.achados;
create trigger achados_set_updated_at
  before update on public.achados
  for each row
  execute function public.set_updated_at();

-- 4. `site_settings` table (single-row configuration)
create table if not exists public.site_settings (
  id integer primary key default 1 check (id = 1),
  whatsapp_group_url text not null default '',
  modal_enabled boolean not null default true,
  modal_title text not null default 'Entre no grupo do Sonin Links!',
  modal_message text not null default 'Receba os melhores achados, cupons e ofertas relâmpago direto no seu WhatsApp antes de esgotar.',
  updated_at timestamptz not null default now()
);

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row
  execute function public.set_updated_at();

insert into public.site_settings (id)
values (1)
on conflict (id) do nothing;

-- 5. Row Level Security (RLS)
alter table public.achados enable row level security;
alter table public.site_settings enable row level security;

-- Public read of published and non-expired achados
drop policy if exists "Public can read published achados" on public.achados;
create policy "Public can read published achados"
  on public.achados
  for select
  to anon, authenticated
  using (
    status = 'published'
    and (expires_at is null or expires_at > now())
  );

-- Admin full access to achados
drop policy if exists "Admin has full access to achados" on public.achados;
create policy "Admin has full access to achados"
  on public.achados
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Public read of site_settings (only public modal and WhatsApp group config)
drop policy if exists "Public can read site settings" on public.site_settings;
create policy "Public can read site settings"
  on public.site_settings
  for select
  to anon, authenticated
  using (true);

-- Admin write access to site_settings
drop policy if exists "Admin can insert site settings" on public.site_settings;
create policy "Admin can insert site settings"
  on public.site_settings
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Admin can update site settings" on public.site_settings;
create policy "Admin can update site settings"
  on public.site_settings
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 6. Storage bucket for achado images (direct browser upload by admin)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'achados-images',
  'achados-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view achado images" on storage.objects;
create policy "Public can view achado images"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'achados-images');

drop policy if exists "Admin can upload achado images" on storage.objects;
create policy "Admin can upload achado images"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'achados-images' and public.is_admin());

drop policy if exists "Admin can update achado images" on storage.objects;
create policy "Admin can update achado images"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'achados-images' and public.is_admin())
  with check (bucket_id = 'achados-images' and public.is_admin());

drop policy if exists "Admin can delete achado images" on storage.objects;
create policy "Admin can delete achado images"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'achados-images' and public.is_admin());

-- =============================================================================
-- AFTER CREATING YOUR SINGLE ADMIN USER IN SUPABASE AUTH:
-- Run the statement below (replacing with your owner email) so RLS recognizes
-- the user as admin via server-only `app_metadata`:
--
-- update auth.users
-- set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
-- where email = 'seu-email@exemplo.com';
-- =============================================================================
