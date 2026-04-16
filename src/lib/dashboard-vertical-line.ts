import type { LandingWorldId } from "@/lib/landing-content"

// One sentence per vertical surfaced in the merchant dashboard header.
// Replaces a single generic Diamond explainer that read the same for every
// commerce. Keeps the structural frame (season, missions, retour, réseau)
// but renders it through the vocabulary of each trade.

export const DASHBOARD_VERTICAL_LINE: Record<LandingWorldId, string> = {
  cafe:
    "Chaque café offert entre dans une progression. Les meilleurs parcours montent et débloquent des moments rares sur la saison.",
  bar:
    "Chaque soirée devient un fil. Vos habitués progressent, partagent avec leurs proches, et quelques-uns atteignent vos moments les plus désirables.",
  restaurant:
    "Chaque repas compte dans un parcours. Vos clients fidèles gagnent accès à des moments rares : table du chef, menus signature, expériences réservées.",
  beaute:
    "Chaque rendez-vous alimente une progression. Les parcours les plus fidèles débloquent des soins premium et un accès VIP sur la saison.",
  boutique:
    "Chaque visite nourrit un parcours. Les meilleurs clients accèdent à des collections privées, styling personnalisé, avant-premières.",
}
