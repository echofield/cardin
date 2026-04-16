create table if not exists public.stripe_webhook_events (
  event_id text primary key,
  event_type text not null,
  status text not null default ''processing'',
  checkout_session_id text,
  customer_email text,
  payload jsonb not null default ''{}''::jsonb,
  processed_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status in (''processing'', ''processed'', ''failed''))
);

create index if not exists idx_stripe_webhook_events_status_created
  on public.stripe_webhook_events(status, created_at desc);