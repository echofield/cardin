"use client"

import Link from "next/link"
import { FormEvent, useMemo, useState } from "react"

import { buildContactMailto, CARDIN_CONTACT_EMAIL } from "@/lib/site-contact"
import { Button, Input } from "@/ui"

type SubmitState =
  | { status: "idle" }
  | { status: "loading" }
  | {
      status: "success"
      persisted: boolean
      emailSent: boolean
      whatsappHref?: string | null
    }
  | { status: "error"; message: string; fallbackMailto?: string }

export function FieldCapturePage() {
  const [formData, setFormData] = useState({
    businessName: "",
    contactName: "",
    whatsapp: "",
    city: "",
    email: "",
    nextAction: "",
    note: "",
    source: "terrain",
  })
  const [state, setState] = useState<SubmitState>({ status: "idle" })

  const fallbackMailto = useMemo(() => {
    return buildContactMailto(
      "Cardin · capture terrain",
      [
        "Bonjour Cardin,",
        "",
        "Nouvelle capture terrain.",
        "",
        `Lieu : ${formData.businessName.trim()}`,
        `Contact : ${formData.contactName.trim() || "—"}`,
        `WhatsApp : ${formData.whatsapp.trim()}`,
        `Ville : ${formData.city.trim() || "—"}`,
        `E-mail : ${formData.email.trim() || "—"}`,
        `Prochaine étape : ${formData.nextAction.trim() || "—"}`,
        `Note : ${formData.note.trim() || "—"}`,
      ].join("\r\n"),
    )
  }, [formData])

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setState({ status: "loading" })

    try {
      const response = await fetch("/api/field-captures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const payload = (await response.json()) as {
        ok?: boolean
        persisted?: boolean
        emailSent?: boolean
        whatsappHref?: string | null
        fallbackMailto?: string
      }

      if (!response.ok || !payload.ok) {
        setState({
          status: "error",
          message: "Capture impossible pour l'instant. Utilisez le lien e-mail ci-dessous.",
          fallbackMailto: payload.fallbackMailto || fallbackMailto,
        })
        return
      }

      setState({
        status: "success",
        persisted: Boolean(payload.persisted),
        emailSent: Boolean(payload.emailSent),
        whatsappHref: payload.whatsappHref,
      })
    } catch {
      setState({
        status: "error",
        message: "Capture impossible pour l'instant. Utilisez le lien e-mail ci-dessous.",
        fallbackMailto,
      })
    }
  }

  const fallbackHref = state.status === "error" ? state.fallbackMailto || fallbackMailto : fallbackMailto

  return (
    <main className="min-h-dvh bg-[radial-gradient(circle_at_top,rgba(15,61,46,0.04),transparent_38%),#f2ede4] px-5 py-10 text-[#1a2a22] sm:px-8">
      <div className="mx-auto max-w-[720px]">
        <div className="rounded-[28px] border border-[#d7ddd2] bg-[#fffef9] p-6 shadow-[0_18px_60px_rgba(15,61,46,0.08)] sm:p-8">
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#8c6a44]">Capture terrain</p>
          <h1 className="mt-3 font-serif text-[clamp(36px,7vw,56px)] leading-[0.98] tracking-[-0.03em] text-[#1a2a22]">
            Cardin
          </h1>
          <p className="mt-4 max-w-[560px] font-serif text-[18px] italic leading-[1.6] text-[#3d4d43]">
            Enregistre un lieu vite, proprement, sans dépendre d'un simple WhatsApp perdu.
          </p>

          <form className="mt-8 space-y-3" onSubmit={onSubmit}>
            <Input
              onChange={(event) => setFormData((prev) => ({ ...prev, businessName: event.target.value }))}
              placeholder="Nom du lieu"
              required
              value={formData.businessName}
            />
            <Input
              onChange={(event) => setFormData((prev) => ({ ...prev, contactName: event.target.value }))}
              placeholder="Prénom du contact"
              value={formData.contactName}
            />
            <Input
              onChange={(event) => setFormData((prev) => ({ ...prev, whatsapp: event.target.value }))}
              placeholder="WhatsApp"
              required
              type="tel"
              value={formData.whatsapp}
            />
            <Input
              onChange={(event) => setFormData((prev) => ({ ...prev, city: event.target.value }))}
              placeholder="Ville"
              value={formData.city}
            />
            <Input
              onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
              placeholder="E-mail si tu l'as"
              type="email"
              value={formData.email}
            />
            <Input
              onChange={(event) => setFormData((prev) => ({ ...prev, nextAction: event.target.value }))}
              placeholder="Prochaine étape · ex. rappel demain 11h"
              value={formData.nextAction}
            />
            <textarea
              className="min-h-[120px] w-full rounded-[1.25rem] border border-[#d8dbd2] bg-[#fffdf8] px-4 py-3 text-sm text-[#132b22] placeholder:text-[#6a726b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#173a2e]"
              onChange={(event) => setFormData((prev) => ({ ...prev, note: event.target.value }))}
              placeholder="Note libre · jour faible, objection, moment pressenti, niveau de chaleur…"
              value={formData.note}
            />

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap">
              <Button size="lg" type="submit">
                {state.status === "loading" ? "Enregistrement…" : "Enregistrer le contact"}
              </Button>
              <a
                className="inline-flex h-12 items-center justify-center rounded-full border border-[#d6dcd3] bg-[#f5f2eb] px-6 text-sm font-medium text-[#173a2e] transition hover:border-[#b8c3b5] hover:bg-[#f1eee5]"
                href={fallbackHref}
              >
                Utiliser le lien e-mail
              </a>
              <Link
                className="inline-flex h-12 items-center justify-center rounded-full border border-[#d6dcd3] px-6 text-sm font-medium text-[#173a2e] transition hover:border-[#b8c3b5] hover:bg-[#f8f5ee]"
                href="/commencer"
              >
                Revoir l'entrée Cardin
              </Link>
            </div>
          </form>

          {state.status === "success" ? (
            <div className="mt-6 rounded-[20px] border border-[#d7ddd2] bg-[#f8f6ef] p-5 text-sm leading-7 text-[#173a2e]">
              <p className="font-medium">Contact enregistré.</p>
              <p className="mt-2">
                Backend: {state.persisted ? "ok" : "indisponible"} · E-mail: {state.emailSent ? "envoyé" : "non envoyé"}.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                {state.whatsappHref ? (
                  <a
                    className="inline-flex h-11 items-center justify-center rounded-full border border-[#173a2e] bg-[#173a2e] px-5 text-sm font-medium text-[#fffef9] transition hover:bg-[#11261f]"
                    href={state.whatsappHref}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Ouvrir WhatsApp
                  </a>
                ) : null}
              </div>
            </div>
          ) : null}

          {state.status === "error" ? (
            <p className="mt-6 text-sm leading-7 text-[#a64040]">{state.message}</p>
          ) : null}

          <p className="mt-6 text-xs leading-6 text-[#6a726b]">
            Capture cachée, non publique. Si le mail casse, le fallback reste {CARDIN_CONTACT_EMAIL}.
          </p>
        </div>
      </div>
    </main>
  )
}
