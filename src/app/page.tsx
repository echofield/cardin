import type { Metadata } from "next"

import { CardinHomePage } from "@/components/home/CardinHomePage"

export const metadata: Metadata = {
  title: "Cardin",
  description: "Transformez les clients de passage en clients qui reviennent.",
}

export default function HomePage() {
  return <CardinHomePage />
}
