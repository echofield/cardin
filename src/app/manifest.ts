import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cardin",
    short_name: "Cardin",
    description: "La carte Cardin garde la progression client en poche, avec une ouverture rapide et un rendu plein écran.",
    start_url: "/pass",
    scope: "/",
    display: "standalone",
    background_color: "#FAF8F2",
    theme_color: "#173A2E",
    orientation: "portrait",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  }
}
