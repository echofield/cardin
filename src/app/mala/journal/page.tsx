import type { Metadata, Viewport } from "next"

import { MalaJournalPage } from "@/components/cardin-page/MalaJournalPage"

export const metadata: Metadata = {
  title: "Mala Club - Journal Cardin",
  description: "Vue merchant Cardin pour Atelier Mala : passages, retours, duos, coût cadeaux, console push et projection.",
}

export const viewport: Viewport = {
  themeColor: "#1a1714",
  colorScheme: "dark",
}

export default function MalaJournalRoute() {
  return <MalaJournalPage />
}
