import type { Metadata } from "next"

import { CardSurfacePreview } from "@/components/card/CardSurfacePreview"

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default function CartePage() {
  return <CardSurfacePreview />
}
