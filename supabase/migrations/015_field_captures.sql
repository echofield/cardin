create table if not exists public.field_captures (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  contact_name text null,
  whatsapp_raw text not null,
  whatsapp_canonical text null,
  city text null,
  email text null,
  next_action text null,
  note text null,
  source text not null default 'terrain',
  email_sent boolean not null default false,
  email_error text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists field_captures_created_at_idx
  on public.field_captures(created_at desc);

create index if not exists field_captures_whatsapp_canonical_idx
  on public.field_captures(whatsapp_canonical);

alter table public.field_captures enable row level security;

comment on table public.field_captures is
  'Private field captures created from the hidden /terrain route for Cardin street sales.';
