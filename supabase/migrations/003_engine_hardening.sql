-- 003_engine_hardening.sql
-- Additive hardening for transactions, season config, and score snapshots.

alter table public.transactions
  add column if not exists event_type text,
  add column if not exists idempotency_key text,
  add column if not exists source text,
  add column if not exists created_by uuid references auth.users(id);

alter table public.transactions
  add column if not exists metadata jsonb;

update public.transactions
set metadata = '{}'::jsonb
where metadata is null;

alter table public.transactions
  alter column metadata set default '{}'::jsonb;

alter table public.transactions
  alter column metadata set not null;

update public.transactions
set event_type = coalesce(event_type, type)
where event_type is null;

update public.transactions
set source = 'legacy'
where source is null;

alter table public.transactions
  alter column event_type set not null;

alter table public.transactions
  alter column source set default 'app';

alter table public.transactions
  alter column source set not null;

create index if not exists idx_transactions_card_event_created
  on public.transactions(card_id, event_type, created_at desc);

create index if not exists idx_transactions_season_event_created
  on public.transactions(season_id, event_type, created_at desc)
  where season_id is not null;

create unique index if not exists idx_transactions_card_idempotency
  on public.transactions(card_id, idempotency_key)
  where idempotency_key is not null;

alter table public.seasons
  add column if not exists scoring_weights jsonb not null default '{}'::jsonb,
  add column if not exists status_thresholds jsonb not null default '{"warming":20,"active":40,"rising":60,"diamond":80}'::jsonb,
  add column if not exists journey_config jsonb not null default '{"stepCount":8,"dominoStartStep":5,"diamondStep":7,"summitStep":8,"activityType":"boulangerie","strategyMode":"frequency"}'::jsonb;

update public.seasons s
set journey_config = jsonb_build_object(
  'stepCount', 8,
  'dominoStartStep', 5,
  'diamondStep', 7,
  'summitStep', 8,
  'activityType', coalesce(mli.activity_template_id, s.journey_config ->> 'activityType', 'boulangerie'),
  'strategyMode', case
    when lower(coalesce(mli.scenario_id, '')) in ('domino', 'social', 'referral') then 'social'
    when lower(coalesce(mli.scenario_id, '')) in ('weekly_rendezvous', 'weak_time', 'gap_fill') then 'weak_time'
    when lower(coalesce(mli.scenario_id, '')) in ('monthly_gain', 'rare', 'value') then 'value'
    else coalesce(s.journey_config ->> 'strategyMode', 'frequency')
  end
)
from public.merchant_launch_intents mli
where mli.merchant_id = s.merchant_id;

create table if not exists public.score_snapshots (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.cards(id) on delete cascade,
  season_id uuid not null references public.seasons(id) on delete cascade,
  total_score integer not null,
  score_band text not null,
  internal_tier integer not null,
  status_name text not null,
  visual_state text not null,
  tension_progress numeric(6,5) not null default 0,
  domino_state jsonb not null default '{}'::jsonb,
  grand_diamond_state text not null default 'none',
  components jsonb not null default '{}'::jsonb,
  engine_version text not null,
  version integer not null default 1,
  computed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(card_id, season_id)
);

create index if not exists idx_score_snapshots_season_id on public.score_snapshots(season_id);
create index if not exists idx_score_snapshots_card_id on public.score_snapshots(card_id);
create index if not exists idx_score_snapshots_band on public.score_snapshots(season_id, score_band);

alter table public.score_snapshots enable row level security;

drop policy if exists "Merchants can view their score snapshots" on public.score_snapshots;
create policy "Merchants can view their score snapshots"
on public.score_snapshots
for select
using (
  exists (
    select 1
    from public.cards c
    where c.id = score_snapshots.card_id
      and c.merchant_id = auth.uid()
  )
);

drop policy if exists "Merchants can manage their score snapshots" on public.score_snapshots;
create policy "Merchants can manage their score snapshots"
on public.score_snapshots
for all
using (
  exists (
    select 1
    from public.cards c
    where c.id = score_snapshots.card_id
      and c.merchant_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.cards c
    where c.id = score_snapshots.card_id
      and c.merchant_id = auth.uid()
  )
);

comment on column public.transactions.event_type is 'Hardened event classification. Legacy type remains for compatibility.';
comment on column public.transactions.idempotency_key is 'Optional replay protection token, unique per card when provided.';
comment on column public.seasons.scoring_weights is 'Optional per-season scoring weights. Empty object falls back to app defaults.';
comment on column public.seasons.status_thresholds is 'Score boundaries used to map total score to internal tiers.';
comment on column public.seasons.journey_config is 'Per-season config such as activity type, strategy mode, and step structure.';
comment on table public.score_snapshots is 'Derived score cache for cards per season. Recomputable from events and progress.';