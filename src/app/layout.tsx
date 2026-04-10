import type { Metadata } from "next"
import { Cormorant_Garamond, Manrope } from "next/font/google"

import { SiteHeader } from "@/components/SiteHeader"

import "./globals.css"

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
        <div className="pt-14">{children}</div>
      </body>
    </html>
  )
}

