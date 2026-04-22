import type { Metadata } from "next"

import { DirectPaymentPage } from "@/components/terrain/DirectPaymentPage"

export const metadata: Metadata = {
  title: "Règlement direct · Cardin",
  description: "Page cachée de règlement direct pour le terrain Cardin.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function ReglerPage({
  searchParams,
}: {
  searchParams?: { offer?: string }
}) {
  return <DirectPaymentPage initialOffer={searchParams?.offer} />
}
