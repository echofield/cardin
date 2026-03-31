"use client"

import { FormEvent, useMemo, useState } from "react"

import { trackEvent } from "@/lib/analytics"
import { merchantTemplates } from "@/lib/merchant-templates"
import { Button, Card, Input } from "@/ui"

type LeadSubmitState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "success"
      leadId: string
      confirmation: string
      merchantId: string
      dashboardUrl: string
      scanUrl: string
      qrCodeUrl: string
    }

export function InstallLeadForm() {
  const callbackOptions = useMemo(() => createCallbackOptions(), [])
  const [state, setState] = useState<LeadSubmitState>({ status: "idle" })
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    businessType: merchantTemplates[0].label,
    city: "",
    callbackSlot: callbackOptions[0],
  })

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setState({ status: "loading" })

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const payload = await response.json()

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "submission_failed")
      }

      setState({
        status: "success",
        leadId: payload.leadId,
        confirmation: payload.confirmation,
        merchantId: payload.merchantId,
        dashboardUrl: payload.dashboardUrl,
        scanUrl: payload.scanUrl,
        qrCodeUrl: payload.qrCodeUrl,
      })

      trackEvent("submit_lead", {
        businessType: formData.businessType,
        callbackSlot: formData.callbackSlot,
        city: formData.city,
      })
    } catch {
      setState({
        status: "error",
        message: "Impossible d'envoyer la demande pour le moment. Réessayez dans quelques minutes.",
      })
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-14" id="installation">
      <Card className="border-[#C7D0C4] bg-gradient-to-b from-[#FCFCF8] to-[#F3F5EE] p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-[#637067]">Installation</p>
            <h2 className="mt-2 font-serif text-4xl text-[#173A2E]">Installation complète en 24h</h2>
            <p className="mt-3 text-sm text-[#536057]">
              Nous configurons votre carte, vos relances et votre QR. Vous choisissez juste votre créneau de rappel.
            </p>

            <div className="mt-6 rounded-2xl border border-[#D2D9CF] bg-[#FEFDF9] p-4">
              <p className="text-sm text-[#173A2E]">119€ — installation complète</p>
              <p className="mt-1 text-sm text-[#173A2E]">39€/mois</p>
              <p className="mt-2 text-xs text-[#5A645D]">Rentabilisé avec 1 client en plus par jour.</p>
            </div>

            {state.status === "success" ? (
              <div className="mt-6 rounded-2xl border border-[#B5C7B5] bg-[#EDF5EA] p-4 text-sm text-[#173A2E]">
                <p className="font-medium">Merchant ID: {state.merchantId}</p>
                <p className="mt-1">{state.confirmation}</p>

                <img alt="QR marchant" className="mt-4 w-full max-w-[220px] rounded-xl border border-[#C4D2C4] bg-white p-2" src={state.qrCodeUrl} />

                <div className="mt-4 space-y-2 text-xs">
                  <a className="block underline" href={state.dashboardUrl} target="_blank">
                    Ouvrir le tableau marchand
                  </a>
                  <a className="block underline" href={state.scanUrl} target="_blank">
                    Ouvrir le lien scan client
                  </a>
                  <a className="block underline" download={`qr-${state.merchantId}.png`} href={state.qrCodeUrl}>
                    Télécharger le QR PNG
                  </a>
                </div>
              </div>
            ) : null}
          </div>

          <form className="space-y-3" onSubmit={onSubmit}>
            <Input
              onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Nom du commerce"
              required
              value={formData.name}
            />
            <Input
              onChange={(event) => setFormData((prev) => ({ ...prev, phone: event.target.value }))}
              placeholder="Téléphone"
              required
              value={formData.phone}
            />

            <select
              className="h-11 w-full rounded-2xl border border-[#D8DBD2] bg-[#FFFDF8] px-3 text-sm text-[#132B22]"
              onChange={(event) => setFormData((prev) => ({ ...prev, businessType: event.target.value }))}
              value={formData.businessType}
            >
              {merchantTemplates.map((template) => (
                <option key={template.id} value={template.label}>
                  {template.label}
                </option>
              ))}
            </select>

            <Input
              onChange={(event) => setFormData((prev) => ({ ...prev, city: event.target.value }))}
              placeholder="Ville"
              required
              value={formData.city}
            />

            <select
              className="h-11 w-full rounded-2xl border border-[#D8DBD2] bg-[#FFFDF8] px-3 text-sm text-[#132B22]"
              onChange={(event) => setFormData((prev) => ({ ...prev, callbackSlot: event.target.value }))}
              value={formData.callbackSlot}
            >
              {callbackOptions.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>

            <Button className="w-full" size="lg" type="submit">
              {state.status === "loading" ? "Envoi en cours..." : "Installer maintenant"}
            </Button>

            {state.status === "error" ? <p className="text-sm text-[#A64040]">{state.message}</p> : null}
          </form>
        </div>
      </Card>
    </section>
  )
}

function createCallbackOptions() {
  const now = new Date()
  const formatter = new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "2-digit", month: "2-digit" })
  const slots = ["10h-12h", "12h-14h", "14h-16h", "16h-18h"]

  return Array.from({ length: 3 }).flatMap((_, index) => {
    const date = new Date(now)
    date.setDate(now.getDate() + index)

    return slots.map((slot) => `${formatter.format(date)} · ${slot}`)
  })
}
