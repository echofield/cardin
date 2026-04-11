create extension if not exists "pgcrypto";

create table if not exists public.merchants (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  midpoint_mode text not null default 'recognition_only',
  target_visits integer not null default 10,
  reward_label text not null default '1 recompense offerte',
  shared_unlock_enabled boolean not null default true,
  shared_unlock_objective integer not null default 120,
  shared_unlock_window_days integer not null default 7,
  shared_unlock_offer text not null default 'Offre collective de la semaine',
  shared_unlock_active_until timestamptz,
  shared_unlock_last_triggered_period text,
  created_at timestamptz not null default now()
);

create table if not exists public.cards (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  customer_name text not null,
  stamps integer not null default 0,
  target_visits integer not null default 10,
  reward_label text not null default '1 recompense offerte',
  midpoint_reached_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.cards(id) on delete cascade,
  type text not null,
  created_at timestamptz not null default now()
);

alter table public.merchants add column if not exists midpoint_mode text not null default 'recognition_only';
alter table public.merchants add column if not exists target_visits integer not null default 10;
alter table public.merchants add column if not exists reward_label text not null default '1 recompense offerte';
alter table public.merchants add column if not exists shared_unlock_enabled boolean not null default true;
alter table public.merchants add column if not exists shared_unlock_objective integer not null default 120;
alter table public.merchants add column if not exists shared_unlock_window_days integer not null default 7;
alter table public.merchants add column if not exists shared_unlock_offer text not null default 'Offre collective de la semaine';
alter table public.merchants add column if not exists shared_unlock_active_until timestamptz;
alter table public.merchants add column if not exists shared_unlock_last_triggered_period text;

alter table public.cards add column if not exists target_visits integer not null default 10;
alter table public.cards add column if not exists reward_label text not null default '1 recompense offerte';
alter table public.cards add column if not exists midpoint_reached_at timestamptz;

alter table public.merchants enable row level security;
alter table public.cards enable row level security;
alter table public.transactions enable row level security;

drop policy if exists "Merchants can manage their own row" on public.merchants;
create policy "Merchants can manage their own row"
on public.merchants
for all
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Merchants can manage their own cards" on public.cards;
create policy "Merchants can manage their own cards"
on public.cards
for all
using (auth.uid() = merchant_id)
with check (auth.uid() = merchant_id);

drop policy if exists "Merchants can read transactions tied to their cards" on public.transactions;
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

drop policy if exists "Merchants can insert transactions tied to their cards" on public.transactions;
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
create index if not exists idx_transactions_created_at on public.transactions(created_at);

-- Visit sessions (client presence → merchant validation). See migration 005_visit_sessions.sql.
create table if not exists public.visit_sessions (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.cards(id) on delete cascade,
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  started_at timestamptz not null default now(),
  validated_at timestamptz
);

alter table public.cards add column if not exists last_merchant_validation_at timestamptz;

-- Summit reward (see migration 006_summit_reward.sql)
alter table public.merchants add column if not exists cardin_world text not null default 'cafe';
alter table public.cards add column if not exists summit_reward_option_id text;
alter table public.cards add column if not exists summit_reward_title text;
alter table public.cards add column if not exists summit_reward_description text;
alter table public.cards add column if not exists summit_reward_usage_remaining integer;
