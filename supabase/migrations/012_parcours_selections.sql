-- 012_parcours_selections.sql
-- Adds a JSONB column on merchants to persist the Step 3/4 configuration
-- captured on the /parcours onboarding flow. Unauth'd demo submissions
-- skip this column and go to email only; authed merchants get their
-- configuration stored for the merchant dashboard ConfigurationRecap.

alter table public.merchants
  add column if not exists parcours_selections jsonb null;

comment on column public.merchants.parcours_selections is
  'Step 3/4 merchant configuration captured from the parcours onboarding. Shape: { worldId, seasonRewardId, rewardType, intensite, moment, accessType, triggerType, propagationType, summaryLine, nextStepLine, submittedAt }.';
