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

alter table public.protocol_events
  add column if not exists mission_id uuid references public.intent_missions(id) on delete set null,
  add column if not exists visit_session_id uuid references public.visit_sessions(id) on delete set null,
  add column if not exists estimated_value_eur numeric(10,2);

create index if not exists idx_protocol_events_mission on public.protocol_events(mission_id);
create index if not exists idx_protocol_events_visit_session on public.protocol_events(visit_session_id);

create unique index if not exists idx_transactions_mission_reward_visit_session
  on public.transactions(visit_session_id)
  where visit_session_id is not null
    and type = 'mission_reward_use';

