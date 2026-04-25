import type { Metadata, Viewport } from "next"

import { RoundDemoPage } from "@/components/cardin-page/RoundDemoPage"

export const metadata: Metadata = {
  title: "Round Club - Carte Cardin",
  description: "Demo Cardin pour Round: saison 90 jours, carte membre, progression, duo et Diamond unique.",
}

export const viewport: Viewport = {
  themeColor: "#f2eadb",
  colorScheme: "light",
}

export default function RoundPage() {
  return <RoundDemoPage />
}
