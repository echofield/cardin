-- Migration: Domino/Diamond/Winner Season System
-- Adds season-based progression, invitation tracking, and winner selection mechanics

-- ============================================================================
-- NEW TABLES
-- ============================================================================

-- Seasons table: tracks merchant seasons with winner selection
create table if not exists public.seasons (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  season_number integer not null,
  season_length integer not null check (season_length in (3, 6)),
  summit_id text not null,
  summit_title text not null,
  started_at timestamptz not null,
  ends_at timestamptz not null,
  closed_at timestamptz,
  winner_card_id uuid references public.cards(id) on delete set null,
  winner_selected_at timestamptz,
  winner_selection_metadata jsonb,
  created_at timestamptz not null default now(),

  unique(merchant_id, season_number)
);

-- Card season progress: per-season journey tracking for each card
create table if not exists public.card_season_progress (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.cards(id) on delete cascade,
  season_id uuid not null references public.seasons(id) on delete cascade,

  -- Step progression (1-8)
  current_step integer not null default 1 check (current_step >= 1 and current_step <= 8),
  step_reached_at timestamptz not null default now(),

  -- Domino tracking (step 5+)
  domino_unlocked_at timestamptz,
  direct_invitations_count integer not null default 0,
  direct_invitations_activated integer not null default 0,

  -- Diamond tracking (step 7+)
  diamond_unlocked_at timestamptz,
  total_branch_capacity integer not null default 0,
  branches_used integer not null default 0,

  -- Summit tracking (step 8)
  summit_reached_at timestamptz,

  -- Winner eligibility
  is_winner_eligible boolean not null default false,
  winner_weight integer not null default 0,
  stayed_active_until_close boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique(card_id, season_id)
);

-- Card referrals: tracks parent-child invitation relationships
create table if not exists public.card_referrals (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.seasons(id) on delete cascade,
  parent_card_id uuid not null references public.cards(id) on delete cascade,
  child_card_id uuid not null references public.cards(id) on delete cascade,

  -- Invitation metadata
  invited_at timestamptz not null default now(),
  activation_visit_at timestamptz,
  is_activated boolean not null default false,

  -- Branch hierarchy (for second ring)
  branch_level integer not null default 1 check (branch_level in (1, 2)),

  created_at timestamptz not null default now(),

  unique(season_id, child_card_id),
  check(parent_card_id != child_card_id)
);

-- ============================================================================
-- EXTEND EXISTING TABLES
-- ============================================================================

-- Add season tracking to cards
alter table public.cards add column if not exists current_season_id uuid references public.seasons(id);

-- Add season metadata to merchants
alter table public.merchants add column if not exists current_season_number integer not null default 1;
alter table public.merchants add column if not exists last_season_closed_at timestamptz;

-- Add season context to transactions
alter table public.transactions add column if not exists season_id uuid references public.seasons(id);
alter table public.transactions add column if not exists step_reached integer;
alter table public.transactions add column if not exists metadata jsonb;

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Seasons indexes
create index if not exists idx_seasons_merchant_id on public.seasons(merchant_id);
create index if not exists idx_seasons_merchant_active on public.seasons(merchant_id, closed_at)
  where closed_at is null;
create index if not exists idx_seasons_ends_at on public.seasons(ends_at)
  where closed_at is null;

-- Card season progress indexes
create index if not exists idx_card_season_progress_card on public.card_season_progress(card_id);
create index if not exists idx_card_season_progress_season on public.card_season_progress(season_id);
create index if not exists idx_card_season_progress_step on public.card_season_progress(season_id, current_step);
create index if not exists idx_card_season_progress_eligible on public.card_season_progress(season_id, is_winner_eligible)
  where is_winner_eligible = true;

-- Card referrals indexes
create index if not exists idx_card_referrals_parent on public.card_referrals(parent_card_id, season_id);
create index if not exists idx_card_referrals_child on public.card_referrals(child_card_id, season_id);
create index if not exists idx_card_referrals_activated on public.card_referrals(season_id, is_activated);

-- Transactions season index
create index if not exists idx_transactions_season on public.transactions(season_id)
  where season_id is not null;

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on new tables
alter table public.seasons enable row level security;
alter table public.card_season_progress enable row level security;
alter table public.card_referrals enable row level security;

-- Seasons policies
drop policy if exists "Merchants can view their own seasons" on public.seasons;
create policy "Merchants can view their own seasons"
on public.seasons
for select
using (auth.uid() = merchant_id);

drop policy if exists "Merchants can manage their own seasons" on public.seasons;
create policy "Merchants can manage their own seasons"
on public.seasons
for all
using (auth.uid() = merchant_id)
with check (auth.uid() = merchant_id);

-- Card season progress policies
drop policy if exists "Merchants can view card season progress" on public.card_season_progress;
create policy "Merchants can view card season progress"
on public.card_season_progress
for select
using (
  exists (
    select 1
    from public.cards c
    where c.id = card_season_progress.card_id
      and c.merchant_id = auth.uid()
  )
);

drop policy if exists "Merchants can manage card season progress" on public.card_season_progress;
create policy "Merchants can manage card season progress"
on public.card_season_progress
for all
using (
  exists (
    select 1
    from public.cards c
    where c.id = card_season_progress.card_id
      and c.merchant_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.cards c
    where c.id = card_season_progress.card_id
      and c.merchant_id = auth.uid()
  )
);

-- Card referrals policies
drop policy if exists "Merchants can view their card referrals" on public.card_referrals;
create policy "Merchants can view their card referrals"
on public.card_referrals
for select
using (
  exists (
    select 1
    from public.cards c
    where c.id = card_referrals.parent_card_id
      and c.merchant_id = auth.uid()
  )
);

drop policy if exists "Merchants can create card referrals" on public.card_referrals;
create policy "Merchants can create card referrals"
on public.card_referrals
for insert
with check (
  exists (
    select 1
    from public.cards c
    where c.id = parent_card_id
      and c.merchant_id = auth.uid()
  )
);

drop policy if exists "Merchants can update their card referrals" on public.card_referrals;
create policy "Merchants can update their card referrals"
on public.card_referrals
for update
using (
  exists (
    select 1
    from public.cards c
    where c.id = card_referrals.parent_card_id
      and c.merchant_id = auth.uid()
  )
);

-- ============================================================================
-- DATA MIGRATION FOR EXISTING RECORDS
-- ============================================================================

-- This section creates initial Season 1 for existing merchants and migrates
-- existing cards to the new season-based system.

-- Step 1: Create initial seasons for all existing merchants
do $$
begin
  if exists (select 1 from public.merchants limit 1) then
    insert into public.seasons (
      merchant_id,
      season_number,
      season_length,
      summit_id,
      summit_title,
      started_at,
      ends_at
    )
    select
      m.id as merchant_id,
      1 as season_number,
      3 as season_length,
      'legacy-migration' as summit_id,
      'Première saison' as summit_title,
      m.created_at as started_at,
      (m.created_at + interval '3 months') as ends_at
    from public.merchants m
    where not exists (
      select 1 from public.seasons s
      where s.merchant_id = m.id
      and s.season_number = 1
    );
  end if;
end $$;

-- Step 2: Link existing cards to their merchant's Season 1
do $$
begin
  update public.cards c
  set current_season_id = (
    select s.id
    from public.seasons s
    where s.merchant_id = c.merchant_id
    and s.season_number = 1
    limit 1
  )
  where c.current_season_id is null;
end $$;

-- Step 3: Create season progress for existing cards
do $$
begin
  if exists (select 1 from public.cards where current_season_id is not null limit 1) then
    insert into public.card_season_progress (
      card_id,
      season_id,
      current_step,
      step_reached_at
    )
    select
      c.id as card_id,
      c.current_season_id as season_id,
      least(greatest(c.stamps, 1), 8) as current_step,
      c.created_at as step_reached_at
    from public.cards c
    where c.current_season_id is not null
    and not exists (
      select 1 from public.card_season_progress csp
      where csp.card_id = c.id
      and csp.season_id = c.current_season_id
    );
  end if;
end $$;

-- Step 4: Update transactions with season_id from their card
do $$
begin
  update public.transactions t
  set season_id = c.current_season_id
  from public.cards c
  where t.card_id = c.id
  and t.season_id is null
  and c.current_season_id is not null;
end $$;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get active season for a merchant
create or replace function public.get_active_season(merchant_uuid uuid)
returns uuid
language sql
stable
as $$
  select id
  from public.seasons
  where merchant_id = merchant_uuid
  and closed_at is null
  order by season_number desc
  limit 1;
$$;

-- Function to count visits in current season
create or replace function public.count_season_visits(card_uuid uuid, season_uuid uuid)
returns integer
language sql
stable
as $$
  select count(*)::integer
  from public.transactions
  where card_id = card_uuid
  and season_id = season_uuid
  and type in ('issued', 'stamp');
$$;

-- ============================================================================
-- COMMENTS
-- ============================================================================

comment on table public.seasons is 'Tracks merchant seasons with summit rewards and winner selection';
comment on table public.card_season_progress is 'Per-season journey tracking for each card (8-step progression)';
comment on table public.card_referrals is 'Parent-child invitation relationships for Domino/Diamond branching';

comment on column public.seasons.winner_selection_metadata is 'JSON audit trail of winner selection (weights, eligible cards, algorithm)';
comment on column public.card_season_progress.direct_invitations_activated is 'Count of invited cards that reached step 2 (activated)';
comment on column public.card_season_progress.total_branch_capacity is 'Calculated branch capacity (2 direct + 1 per activated for Diamond)';
comment on column public.card_referrals.branch_level is '1 = direct invitation, 2 = second-ring invitation';
