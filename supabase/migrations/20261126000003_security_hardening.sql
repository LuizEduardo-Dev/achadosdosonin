-- Security hardening: fix search_path on Postgres helper functions,
-- revoke public EXECUTE on is_admin(), and enforce URL protocol constraints at DB layer.

create or replace function public.is_admin()
returns boolean
language sql
stable
set search_path = public
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

alter table public.achados
  drop constraint if exists achados_affiliate_url_protocol_check;
alter table public.achados
  add constraint achados_affiliate_url_protocol_check
  check (affiliate_url ~* '^https?://');

alter table public.site_settings
  drop constraint if exists site_settings_whatsapp_url_check;
alter table public.site_settings
  add constraint site_settings_whatsapp_url_check
  check (
    whatsapp_group_url = ''
    or whatsapp_group_url ~ '^https://chat\.whatsapp\.com/[A-Za-z0-9_-]{6,64}$'
  );
