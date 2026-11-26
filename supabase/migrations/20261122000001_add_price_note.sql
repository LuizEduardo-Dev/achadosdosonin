-- Add optional short price observation (e.g., "à vista no PIX", "em até 10x sem juros")
alter table public.achados
  add column if not exists price_note text null;

alter table public.achados
  drop constraint if exists achados_price_note_length_check;

alter table public.achados
  add constraint achados_price_note_length_check
  check (price_note is null or char_length(price_note) <= 40);
