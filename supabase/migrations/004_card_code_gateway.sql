-- 004_card_code_gateway.sql
-- Introduce human-readable card codes for public card-scoped access.

create sequence if not exists public.card_code_seq start 1000;

create or replace function public.generate_card_code()
returns text
language plpgsql
as $$
declare
  next_value bigint;
begin
  next_value := nextval('public.card_code_seq');
  return 'CD-' || lpad(next_value::text, 6, '0');
end;
$$;

alter table public.cards
  add column if not exists card_code text;

select setval(
  'public.card_code_seq',
  coalesce(
    (
      select max((regexp_match(card_code, '^CD-([0-9]+)$'))[1]::bigint)
      from public.cards
      where card_code ~ '^CD-[0-9]+$'
    ),
    999
  ),
  true
);

update public.cards
set card_code = public.generate_card_code()
where card_code is null;

alter table public.cards
  alter column card_code set default public.generate_card_code();

alter table public.cards
  alter column card_code set not null;

create unique index if not exists idx_cards_card_code on public.cards(card_code);

comment on column public.cards.card_code is 'Human-readable card identity code used for QR/public entry without customer login.';
