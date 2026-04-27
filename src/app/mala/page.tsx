import type { Metadata, Viewport } from "next"

import { MalaDemoPage } from "@/components/cardin-page/MalaDemoPage"

export const metadata: Metadata = {
  title: "Mala Club - Carte Cardin",
  description: "Démo Cardin pour Atelier Mala : carte mobile, progression, duo, animation du jour et Diamond.",
}

export const viewport: Viewport = {
  themeColor: "#1a1714",
  colorScheme: "dark",
}

export default function MalaPage() {
  return <MalaDemoPage />
}
