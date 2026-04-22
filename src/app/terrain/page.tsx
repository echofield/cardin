import type { Metadata } from "next"

import { FieldCapturePage } from "@/components/terrain/FieldCapturePage"

export const metadata: Metadata = {
  title: "Capture terrain · Cardin",
  description: "Capture cachée WhatsApp-first pour les contacts terrain Cardin.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function TerrainPage() {
  return <FieldCapturePage />
}
