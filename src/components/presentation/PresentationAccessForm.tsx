"use client"

import { useState, useTransition } from "react"

import { buttonVariants } from "@/ui"
import { cn } from "@/lib/utils"

export function PresentationAccessForm() {
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[radial-gradient(circle_at_top,rgba(15,61,46,0.07),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(184,149,106,0.12),transparent_32%),#f2ede4] px-6 py-10">
      <div className="mx-auto flex min-h-[calc(100dvh-5rem)] max-w-[1180px] flex-col justify-between">
        <div className="flex items-center justify-between text-[12px] uppercase tracking-[0.22em] text-[#8a8578]">
          <div className="font-serif text-[30px] tracking-[0.12em] text-[#003d2c]">CARDIN</div>
          <div>Présentation privée</div>
        </div>

        <section className="mx-auto grid w-full max-w-[1040px] gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:items-end">
          <div>
            <p className="mb-4 text-[11px] uppercase tracking-[0.28em] text-[#8a8578]">Accès protégé</p>
            <h1 className="font-serif text-[clamp(52px,8vw,96px)] leading-[0.95] tracking-[-0.03em] text-[#18271f]">
              Présentation <em className="font-medium italic text-[#003d2c]">Cardin.</em>
            </h1>
            <p className="mt-6 max-w-[680px] font-serif text-[clamp(22px,2.6vw,32px)] italic leading-[1.32] text-[#3d4d43]">
              Une lecture claire du moteur Cardin: problème, saison, modèle économique, distribution et vision.
            </p>
          </div>

          <div className="border border-[#ded9cf] bg-[rgba(255,253,248,0.84)] p-6 backdrop-blur-sm">
            <div className="mb-5 text-[11px] uppercase tracking-[0.24em] text-[#8a8578]">Mot de passe</div>
            <label className="block text-[11px] uppercase tracking-[0.18em] text-[#8a8578]" htmlFor="presentation-password">
              Accéder à la présentation
            </label>
            <input
              className="mt-3 w-full border border-[#ded9cf] bg-[#f9f6ef] px-4 py-3 text-[15px] text-[#18271f] outline-none transition focus:border-[#003d2c]"
              id="presentation-password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Mot de passe"
              type="password"
              value={password}
            />
            {error ? <p className="mt-3 text-sm text-[#8c6a44]">{error}</p> : null}

            <button
              className={cn(buttonVariants({ variant: "primary", size: "lg" }), "mt-5 w-full")}
              disabled={isPending}
              onClick={() => {
                setError(null)
                startTransition(async () => {
                  const response = await fetch("/api/presentation/auth", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: "unlock", password }),
                  })

                  if (!response.ok) {
                    const payload = (await response.json().catch(() => null)) as { error?: string } | null
                    setError(payload?.error ?? "Impossible d'ouvrir la présentation.")
                    return
                  }

                  window.location.reload()
                })
              }}
              type="button"
            >
              {isPending ? "Ouverture..." : "Ouvrir la présentation"}
            </button>

            <p className="mt-4 text-[11px] italic tracking-[0.08em] text-[#8a8578]">
              Le mot de passe peut être redéfini via <code className="font-mono">CARDIN_PRESENTATION_PASSWORD</code>.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
