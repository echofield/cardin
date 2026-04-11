-- Bearer-scoped card access + merchant API idempotency cache
alter table public.cards add column if not exists client_access_token text;

update public.cards
set client_access_token = encode(gen_random_bytes(24), 'hex')
where client_access_token is null;

alter table public.cards alter column client_access_token set not null;

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

create index if not exists idx_api_idempotency_merchant_scope on public.api_idempotency (merchant_id, scope);

alter table public.api_idempotency enable row level security;

drop policy if exists "Merchants manage own idempotency rows" on public.api_idempotency;
create policy "Merchants manage own idempotency rows"
on public.api_idempotency
for all
using (auth.uid() = merchant_id)
with check (auth.uid() = merchant_id);
