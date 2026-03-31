-- Enable needed extension for uuid generation
create extension if not exists "pgcrypto";

create table if not exists public.merchants (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.cards (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  customer_name text not null,
  stamps integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.cards(id) on delete cascade,
  type text not null,
  created_at timestamptz not null default now()
);

alter table public.merchants enable row level security;
alter table public.cards enable row level security;
alter table public.transactions enable row level security;

create policy "Merchants can manage their own row"
on public.merchants
for all
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Merchants can manage their own cards"
on public.cards
for all
using (auth.uid() = merchant_id)
with check (auth.uid() = merchant_id);

create policy "Merchants can read transactions tied to their cards"
on public.transactions
for select
using (
  exists (
    select 1
    from public.cards c
    where c.id = transactions.card_id
      and c.merchant_id = auth.uid()
  )
);

create policy "Merchants can insert transactions tied to their cards"
on public.transactions
for insert
with check (
  exists (
    select 1
    from public.cards c
    where c.id = transactions.card_id
      and c.merchant_id = auth.uid()
  )
);

create index if not exists idx_cards_merchant_id on public.cards(merchant_id);
create index if not exists idx_transactions_card_id on public.transactions(card_id);
