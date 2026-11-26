-- Make price_cents optional without dropping price columns or existing data.
alter table public.achados
  alter column price_cents drop not null;

alter table public.achados
  drop constraint if exists achados_price_cents_check;

alter table public.achados
  add constraint achados_price_cents_check
  check (price_cents is null or price_cents >= 0);
