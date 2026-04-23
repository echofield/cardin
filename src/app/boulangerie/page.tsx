import type { Metadata } from "next"

import { BoulangerieDemoPage } from "@/components/cardin-page/BoulangerieDemoPage"
import { PublicFooter } from "@/components/shared/PublicFooter"
import { buildCardinMerchantHref, resolveCardinMerchantPage } from "@/lib/cardin-page-data"

export const metadata: Metadata = {
  title: "Cardin pour boulangerie",
  description: "Page de demo Cardin pour une boulangerie: retour client, progression, rewards et Diamond adaptes au comptoir.",
}

type PageProps = {
  searchParams?: {
    name?: string
    weak?: string
    rhythm?: string
    clientele?: string
    note?: string
  }
}

export default function BoulangeriePage({ searchParams }: PageProps) {
  const businessName = searchParams?.name?.trim() || "Votre boulangerie"
  const slug = businessName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "votre-boulangerie"

  const merchant = resolveCardinMerchantPage(slug, {
    businessName,
    world: "boulangerie",
    weakMoment: searchParams?.weak ?? "mardi-apres-midi",
    returnRhythm: searchParams?.rhythm ?? "3-7-jours",
    clientele: searchParams?.clientele ?? "quartier",
    note: searchParams?.note,
  })

  const activationHref = buildCardinMerchantHref({
    businessName: merchant.businessName,
    worldId: merchant.worldId,
    weakMomentId: merchant.weakMomentId,
    returnRhythmId: merchant.returnRhythmId,
    clienteleId: merchant.clienteleId,
    note: merchant.note,
  })

  return (
    <main className="bg-[#F7F3EA] text-[#18271F]">
      <BoulangerieDemoPage activationHref={activationHref} merchant={merchant} />
      <PublicFooter />
    </main>
  )
}
