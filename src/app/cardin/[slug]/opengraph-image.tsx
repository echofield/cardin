import { ImageResponse } from "next/og"

import { resolveCardinMerchantPage } from "@/lib/cardin-page-data"

export const runtime = "edge"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"
export const alt = "Cardin merchant page preview"

type ImageProps = {
  params: { slug: string }
  searchParams?: {
    name?: string
    world?: string
    weak?: string
    rhythm?: string
    clientele?: string
    note?: string
    status?: string
  }
}

function formatProjection(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value)
}

function businessNameFontSize(name: string) {
  if (name.length > 28) return 60
  if (name.length > 20) return 72
  return 84
}

export default async function CardinMerchantOgImage({ params, searchParams }: ImageProps) {
  const merchant = resolveCardinMerchantPage(params.slug, {
    businessName: searchParams?.name,
    world: searchParams?.world,
    weakMoment: searchParams?.weak,
    returnRhythm: searchParams?.rhythm,
    clientele: searchParams?.clientele,
    note: searchParams?.note,
  })
  const isActivated = searchParams?.status === "activation"
  const range = `${formatProjection(merchant.projectionLow)} \u00e0 ${formatProjection(merchant.projectionHigh)}`
  const statusLabel = isActivated ? "Saison r\u00e9serv\u00e9e" : "Lecture du lieu"
  const sideTitle = isActivated ? "Saison r\u00e9serv\u00e9e" : "Projection de saison"
  const sideValue = isActivated ? "Sous 48 h" : range
  const sideText = isActivated
    ? "Cardin pr\u00e9pare maintenant la mise en place du lieu."
    : "Premi\u00e8re saison, retour dominant et lien partageable pour la d\u00e9cision."

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(135deg, #f7f3ea 0%, #f3efe6 58%, #edf4ee 100%)",
          color: "#173328",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -180,
            left: -40,
            width: 460,
            height: 460,
            borderRadius: 9999,
            background: "rgba(233, 239, 231, 0.92)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: -120,
            bottom: -160,
            width: 520,
            height: 520,
            borderRadius: 9999,
            background: "rgba(226, 235, 227, 0.92)",
          }}
        />

        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            padding: "48px 52px",
            gap: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              flex: 1,
              minWidth: 0,
              flexDirection: "column",
              justifyContent: "space-between",
              borderRadius: 32,
              border: "1px solid rgba(23, 58, 46, 0.08)",
              background: "rgba(255, 254, 250, 0.84)",
              padding: "34px 36px 30px 36px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div
                  style={{
                    fontSize: 29,
                    fontWeight: 700,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                  }}
                >
                  CARDIN
                </div>
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 13,
                    fontWeight: 500,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "#68726b",
                  }}
                >
                  Pour {merchant.businessName}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  borderRadius: 9999,
                  border: "1px solid rgba(23, 58, 46, 0.10)",
                  background: isActivated ? "rgba(236, 244, 237, 0.95)" : "rgba(245, 242, 235, 0.95)",
                  padding: "10px 16px",
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 9999,
                    background: isActivated ? "#173A2E" : "#8A6A35",
                  }}
                />
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                  }}
                >
                  {statusLabel}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div
                style={{
                  fontSize: businessNameFontSize(merchant.businessName),
                  lineHeight: 0.96,
                  maxWidth: 660,
                }}
              >
                {merchant.businessName}
              </div>
              <div
                style={{
                  fontSize: 31,
                  lineHeight: 1.24,
                  color: "#4f5d55",
                  maxWidth: 720,
                }}
              >
                {isActivated ? "Le cadre de saison est r\u00e9serv\u00e9 pour ce lieu." : merchant.subtitle}
              </div>
              <div
                style={{
                  fontSize: 19,
                  lineHeight: 1.45,
                  color: "#69726b",
                  maxWidth: 700,
                }}
              >
                {isActivated
                  ? "M\u00eame lecture du lieu, m\u00eame lien de r\u00e9f\u00e9rence, m\u00eame point d'appui pour l'\u00e9quipe."
                  : "Lecture du lieu, premi\u00e8re saison Cardin et lien partageable pour la d\u00e9cision."}
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {[merchant.temporalAnchor, merchant.clienteleLabel, merchant.returnProfile].map((pill) => (
                <div
                  key={pill}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    borderRadius: 9999,
                    border: "1px solid rgba(23, 58, 46, 0.08)",
                    background: "rgba(245, 242, 235, 0.95)",
                    padding: "10px 16px",
                    fontSize: 15,
                    color: "#173A2E",
                  }}
                >
                  {pill}
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              width: 336,
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            <div
              style={{
                display: "flex",
                flex: 1,
                flexDirection: "column",
                justifyContent: "space-between",
                borderRadius: 32,
                background: "rgba(23, 58, 46, 0.98)",
                padding: "28px 26px",
                color: "#FBFAF6",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div
                  style={{
                    fontSize: 12,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "rgba(244, 238, 226, 0.66)",
                  }}
                >
                  {sideTitle}
                </div>
                <div
                  style={{
                    fontSize: isActivated ? 56 : 47,
                    lineHeight: 1.02,
                  }}
                >
                  {sideValue}
                </div>
                <div
                  style={{
                    fontSize: 18,
                    lineHeight: 1.45,
                    color: "rgba(244, 238, 226, 0.82)",
                  }}
                >
                  {sideText}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  borderTop: "1px solid rgba(244, 238, 226, 0.16)",
                  paddingTop: 18,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "rgba(244, 238, 226, 0.58)",
                  }}
                >
                  Ce que Cardin voit
                </div>
                <div
                  style={{
                    fontSize: 17,
                    lineHeight: 1.42,
                    color: "#FBFAF6",
                  }}
                >
                  {merchant.observations[0]?.text ?? merchant.readingLead}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  )
}
