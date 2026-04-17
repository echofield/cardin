import Link from "next/link"

import { PublicFooter } from "@/components/shared/PublicFooter"
import { CARDIN_CONTACT_EMAIL } from "@/lib/site-contact"

export default function ApresPaiementPage() {
  return (
    <main className="mx-auto max-w-xl px-4 py-12 pb-[max(3rem,env(safe-area-inset-bottom,0px))] text-[#173A2E]">
      <div className="flex items-center gap-3">
        <div className="relative h-2.5 w-2.5">
          <div className="absolute inset-0 rounded-full bg-[#173A2E]" />
          <div className="absolute inset-0 rounded-full bg-[#173A2E] opacity-40 animate-ping" />
        </div>
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#173A2E]">Saison réservée</p>
      </div>

      <h1 className="mt-5 font-serif text-4xl leading-[1.08] text-[#163328] sm:text-5xl">
        Votre moteur de retour client est lancé.
      </h1>

      <p className="mt-5 text-[15px] leading-7 text-[#2A3F35]">
        La saison Cardin est réservée. Votre lieu entre dans l&apos;ordre d&apos;activation. Nous vous recontactons sous 48 h
        pour caler l&apos;installation : QR comptoir, carte digitale, tableau de saison.
      </p>

      <div className="mt-8 rounded-2xl border border-[#D6DCD3] bg-[#F5F2EB] p-5">
        <p className="text-[10px] uppercase tracking-[0.16em] text-[#677168]">Ce qui se passe maintenant</p>
        <ol className="mt-3 space-y-2.5 text-sm leading-6 text-[#2A3F35]">
          <li>
            <span className="font-medium">Sous 48 h</span> : un appel pour confirmer le nom du lieu, la récompense visible
            et l&apos;équipe.
          </li>
          <li>
            <span className="font-medium">Puis</span> : QR de validation remis au comptoir, carte digitale activée, votre
            page de saison en ligne.
          </li>
          <li>
            <span className="font-medium">Ensuite</span> : vous distribuez. Le staff valide. Le retour se voit.
          </li>
        </ol>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          className="inline-flex h-12 flex-1 items-center justify-center rounded-full bg-[#173A2E] px-6 text-sm font-medium text-[#FBFAF6] transition hover:bg-[#24533F]"
          href="/landing"
        >
          Retour à l&apos;accueil
        </Link>
        <a
          className="inline-flex h-12 flex-1 items-center justify-center rounded-full border border-[#D6DCD3] bg-[#F5F2EB] px-6 text-sm font-medium text-[#173A2E] transition hover:bg-[#F1EEE5]"
          href={`mailto:${CARDIN_CONTACT_EMAIL}?subject=Saison%20Cardin%20activ%C3%A9e`}
        >
          Nous contacter
        </a>
      </div>

      <p className="mt-10 text-xs leading-relaxed text-[#6A726B]">
        Un reçu Stripe vous a été envoyé. L&apos;équipe Cardin prend la suite.
      </p>

      <div className="mt-12">
        <PublicFooter />
      </div>
    </main>
  )
}
