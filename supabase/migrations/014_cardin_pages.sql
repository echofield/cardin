create table if not exists public.cardin_pages (
  slug text primary key,
  business_name text not null,
  world_id text not null check (world_id in ('cafe', 'bar', 'restaurant', 'beaute', 'boutique')),
  reading_payload jsonb not null default '{}'::jsonb,
  paid_at timestamptz,
  stripe_session_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_cardin_pages_stripe_session_id
  on public.cardin_pages(stripe_session_id)
  where stripe_session_id is not null;

create index if not exists idx_cardin_pages_paid_at
  on public.cardin_pages(paid_at desc nulls last);
