-- Explicit least-privilege table and function grants for anon and authenticated roles.
-- Row-level access remains strictly enforced by RLS policies on all tables.

grant usage on schema public to anon, authenticated;

grant execute on function public.is_admin() to authenticated;

revoke truncate on table public.achados from anon, authenticated;
grant select on table public.achados to anon;
grant select, insert, update, delete on table public.achados to authenticated;

revoke truncate on table public.site_settings from anon, authenticated;
grant select on table public.site_settings to anon;
grant select, insert, update on table public.site_settings to authenticated;
