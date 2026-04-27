import type { Metadata, Viewport } from "next"

import { CardinBeginPage } from "@/components/acquisition/CardinBeginPage"

export const metadata: Metadata = {
  title: "Begin with Cardin",
  description:
    "An English Cardin entry page: customer return system, visible weekly moment, QR scan loop, Diamond reward and 90-day season.",
}

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#ebe5d8",
}

export default function BeginPage() {
  return <CardinBeginPage />
}
