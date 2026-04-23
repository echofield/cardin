import type { Metadata, Viewport } from "next"

import { PompetteDemoPage } from "@/components/cardin-page/PompetteDemoPage"

export const metadata: Metadata = {
  title: "Pompette · Votre carte",
  description: "Démo vivante d'une carte Cardin pour Pompette: entrée code, profil léger, carte vivante et actions de saison.",
}

export const viewport: Viewport = {
  themeColor: "#f5efe3",
  colorScheme: "light",
}

type PageProps = {
  searchParams?: {
    merchantId?: string
  }
}

export default function PompettePage({ searchParams }: PageProps) {
  return <PompetteDemoPage merchantId={searchParams?.merchantId?.trim() || null} />
}
