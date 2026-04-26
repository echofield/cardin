import type { Metadata, Viewport } from "next"

import { CommerceCrmDemoPage } from "@/components/cardin-page/CommerceCrmDemoPage"

export const metadata: Metadata = {
  title: "Cardin · Bar",
  description:
    "Démo Cardin pour bar : CRM de comptoir, tables à réveiller, moteur d'activation et jeu live.",
}

export const viewport: Viewport = {
  themeColor: "#f5f3ed",
  colorScheme: "light",
}

export default function BarRoute() {
  return <CommerceCrmDemoPage variant="bar" />
}
