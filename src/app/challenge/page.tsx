import type { Metadata } from "next"

import { ChallengePage } from "@/components/challenge/ChallengePage"

export const metadata: Metadata = {
  title: "Challenge Cardin",
  description: "Un challenge court, cadré par Cardin, pour provoquer un retour mesurable sur votre commerce.",
}

export default function Page() {
  return <ChallengePage />
}
