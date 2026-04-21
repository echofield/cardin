import type { Metadata } from "next"
import { cookies } from "next/headers"

import { CardinPresentationPage } from "@/components/presentation/CardinPresentationPage"
import { PresentationAccessForm } from "@/components/presentation/PresentationAccessForm"
import { isPresentationAuthorized, PRESENTATION_COOKIE_NAME } from "@/lib/presentation-auth"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Présentation",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
}

export default function PresentationPage() {
  const cookieStore = cookies()
  const isAuthorized = isPresentationAuthorized(cookieStore.get(PRESENTATION_COOKIE_NAME)?.value)

  return isAuthorized ? <CardinPresentationPage /> : <PresentationAccessForm />
}
