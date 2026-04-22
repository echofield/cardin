import type { Metadata, Viewport } from "next"
import { Cormorant_Garamond, Manrope } from "next/font/google"

import { AppChrome } from "@/components/AppChrome"
import { PwaBootstrap } from "@/components/PwaBootstrap"

import "./globals.css"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#173A2E",
  colorScheme: "light",
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
const SITE_TITLE = "Cardin — le revenu qui part avec vos clients. Récupéré."
const SITE_DESCRIPTION =
  "Cardin transforme chaque passage en raison structurée de revenir. Simulez l'impact sur votre commerce puis lancez une saison claire."

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s · Cardin",
  },
  manifest: "/manifest.webmanifest",
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
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: "default",
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
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
        <PwaBootstrap />
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  )
}

