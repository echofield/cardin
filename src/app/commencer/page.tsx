import type { Metadata } from "next"

import { CardinStarterPage } from "@/components/acquisition/CardinStarterPage"

export const metadata: Metadata = {
  title: "Commencer avec Cardin",
  description: "Une entrée simple dans Cardin : un premier mois pour faire revenir les clients, puis la saison complète.",
}

export default function CommencerPage() {
  return <CardinStarterPage />
}
