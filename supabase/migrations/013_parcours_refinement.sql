-- 013_parcours_refinement.sql
-- Adds an optional JSONB column to capture the post-activation refinement
-- layer ("Affiner la récompense"): the real product/service tied to the
-- reward, indicative public price, indicative place cost, and usage frame.
-- This does not alter the current onboarding path or reward logic — it is
-- purely a downstream grounding layer the merchant can edit from the
-- dashboard to improve calculation accuracy.

alter table public.merchants
  add column if not exists parcours_refinement jsonb null;

comment on column public.merchants.parcours_refinement is
  'Optional post-activation refinement: { productLabel, publicPriceEur, costEur, usageFrame, updatedAt }. Grounds the reward in a real product/service without altering the configured parcours selections.';
