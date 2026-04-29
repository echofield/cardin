import type { Metadata, Viewport } from "next"

import { MalaBrainPage } from "@/components/cardin-page/MalaBrainPage"

export const metadata: Metadata = {
  title: "Mala Club - Brain Cardin",
  description:
    "Tour de contrôle Cardin pour bar : ventes, stock, staff, fournisseurs, cartes clients et recommandations opérationnelles.",
}

export const viewport: Viewport = {
  themeColor: "#1a1714",
  colorScheme: "dark",
}

export default function MalaBrainRoute() {
  return <MalaBrainPage />
}
