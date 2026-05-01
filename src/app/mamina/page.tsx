import type { Metadata, Viewport } from "next"

import { MaminaDemoPage } from "@/components/cardin-page/MaminaDemoPage"

export const metadata: Metadata = {
  title: "Mamina - Carte Cardin",
  description:
    "Carte Cardin pour Mamina : carte des saveurs, retours midi, découverte épicerie, dégustations et progression client.",
}

export const viewport: Viewport = {
  themeColor: "#f5ecdc",
  colorScheme: "light",
}

type PageProps = {
  searchParams?: {
    merchantId?: string
  }
}

export default function MaminaPage({ searchParams }: PageProps) {
  return <MaminaDemoPage merchantId={searchParams?.merchantId?.trim() || null} />
}
