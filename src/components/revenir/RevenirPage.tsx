"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useReducedMotion } from "framer-motion"
import { gsap } from "gsap"

type ApiResponse = {
  ok?: boolean
  resumeUrl?: string
  offerUrl?: string
  contactType?: "whatsapp" | "email"
  recoveryUrl?: string | null
  recoveryState?: "activation" | "projection" | "paid" | null
  hasPaidCheckout?: boolean
  fallbackMailto?: string
  error?: string
}

export function RevenirPage({ source }: { source?: string | null }) {
  const reducedMotion = useReducedMotion()
  const [contactType, setContactType] = useState<"whatsapp" | "email">("whatsapp")
  const [businessName, setBusinessName] = useState("")
  const [contactValue, setContactValue] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fallbackMailto, setFallbackMailto] = useState<string | null>(null)
  const [recoveryUrl, setRecoveryUrl] = useState<string | null>(null)
  const [recoveryState, setRecoveryState] = useState<"activation" | "projection" | "paid" | null>(null)

  const successLine = useMemo(() => {
    if (!businessName.trim()) {
      return "Vous pouvez reprendre votre lecture Cardin ou activer votre première saison maintenant."
    }

    return `Bonjour ${businessName.trim()}. Vous pouvez reprendre votre lecture Cardin ou activer votre première saison maintenant.`
  }, [businessName])

  useEffect(() => {
    if (reducedMotion) {
      const introTargets = document.querySelectorAll<HTMLElement>(
        "[data-revenir-glyph], [data-revenir-title], [data-revenir-subtitle], [data-revenir-form], [data-revenir-links]",
      )
      introTargets.forEach((node) => {
        node.style.opacity = "1"
        node.style.transform = "none"
      })
      return
    }

    const particles = document.querySelectorAll<HTMLElement>("[data-revenir-particle]")
    const glyphRing = document.querySelector<HTMLElement>("[data-revenir-ring]")
    const glyphOuter = document.querySelector<HTMLElement>("[data-revenir-ring-outer]")

    const particleTweens = Array.from(particles).map((particle, index) =>
      gsap.to(particle, {
        y: -24 - (index % 4) * 10,
        x: (index % 2 === 0 ? 1 : -1) * (8 + (index % 5) * 4),
        opacity: 0.18 + (index % 3) * 0.08,
        duration: 7 + (index % 5),
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: index * 0.1,
      }),
    )

    const intro = gsap.timeline({ delay: 0.15 })
    intro
      .from("[data-revenir-glyph]", { opacity: 0, y: 8, duration: 0.7, ease: "power2.out" })
      .from("[data-revenir-title]", { opacity: 0, y: 8, duration: 0.65, ease: "power2.out" }, "-=0.4")
      .from("[data-revenir-subtitle]", { opacity: 0, y: 8, duration: 0.6, ease: "power2.out" }, "-=0.35")
      .from("[data-revenir-form]", { opacity: 0, y: 8, duration: 0.7, ease: "power2.out" }, "-=0.3")
      .from("[data-revenir-links]", { opacity: 0, duration: 0.5, ease: "power2.out" }, "-=0.25")

    const ringTween = glyphRing
      ? gsap.to(glyphRing, {
          scale: 1.08,
          opacity: 0.5,
          duration: 2.8,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        })
      : null

    const outerTween = glyphOuter
      ? gsap.to(glyphOuter, {
          rotation: 360,
          duration: 35,
          repeat: -1,
          ease: "none",
          transformOrigin: "center",
        })
      : null

    return () => {
      intro.kill()
      ringTween?.kill()
      outerTween?.kill()
      particleTweens.forEach((tween) => tween.kill())
    }
  }, [reducedMotion])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (loading) return

    setLoading(true)
    setError(null)
    setFallbackMailto(null)

    try {
      const response = await fetch("/api/revenir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          contactType,
          contactValue,
          source,
        }),
      })

      const payload = (await response.json()) as ApiResponse

      if (!response.ok || !payload.ok) {
        setFallbackMailto(payload.fallbackMailto ?? null)
        throw new Error(payload.error ?? "submit_failed")
      }

      setRecoveryUrl(payload.recoveryUrl ?? null)
      setRecoveryState(payload.recoveryState ?? null)
      setSuccess(true)
    } catch (submitError) {
      setError(resolveErrorMessage(submitError))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#f2ede4] text-[#1a2a22]">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        {Array.from({ length: 16 }).map((_, index) => (
          <span
            className="absolute h-[2px] w-[2px] rounded-full bg-[#b8956a] opacity-0"
            data-revenir-particle
            key={index}
            style={{
              left: `${8 + ((index * 11) % 84)}%`,
              top: `${8 + ((index * 17) % 78)}%`,
            }}
          />
        ))}
      </div>

      <header className="fixed inset-x-0 top-0 z-20 flex justify-center bg-[linear-gradient(to_bottom,#f2ede4_70%,transparent)] px-5 py-5">
        <Link className="font-serif text-[14px] tracking-[0.32em] text-[#1a2a22] sm:text-[16px]" href="/">
          CARDIN
        </Link>
      </header>

      <section className="relative z-[2] flex min-h-dvh flex-col items-center justify-center px-5 pb-12 pt-24 text-center">
        {!success ? (
          <div className="w-full max-w-[480px]">
            <div className="mx-auto mb-9 flex h-16 w-16 items-center justify-center" data-revenir-glyph>
              <span className="absolute h-16 w-16 rounded-full border border-[#b8956a] opacity-35" data-revenir-ring />
              <span className="absolute h-[84px] w-[84px] rounded-full border border-dashed border-[#d4b892] opacity-40" data-revenir-ring-outer />
              <span className="font-serif text-2xl text-[#b8956a]">◇</span>
            </div>

            <h1 className="font-serif text-[clamp(38px,7vw,58px)] leading-[1.05] tracking-[-0.01em] text-[#1a2a22]" data-revenir-title>
              Revenir à <em className="italic text-[#0f3d2e]">Cardin.</em>
            </h1>

            <p className="mx-auto mt-4 max-w-[400px] font-serif text-[clamp(16px,2vw,19px)] italic leading-[1.5] text-[#3d4d43]" data-revenir-subtitle>
              Votre lecture peut reprendre ici.
            </p>

            <form className="mt-10 space-y-4 text-left" data-revenir-form onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-2 block text-[10px] uppercase tracking-[0.22em] text-[#8a8578]">Nom du lieu</span>
                <input
                  autoComplete="organization"
                  className="w-full rounded-[3px] border border-[#d4cdbd] bg-[#f2ede4] px-4 py-3.5 text-[15px] text-[#1a2a22] outline-none transition focus:border-[#0f3d2e] focus:shadow-[0_0_0_3px_rgba(15,61,46,0.08)]"
                  onChange={(event) => setBusinessName(event.target.value)}
                  placeholder="Le Comptoir des Abbesses"
                  required
                  value={businessName}
                />
              </label>

              <div>
                <span className="mb-2 block text-[10px] uppercase tracking-[0.22em] text-[#8a8578]">Comment vous joindre</span>
                <div className="mb-2 grid grid-cols-2 gap-2">
                  <button
                    className={toggleClass(contactType === "whatsapp")}
                    onClick={() => {
                      setContactType("whatsapp")
                      setContactValue("")
                    }}
                    type="button"
                  >
                    WhatsApp
                  </button>
                  <button
                    className={toggleClass(contactType === "email")}
                    onClick={() => {
                      setContactType("email")
                      setContactValue("")
                    }}
                    type="button"
                  >
                    E-mail
                  </button>
                </div>
                <input
                  autoComplete={contactType === "whatsapp" ? "tel" : "email"}
                  className="w-full rounded-[3px] border border-[#d4cdbd] bg-[#f2ede4] px-4 py-3.5 text-[15px] text-[#1a2a22] outline-none transition focus:border-[#0f3d2e] focus:shadow-[0_0_0_3px_rgba(15,61,46,0.08)]"
                  onChange={(event) => setContactValue(event.target.value)}
                  placeholder={contactType === "whatsapp" ? "06 00 00 00 00" : "vous@exemple.com"}
                  required
                  type={contactType === "whatsapp" ? "tel" : "email"}
                  value={contactValue}
                />
              </div>

              <button
                className="inline-flex w-full items-center justify-center gap-3 overflow-hidden rounded-[2px] border border-[#0f3d2e] bg-[#0f3d2e] px-6 py-4 text-[12px] uppercase tracking-[0.22em] text-[#f2ede4] transition hover:border-[#1a2a22] hover:bg-[#1a2a22] disabled:opacity-45"
                disabled={loading}
                type="submit"
              >
                <span>{loading ? "Enregistrement…" : "Recevoir mon accès Cardin"}</span>
                <span aria-hidden="true">→</span>
              </button>
            </form>

            {error ? <p className="mt-4 text-sm text-[#8c6a44]">{error}</p> : null}
            {fallbackMailto ? (
              <p className="mt-3 text-sm text-[#8a8578]">
                Si besoin, <a className="underline decoration-[#0f3d2e]/40 underline-offset-4 hover:text-[#0f3d2e]" href={fallbackMailto}>écrire directement à Cardin</a>.
              </p>
            ) : null}

            <div className="mt-8 flex items-center justify-center gap-4 text-[11px] uppercase tracking-[0.18em] text-[#8a8578]" data-revenir-links>
              <Link className="transition hover:text-[#0f3d2e]" href="/parcours/lecture">
                Voir la simulation
              </Link>
              <span className="h-[3px] w-[3px] rounded-full bg-[#8a8578]/50" />
              <Link className="transition hover:text-[#0f3d2e]" href="/parcours/offre">
                Activer ma première saison
              </Link>
            </div>

            <p className="mx-auto mt-14 max-w-[360px] font-serif text-sm italic leading-[1.6] text-[#8a8578]">
              Vos coordonnées servent uniquement à retrouver votre accès Cardin. WhatsApp est privilégié pour vous relancer proprement.
            </p>
          </div>
        ) : (
          <div className="w-full max-w-[480px]">
            <div className="mx-auto mb-8 flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(15,61,46,0.08)]">
              <svg className="h-6 w-6 text-[#0f3d2e]" fill="none" viewBox="0 0 24 24">
                <path d="M5 12l4 4L19 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </div>

            <h2 className="font-serif text-[clamp(34px,6vw,48px)] leading-[1.08] text-[#1a2a22]">
              Votre accès <em className="italic text-[#0f3d2e]">est prêt.</em>
            </h2>
            <p className="mx-auto mt-4 max-w-[380px] font-serif text-lg italic leading-[1.5] text-[#3d4d43]">{successLine}</p>

            <div className="mt-10 space-y-3">
              {recoveryUrl ? (
                <Link className={choiceClass(true)} href={recoveryUrl}>
                  <span className="flex flex-col items-start gap-1 text-left">
                    <span className="font-medium">
                      {recoveryState === "activation" ? "Retrouver ma page Cardin" : "Reprendre ma page Cardin"}
                    </span>
                    <span className="font-serif text-[13px] italic tracking-normal opacity-70">
                      {recoveryState === "activation" ? "Saison active" : "Brouillon sauvegardé"}
                    </span>
                  </span>
                  <span aria-hidden="true">→</span>
                </Link>
              ) : null}

              <Link className={choiceClass(false)} href="/parcours/lecture">
                <span className="flex flex-col items-start gap-1 text-left">
                  <span className="font-medium">Reprendre la simulation</span>
                  <span className="font-serif text-[13px] italic tracking-normal opacity-70">~3 minutes</span>
                </span>
                <span aria-hidden="true">→</span>
              </Link>

              {recoveryState !== "activation" ? (
                <Link className={choiceClass(!recoveryUrl)} href="/parcours/offre">
                  <span className="flex flex-col items-start gap-1 text-left">
                    <span className="font-medium">Activer ma saison</span>
                    <span className="font-serif text-[13px] italic tracking-normal opacity-70">490 € TTC · 90 jours</span>
                  </span>
                  <span aria-hidden="true">→</span>
                </Link>
              ) : null}
            </div>

            <p className="mt-8 border-t border-[#d4cdbd] pt-6 font-serif text-sm italic leading-[1.6] text-[#8a8578]">
              {contactType === "whatsapp"
                ? "Nous pouvons aussi vous relancer sur WhatsApp dans les 24 heures."
                : "Vous pouvez aussi répondre à l'e-mail que vous recevrez pour reprendre le sujet plus tard."}
            </p>
          </div>
        )}
      </section>
    </main>
  )
}

function toggleClass(active: boolean) {
  return [
    "rounded-[3px] border px-3 py-2.5 text-[11px] uppercase tracking-[0.14em] transition",
    active ? "border-[#0f3d2e] bg-[#0f3d2e] text-[#f2ede4]" : "border-[#d4cdbd] text-[#3d4d43] hover:border-[#0f3d2e] hover:text-[#0f3d2e]",
  ].join(" ")
}

function choiceClass(primary: boolean) {
  return [
    "flex w-full items-center justify-between gap-3 rounded-[3px] border px-5 py-4 text-[12px] uppercase tracking-[0.18em] transition",
    primary
      ? "border-[#0f3d2e] bg-[#0f3d2e] text-[#f2ede4] hover:border-[#1a2a22] hover:bg-[#1a2a22]"
      : "border-[#d4cdbd] bg-[#f2ede4] text-[#1a2a22] hover:border-[#0f3d2e] hover:bg-[rgba(15,61,46,0.03)]",
  ].join(" ")
}

function resolveErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "submit_failed"

  switch (message) {
    case "invalid_email":
      return "Cette adresse e-mail n'est pas valide."
    case "invalid_phone":
      return "Ce numéro WhatsApp n'est pas valide."
    case "email_not_configured":
      return "La capture n'est pas configurée côté Cardin pour le moment."
    default:
      return "Impossible d'enregistrer votre accès pour l'instant."
  }
}
