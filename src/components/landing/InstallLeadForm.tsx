"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"

import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton"
import { trackEvent } from "@/lib/analytics"
import { createClientSupabaseBrowser } from "@/lib/supabase/client"
import { Button, Card, Input } from "@/ui"

type EntryMode = "commerce" | "creator" | "experience"

type InstallLeadFormProps = {
  entryMode?: EntryMode
}

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

export function InstallLeadForm({ entryMode = "commerce" }: InstallLeadFormProps) {
  const callbackOptions = useMemo(() => createCallbackOptions(), [])
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [checkingSession, setCheckingSession] = useState(true)
  const [state, setState] = useState<LeadSubmitState>({ status: "idle" })
  const [formData, setFormData] = useState({
    name: "",
    callbackSlot: callbackOptions[0],
    entryMode,
  })

  useEffect(() => {
    setFormData((prev) => ({ ...prev, entryMode }))
  }, [entryMode])

  useEffect(() => {
    const supabase = createClientSupabaseBrowser()

    const loadSession = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      setUserEmail(user?.email ?? null)
      setCheckingSession(false)
    }

    loadSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUserEmail(user?.email ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

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

      if (response.status === 401) {
        setState({
          status: "error",
          message: "Entrée instantanée avec Google requise pour activer Cardin.",
        })
        return
      }

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
        callbackSlot: formData.callbackSlot,
        entryMode: formData.entryMode,
      })
    } catch {
      setState({
        status: "error",
        message: "Impossible d'activer votre espace pour le moment. Réessayez dans quelques minutes.",
      })
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-14" id="installation">
      <Card className="border-[#C7D0C4] bg-gradient-to-b from-[#FCFCF8] to-[#F3F5EE] p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-[#637067]">Activation</p>
            <h2 className="mt-2 font-serif text-4xl text-[#173A2E]">Activer Cardin</h2>
            <p className="mt-3 text-sm text-[#536057]">Votre système de retour, en place en 24h.</p>

            <div className="mt-6 rounded-2xl border border-[#D2D9CF] bg-[#FEFDF9] p-4">
              <p className="text-sm text-[#173A2E]">119€ — installation complète</p>
              <p className="mt-1 text-sm text-[#173A2E]">39€/mois — moteur actif</p>
              <p className="mt-2 text-xs text-[#5A645D]">Un retour par jour couvre largement Cardin.</p>
            </div>

            {state.status === "success" ? (
              <div className="mt-6 rounded-2xl border border-[#B5C7B5] bg-[#EDF5EA] p-4 text-sm text-[#173A2E]">
                <p className="font-medium">Cardin ID: {state.merchantId}</p>
                <p className="mt-1">{state.confirmation}</p>

                <img alt="QR Cardin" className="mt-4 w-full max-w-[220px] rounded-xl border border-[#C4D2C4] bg-white p-2" src={state.qrCodeUrl} />

                <div className="mt-4 space-y-2 text-xs">
                  <a className="block underline" href={state.dashboardUrl} target="_blank">
                    Ouvrir le tableau Cardin
                  </a>
                  <a className="block underline" href={state.scanUrl} target="_blank">
                    Ouvrir le parcours client
                  </a>
                  <a className="block underline" download={`qr-${state.merchantId}.png`} href={state.qrCodeUrl}>
                    Télécharger le QR PNG
                  </a>
                </div>
              </div>
            ) : null}
          </div>

          {checkingSession ? (
            <div className="rounded-2xl border border-[#D8DBD2] bg-[#FFFDF8] p-6 text-sm text-[#5A645D]">Vérification de la session...</div>
          ) : userEmail ? (
            <form className="space-y-3" onSubmit={onSubmit}>
              <Input
                onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Nom de votre activité"
                required
                value={formData.name}
              />

              <Input disabled value={userEmail} />

              <select
                className="h-11 w-full rounded-2xl border border-[#D8DBD2] bg-[#FFFDF8] px-3 text-sm text-[#132B22]"
                onChange={(event) => setFormData((prev) => ({ ...prev, entryMode: event.target.value as EntryMode }))}
                value={formData.entryMode}
              >
                <option value="commerce">Mode Commerce</option>
                <option value="creator">Mode Creator / Community</option>
                <option value="experience">Mode Experience / Brand</option>
              </select>

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
                {state.status === "loading" ? "Activation en cours..." : "Activer Cardin"}
              </Button>

              {state.status === "error" ? <p className="text-sm text-[#A64040]">{state.message}</p> : null}
            </form>
          ) : (
            <div className="rounded-2xl border border-[#D8DBD2] bg-[#FFFDF8] p-6">
              <p className="text-sm text-[#556159]">Entrée instantanée avec Google. Activation simple. Aucun outil à apprendre.</p>
              <div className="mt-4">
                <GoogleSignInButton nextPath="/landing#installation" />
              </div>
            </div>
          )}
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
