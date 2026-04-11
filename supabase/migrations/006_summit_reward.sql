-- Summit reward selection (client choice) + usage counter for merchant redemption
alter table public.merchants add column if not exists cardin_world text not null default 'cafe';

alter table public.cards add column if not exists summit_reward_option_id text;
alter table public.cards add column if not exists summit_reward_title text;
alter table public.cards add column if not exists summit_reward_description text;
alter table public.cards add column if not exists summit_reward_usage_remaining integer;

comment on column public.merchants.cardin_world is 'cafe | restaurant | beaute | boutique — drives summit reward copy';
comment on column public.cards.summit_reward_option_id is 'recurrence | impact | statut';
comment on column public.cards.summit_reward_usage_remaining is 'Remaining redemptions; null if no summit reward chosen';
