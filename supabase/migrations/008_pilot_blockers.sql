-- Pilot blockers: one active visit session per card, session-bound validation,
-- and one reward consumption per validated visit / per remaining unit.

-- Clean up legacy ghost sessions before enforcing the single-active-session rule.
with ranked as (
  select
    id,
    row_number() over (
      partition by card_id
      order by started_at desc, id desc
    ) as rn
  from public.visit_sessions
  where validated_at is null
)
delete from public.visit_sessions
where id in (
  select id
  from ranked
  where rn > 1
);

create unique index if not exists idx_visit_sessions_one_active_per_card
  on public.visit_sessions(card_id)
  where validated_at is null;

alter table public.transactions
  add column if not exists visit_session_id uuid references public.visit_sessions(id) on delete set null,
  add column if not exists reward_use_index integer;

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

create or replace function public.consume_summit_reward_atomic(
  p_card_id uuid,
  p_merchant_id uuid,
  p_visit_session_id uuid,
  p_created_by uuid default null,
  p_idempotency_key text default null
)
returns table (
  usage_remaining integer,
  title text,
  description text,
  option_id text,
  reward_use_index integer
)
language plpgsql
as $$
declare
  v_card public.cards%rowtype;
  v_next integer;
  v_reward_use_index integer;
begin
  if exists (
    select 1
    from public.transactions
    where visit_session_id = p_visit_session_id
      and type = 'summit_reward_use'
  ) then
    raise exception 'reward_already_consumed_for_session';
  end if;

  select *
  into v_card
  from public.cards
  where id = p_card_id
  for update;

  if not found then
    raise exception 'card_not_found';
  end if;

  if v_card.merchant_id <> p_merchant_id then
    raise exception 'forbidden';
  end if;

  if v_card.summit_reward_option_id is null or v_card.summit_reward_usage_remaining is null then
    raise exception 'no_active_reward';
  end if;

  if v_card.summit_reward_usage_remaining <= 0 then
    raise exception 'no_uses_remaining';
  end if;

  v_reward_use_index := v_card.summit_reward_usage_remaining;
  v_next := v_reward_use_index - 1;

  update public.cards
  set summit_reward_usage_remaining = v_next
  where id = v_card.id;

  insert into public.transactions (
    card_id,
    type,
    event_type,
    source,
    metadata,
    created_by,
    idempotency_key,
    visit_session_id,
    reward_use_index
  )
  values (
    v_card.id,
    'summit_reward_use',
    'summit_reward_use',
    'merchant_consume',
    jsonb_build_object(
      'optionId', v_card.summit_reward_option_id,
      'usageAfter', v_next,
      'visitSessionId', p_visit_session_id
    ),
    p_created_by,
    p_idempotency_key,
    p_visit_session_id,
    v_reward_use_index
  );

  return query
  select
    v_next,
    v_card.summit_reward_title,
    v_card.summit_reward_description,
    v_card.summit_reward_option_id,
    v_reward_use_index;
exception
  when unique_violation then
    raise exception 'reward_already_consumed_for_session';
end;
$$;

comment on column public.transactions.visit_session_id is 'Visit proof bound to stamp/reward actions.';
comment on column public.transactions.reward_use_index is 'Remaining-use slot consumed by a summit reward use.';
