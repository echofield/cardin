alter table if exists public.cardin_pages
  drop constraint if exists cardin_pages_world_id_check;

alter table if exists public.cardin_pages
  add constraint cardin_pages_world_id_check
  check (world_id in ('cafe', 'bar', 'boulangerie', 'restaurant', 'caviste', 'beaute', 'boutique'));

insert into public.projection_presets (
  activity_id,
  scenario_id,
  revenue_weight,
  returns_weight,
  primary_effect,
  secondary_effect,
  scenario_role,
  is_active
)
values
  ('caviste','starting_loop',1,1,'Sélection de cave mieux relancée','Premier retour plus lisible','Installe le premier rythme',true),
  ('caviste','weekly_rendezvous',0.9,0.84,'Dégustation hebdo mieux cadrée','Rendez-vous cave plus attendu','Travaille un temps faible',true),
  ('caviste','short_challenge',1.12,1.08,'Retour réactivé avant la prochaine bouteille','Cycle resserré sur une fenêtre courte','Accélère le retour',true),
  ('caviste','monthly_gain',1.08,0.92,'Sélection du mois plus désirable','Valeur perçue renforcée sans promo brute','Crée un pic d''attention',true)
on conflict (activity_id, scenario_id) do update
set
  revenue_weight = excluded.revenue_weight,
  returns_weight = excluded.returns_weight,
  primary_effect = excluded.primary_effect,
  secondary_effect = excluded.secondary_effect,
  scenario_role = excluded.scenario_role,
  is_active = excluded.is_active,
  updated_at = now();
