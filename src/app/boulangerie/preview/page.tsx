import type { Metadata } from "next"

import { BoulangeriePreviewPage } from "@/components/cardin-page/BoulangeriePreviewPage"
import { PublicFooter } from "@/components/shared/PublicFooter"
import { buildCardinMerchantHref, resolveCardinMerchantPage } from "@/lib/cardin-page-data"
import { getDiamondOptions, getSeasonPreset, type ParcoursDiamondKey } from "@/lib/parcours-v2"

export const metadata: Metadata = {
  title: "Preview Diamond boulangerie · Cardin",
  description: "Preview boulangerie inspiree de /commencer pour montrer ce qui s'affiche a l'entree selon le Diamond choisi.",
}

type PageProps = {
  searchParams?: {
    name?: string
    weak?: string
    rhythm?: string
    clientele?: string
    note?: string
    diamond?: string
    merchantId?: string
  }
}

function resolveDiamondKey(value?: string): ParcoursDiamondKey {
  if (value === "dinner" || value === "credit" || value === "unlimited") return value
  return getSeasonPreset("boulangerie").diamond
}

function buildBaseParams({
  businessName,
  weakMomentId,
  returnRhythmId,
  clienteleId,
  note,
  merchantId,
}: {
  businessName: string
  weakMomentId: string
  returnRhythmId: string
  clienteleId: string
  note: string
  merchantId?: string
}) {
  const params = new URLSearchParams({
    name: businessName,
    weak: weakMomentId,
    rhythm: returnRhythmId,
    clientele: clienteleId,
  })

  if (note) params.set("note", note)
  if (merchantId) params.set("merchantId", merchantId)

  return params
}

export default function BoulangeriePreviewRoute({ searchParams }: PageProps) {
  const businessName = searchParams?.name?.trim() || "Votre boulangerie"
  const slug =
    businessName
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

  const selectedDiamond = resolveDiamondKey(searchParams?.diamond)
  const activationHref = buildCardinMerchantHref({
    businessName: merchant.businessName,
    worldId: merchant.worldId,
    weakMomentId: merchant.weakMomentId,
    returnRhythmId: merchant.returnRhythmId,
    clienteleId: merchant.clienteleId,
    note: merchant.note,
  })

  const baseParams = buildBaseParams({
    businessName: merchant.businessName,
    weakMomentId: merchant.weakMomentId,
    returnRhythmId: merchant.returnRhythmId,
    clienteleId: merchant.clienteleId,
    note: merchant.note,
    merchantId: searchParams?.merchantId?.trim() || undefined,
  })

  const backHref = `/boulangerie?${baseParams.toString()}`
  const choiceLinks = getDiamondOptions("boulangerie").map((option) => {
    const params = new URLSearchParams(baseParams)
    params.set("diamond", option.key)

    return {
      key: option.key,
      label: option.label,
      href: `/boulangerie/preview?${params.toString()}`,
      active: option.key === selectedDiamond,
    }
  })

  const merchantId = searchParams?.merchantId?.trim() || ""
  const scanHref = merchantId ? `/scan/${merchantId}?demo=1` : null
  const merchantDashboardHref = merchantId ? `/merchant/${merchantId}?demo=1` : null

  return (
    <main className="bg-[#ebe5d8] text-[#1a2a22]">
      <BoulangeriePreviewPage
        activationHref={activationHref}
        backHref={backHref}
        choiceLinks={choiceLinks}
        merchant={merchant}
        merchantDashboardHref={merchantDashboardHref}
        scanHref={scanHref}
        selectedDiamond={selectedDiamond}
      />
      <PublicFooter />
    </main>
  )
}
