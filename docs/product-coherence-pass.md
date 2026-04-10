# Cardin product coherence pass — QA (2026)

## 1. Physical-card / digital-first wording

| Area | Change |
|------|--------|
| [`DemoNarrative.tsx`](../src/components/demo/DemoNarrative.tsx) | Feature "Support physique" → "Activation digitale" ; QR/carte digitale copy |
| [`MerchantSeasonStudio.tsx`](../src/components/landing/MerchantSeasonStudio.tsx) | Physical shipping lines → optional premium / digital-first delays |
| [`InstallLeadForm.tsx`](../src/components/landing/InstallLeadForm.tsx) | Titles/CTA → accès digital |
| [`EngineFlow.tsx`](../src/components/engine/EngineFlow.tsx) | Parcours digital, QR d'entrée, carte digitale |
| [`ParcoursOnboardingCore.tsx`](../src/components/parcours/ParcoursOnboardingCore.tsx) | Diagrams: "cartes" → "accès" où c’était comptage physique |
| [`terms/page.tsx`](../src/app/terms/page.tsx), [`privacy/page.tsx`](../src/app/privacy/page.tsx), [`legal/page.tsx`](../src/app/legal/page.tsx) | Cartes / activation → accès digitaux, parcours digital |
| [`layout.tsx`](../src/app/layout.tsx) | Metadata: QR, carte digitale, wallet |

## 2. French / typography (principal)

- **Terms, privacy, legal:** accents (précise, périmètre, récurrence, données, activé, etc.).
- **Parcours / engine:** étapes, façade, système, apostrophes HTML (`&apos;`) où nécessaire.
- **ParcoursSeasonTradingChart:** "Courbe cumulée nette".
- **Demo world labels** in [`demo-content.ts`](../src/lib/demo-content.ts): Café, Beauté, Léa, à inviter, débloque.

Une passe exhaustive sur tout `src/` peut continuer (fichiers non touchés : `objective-scenarios.ts`, `card-messaging.ts`, etc.).

## 3. Single projection source of truth

**Module:** [`cardin-projection-engine.ts`](../src/lib/cardin-projection-engine.ts) (`computeCardinFinancialProjection`)

**Types:** [`cardin-projection-types.ts`](../src/lib/cardin-projection-types.ts)

**Wrapped by:** [`parcours-projection.ts`](../src/lib/parcours-projection.ts) → `buildParcoursProjection` / `computeParcoursProjectionFull`

**Net logic:**

- `grossMonth` = recovery + frequency + domino (monthly, avant coûts)
- `rewardCostMonth` = `grossMonth × rewardCostRate` (défaut 12 %)
- `diamondCostMonth` = 49 € en Full, **0** en Lite
- `netCardinMonth` / `netCardinSeason` = tête de lecture principale

**Consumers alignés:**

- [`demo-content.ts`](../src/lib/demo-content.ts) — plus de `projectScenarioImpact` pour les chiffres démo ; `getDemoWorldContent` utilise `computeParcoursProjectionFull(..., 1)` ; **saison 3 mois** pour les 4 mondes.
- [`/api/parcours/projection`](../src/app/api/parcours/projection/route.ts) — inchangé côté route ; réponse = moteur unifié.
- [`simulation.ts`](../src/lib/simulation.ts) — `simulateScenario` appelle le même moteur pour les montants (net saison + net mensuel).
- [`ProjectionView.tsx`](../src/components/landing/ProjectionView.tsx) — libellés "revenu net saison" + équivalent mensuel.

**Hors scope (suivi possible):**

- [`MerchantSeasonStudio.tsx`](../src/components/landing/MerchantSeasonStudio.tsx) — métriques `baselineMonthlyRecovered` / heuristiques locales (non branchées sur le moteur).
- [`annual-projection-engine.ts`](../src/lib/annual-projection-engine.ts) — utilise encore `projectScenarioImpact` (usage annuel / autre écran).

## 4. Historique des chiffres

Les montants affichés **ne sont pas** conservés pour compatibilité avec l’ancienne double source (`projectScenarioImpact` vs `buildParcoursProjection`). La cohérence produit prime.
