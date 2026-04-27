import type { Metadata, Viewport } from "next"

import { PompetteDemoPage } from "@/components/cardin-page/PompetteDemoPage"

export const metadata: Metadata = {
  title: "Boulangerie - Carte Cardin",
  description: "Template Cardin pour boulangerie : carte mobile, progression, duo, animation du jour et Diamond.",
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

export default function BoulangeriePage({ searchParams }: PageProps) {
  return <PompetteDemoPage merchantId={searchParams?.merchantId?.trim() || null} />
}
