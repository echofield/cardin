import type { MetadataRoute } from "next"

const SITE_URL = process.env.CARDIN_SITE_URL ?? "https://getcardin.com"

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const routes = ["/", "/diagnostic", "/parcours", "/legal", "/privacy", "/terms"]

  return routes.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: path === "/" ? 1 : 0.7,
  }))
}
