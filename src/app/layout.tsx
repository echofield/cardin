import type { Metadata } from "next"
import { Cormorant_Garamond, Manrope } from "next/font/google"

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
  title: "Cardin - Fidelite wallet pour commerces",
  description: "Plus de clients qui reviennent = plus de chiffre. Carte de fidelite wallet en 24h.",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html className={`${heading.variable} ${body.variable}`} lang="fr">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
