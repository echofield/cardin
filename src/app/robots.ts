import type { MetadataRoute } from "next"

const SITE_URL = process.env.CARDIN_SITE_URL ?? "https://getcardin.com"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/auth/", "/dashboard-demo", "/apres-paiement"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
