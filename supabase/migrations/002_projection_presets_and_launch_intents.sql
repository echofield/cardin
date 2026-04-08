-- 002_projection_presets_and_launch_intents.sql

create table if not exists public.projection_presets (
  id uuid primary key default gen_random_uuid(),
  activity_id text not null,
  scenario_id text not null,
  revenue_weight numeric(8,4) not null,
  returns_weight numeric(8,4) not null,
  primary_effect text not null,
  secondary_effect text not null,
  scenario_role text not null,
  is_active boolean not null default true,
  updated_by uuid null references auth.users(id),
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create unique index if not exists projection_presets_activity_scenario_uidx
  on public.projection_presets(activity_id, scenario_id);

create table if not exists public.merchant_launch_intents (
  merchant_id uuid primary key references public.merchants(id) on delete cascade,
  activity_template_id text not null,
  scenario_id text not null,
  scenario_label text not null,
  summit_id text not null,
  summit_title text not null,
  season_length_months int not null check (season_length_months in (3, 6)),
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.projection_presets enable row level security;
alter table public.merchant_launch_intents enable row level security;

drop policy if exists "Projection presets readable" on public.projection_presets;
create policy "Projection presets readable"
  on public.projection_presets
  for select
  using (true);

drop policy if exists "Projection presets writable by authenticated" on public.projection_presets;
create policy "Projection presets writable by authenticated"
  on public.projection_presets
  for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

drop policy if exists "Merchants can read their launch intent" on public.merchant_launch_intents;
create policy "Merchants can read their launch intent"
  on public.merchant_launch_intents
  for select
  using (merchant_id = auth.uid());

drop policy if exists "Merchants can manage their launch intent" on public.merchant_launch_intents;
create policy "Merchants can manage their launch intent"
  on public.merchant_launch_intents
  for all
  using (merchant_id = auth.uid())
  with check (merchant_id = auth.uid());

-- Seed baseline presets so admin can edit in DB/UI without code changes.
insert into public.projection_presets (activity_id, scenario_id, revenue_weight, returns_weight, primary_effect, secondary_effect, scenario_role, is_active)
values
  ('boulangerie','starting_loop',1,1,'Routine de quartier plus solide','Retour régulier plus visible','Installe le premier rythme',true),
  ('boulangerie','weekly_rendezvous',0.84,0.78,'Jour creux mieux rempli','Rendez-vous attendu dans la semaine','Travaille un temps faible',true),
  ('boulangerie','short_challenge',1.18,1.24,'Fréquence relancée vite','Plusieurs passages sur une courte fenêtre','Accélère le retour',true),
  ('boulangerie','monthly_gain',0.94,0.88,'Sujet du mois plus fort','Désir ajouté à la routine','Crée un pic d''attention',true),
  ('cafe','starting_loop',1,1,'Habitude du matin mieux retenue','Premier retour rapide','Installe le premier rythme',true),
  ('cafe','weekly_rendezvous',0.9,0.84,'Créneau du matin renforcé','Moment hebdo plus mémorable','Travaille un temps faible',true),
  ('cafe','short_challenge',1.16,1.22,'Séquence de retours rapide','Routine recollée sur quelques jours','Accélère le retour',true),
  ('cafe','monthly_gain',0.92,0.86,'Sujet signature autour du comptoir','Désir plus fort sans discount','Crée un pic d''attention',true),
  ('restaurant','starting_loop',1,1,'Retour entre deux repas','Premier cap simple à expliquer','Installe le premier rythme',true),
  ('restaurant','weekly_rendezvous',0.88,0.82,'Service calme mieux rempli','Repère hebdomadaire plus clair','Travaille un temps faible',true),
  ('restaurant','short_challenge',1.2,1.12,'Fréquence relancée rapidement','Plus de visites sur une même période','Accélère le retour',true),
  ('restaurant','monthly_gain',1.02,0.9,'Pic d''attention autour d''un temps fort','Désir plus élevé sans promo permanente','Crée un pic d''attention',true),
  ('coiffeur','starting_loop',1,1,'Cycle de retour plus visible','Cap clair entre deux rendez-vous','Installe le premier rythme',true),
  ('coiffeur','weekly_rendezvous',0.76,0.72,'Créneau faible mieux occupé','Repère mensuel plus stable','Travaille un temps faible',true),
  ('coiffeur','short_challenge',1.22,1.18,'Réactivation plus rapide des absentes','Cycle raccourci','Accélère le retour',true),
  ('coiffeur','monthly_gain',1.08,0.94,'Désir plus premium dans le mois','Conversation autour d''une prestation forte','Crée un pic d''attention',true),
  ('institut-beaute','starting_loop',1,1,'Fréquence mieux stabilisée','Cap visible entre deux séances','Installe le premier rythme',true),
  ('institut-beaute','weekly_rendezvous',0.78,0.74,'Temps faible mieux rythmé','Retour périodique plus attendu','Travaille un temps faible',true),
  ('institut-beaute','short_challenge',1.18,1.14,'Réengagement plus rapide','Retour plus tôt que le cycle naturel','Accélère le retour',true),
  ('institut-beaute','monthly_gain',1.1,0.96,'Désir premium plus fort','Valeur perçue de la carte augmentée','Crée un pic d''attention',true),
  ('boutique','starting_loop',1,1,'Raison simple de revenir','Passage réinstallé entre deux achats','Installe le premier rythme',true),
  ('boutique','weekly_rendezvous',0.86,0.8,'Moment boutique mieux ancré','Temps faible mieux animé','Travaille un temps faible',true),
  ('boutique','short_challenge',1.14,1.08,'Passage relancé rapidement','Retour resserré entre deux achats','Accélère le retour',true),
  ('boutique','monthly_gain',1.12,0.98,'Désir plus fort autour d''une pièce','Pic d''attention mensuel plus net','Crée un pic d''attention',true)
on conflict (activity_id, scenario_id) do update
set
  revenue_weight = excluded.revenue_weight,
  returns_weight = excluded.returns_weight,
  primary_effect = excluded.primary_effect,
  secondary_effect = excluded.secondary_effect,
  scenario_role = excluded.scenario_role,
  is_active = excluded.is_active,
  updated_at = now();
