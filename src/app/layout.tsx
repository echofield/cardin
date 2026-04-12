import type { Metadata, Viewport } from "next"
import { Cormorant_Garamond, Manrope } from "next/font/google"

import { SiteHeader } from "@/components/SiteHeader"

import "./globals.css"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

const heading = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-heading",
  display: "swap",
})

const body = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Cardin - Return Engine pour commerces et communautés",
  description:
    "Cardin crée des boucles de retour mesurables : QR d'entrée, carte digitale, wallet Apple / Google. Activation digitale rapide.",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html className={`${heading.variable} ${body.variable}`} lang="fr">
      <body className="font-sans antialiased">
        <SiteHeader />
        <div className="pb-safe min-h-dvh-safe pt-[calc(3.5rem+env(safe-area-inset-top,0px))]">{children}</div>
      </body>
    </html>
  )
}

