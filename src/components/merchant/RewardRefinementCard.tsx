"use client"

import { useState } from "react"

import { Button, Card } from "@/ui"

export type UsageFrame = "free" | "specific_hours" | "reserved" | "accompanied"

export type RewardRefinement = {
  productLabel: string
  publicPriceEur: number | null
  costEur: number | null
  usageFrame: UsageFrame
  updatedAt?: string
}

const USAGE_FRAME_OPTIONS: Array<{ id: UsageFrame; label: string; sub: string }> = [
  { id: "free",           label: "Libre — toutes heures",  sub: "Utilisable quand le client le souhaite" },
  { id: "specific_hours", label: "Heures spécifiques",     sub: "Uniquement sur les créneaux définis" },
  { id: "reserved",       label: "Sur réservation",        sub: "Le client doit réserver à l'avance" },
  { id: "accompanied",    label: "Avec accompagnement",    sub: "Le client doit venir accompagné" },
]

type Props = {
  initial: RewardRefinement | null
}

function formatPrice(value: number | null): string {
  if (value === null) return ""
  return String(value)
}

export function RewardRefinementCard({ initial }: Props) {
  const [open, setOpen] = useState<boolean>(!initial)
  const [productLabel, setProductLabel] = useState<string>(initial?.productLabel ?? "")
  const [publicPrice, setPublicPrice] = useState<string>(formatPrice(initial?.publicPriceEur ?? null))
  const [cost, setCost] = useState<string>(formatPrice(initial?.costEur ?? null))
  const [usageFrame, setUsageFrame] = useState<UsageFrame>(initial?.usageFrame ?? "free")
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSave = async () => {
    if (!productLabel.trim() || status === "saving") return
    setStatus("saving")
    setErrorMessage(null)
    try {
      const res = await fetch("/api/parcours/refinement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productLabel: productLabel.trim(),
          publicPriceEur: publicPrice === "" ? null : publicPrice,
          costEur: cost === "" ? null : cost,
          usageFrame,
        }),
      })
      const data = (await res.json()) as { ok: boolean; error?: string }
      if (data.ok) {
        setStatus("saved")
        setTimeout(() => setStatus("idle"), 2200)
        setOpen(false)
      } else {
        setErrorMessage(data.error ?? "save_failed")
        setStatus("error")
      }
    } catch {
      setErrorMessage("network_error")
      setStatus("error")
    }
  }

  const usageLabel = USAGE_FRAME_OPTIONS.find((o) => o.id === usageFrame)?.label ?? "—"
  const hasAny = initial || productLabel.trim()

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.12em] text-[#5F6B62]">Affiner la récompense</p>
          <p className="mt-1 text-[11px] text-[#7B8581]">
            Ancrez votre récompense dans un vrai produit. Facultatif — améliore le calcul.
          </p>
        </div>
        {!open ? (
          <Button onClick={() => setOpen(true)} size="sm" variant="subtle">
            {hasAny ? "Modifier" : "Affiner"}
          </Button>
        ) : null}
      </div>

      {!open && initial ? (
        <dl className="mt-5 divide-y divide-[#E7E2D6]">
          <div className="flex items-baseline justify-between gap-4 py-2.5">
            <dt className="text-xs uppercase tracking-[0.08em] text-[#5F6B62]">Produit associé</dt>
            <dd className="text-right text-sm text-[#173A2E]">{initial.productLabel}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4 py-2.5">
            <dt className="text-xs uppercase tracking-[0.08em] text-[#5F6B62]">Prix public indicatif</dt>
            <dd className="text-right text-sm text-[#173A2E]">{initial.publicPriceEur != null ? `${initial.publicPriceEur} €` : "—"}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4 py-2.5">
            <dt className="text-xs uppercase tracking-[0.08em] text-[#5F6B62]">Coût indicatif pour le lieu</dt>
            <dd className="text-right text-sm text-[#173A2E]">{initial.costEur != null ? `${initial.costEur} €` : "—"}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4 py-2.5">
            <dt className="text-xs uppercase tracking-[0.08em] text-[#5F6B62]">Cadre d&apos;utilisation</dt>
            <dd className="text-right text-sm text-[#173A2E]">{usageLabel}</dd>
          </div>
        </dl>
      ) : null}

      {open ? (
        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="text-xs uppercase tracking-[0.08em] text-[#5F6B62]">Produit ou service associé</span>
            <input
              className="mt-1.5 w-full rounded-[1rem] border border-[#D8DED4] bg-[#FFFEFA] px-3 py-2.5 text-sm text-[#173A2E] placeholder-[#B0BAB4] focus:border-[#173A2E] focus:outline-none"
              maxLength={120}
              onChange={(e) => setProductLabel(e.target.value)}
              placeholder="Ex. Latte signature, Menu dégustation, Soin complet"
              type="text"
              value={productLabel}
            />
          </label>

          <div className="rounded-[1rem] border border-[#E7E2D6] bg-[#F8F6F0] px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.1em] text-[#7B8581]">Exemple</p>
            <p className="mt-1.5 text-[12.5px] leading-[1.55] text-[#3E4A44]">
              Le client revient 3 fois <span className="text-[#7B8581]">→</span> débloque un espresso.
              <br />
              S&apos;il vient accompagné <span className="text-[#7B8581]">→</span> il peut inviter une personne.
              <br />
              <span className="text-[#355246]">→ vous remplissez vos heures calmes et créez du passage.</span>
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs uppercase tracking-[0.08em] text-[#5F6B62]">Prix public indicatif (€)</span>
              <input
                className="mt-1.5 w-full rounded-[1rem] border border-[#D8DED4] bg-[#FFFEFA] px-3 py-2.5 text-sm text-[#173A2E] placeholder-[#B0BAB4] focus:border-[#173A2E] focus:outline-none"
                inputMode="decimal"
                onChange={(e) => setPublicPrice(e.target.value)}
                placeholder="Ex. 4,50"
                type="text"
                value={publicPrice}
              />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-[0.08em] text-[#5F6B62]">Coût pour le lieu (€)</span>
              <input
                className="mt-1.5 w-full rounded-[1rem] border border-[#D8DED4] bg-[#FFFEFA] px-3 py-2.5 text-sm text-[#173A2E] placeholder-[#B0BAB4] focus:border-[#173A2E] focus:outline-none"
                inputMode="decimal"
                onChange={(e) => setCost(e.target.value)}
                placeholder="Ex. 1,20"
                type="text"
                value={cost}
              />
            </label>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.08em] text-[#5F6B62]">Cadre d&apos;utilisation</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {USAGE_FRAME_OPTIONS.map((opt) => {
                const selected = usageFrame === opt.id
                return (
                  <button
                    className={`rounded-[1rem] border px-3 py-2.5 text-left transition ${
                      selected
                        ? "border-[#173A2E] bg-[#EEF3EC]"
                        : "border-[#D8DED4] bg-[#FFFEFA] hover:border-[#173A2E]/40 hover:bg-[#F8FAF6]"
                    }`}
                    key={opt.id}
                    onClick={() => setUsageFrame(opt.id)}
                    type="button"
                  >
                    <p className="text-sm font-medium text-[#173A2E]">{opt.label}</p>
                    <p className="mt-0.5 text-[11px] leading-4 text-[#6B766D]">{opt.sub}</p>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button disabled={!productLabel.trim() || status === "saving"} onClick={handleSave}>
              {status === "saving" ? "Enregistrement…" : "Enregistrer"}
            </Button>
            {initial ? (
              <Button onClick={() => setOpen(false)} variant="subtle">
                Annuler
              </Button>
            ) : null}
            {status === "saved" ? <span className="text-sm text-[#355246]">Enregistré.</span> : null}
            {status === "error" ? (
              <span className="text-sm text-[#A64040]">
                Impossible d&apos;enregistrer{errorMessage ? ` — ${errorMessage}` : ""}.
              </span>
            ) : null}
          </div>
        </div>
      ) : null}
    </Card>
  )
}
