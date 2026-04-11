"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"

import { Button, Card } from "@/ui"

type PendingPayload = {
  ok: boolean
  pending: null | {
    sessionId: string
    cardId: string
    startedAt: string
    customerName: string
    stamps: number
    targetVisits: number
  }
}

export function MerchantValidatePanel({ merchantId }: { merchantId: string }) {
  const [pending, setPending] = useState<PendingPayload["pending"]>(null)
  const [loading, setLoading] = useState(true)
  const [actionState, setActionState] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const loadPending = useCallback(async () => {
    try {
      const res = await fetch("/api/merchant/pending-validation")
      const data = (await res.json()) as PendingPayload
      if (data.ok) {
        setPending(data.pending)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadPending()
    const t = setInterval(() => void loadPending(), 5000)
    return () => clearInterval(t)
  }, [loadPending])

  const onValidate = async () => {
    setActionState("loading")
    setMessage("")
    try {
      const res = await fetch("/api/merchant/validate-passage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        setActionState("error")
        setMessage(data.error === "no_pending_client" ? "Aucun client en cours." : data.message ?? data.error ?? "Erreur")
        return
      }
      setActionState("success")
      setMessage("Passage validé — la carte du client se met à jour.")
      await loadPending()
    } catch {
      setActionState("error")
      setMessage("Réseau indisponible.")
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6 px-4 py-10">
      <div>
        <p className="text-[11px] uppercase tracking-[0.2em] text-[#677168]">Validation</p>
        <h1 className="mt-3 font-serif text-3xl text-[#163328]">Client en cours</h1>
        <p className="mt-2 text-sm leading-7 text-[#556159]">
          Le client ne valide pas lui-même : vous confirmez le passage dans le lieu.
        </p>
      </div>

      <Card className="p-6">
        {loading ? (
          <p className="text-sm text-[#556159]">Chargement…</p>
        ) : pending ? (
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-[#5E6961]">Présence signalée</p>
            <p className="mt-2 font-serif text-2xl text-[#173A2E]">{pending.customerName}</p>
            <p className="mt-1 text-sm text-[#556159]">
              Progression carte : {pending.stamps} / {pending.targetVisits}
            </p>
            <p className="mt-3 text-xs text-[#69736C]">
              Depuis {new Date(pending.startedAt).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
            </p>
          </div>
        ) : (
          <p className="text-sm text-[#556159]">Aucun client en attente de validation pour le moment.</p>
        )}

        <Button className="mt-6 w-full" disabled={!pending || actionState === "loading"} onClick={() => void onValidate()} type="button">
          {actionState === "loading" ? "Validation…" : "Valider un passage"}
        </Button>

        {actionState === "success" ? <p className="mt-4 text-sm text-[#173A2E]">{message}</p> : null}
        {actionState === "error" ? <p className="mt-4 text-sm text-[#A64040]">{message}</p> : null}
      </Card>

      <p className="text-center text-xs text-[#69736C]">
        Fenêtre courte entre deux validations sur la même carte (évite les doublons).
      </p>

      <div className="flex justify-center gap-4 text-sm">
        <Link className="text-[#173A2E] underline" href={`/merchant/${merchantId}`}>
          Tableau marchand
        </Link>
        <Link className="text-[#173A2E] underline" href="/landing">
          Cardin
        </Link>
      </div>
    </div>
  )
}
