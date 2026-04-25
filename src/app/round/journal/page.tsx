import type { Metadata, Viewport } from "next"

import { RoundJournalPage } from "@/components/cardin-page/RoundJournalPage"

export const metadata: Metadata = {
  title: "Round - Journal Cardin",
  description: "Vue merchant Cardin pour Round: passages, retours, invites, finalistes, cout cadeaux et scenarios.",
}

export const viewport: Viewport = {
  themeColor: "#f2eadb",
  colorScheme: "light",
}

export default function RoundJournalRoute() {
  return <RoundJournalPage />
}
