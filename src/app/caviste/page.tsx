import type { Metadata, Viewport } from "next"

import { CommerceCrmDemoPage } from "@/components/cardin-page/CommerceCrmDemoPage"

export const metadata: Metadata = {
  title: "Cardin · Caviste",
  description:
    "Démo Cardin pour caviste : CRM de comptoir, clients à traiter, caisse préparée et journal vivant.",
}

export const viewport: Viewport = {
  themeColor: "#f5f3ed",
  colorScheme: "light",
}

export default function CavisteRoute() {
  return <CommerceCrmDemoPage variant="caviste" />
}
