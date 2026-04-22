import type { Metadata } from "next"

import { CardInstallHome } from "@/components/card/CardInstallHome"

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default function PassPage() {
  return <CardInstallHome />
}
