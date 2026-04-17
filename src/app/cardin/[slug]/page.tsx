import type { Metadata } from "next"

import { CardinDedicatedPage } from "@/components/cardin-page/CardinDedicatedPage"
import { PublicFooter } from "@/components/shared/PublicFooter"
import { resolveCardinMerchantPage, resolveCardinPageState } from "@/lib/cardin-page-data"

export const dynamic = "force-dynamic"

type PageProps = {
  params: { slug: string }
  searchParams?: {
    state?: string
    world?: string
    name?: string
    contact?: string
  }
}

export function generateMetadata({ params, searchParams }: PageProps): Metadata {
  const merchant = resolveCardinMerchantPage(params.slug, {
    businessName: searchParams?.name,
    world: searchParams?.world,
    contactEmail: searchParams?.contact,
  })

  return {
    title: `Cardin pour ${merchant.businessName}`,
    description: `Une saison Cardin déjà cadrée pour ${merchant.businessName}.`,
  }
}

export default function CardinMerchantPage({ params, searchParams }: PageProps) {
  const merchant = resolveCardinMerchantPage(params.slug, {
    businessName: searchParams?.name,
    world: searchParams?.world,
    contactEmail: searchParams?.contact,
  })

  const displayState = resolveCardinPageState(merchant.paidAt, searchParams?.state)

  return (
    <main className="bg-[#F7F3EA] text-[#18271F]">
      <CardinDedicatedPage displayState={displayState} merchant={merchant} />
      <PublicFooter />
    </main>
  )
}
