-- Categories (departments) and many-to-many link table with max 3 categories per achado.
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint categories_name_length check (
    char_length(trim(name)) >= 2 and char_length(name) <= 80
  ),
  constraint categories_slug_format check (
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  )
);

create index if not exists categories_active_order_idx
  on public.categories (is_active, sort_order asc, name asc);

drop trigger if exists trg_categories_updated_at on public.categories;
create trigger trg_categories_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

create table if not exists public.achado_categories (
  achado_id uuid not null references public.achados(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (achado_id, category_id)
);

create index if not exists achado_categories_category_idx
  on public.achado_categories (category_id, achado_id);

create or replace function public.enforce_max_achado_categories()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  current_count integer;
begin
  select count(*)
    into current_count
    from public.achado_categories
   where achado_id = new.achado_id
     and (tg_op <> 'UPDATE' or category_id <> old.category_id);

  if current_count >= 3 then
    raise exception 'Um achado pode pertencer a no máximo 3 departamentos.'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_achado_categories_max_three on public.achado_categories;
create trigger trg_achado_categories_max_three
before insert or update on public.achado_categories
for each row execute function public.enforce_max_achado_categories();

alter table public.categories enable row level security;
alter table public.achado_categories enable row level security;

drop policy if exists "Public can view active categories" on public.categories;
create policy "Public can view active categories"
on public.categories
for select
to anon, authenticated
using (is_active = true);

drop policy if exists "Admin can manage categories" on public.categories;
create policy "Admin can manage categories"
on public.categories
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can view published achado categories" on public.achado_categories;
create policy "Public can view published achado categories"
on public.achado_categories
for select
to anon, authenticated
using (
  exists (
    select 1
      from public.categories c
     where c.id = category_id
       and c.is_active = true
  )
  and exists (
    select 1
      from public.achados a
     where a.id = achado_id
       and a.status = 'published'
       and (a.expires_at is null or a.expires_at > now())
  )
);

drop policy if exists "Admin can manage achado categories" on public.achado_categories;
create policy "Admin can manage achado categories"
on public.achado_categories
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Explicit table grants (matching Supabase schema privileges)
grant usage on schema public to anon, authenticated;

grant select on table public.categories to anon, authenticated;
grant insert, update, delete on table public.categories to authenticated;
revoke truncate on table public.categories from anon, authenticated;

grant select on table public.achado_categories to anon, authenticated;
grant insert, update, delete on table public.achado_categories to authenticated;
revoke truncate on table public.achado_categories from anon, authenticated;

-- Idempotent initial departments seed (in exact display order)
insert into public.categories (name, slug, sort_order, is_active)
values
  ('Camisa/Casaco', 'camisa-casaco', 1, true),
  ('Tênis/Calçados', 'tenis-calcados', 2, true),
  ('Futebol', 'futebol', 3, true),
  ('Calça/Bermuda', 'calca-bermuda', 4, true),
  ('Chuteiras', 'chuteiras', 5, true),
  ('Streetwear', 'streetwear', 6, true),
  ('Roupas', 'roupas', 7, true),
  ('Eletrônicos/Tecnologia', 'eletronicos-tecnologia', 8, true),
  ('Comidas/Bebidas', 'comidas-bebidas', 9, true),
  ('Gamer', 'gamer', 10, true),
  ('Fitness', 'fitness', 11, true),
  ('Acessórios', 'acessorios', 12, true),
  ('Casa e Cozinha', 'casa-e-cozinha', 13, true),
  ('Bonés', 'bones', 14, true),
  ('Fones/Relógios', 'fones-relogios', 15, true),
  ('Correntes/Colares', 'correntes-colares', 16, true),
  ('Beleza & Higiene', 'beleza-e-higiene', 17, true)
on conflict (slug) do nothing;
