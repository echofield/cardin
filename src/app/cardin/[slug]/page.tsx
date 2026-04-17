import type { Metadata } from "next"

import { CardinDedicatedPage } from "@/components/cardin-page/CardinDedicatedPage"
import { PublicFooter } from "@/components/shared/PublicFooter"
import { resolveCardinMerchantPage, resolveCardinPageState } from "@/lib/cardin-page-data"
import { getStoredCardinPageBySlug } from "@/lib/cardin-page-store"

export const dynamic = "force-dynamic"

const SITE_URL = process.env.CARDIN_SITE_URL ?? "https://getcardin.com"

type PageProps = {
  params: { slug: string }
  searchParams?: {
    state?: string
    world?: string
    name?: string
    contact?: string
    weak?: string
    rhythm?: string
    clientele?: string
    note?: string
  }
}

function resolveMerchantFromRequest(
  slug: string,
  searchParams: PageProps["searchParams"],
  stored: Awaited<ReturnType<typeof getStoredCardinPageBySlug>>,
) {
  return resolveCardinMerchantPage(slug, {
    businessName: searchParams?.name ?? stored?.businessName,
    world: searchParams?.world ?? stored?.worldId,
    contactEmail: searchParams?.contact ?? stored?.contactEmail,
    weakMoment: searchParams?.weak ?? stored?.weakMomentId,
    returnRhythm: searchParams?.rhythm ?? stored?.returnRhythmId,
    clientele: searchParams?.clientele ?? stored?.clienteleId,
    note: searchParams?.note ?? stored?.note,
  })
}

function buildOpenGraphImageUrl(
  slug: string,
  merchant: ReturnType<typeof resolveCardinMerchantPage>,
  displayState: ReturnType<typeof resolveCardinPageState>,
) {
  const params = new URLSearchParams({
    name: merchant.businessName,
    world: merchant.worldId,
    weak: merchant.weakMomentId,
    rhythm: merchant.returnRhythmId,
    clientele: merchant.clienteleId,
    status: displayState,
  })

  if (merchant.note) {
    params.set("note", merchant.note)
  }

  return `${SITE_URL}/cardin/${slug}/opengraph-image?${params.toString()}`
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const stored = await getStoredCardinPageBySlug(params.slug)
  const merchant = resolveMerchantFromRequest(params.slug, searchParams, stored)
  const displayState = resolveCardinPageState(stored?.paidAt ?? merchant.paidAt, searchParams?.state)
  const title = `Cardin pour ${merchant.businessName}`
  const pageUrl = `${SITE_URL}/cardin/${params.slug}`
  const imagePath = buildOpenGraphImageUrl(params.slug, merchant, displayState)
  const description =
    displayState === "activation"
      ? `Saison Cardin réservée pour ${merchant.businessName}. Lecture du lieu, cadre de saison et mise en place sous 48 h.`
      : `Lecture du lieu, première saison Cardin et projection partageable pour ${merchant.businessName}. ${merchant.weakMomentLabel}, retour ${merchant.returnRhythmLabel}, clientèle ${merchant.clienteleLabel}.`

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title,
      description,
      url: pageUrl,
      images: [
        {
          url: imagePath,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imagePath],
    },
  }
}

export default async function CardinMerchantPage({ params, searchParams }: PageProps) {
  const stored = await getStoredCardinPageBySlug(params.slug)
  const merchant = resolveMerchantFromRequest(params.slug, searchParams, stored)
  const displayState = resolveCardinPageState(stored?.paidAt ?? merchant.paidAt, searchParams?.state)

  return (
    <main className="bg-[#F7F3EA] text-[#18271F]">
      <CardinDedicatedPage displayState={displayState} merchant={merchant} />
      <PublicFooter />
    </main>
  )
}
