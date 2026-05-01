import type { Metadata, Viewport } from "next"

import { MaminaJournalPage } from "@/components/cardin-page/MaminaJournalPage"

export const metadata: Metadata = {
  title: "Mamina - Journal Cardin",
  description:
    "Journal commerçant Cardin pour Mamina : passages, retours, produits découverts, dégustations et opportunités proches.",
}

export const viewport: Viewport = {
  themeColor: "#f5ecdc",
  colorScheme: "light",
}

export default function MaminaJournalRoute() {
  return <MaminaJournalPage />
}
