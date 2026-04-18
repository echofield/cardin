import type { Metadata } from "next"

import { RevenirPage } from "@/components/revenir/RevenirPage"

export const metadata: Metadata = {
  title: "Revenir à Cardin",
  description: "Retrouvez votre accès Cardin, laissez votre contact, ou reprenez votre saison plus tard.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function Page({
  searchParams,
}: {
  searchParams?: { source?: string }
}) {
  return <RevenirPage source={searchParams?.source ?? null} />
}
