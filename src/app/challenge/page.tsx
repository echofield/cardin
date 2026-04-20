import type { Metadata } from "next"

import { ChallengePage } from "@/components/challenge/ChallengePage"

export const metadata: Metadata = {
  title: "Challenge Cardin",
  description: "Un format Cardin court pour provoquer un retour mesurable dans un lieu.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function Page() {
  return <ChallengePage />
}
