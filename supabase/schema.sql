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

-- Visit sessions (client presence ? merchant validation). See migration 005_visit_sessions.sql.
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

-- Card Bearer access + API idempotency (see migration 007_card_access_and_idempotency.sql)
alter table public.cards add column if not exists client_access_token text;
create unique index if not exists idx_cards_client_access_token on public.cards (client_access_token);

create table if not exists public.api_idempotency (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants (id) on delete cascade,
  scope text not null,
  idempotency_key text not null,
  response_json jsonb not null,
  created_at timestamptz not null default now(),
  unique (merchant_id, scope, idempotency_key)
);

create unique index if not exists idx_visit_sessions_one_active_per_card
  on public.visit_sessions(card_id)
  where validated_at is null;

alter table public.transactions add column if not exists visit_session_id uuid references public.visit_sessions(id) on delete set null;
alter table public.transactions add column if not exists reward_use_index integer;

create unique index if not exists idx_transactions_stamp_visit_session
  on public.transactions(visit_session_id)
  where visit_session_id is not null
    and type = 'stamp';

create unique index if not exists idx_transactions_reward_use_visit_session
  on public.transactions(visit_session_id)
  where visit_session_id is not null
    and type = 'summit_reward_use';

create unique index if not exists idx_transactions_reward_use_unit
  on public.transactions(card_id, reward_use_index)
  where reward_use_index is not null
    and type = 'summit_reward_use';

create unique index if not exists idx_transactions_mission_reward_visit_session
  on public.transactions(visit_session_id)
  where visit_session_id is not null
    and type = 'mission_reward_use';

-- Protocol v3 economics (see migration 009_protocol_v3.sql)
alter table public.merchants add column if not exists protocol_v3_config jsonb not null default '{}'::jsonb;
alter table public.merchants add column if not exists protocol_v3_enabled boolean not null default true;
alter table public.merchants add column if not exists protocol_diamond_tokens_enabled boolean not null default true;
alter table public.merchants add column if not exists protocol_adaptive_enabled boolean not null default false;

create table if not exists public.intent_missions (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  card_id uuid not null references public.cards(id) on delete cascade,
  season_id uuid references public.seasons(id) on delete cascade,
  type text not null,
  trigger_step text not null,
  role_min integer not null default 0,
  copy jsonb not null default '{}'::jsonb,
  incentive_type text not null,
  c_mission numeric(10,2) not null default 0,
  v_mission numeric(10,2) not null default 0,
  estimated_value_eur numeric(10,2) not null default 0,
  identity_factor numeric(6,2) not null default 1,
  expiry_days integer not null default 7,
  max_active_missions integer not null default 1,
  requires_visit_validation boolean not null default true,
  requires_group_size integer,
  requires_time_window jsonb,
  template_key text not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  completed_at timestamptz,
  completed_visit_session_id uuid references public.visit_sessions(id) on delete set null,
  completion_data jsonb not null default '{}'::jsonb,
  check (type in ('group', 'time_shift', 'aov', 'identity')),
  check (trigger_step in ('3', '4', '5', 'diamond')),
  check (role_min between 0 and 3),
  check (status in ('active', 'completed', 'expired')),
  check (max_active_missions = 1)
);

create unique index if not exists idx_intent_missions_one_active_per_card
  on public.intent_missions(card_id)
  where status = 'active';

create unique index if not exists idx_intent_missions_completed_session
  on public.intent_missions(completed_visit_session_id)
  where completed_visit_session_id is not null;

create index if not exists idx_intent_missions_merchant_status
  on public.intent_missions(merchant_id, status, created_at desc);

create index if not exists idx_intent_missions_card_status
  on public.intent_missions(card_id, status, expires_at desc);

create index if not exists idx_intent_missions_season_status
  on public.intent_missions(season_id, status, created_at desc);

create table if not exists public.protocol_events (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  season_id uuid references public.seasons(id) on delete cascade,
  card_id uuid references public.cards(id) on delete cascade,
  event_type text not null,
  cost_eur numeric(10,2) not null default 0,
  state text,
  mission_id uuid references public.intent_missions(id) on delete set null,
  visit_session_id uuid references public.visit_sessions(id) on delete set null,
  estimated_value_eur numeric(10,2),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_protocol_events_merchant_created_at on public.protocol_events(merchant_id, created_at desc);
create index if not exists idx_protocol_events_season on public.protocol_events(season_id);
create index if not exists idx_protocol_events_type on public.protocol_events(event_type);
create index if not exists idx_protocol_events_mission on public.protocol_events(mission_id);
create index if not exists idx_protocol_events_visit_session on public.protocol_events(visit_session_id);

create table if not exists public.diamond_experience_tokens (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  card_id uuid not null references public.cards(id) on delete cascade,
  season_id uuid not null references public.seasons(id) on delete cascade,
  cycle_index integer not null,
  cycle_started_at timestamptz not null,
  expires_at timestamptz not null,
  status text not null default 'available',
  issued_at timestamptz not null default now(),
  consumed_at timestamptz,
  consumed_visit_session_id uuid references public.visit_sessions(id) on delete set null,
  token_cost_eur numeric(10,2) not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  unique(card_id, season_id, cycle_index)
);

create unique index if not exists idx_diamond_tokens_consumed_session
  on public.diamond_experience_tokens(consumed_visit_session_id)
  where consumed_visit_session_id is not null;

create index if not exists idx_diamond_tokens_card_status on public.diamond_experience_tokens(card_id, status, expires_at desc);
create index if not exists idx_diamond_tokens_merchant on public.diamond_experience_tokens(merchant_id, issued_at desc);


