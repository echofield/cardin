import type { Metadata, Viewport } from "next"

import { PompetteJournalPage } from "@/components/cardin-page/PompetteJournalPage"

export const metadata: Metadata = {
  title: "Pompette · Journal du jour",
  description: "Vue manager Cardin pour Pompette: passages, retours, copains, cadeaux et rythme de la journée.",
}

export const viewport: Viewport = {
  themeColor: "#f5efe3",
  colorScheme: "light",
}

export default function PompetteJournalRoute() {
  return <PompetteJournalPage />
}
