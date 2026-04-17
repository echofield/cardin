import type { Metadata } from "next"

import { CardinHomePage } from "@/components/home/CardinHomePage"

export const metadata: Metadata = {
  title: "Cardin",
  description: "Le revenu qui part avec vos clients. Récupéré.",
}

export default function HomePage() {
  return <CardinHomePage />
}
