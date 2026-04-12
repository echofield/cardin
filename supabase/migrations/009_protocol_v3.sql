alter table public.merchants
  add column if not exists protocol_v3_config jsonb not null default '{}'::jsonb,
  add column if not exists protocol_v3_enabled boolean not null default true,
  add column if not exists protocol_diamond_tokens_enabled boolean not null default true,
  add column if not exists protocol_adaptive_enabled boolean not null default false;

create table if not exists public.protocol_events (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  season_id uuid references public.seasons(id) on delete cascade,
  card_id uuid references public.cards(id) on delete cascade,
  event_type text not null,
  cost_eur numeric(10,2) not null default 0,
  state text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_protocol_events_merchant_created_at on public.protocol_events(merchant_id, created_at desc);
create index if not exists idx_protocol_events_season on public.protocol_events(season_id);
create index if not exists idx_protocol_events_type on public.protocol_events(event_type);

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

update public.merchants
set protocol_v3_config = case
  when coalesce(cardin_world, 'generic') = 'cafe' then jsonb_build_object(
    'aov', 6,
    'grossMarginRate', 0.75,
    'seasonBudget', 250,
    'seasonLengthMonths', 3,
    'baseVisitsPerMonth', 4,
    'deltaVisitsPerMonth', 1.5,
    'attributionWindowDays', 7,
    'rewardCosts', jsonb_build_object('midpoint', 0.4, 'summit', 1.2, 'propagation', 0),
    'rewardRedemption', jsonb_build_object('midpoint', 0.3, 'summit', 0.15),
    'incrementality', jsonb_build_object('direct', 0.7, 'referral', 0.6),
    'funnel', jsonb_build_object('activationRate', 0.58, 'midpointRate', 0.3, 'summitRate', 0.15, 'diamondRate', 0.06, 'conversionRate', 0.2, 'maxInvites', 2, 'referredIncrementalVisits', 3),
    'basketUplift', jsonb_build_object('engagedVisits', 0, 'deltaAov', 0),
    'timeControl', jsonb_build_object('peakFactor', 1.7),
    'minGrossProfit', 8,
    'maxDiamondRatio', 0.06,
    'diamond', jsonb_build_object('tokenCycleDays', 30, 'tokenCost', 2, 'tokenRedemptionRate', 0.5, 'maxTokenCycles', 12, 'budget', 100)
  )
  when coalesce(cardin_world, 'generic') = 'restaurant' then jsonb_build_object(
    'aov', 35,
    'grossMarginRate', 0.65,
    'seasonBudget', 400,
    'seasonLengthMonths', 3,
    'baseVisitsPerMonth', 1.5,
    'deltaVisitsPerMonth', 0.7,
    'attributionWindowDays', 14,
    'rewardCosts', jsonb_build_object('midpoint', 2.5, 'summit', 5, 'propagation', 0),
    'rewardRedemption', jsonb_build_object('midpoint', 0.3, 'summit', 0.15),
    'incrementality', jsonb_build_object('direct', 0.6, 'referral', 0.55),
    'funnel', jsonb_build_object('activationRate', 0.5, 'midpointRate', 0.3, 'summitRate', 0.15, 'diamondRate', 0.08, 'conversionRate', 0.2, 'maxInvites', 2, 'referredIncrementalVisits', 2),
    'basketUplift', jsonb_build_object('engagedVisits', 0, 'deltaAov', 0),
    'timeControl', jsonb_build_object('peakFactor', 1.8),
    'minGrossProfit', 20,
    'maxDiamondRatio', 0.08,
    'diamond', jsonb_build_object('tokenCycleDays', 30, 'tokenCost', 5, 'tokenRedemptionRate', 0.5, 'maxTokenCycles', 12, 'budget', 160)
  )
  when coalesce(cardin_world, 'generic') in ('boutique') then jsonb_build_object(
    'aov', 180,
    'grossMarginRate', 0.6,
    'seasonBudget', 500,
    'seasonLengthMonths', 3,
    'baseVisitsPerMonth', 0.5,
    'deltaVisitsPerMonth', 0.3,
    'attributionWindowDays', 21,
    'rewardCosts', jsonb_build_object('midpoint', 5, 'summit', 12, 'propagation', 0),
    'rewardRedemption', jsonb_build_object('midpoint', 0.25, 'summit', 0.12),
    'incrementality', jsonb_build_object('direct', 0.5, 'referral', 0.5),
    'funnel', jsonb_build_object('activationRate', 0.45, 'midpointRate', 0.25, 'summitRate', 0.12, 'diamondRate', 0.12, 'conversionRate', 0.2, 'maxInvites', 2, 'referredIncrementalVisits', 1),
    'basketUplift', jsonb_build_object('engagedVisits', 0, 'deltaAov', 0),
    'timeControl', jsonb_build_object('peakFactor', 1.8),
    'minGrossProfit', 40,
    'maxDiamondRatio', 0.12,
    'diamond', jsonb_build_object('tokenCycleDays', 30, 'tokenCost', 8, 'tokenRedemptionRate', 0.45, 'maxTokenCycles', 12, 'budget', 200)
  )
  when coalesce(cardin_world, 'generic') in ('beaute', 'salon') then jsonb_build_object(
    'aov', 45,
    'grossMarginRate', 0.62,
    'seasonBudget', 420,
    'seasonLengthMonths', 3,
    'baseVisitsPerMonth', 1.2,
    'deltaVisitsPerMonth', 0.8,
    'attributionWindowDays', 14,
    'rewardCosts', jsonb_build_object('midpoint', 2.5, 'summit', 6, 'propagation', 0),
    'rewardRedemption', jsonb_build_object('midpoint', 0.3, 'summit', 0.14),
    'incrementality', jsonb_build_object('direct', 0.58, 'referral', 0.55),
    'funnel', jsonb_build_object('activationRate', 0.5, 'midpointRate', 0.28, 'summitRate', 0.14, 'diamondRate', 0.07, 'conversionRate', 0.18, 'maxInvites', 2, 'referredIncrementalVisits', 2.2),
    'basketUplift', jsonb_build_object('engagedVisits', 0, 'deltaAov', 0),
    'timeControl', jsonb_build_object('peakFactor', 1.8),
    'minGrossProfit', 22,
    'maxDiamondRatio', 0.08,
    'diamond', jsonb_build_object('tokenCycleDays', 30, 'tokenCost', 4.5, 'tokenRedemptionRate', 0.5, 'maxTokenCycles', 12, 'budget', 150)
  )
  when coalesce(cardin_world, 'generic') = 'boulangerie' then jsonb_build_object(
    'aov', 8,
    'grossMarginRate', 0.72,
    'seasonBudget', 260,
    'seasonLengthMonths', 3,
    'baseVisitsPerMonth', 4.5,
    'deltaVisitsPerMonth', 1.1,
    'attributionWindowDays', 7,
    'rewardCosts', jsonb_build_object('midpoint', 0.5, 'summit', 1.5, 'propagation', 0),
    'rewardRedemption', jsonb_build_object('midpoint', 0.32, 'summit', 0.16),
    'incrementality', jsonb_build_object('direct', 0.68, 'referral', 0.58),
    'funnel', jsonb_build_object('activationRate', 0.56, 'midpointRate', 0.31, 'summitRate', 0.15, 'diamondRate', 0.06, 'conversionRate', 0.18, 'maxInvites', 2, 'referredIncrementalVisits', 2.6),
    'basketUplift', jsonb_build_object('engagedVisits', 0, 'deltaAov', 0),
    'timeControl', jsonb_build_object('peakFactor', 1.7),
    'minGrossProfit', 10,
    'maxDiamondRatio', 0.06,
    'diamond', jsonb_build_object('tokenCycleDays', 30, 'tokenCost', 2.5, 'tokenRedemptionRate', 0.48, 'maxTokenCycles', 12, 'budget', 104)
  )
  else jsonb_build_object(
    'aov', 12,
    'grossMarginRate', 0.68,
    'seasonBudget', 280,
    'seasonLengthMonths', 3,
    'baseVisitsPerMonth', 2.5,
    'deltaVisitsPerMonth', 0.8,
    'attributionWindowDays', 7,
    'rewardCosts', jsonb_build_object('midpoint', 0.8, 'summit', 2.5, 'propagation', 0),
    'rewardRedemption', jsonb_build_object('midpoint', 0.3, 'summit', 0.15),
    'incrementality', jsonb_build_object('direct', 0.62, 'referral', 0.58),
    'funnel', jsonb_build_object('activationRate', 0.55, 'midpointRate', 0.3, 'summitRate', 0.14, 'diamondRate', 0.06, 'conversionRate', 0.18, 'maxInvites', 2, 'referredIncrementalVisits', 2.5),
    'basketUplift', jsonb_build_object('engagedVisits', 0, 'deltaAov', 0),
    'timeControl', jsonb_build_object('peakFactor', 1.7),
    'minGrossProfit', 10,
    'maxDiamondRatio', 0.07,
    'diamond', jsonb_build_object('tokenCycleDays', 30, 'tokenCost', 3, 'tokenRedemptionRate', 0.5, 'maxTokenCycles', 12, 'budget', 110)
  )
end
where protocol_v3_config = '{}'::jsonb;
