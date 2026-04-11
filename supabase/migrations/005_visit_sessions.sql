-- Visit sessions: client "present" signal for merchant validation (Option B flow).

create table if not exists public.visit_sessions (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.cards(id) on delete cascade,
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  started_at timestamptz not null default now(),
  validated_at timestamptz
);

create index if not exists idx_visit_sessions_merchant_started
  on public.visit_sessions (merchant_id, started_at desc);

create index if not exists idx_visit_sessions_pending
  on public.visit_sessions (merchant_id, started_at desc)
  where validated_at is null;

alter table public.cards add column if not exists last_merchant_validation_at timestamptz;

alter table public.visit_sessions enable row level security;

drop policy if exists "Merchants read own visit sessions" on public.visit_sessions;
create policy "Merchants read own visit sessions"
on public.visit_sessions
for select
using (merchant_id = auth.uid());

drop policy if exists "Merchants update own visit sessions" on public.visit_sessions;
create policy "Merchants update own visit sessions"
on public.visit_sessions
for update
using (merchant_id = auth.uid());
