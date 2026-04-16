"use client"

import { FormEvent, useMemo, useState } from "react"

import { buildContactMailto, CARDIN_CONTACT_EMAIL } from "@/lib/site-contact"
import { Button, Input } from "@/ui"

type SubmitState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success" }
  | { status: "error"; message: string; fallbackMailto?: string }

export function ContactLeadForm() {
  const [formData, setFormData] = useState({
    businessName: "",
    city: "",
    email: "",
    request: "Recevoir le récap marchand et me recontacter plus tard.",
  })
  const [state, setState] = useState<SubmitState>({ status: "idle" })

  const fallbackMailto = useMemo(() => {
    const body = [
      "Bonjour Cardin,",
      "",
      formData.request.trim() || "Merci de me recontacter plus tard.",
      "",
      `Nom du lieu : ${formData.businessName.trim()}`,
      `Ville : ${formData.city.trim()}`,
      `E-mail : ${formData.email.trim()}`,
    ].join("\r\n")

    return buildContactMailto("Cardin — demande marchand", body)
  }, [formData])

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setState({ status: "loading" })

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const payload = (await response.json()) as { ok?: boolean; fallbackMailto?: string }

      if (!response.ok || !payload.ok) {
        const nextFallback = payload.fallbackMailto || fallbackMailto
        setState({
          status: "error",
          message: "Envoi direct indisponible pour l'instant. Utilisez le lien e-mail ci-dessous.",
          fallbackMailto: nextFallback,
        })
        return
      }

      setState({ status: "success" })
    } catch {
      setState({
        status: "error",
        message: "Envoi automatique impossible. Utilisez le lien e-mail ci-dessous.",
        fallbackMailto,
      })
    }
  }

  const fallbackHref = state.status === "error" ? state.fallbackMailto || fallbackMailto : fallbackMailto

  return (
    <div className="rounded-[1.5rem] border border-[#D7DDD2] bg-[#FFFEFA] p-5 sm:p-6">
      <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">Formulaire de contact</p>
      <p className="mt-3 text-sm leading-7 text-[#556159]">
        Laissez un contact propre si le commerce ne décide pas tout de suite. Cardin répond depuis {CARDIN_CONTACT_EMAIL} dès que la demande est reçue.
      </p>
      <form className="mt-5 space-y-3" onSubmit={onSubmit}>
        <Input
          onChange={(event) => setFormData((prev) => ({ ...prev, businessName: event.target.value }))}
          placeholder="Nom du lieu"
          required
          value={formData.businessName}
        />
        <Input
          onChange={(event) => setFormData((prev) => ({ ...prev, city: event.target.value }))}
          placeholder="Ville"
          value={formData.city}
        />
        <Input
          onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
          placeholder="E-mail du commerce"
          required
          type="email"
          value={formData.email}
        />
        <textarea
          className="min-h-[118px] w-full rounded-[1.25rem] border border-[#D8DBD2] bg-[#FFFDF8] px-3 py-3 text-sm text-[#132B22] placeholder:text-[#6A726B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#173A2E]"
          onChange={(event) => setFormData((prev) => ({ ...prev, request: event.target.value }))}
          placeholder="Exemple : envoyez-moi le récapitulatif marchand et rappelez-moi jeudi matin."
          value={formData.request}
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Button size="lg" type="submit">
            {state.status === "loading" ? "Envoi…" : "Envoyer la demande"}
          </Button>
          <a
            className="inline-flex h-12 items-center justify-center rounded-full border border-[#D6DCD3] bg-[#F5F2EB] px-6 text-sm font-medium text-[#173A2E] transition hover:border-[#B8C3B5] hover:bg-[#F1EEE5]"
            href={fallbackHref}
          >
            Utiliser le lien e-mail
          </a>
        </div>
        {state.status === "success" ? <p className="text-xs leading-6 text-[#173A2E]">Demande envoyée. Cardin peut reprendre le lieu plus tard, proprement.</p> : null}
        {state.status === "error" ? <p className="text-xs leading-6 text-[#A64040]">{state.message}</p> : null}
        <p className="text-xs leading-6 text-[#6A726B]">Besoin d&apos;écrire directement à {CARDIN_CONTACT_EMAIL} ? C&apos;est possible aussi.</p>
      </form>
    </div>
  )
}
