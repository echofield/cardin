"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import QRCode from "qrcode"

import { Button } from "@/ui"
import {
  CHALLENGE_PRICING,
  LANDING_PRICING,
  STRIPE_CHALLENGE_LINK,
  STRIPE_PAYMENT_LINK,
} from "@/lib/landing-content"
import { buildContactMailto } from "@/lib/site-contact"

type OfferId = "starter" | "season"

const OFFERS: Record<
  OfferId,
  {
    id: OfferId
    tag: string
    title: string
    price: string
    detail: string
    meta: string
    href: string
    note: string
  }
> = {
  starter: {
    id: "starter",
    tag: "Premier mois",
    title: "Premier mois Cardin",
    price: `${CHALLENGE_PRICING.activationFee} € TTC`,
    detail: "30 jours pour lancer le lieu, poser un moment visible et commencer à faire revenir.",
    meta: "1 moment cadré · même moteur Cardin",
    href:
      STRIPE_CHALLENGE_LINK ||
      buildContactMailto("Cardin · premier mois", "Bonjour Cardin,\r\n\r\nJe veux lancer le Premier mois Cardin.\r\n"),
    note: "À utiliser quand le lieu veut commencer léger mais payer tout de suite.",
  },
  season: {
    id: "season",
    tag: "Saison complète",
    title: "Saison Cardin",
    price: `${LANDING_PRICING.activationFee} €`,
    detail: "90 jours complets avec Diamond visible, rythme plus profond et vraie installation Cardin.",
    meta: "90 jours · Diamond visible · calibrage complet",
    href: STRIPE_PAYMENT_LINK,
    note: "À utiliser quand le lieu est déjà prêt pour la version complète.",
  },
} as const

function isOfferId(value: string | null | undefined): value is OfferId {
  return value === "starter" || value === "season"
}

export function DirectPaymentPage({ initialOffer }: { initialOffer?: string | null }) {
  const [selectedOffer, setSelectedOffer] = useState<OfferId>(isOfferId(initialOffer) ? initialOffer : "starter")
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const offer = OFFERS[selectedOffer]

  useEffect(() => {
    let active = true

    async function renderQr() {
      if (!canvasRef.current) return

      try {
        await QRCode.toCanvas(canvasRef.current, offer.href, {
          width: 280,
          margin: 0,
          errorCorrectionLevel: "H",
          color: {
            dark: "#173a2e",
            light: "#fffef9",
          },
        })
      } catch {
        if (active && canvasRef.current) {
          const context = canvasRef.current.getContext("2d")
          context?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        }
      }
    }

    void renderQr()

    return () => {
      active = false
    }
  }, [offer.href])

  return (
    <main className="min-h-dvh bg-[radial-gradient(circle_at_top,rgba(15,61,46,0.05),transparent_38%),#f2ede4] px-5 py-10 text-[#1a2a22] sm:px-8">
      <div className="mx-auto max-w-[980px]">
        <div className="rounded-[28px] border border-[#d7ddd2] bg-[#fffef9] p-6 shadow-[0_18px_60px_rgba(15,61,46,0.08)] sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#8c6a44]">Règlement direct</p>
              <h1 className="mt-3 font-serif text-[clamp(34px,7vw,54px)] leading-[0.98] tracking-[-0.03em] text-[#1a2a22]">
                Cardin
              </h1>
              <p className="mt-4 max-w-[560px] font-serif text-[18px] italic leading-[1.6] text-[#3d4d43]">
                À utiliser quand le lieu est prêt à payer sur place. Sinon, laisse plutôt la page <em>/commencer</em>.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                className="inline-flex h-11 items-center justify-center rounded-full border border-[#d6dcd3] px-5 text-sm font-medium text-[#173a2e] transition hover:border-[#b8c3b5] hover:bg-[#f8f5ee]"
                href="/terrain"
              >
                Retour capture terrain
              </Link>
              <Link
                className="inline-flex h-11 items-center justify-center rounded-full border border-[#d6dcd3] px-5 text-sm font-medium text-[#173a2e] transition hover:border-[#b8c3b5] hover:bg-[#f8f5ee]"
                href="/commencer"
              >
                Voir l'entrée Cardin
              </Link>
            </div>
          </div>

          <div className="mt-8 inline-flex rounded-full border border-[#d6dcd3] bg-[#f8f5ee] p-1">
            {(["starter", "season"] as OfferId[]).map((offerId) => {
              const item = OFFERS[offerId]
              const active = selectedOffer === offerId
              return (
                <button
                  className={[
                    "inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-medium transition",
                    active ? "bg-[#173a2e] text-[#fffef9]" : "text-[#173a2e] hover:bg-[#ece7db]",
                  ].join(" ")}
                  key={offerId}
                  onClick={() => setSelectedOffer(offerId)}
                  type="button"
                >
                  {item.price}
                </button>
              )
            })}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <article className="rounded-[24px] border border-[#d7ddd2] bg-[linear-gradient(180deg,#fffef9,#f7f3ea)] p-6">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#8c6a44]">{offer.tag}</p>
              <h2 className="mt-3 font-serif text-[clamp(28px,4vw,40px)] leading-[1.04] tracking-[-0.025em] text-[#1a2a22]">
                {offer.title}
              </h2>
              <p className="mt-3 font-serif text-[28px] italic leading-none text-[#173a2e]">{offer.price}</p>
              <p className="mt-5 max-w-[520px] font-serif text-[17px] italic leading-[1.6] text-[#3d4d43]">{offer.detail}</p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[18px] border border-[#d7ddd2] bg-[#fffef9] px-4 py-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[#8a8578]">Ce que tu vends</p>
                  <p className="mt-2 font-serif text-[15px] italic leading-[1.55] text-[#3d4d43]">{offer.meta}</p>
                </div>
                <div className="rounded-[18px] border border-[#d7ddd2] bg-[#fffef9] px-4 py-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[#8a8578]">Usage terrain</p>
                  <p className="mt-2 font-serif text-[15px] italic leading-[1.55] text-[#3d4d43]">{offer.note}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <a href={offer.href} rel="noreferrer" target="_blank">
                  <Button size="lg">Ouvrir le paiement</Button>
                </a>
                <a
                  className="inline-flex h-12 items-center justify-center rounded-full border border-[#d6dcd3] bg-[#f5f2eb] px-6 text-sm font-medium text-[#173a2e] transition hover:border-[#b8c3b5] hover:bg-[#f1eee5]"
                  href={offer.href}
                >
                  Copier / partager le lien
                </a>
              </div>
            </article>

            <aside className="rounded-[24px] border border-[#d7ddd2] bg-[#fffef9] p-6">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#8c6a44]">QR de close</p>
              <div className="mt-5 rounded-[18px] border border-[#d7ddd2] bg-[#fffef9] p-4">
                <div className="relative mx-auto flex h-[280px] w-[280px] items-center justify-center rounded-[16px] border border-[#d7ddd2] bg-[#fffef9] p-3">
                  <canvas className="h-full w-full" ref={canvasRef} />
                </div>
              </div>
              <p className="mt-4 font-serif text-[15px] italic leading-[1.6] text-[#3d4d43]">
                Montre ce QR seulement quand le lieu est décidé. Sinon, renvoie plutôt vers <em>/commencer</em>.
              </p>
            </aside>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {(["starter", "season"] as OfferId[]).map((offerId) => {
              const item = OFFERS[offerId]
              const active = selectedOffer === offerId
              return (
                <button
                  className={[
                    "rounded-[20px] border px-5 py-5 text-left transition",
                    active
                      ? "border-[#173a2e] bg-[rgba(23,58,46,0.04)]"
                      : "border-[#d7ddd2] bg-[#fffef9] hover:border-[#b8c3b5] hover:bg-[#faf7f0]",
                  ].join(" ")}
                  key={offerId}
                  onClick={() => setSelectedOffer(offerId)}
                  type="button"
                >
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[#8c6a44]">{item.tag}</p>
                  <p className="mt-2 font-serif text-[26px] leading-none text-[#173a2e]">{item.price}</p>
                  <p className="mt-3 font-serif text-[15px] italic leading-[1.55] text-[#3d4d43]">{item.detail}</p>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </main>
  )
}
