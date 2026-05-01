import type { Metadata, Viewport } from "next"

import { CbdDemoPage } from "@/components/cardin-page/CbdDemoPage"

export const metadata: Metadata = {
  title: "CBD Boutique - Carte Cardin",
  description:
    "Carte Cardin anonyme pour boutique CBD : un mot de passage, une date de naissance optionnelle, des paliers et des drops privés.",
}

export const viewport: Viewport = {
  themeColor: "#f4ede0",
  colorScheme: "light",
}

type PageProps = {
  searchParams?: {
    merchantId?: string
  }
}

export default function CbdPage({ searchParams }: PageProps) {
  return <CbdDemoPage merchantId={searchParams?.merchantId?.trim() || null} />
}
