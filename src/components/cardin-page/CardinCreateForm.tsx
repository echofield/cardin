"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"

import {
  buildCardinMerchantInput,
  buildCardinMerchantHref,
  buildCardinMerchantPath,
  CARDIN_CLIENTELE_OPTIONS,
  CARDIN_RETURN_RHYTHM_OPTIONS,
  CARDIN_WEAK_MOMENT_OPTIONS,
  generateMerchantSlug,
  getDefaultCreateSelection,
  type CardinClienteleId,
  type CardinReturnRhythmId,
  type CardinWeakMomentId,
} from "@/lib/cardin-page-data"
import { LANDING_WORLDS, type LandingWorldId } from "@/lib/landing-content"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/ui/button"

export function CardinCreateForm() {
  const router = useRouter()
  const [businessName, setBusinessName] = useState("")
  const [worldId, setWorldId] = useState<LandingWorldId>("cafe")
  const [weakMomentId, setWeakMomentId] = useState<CardinWeakMomentId>(getDefaultCreateSelection("cafe").weakMomentId)
  const [returnRhythmId, setReturnRhythmId] = useState<CardinReturnRhythmId>(getDefaultCreateSelection("cafe").returnRhythmId)
  const [clienteleId, setClienteleId] = useState<CardinClienteleId>(getDefaultCreateSelection("cafe").clienteleId)
  const [note, setNote] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const canSubmit = businessName.trim().length > 1

  const previewHref = useMemo(() => buildCardinMerchantPath(generateMerchantSlug(businessName.trim() || "Votre lieu")), [businessName])

  const handleWorldChange = (nextWorldId: LandingWorldId) => {
    const defaults = getDefaultCreateSelection(nextWorldId)
    setWorldId(nextWorldId)
    setWeakMomentId(defaults.weakMomentId)
    setReturnRhythmId(defaults.returnRhythmId)
    setClienteleId(defaults.clienteleId)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSubmit) return

    const payload = buildCardinMerchantInput({
      businessName: businessName.trim(),
      worldId,
      weakMomentId,
      returnRhythmId,
      clienteleId,
      note,
    })

    setSubmitting(true)
    try {
      const response = await fetch("/api/cardin/page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const data = (await response.json()) as { ok: boolean; url?: string }
        if (data.url) {
          router.push(data.url)
          return
        }
      }
    } catch {
      /* fallback below */
    } finally {
      setSubmitting(false)
    }

    router.push(
      buildCardinMerchantHref({
        businessName: businessName.trim(),
        worldId,
        weakMomentId,
        returnRhythmId,
        clienteleId,
        note,
      }),
    )
  }

  return (
    <form className="rounded-[1.8rem] border border-[#D7DDD2] bg-[#FFFEFA] p-6 shadow-[0_24px_60px_-42px_rgba(23,58,46,0.22)] sm:p-8" onSubmit={handleSubmit}>
      <div className="grid gap-5 lg:grid-cols-2">
        <Field label="Nom du lieu">
          <input
            className="h-12 w-full rounded-2xl border border-[#D7DDD2] bg-[#FBF9F3] px-4 text-sm text-[#173328] outline-none transition focus:border-[#173A2E]"
            onChange={(event) => setBusinessName(event.target.value)}
            placeholder="Café des Angles"
            value={businessName}
          />
        </Field>

        <Field label="Type de lieu">
          <select
            className="h-12 w-full rounded-2xl border border-[#D7DDD2] bg-[#FBF9F3] px-4 text-sm text-[#173328] outline-none transition focus:border-[#173A2E]"
            onChange={(event) => handleWorldChange(event.target.value as LandingWorldId)}
            value={worldId}
          >
            {Object.entries(LANDING_WORLDS).map(([id, world]) => (
              <option key={id} value={id}>
                {world.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Moment faible">
          <select
            className="h-12 w-full rounded-2xl border border-[#D7DDD2] bg-[#FBF9F3] px-4 text-sm text-[#173328] outline-none transition focus:border-[#173A2E]"
            onChange={(event) => setWeakMomentId(event.target.value as CardinWeakMomentId)}
            value={weakMomentId}
          >
            {CARDIN_WEAK_MOMENT_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Rythme de retour">
          <select
            className="h-12 w-full rounded-2xl border border-[#D7DDD2] bg-[#FBF9F3] px-4 text-sm text-[#173328] outline-none transition focus:border-[#173A2E]"
            onChange={(event) => setReturnRhythmId(event.target.value as CardinReturnRhythmId)}
            value={returnRhythmId}
          >
            {CARDIN_RETURN_RHYTHM_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Clientèle dominante">
          <select
            className="h-12 w-full rounded-2xl border border-[#D7DDD2] bg-[#FBF9F3] px-4 text-sm text-[#173328] outline-none transition focus:border-[#173A2E]"
            onChange={(event) => setClienteleId(event.target.value as CardinClienteleId)}
            value={clienteleId}
          >
            {CARDIN_CLIENTELE_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Observation libre">
          <textarea
            className="min-h-[7rem] w-full rounded-2xl border border-[#D7DDD2] bg-[#FBF9F3] px-4 py-3 text-sm text-[#173328] outline-none transition focus:border-[#173A2E]"
            onChange={(event) => setNote(event.target.value)}
            placeholder="Le samedi marche déjà seul. Le mardi porte la vraie reprise."
            value={note}
          />
        </Field>
      </div>

      <div className="mt-6 rounded-[1.4rem] border border-[#E2DDD1] bg-[#FBF9F3] p-5">
        <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">Ce que la page va ouvrir</p>
        <p className="mt-3 text-sm leading-7 text-[#203B31]">
          Une lecture du lieu, des scénarios concrets, une première saison cadrée et la même URL avant ou après la réservation.
        </p>
        <p className="mt-3 text-xs leading-6 text-[#6A726B]">{previewHref}</p>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-[#556159]">Cardin lit le lieu, ouvre la page, puis garde la même base pour la démo et la suite.</p>
        <button
          className={cn(buttonVariants({ variant: "primary", size: "md" }), "justify-center")}
          disabled={!canSubmit || submitting}
          type="submit"
        >
          {submitting ? "Ouverture..." : "Ouvrir la page Cardin"}
        </button>
      </div>
    </form>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.16em] text-[#6D776F]">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  )
}
