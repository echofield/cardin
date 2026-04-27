import type { Metadata, Viewport } from "next"

import { PompetteJournalPage } from "@/components/cardin-page/PompetteJournalPage"

export const metadata: Metadata = {
  title: "Boulangerie - Journal Cardin",
  description: "Journal marchand Cardin pour boulangerie : passages, retours, duos, cadeaux, moments forts et console push.",
}

export const viewport: Viewport = {
  themeColor: "#f5efe3",
  colorScheme: "light",
}

export default function BoulangerieJournalRoute() {
  return <PompetteJournalPage />
}
