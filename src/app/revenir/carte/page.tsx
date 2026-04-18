import type { Metadata } from "next"

import { InvitationCardPage } from "@/components/revenir/InvitationCardPage"

export const metadata: Metadata = {
  title: "Carte Cardin",
  description: "Carte imprimable Cardin avec QR de reprise.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function Page({
  searchParams,
}: {
  searchParams?: { url?: string }
}) {
  return <InvitationCardPage initialUrl={searchParams?.url ?? null} />
}
