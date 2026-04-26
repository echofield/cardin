import type { Metadata, Viewport } from "next"

import { ComptoirCrmPage } from "@/components/cardin-page/ComptoirCrmPage"

export const metadata: Metadata = {
  title: "Cardin CRM Comptoir",
  description:
    "Démo Cardin pour caviste et bar : carnet client vivant, queue de relance, journal et moteur d'activation.",
}

export const viewport: Viewport = {
  themeColor: "#281713",
  colorScheme: "light",
}

export default function CrmComptoirRoute() {
  return <ComptoirCrmPage />
}
