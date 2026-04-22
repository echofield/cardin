"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { readInstallEntry } from "@/lib/card-install"
import { Button, Card } from "@/ui"

type InstallState =
  | { status: "loading" }
  | { status: "redirecting"; url: string; label?: string | null; businessName?: string | null }
  | { status: "empty" }

export function CardInstallHome() {
  const [state, setState] = useState<InstallState>({ status: "loading" })

  useEffect(() => {
    const entry = readInstallEntry()

    if (entry?.url) {
      setState({
        status: "redirecting",
        url: entry.url,
        label: entry.label,
        businessName: entry.businessName,
      })

      const timer = window.setTimeout(() => {
        window.location.replace(entry.url)
      }, 220)

      return () => window.clearTimeout(timer)
    }

    setState({ status: "empty" })
  }, [])

  return (
    <main className="min-h-dvh-safe bg-[radial-gradient(circle_at_top,rgba(15,61,46,0.08),transparent_34%),#F8F5ED] px-5 py-10 text-[#173A2E]">
      <div className="mx-auto max-w-md">
        <div className="rounded-[2rem] border border-[#D9D3C7] bg-[linear-gradient(180deg,#FFFDF8_0%,#FBF8F1_100%)] p-6 shadow-[0_34px_90px_-50px_rgba(23,58,46,0.45)]">
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#8C6A44]">Carte Cardin installée</p>

          {state.status === "loading" ? (
            <>
              <p className="mt-4 font-serif text-[2.25rem] leading-[1.02]">Ouverture de votre carte…</p>
              <p className="mt-3 text-sm leading-6 text-[#556159]">Nous retrouvons la dernière carte enregistrée sur ce téléphone.</p>
            </>
          ) : null}

          {state.status === "redirecting" ? (
            <>
              <p className="mt-4 font-serif text-[2.25rem] leading-[1.02]">On rouvre votre carte.</p>
              <p className="mt-3 text-sm leading-6 text-[#556159]">
                {state.businessName ? `${state.businessName} arrive en plein écran.` : "La dernière carte Cardin enregistrée arrive en plein écran."}
              </p>
            </>
          ) : null}

          {state.status === "empty" ? (
            <>
              <p className="mt-4 font-serif text-[2.25rem] leading-[1.02]">Aucune carte enregistrée ici.</p>
              <p className="mt-3 text-sm leading-6 text-[#556159]">Ouvrez d’abord une carte Cardin depuis un lieu, puis utilisez “Installer la carte”.</p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link href="/commencer">
                  <Button size="md" type="button">
                    Voir Cardin
                  </Button>
                </Link>
                <Link href="/">
                  <Button size="md" type="button" variant="secondary">
                    Retour site
                  </Button>
                </Link>
              </div>
            </>
          ) : null}

          {state.status !== "empty" ? (
            <Card className="mt-6 border-[#E6DED1] bg-[#FFFEFB] p-4">
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#7B837D]">Pass-like</p>
              <p className="mt-2 text-sm leading-6 text-[#556159]">
                La carte web reste le cœur vivant. L’installation sert juste à la rouvrir plus vite, avec un rendu plus propre sur téléphone.
              </p>
            </Card>
          ) : null}
        </div>
      </div>
    </main>
  )
}
