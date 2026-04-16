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

const SITE_URL = process.env.CARDIN_SITE_URL ?? "https://getcardin.com"
const SITE_NAME = "Cardin"
const SITE_TITLE = "Cardin — moteur de retour pour commerces et communautés"
const SITE_DESCRIPTION =
  "Transformez chaque passage en progression mesurable. QR d'entrée, carte digitale, récompense de saison. Activation sous 48 h, lecture du retour sous 30 jours."

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s · Cardin",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "fidélisation commerce",
    "carte de fidélité digitale",
    "moteur de retour",
    "QR restaurant",
    "programme de fidélité bar",
    "retention commerce local",
  ],
  authors: [{ name: "Cardin" }],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: {
    icon: "/favicon.ico",
  },
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

