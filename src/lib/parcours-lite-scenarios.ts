import type { LandingWorldId } from "@/lib/landing-content"

/**
 * Cardin Lite — locked copy for parcours Étape « Vos scénarios ».
 * 4 secteurs × 3 scénarios × 3 types de récompense (exemples inclus).
 */

export type LiteRewardOption = {
  id: string
  label: string
  shortExample: string
}

export type LiteScenario = {
  id: string
  title: string
  mechanicOneLiner: string
  rewards: [LiteRewardOption, LiteRewardOption, LiteRewardOption]
}

export const LITE_SCENARIOS_BY_WORLD: Record<LandingWorldId, LiteScenario[]> = {
  cafe: [
    {
      id: "cafe_heures_creuses",
      title: "Heures creuses",
      mechanicOneLiner:
        "Un client scanne pendant vos heures calmes. Il recoit une offre qui n'existe qu'a ce moment.",
      rewards: [
        { id: "reduction", label: "Reduction", shortExample: "ex. -40% 2e boisson" },
        { id: "offre_speciale", label: "Offre speciale", shortExample: "ex. combo pas sur la carte" },
        { id: "offert", label: "Offert", shortExample: "ex. patisserie offerte pour toute commande" },
      ],
    },
    {
      id: "cafe_premiere_visite",
      title: "Premiere visite",
      mechanicOneLiner:
        "Quelqu'un scanne pour la premiere fois. Le systeme le detecte et declenche un geste de bienvenue.",
      rewards: [
        { id: "reduction", label: "Reduction", shortExample: "ex. -20% aujourd'hui" },
        { id: "offert", label: "Offert", shortExample: "ex. cafe offert, sans condition" },
        { id: "cadeau", label: "Cadeau", shortExample: "ex. un cookie avec la commande" },
      ],
    },
    {
      id: "cafe_serie",
      title: "Serie de visites",
      mechanicOneLiner:
        "Un client revient 3 fois cette semaine. Chaque visite augmente son avantage. S'il s'arrete, ca repart a zero.",
      rewards: [
        { id: "reduction_croissante", label: "Reduction croissante", shortExample: "ex. -5%, -10%, -15%" },
        { id: "upgrade_croissant", label: "Upgrade croissant", shortExample: "ex. taille superieure, puis supplement offert, puis boisson offerte" },
        { id: "surprise", label: "Surprise", shortExample: "le client ne sait pas ce qu'il debloque — effet de curiosite" },
      ],
    },
  ],
  restaurant: [
    {
      id: "resto_heures_creuses",
      title: "Heures creuses",
      mechanicOneLiner:
        "Tables vides entre 15h et 19h. Les clients a proximite recoivent une offre limitee dans le temps.",
      rewards: [
        { id: "menu_special", label: "Menu special", shortExample: "ex. menu decouverte 22 EUR, hors carte" },
        { id: "reduction", label: "Reduction", shortExample: "ex. -30% sur l'addition entre 15h et 18h" },
        { id: "offert", label: "Offert", shortExample: "ex. entree offerte sur ce creneau" },
      ],
    },
    {
      id: "resto_dessert",
      title: "Declencheur dessert",
      mechanicOneLiner:
        "Le client est assis, il scanne. Une offre apparait avec un compte a rebours.",
      rewards: [
        { id: "reduction", label: "Reduction", shortExample: "ex. -30% dessert dans les 10 min" },
        { id: "offert", label: "Offert", shortExample: "ex. cafe offert si dessert commande maintenant" },
        { id: "combo", label: "Combo", shortExample: "ex. dessert + digestif a prix fixe" },
      ],
    },
    {
      id: "resto_groupe",
      title: "Table de groupe",
      mechanicOneLiner:
        "4 personnes ou plus scannent en meme temps. Une offre collective se debloque.",
      rewards: [
        { id: "offert", label: "Offert", shortExample: "ex. bouteille offerte" },
        { id: "reduction", label: "Reduction", shortExample: "ex. -10% sur l'addition totale" },
        { id: "experience", label: "Experience", shortExample: "ex. dessert flambe offert a table — moment memorable" },
      ],
    },
  ],
  beaute: [
    {
      id: "beaute_rebook",
      title: "Rebooking immediat",
      mechanicOneLiner:
        "Le rendez-vous se termine. La cliente scanne. Elle a quelques minutes pour reserver le prochain avec un avantage.",
      rewards: [
        { id: "reduction", label: "Reduction", shortExample: "ex. -15% sur le prochain RDV" },
        { id: "offert", label: "Offert", shortExample: "ex. soin complementaire offert au prochain passage" },
        { id: "prix_fixe", label: "Prix fixe", shortExample: "ex. prochain RDV au meme prix garanti — pas d'augmentation" },
      ],
    },
    {
      id: "beaute_anniversaire",
      title: "Anniversaire",
      mechanicOneLiner:
        "C'est la semaine de son anniversaire. Le systeme le sait. Une offre personnelle apparait.",
      rewards: [
        { id: "reduction", label: "Reduction", shortExample: "ex. -25% sur la prestation du jour" },
        { id: "offert", label: "Offert", shortExample: "ex. brushing offert" },
        { id: "experience", label: "Experience", shortExample: "ex. prestation VIP — accueil champagne + soin supplementaire" },
      ],
    },
    {
      id: "beaute_duo",
      title: "Duo",
      mechanicOneLiner:
        "Une cliente reserve avec une amie. Les deux recoivent un avantage.",
      rewards: [
        { id: "reduction_partagee", label: "Reduction partagee", shortExample: "ex. -20% chacune" },
        { id: "offert_conditionnel", label: "Offert conditionnel", shortExample: "ex. la 2e coupe a -50%" },
        { id: "cadeau_commun", label: "Cadeau commun", shortExample: "ex. kit produit offert pour les deux" },
      ],
    },
  ],
  boutique: [
    {
      id: "boutique_premiere_visite",
      title: "Premiere visite",
      mechanicOneLiner:
        "Quelqu'un entre pour la premiere fois et scanne. Le systeme detecte un nouveau profil.",
      rewards: [
        { id: "reduction", label: "Reduction", shortExample: "ex. -20% aujourd'hui uniquement" },
        { id: "cadeau", label: "Cadeau", shortExample: "ex. accessoire offert pour tout achat" },
        { id: "temps", label: "Temps", shortExample: "ex. -10% valable 48h — laisse le temps de reflechir mais cree l'urgence" },
      ],
    },
    {
      id: "boutique_taille",
      title: "Ma taille, maintenant",
      mechanicOneLiner:
        "Le client entre sa taille. Le systeme montre ce qui est disponible pour lui, avec une offre limitee.",
      rewards: [
        { id: "reduction", label: "Reduction", shortExample: "ex. -15% sur les pieces dans votre taille, 1h" },
        { id: "acces", label: "Acces", shortExample: "ex. 3 pieces selectionnees pour vous, avant les autres" },
        { id: "service", label: "Service", shortExample: "ex. essayage prive reserve pour vous" },
      ],
    },
    {
      id: "boutique_duo",
      title: "Duo / Couple",
      mechanicOneLiner:
        "Deux personnes scannent ensemble. Une dynamique collective se declenche.",
      rewards: [
        { id: "reduction_croisee", label: "Reduction croisee", shortExample: "ex. -15% chacun si les deux achetent" },
        { id: "offre_decalee", label: "Offre decalee", shortExample: "ex. l'un achete, l'autre recoit -20% valable 48h" },
        { id: "cadeau_partage", label: "Cadeau partage", shortExample: "ex. un accessoire offert pour le duo" },
      ],
    },
  ],
}

export type LiteSelections = Partial<Record<string, string>>

export function isLiteSelectionsComplete(worldId: LandingWorldId, selections: LiteSelections): boolean {
  return LITE_SCENARIOS_BY_WORLD[worldId].every((s) => Boolean(selections[s.id]))
}

/** Label-only hint for projection / activation (no number changes). */
export function liteProjectionHintLabel(worldId: LandingWorldId, selections: LiteSelections): string {
  const scenarios = LITE_SCENARIOS_BY_WORLD[worldId]
  const labels: string[] = []
  for (const sc of scenarios) {
    const rid = selections[sc.id]
    if (!rid) continue
    const r = sc.rewards.find((x) => x.id === rid)
    if (r) labels.push(r.label.toLowerCase())
  }
  if (labels.length === 0) return "Configuration Lite"
  const reductionish = labels.filter((l) => l.includes("reduction")).length
  const offertish = labels.filter((l) => l.includes("offert") || l.includes("cadeau")).length
  if (reductionish >= 2) return "Profil plutot reductions — conversion souvent plus directe."
  if (offertish >= 2) return "Profil plutot offerts / cadeaux — valeur percue forte, a suivre en marge."
  return "Mix equilibre entre types de recompenses."
}
