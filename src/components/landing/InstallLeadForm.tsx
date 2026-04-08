"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"

import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton"
import { trackEvent } from "@/lib/analytics"
import { createClientSupabaseBrowser } from "@/lib/supabase/client"
import { Button, Card, Input } from "@/ui"

type EntryMode = "commerce" | "creator" | "experience"
type MidpointMode = "recognition_only" | "recognition_plus_boost"

type InstallLeadFormProps = {
  entryMode?: EntryMode
  activityTemplateId?: string
  targetVisits?: number
  rewardLabel?: string
  midpointMode?: MidpointMode
  seasonLength?: 3 | 6
  summitId?: string
  summitTitle?: string
  scenarioId?: string
  scenarioLabel?: string
  embedded?: boolean
  title?: string
  description?: string
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
      setup?: {
        targetVisits: number
        rewardLabel: string
        objective: number
        activeWindowDays: number
        unlockedOffer: string
        midpointMode: MidpointMode
        seasonLength: 3 | 6
        summitId: string
        summitTitle: string
        scenarioId: string
        scenarioLabel: string
      }
    }

export function InstallLeadForm({
  entryMode = "commerce",
  activityTemplateId = "boulangerie",
  targetVisits = 10,
  rewardLabel = "1 recompense offerte",
  midpointMode = "recognition_only",
  seasonLength = 3,
  summitId = "default-summit",
  summitTitle = "Privilege de saison",
  scenarioId = "starting_loop",
  scenarioLabel = "Scenario Cardin",
  embedded = false,
  title = "Lancer votre carte en boutique",
  description = "Connexion simple, configuration claire, QR pret en quelques minutes.",
}: InstallLeadFormProps) {
  const callbackOptions = useMemo(() => createCallbackOptions(), [])
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [checkingSession, setCheckingSession] = useState(true)
  const [showNetworkOptions, setShowNetworkOptions] = useState(false)
  const [state, setState] = useState<LeadSubmitState>({ status: "idle" })

  const [formData, setFormData] = useState({
    name: "",
    callbackSlot: callbackOptions[0],
    entryMode,
    activityTemplateId,
    targetVisits,
    rewardLabel,
    midpointMode,
    seasonLength,
    summitId,
    summitTitle,
    scenarioId,
    scenarioLabel,
    sharedUnlockObjective: 120,
    sharedUnlockWindowDays: 7,
    sharedUnlockOffer: "Offre collective de la semaine",
  })

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      entryMode,
      activityTemplateId,
      targetVisits,
      rewardLabel,
      midpointMode,
      seasonLength,
      summitId,
      summitTitle,
      scenarioId,
      scenarioLabel,
    }))
  }, [activityTemplateId, entryMode, midpointMode, rewardLabel, seasonLength, summitId, summitTitle, scenarioId, scenarioLabel, targetVisits])

  useEffect(() => {
    const supabase = createClientSupabaseBrowser()

    const loadSession = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      setUserEmail(user?.email ?? null)
      setCheckingSession(false)
    }

    void loadSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUserEmail(user?.email ?? null)
      setCheckingSession(false)
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
          message: "Connexion Google requise pour lancer Cardin.",
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
        setup: payload.setup,
      })

      trackEvent("submit_lead", {
        callbackSlot: formData.callbackSlot,
        entryMode: formData.entryMode,
        activityTemplateId: formData.activityTemplateId,
        targetVisits: formData.targetVisits,
        midpointMode: formData.midpointMode,
        sharedUnlockObjective: formData.sharedUnlockObjective,
        sharedUnlockWindowDays: formData.sharedUnlockWindowDays,
        seasonLength: formData.seasonLength,
        summitId: formData.summitId,
        scenarioId: formData.scenarioId,
        scenarioLabel: formData.scenarioLabel,
      })
    } catch {
      setState({
        status: "error",
        message: "Impossible de lancer votre espace pour le moment. Reessayez dans quelques minutes.",
      })
    }
  }

  const summary = (
    <div className="rounded-2xl border border-[#D2D9CF] bg-[#FEFDF9] p-4">
      <p className="text-xs uppercase tracking-[0.12em] text-[#5C655E]">Programme retenu</p>
      <p className="mt-2 text-sm text-[#173A2E]">
        {formData.targetVisits} passages {"->"} {formData.rewardLabel}
      </p>
      <p className="mt-1 text-sm text-[#556159]">
        {formData.midpointMode === "recognition_plus_boost" ? "Cap intermediaire: reconnaissance + boost" : "Cap intermediaire: reconnaissance uniquement"}
      </p>
      <p className="mt-1 text-sm text-[#556159]">Saison: {formData.seasonLength} mois</p>
      <p className="mt-1 text-sm text-[#556159]">Scenario: {formData.scenarioLabel}</p>
      <p className="mt-1 text-sm text-[#556159]">Sommet: {formData.summitTitle}</p>
      <button
        className="mt-3 text-xs font-medium text-[#173A2E] underline-offset-2 hover:underline"
        onClick={() => setShowNetworkOptions((prev) => !prev)}
        type="button"
      >
        {showNetworkOptions ? "Masquer les options reseau" : "Afficher les options reseau"}
      </button>

      {showNetworkOptions ? (
        <div className="mt-4 space-y-3 border-t border-[#E0E4DB] pt-4">
          <div>
            <label className="block text-xs uppercase tracking-[0.12em] text-[#5A645D]">Objectif collectif (passages / mois)</label>
            <Input
              min={20}
              onChange={(event) => setFormData((prev) => ({ ...prev, sharedUnlockObjective: Number(event.target.value) || 120 }))}
              type="number"
              value={formData.sharedUnlockObjective}
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-[0.12em] text-[#5A645D]">Fenetre active (jours)</label>
            <Input
              min={3}
              onChange={(event) => setFormData((prev) => ({ ...prev, sharedUnlockWindowDays: Number(event.target.value) || 7 }))}
              type="number"
              value={formData.sharedUnlockWindowDays}
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-[0.12em] text-[#5A645D]">Offre debloquee</label>
            <Input onChange={(event) => setFormData((prev) => ({ ...prev, sharedUnlockOffer: event.target.value }))} value={formData.sharedUnlockOffer} />
          </div>
        </div>
      ) : null}
    </div>
  )

  const successBlock = state.status === "success" ? (
    <div className="rounded-2xl border border-[#B5C7B5] bg-[#EDF5EA] p-4 text-sm text-[#173A2E]">
      <p className="font-medium">{state.confirmation}</p>
      <p className="mt-1">Cardin ID: {state.merchantId}</p>

      {state.setup ? (
        <div className="mt-3 space-y-1 text-xs text-[#2A3F35]">
          <p>{state.setup.targetVisits} passages {"->"} {state.setup.rewardLabel}</p>
          <p>{state.setup.midpointMode === "recognition_plus_boost" ? "Cap intermediaire : boost actif" : "Cap intermediaire : reconnaissance uniquement"}</p>
          <p>Saison : {state.setup.seasonLength} mois</p>
          <p>Scenario : {state.setup.scenarioLabel}</p>
          <p>Sommet : {state.setup.summitTitle}</p>
          <p>Objectif collectif: {state.setup.objective} passages/mois</p>
          <p>Fenetre active: {state.setup.activeWindowDays} jours</p>
        </div>
      ) : null}

      <img alt="QR Cardin" className="mt-4 w-full max-w-[220px] rounded-xl border border-[#C4D2C4] bg-white p-2" src={state.qrCodeUrl} />

      <div className="mt-4 space-y-2 text-xs">
        <a className="block underline" href={state.dashboardUrl} rel="noreferrer" target="_blank">
          Ouvrir le tableau Cardin
        </a>
        <a className="block underline" href={state.scanUrl} rel="noreferrer" target="_blank">
          Ouvrir le parcours client
        </a>
        <a className="block underline" download={`qr-${state.merchantId}.png`} href={state.qrCodeUrl}>
          Telecharger le QR PNG
        </a>
      </div>
    </div>
  ) : null

  const formBlock = checkingSession ? (
    <div className="rounded-2xl border border-[#D8DBD2] bg-[#FFFDF8] p-6 text-sm text-[#5A645D]">Verification de la session...</div>
  ) : userEmail ? (
    <form className="space-y-3" onSubmit={onSubmit}>
      <Input
        onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
        placeholder="Nom de votre activite"
        required
        value={formData.name}
      />

      <Input disabled value={userEmail} />

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
        {state.status === "loading" ? "Activation en cours..." : "Lancer ma carte"}
      </Button>

      {state.status === "error" ? <p className="text-sm text-[#A64040]">{state.message}</p> : null}
      {successBlock}
    </form>
  ) : (
    <div className="rounded-2xl border border-[#D8DBD2] bg-[#FFFDF8] p-6">
      <p className="text-sm text-[#556159]">Connexion Google. Activation simple. Aucun outil a apprendre.</p>
      <div className="mt-4">
        <GoogleSignInButton nextPath="/engine#installation" />
      </div>
    </div>
  )

  if (embedded) {
    return (
      <Card className="border-[#C7D0C4] bg-gradient-to-b from-[#FCFCF8] to-[#F3F5EE] p-6 sm:p-8" id="installation">
        <p className="text-xs uppercase tracking-[0.14em] text-[#637067]">Activation</p>
        <h3 className="mt-2 font-serif text-3xl text-[#173A2E]">{title}</h3>
        <p className="mt-3 text-sm text-[#536057]">{description}</p>
        <div className="mt-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div>{summary}</div>
          <div>{formBlock}</div>
        </div>
      </Card>
    )
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-14" id="installation">
      <Card className="border-[#C7D0C4] bg-gradient-to-b from-[#FCFCF8] to-[#F3F5EE] p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-[#637067]">Activation</p>
            <h2 className="mt-2 font-serif text-4xl text-[#173A2E]">{title}</h2>
            <p className="mt-3 text-sm text-[#536057]">{description}</p>
            <div className="mt-6">{summary}</div>
          </div>
          <div>{formBlock}</div>
        </div>
      </Card>
    </section>
  )
}

function createCallbackOptions() {
  const now = new Date()
  const slots = ["10h-12h", "12h-14h", "14h-16h", "16h-18h"]

  const formatDay = (date: Date) => {
    try {
      const formatter = new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "2-digit", month: "2-digit" })
      return formatter.format(date)
    } catch {
      return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`
    }
  }

  return Array.from({ length: 3 }).flatMap((_, index) => {
    const date = new Date(now)
    date.setDate(now.getDate() + index)

    return slots.map((slot) => `${formatDay(date)} · ${slot}`)
  })
}
