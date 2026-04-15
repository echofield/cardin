"use client"

import { FormEvent, useMemo, useState } from "react"

import { buildContactMailto, CARDIN_CONTACT_EMAIL } from "@/lib/site-contact"
import { Button, Input } from "@/ui"

export function ContactLeadForm() {
  const [formData, setFormData] = useState({
    businessName: "",
    city: "",
    email: "",
    request: "Recevoir le récapitulatif marchand et être recontacté plus tard.",
  })
  const [submitted, setSubmitted] = useState(false)

  const mailto = useMemo(() => {
    const body = [
      "Bonjour Cardin,",
      "",
      formData.request.trim() || "Je souhaite être recontacté.",
      "",
      `Nom du lieu : ${formData.businessName.trim()}`,
      `Ville : ${formData.city.trim()}`,
      `E-mail : ${formData.email.trim()}`,
    ].join("\r\n")

    return buildContactMailto("Cardin — demande marchand", body)
  }, [formData])

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)
    if (typeof window !== "undefined") {
      window.location.href = mailto
    }
  }

  return (
    <div className="rounded-[1.5rem] border border-[#D7DDD2] bg-[#FFFEFA] p-5 sm:p-6">
      <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">Formulaire simple</p>
      <p className="mt-3 text-sm leading-7 text-[#556159]">
        Laisse un contact propre si le commerce ne décide pas immédiatement. Cela ouvre un e-mail prérempli vers {CARDIN_CONTACT_EMAIL}.
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
            Ouvrir l&apos;e-mail
          </Button>
          <a
            className="inline-flex h-12 items-center justify-center rounded-full border border-[#D6DCD3] bg-[#F5F2EB] px-6 text-sm font-medium text-[#173A2E] transition hover:border-[#B8C3B5] hover:bg-[#F1EEE5]"
            href={mailto}
          >
            Utiliser le lien direct
          </a>
        </div>
        <p className="text-xs leading-6 text-[#6A726B]">Si aucune app e-mail ne s&apos;ouvre, écrivez directement à {CARDIN_CONTACT_EMAIL}.</p>
        {submitted ? <p className="text-xs leading-6 text-[#173A2E]">La demande est prête. Envoie-la puis reprends le lieu au bon moment.</p> : null}
      </form>
    </div>
  )
}