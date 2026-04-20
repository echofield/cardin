import type { MetadataRoute } from "next"

const SITE_URL = process.env.CARDIN_SITE_URL ?? "https://getcardin.com"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/auth/", "/dashboard-demo", "/apres-paiement", "/parcours-client", "/engine", "/projection", "/demo", "/challenge", "/cardin/create", "/revenir", "/revenir/carte"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
