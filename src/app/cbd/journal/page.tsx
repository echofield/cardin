import type { Metadata, Viewport } from "next"

import { CbdJournalPage } from "@/components/cardin-page/CbdJournalPage"

export const metadata: Metadata = {
  title: "CBD Boutique - Journal Cardin",
  description:
    "Vue commerçant Cardin pour boutique CBD : mots reconnus, retours, paliers, drops privés et rythme de la journée.",
}

export const viewport: Viewport = {
  themeColor: "#f4ede0",
  colorScheme: "light",
}

export default function CbdJournalRoute() {
  return <CbdJournalPage />
}
