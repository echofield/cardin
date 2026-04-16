import Link from "next/link"

import { PublicFooter } from "@/components/shared/PublicFooter"
import { CARDIN_CONTACT_EMAIL } from "@/lib/site-contact"

export default function ApresPaiementPage() {
  return (
    <main className="mx-auto max-w-xl px-4 py-12 pb-[max(3rem,env(safe-area-inset-bottom,0px))] text-[#173A2E]">
      <p className="text-[11px] uppercase tracking-[0.18em] text-[#677168]">Apres paiement</p>
      <h1 className="mt-4 font-serif text-3xl text-[#163328] sm:text-4xl">Paiement effectue sur Stripe</h1>
      <p className="mt-4 text-sm leading-7 text-[#556159]">
        Le paiement s'ouvre dans un nouvel onglet. Une fois le paiement confirme, Stripe envoie son recu et Cardin peut maintenant envoyer un e-mail automatique de suite si le webhook et le SMTP sont configures.
      </p>
      <ol className="mt-6 list-decimal space-y-3 pl-5 text-sm leading-7 text-[#2A3F35]">
        <li>Verifiez l'e-mail de confirmation Stripe.</li>
        <li>Attendez l'e-mail Cardin de recap et de prochaines etapes.</li>
        <li>Si rien n'arrive rapidement, ecrivez a {CARDIN_CONTACT_EMAIL}.</li>
        <li>Revenez sur le parcours marchand si vous devez revoir l'offre ou l'activation.</li>
      </ol>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link
          className="inline-flex h-11 items-center justify-center rounded-full border border-[#173A2E] bg-[#173A2E] px-6 text-sm font-medium text-[#FBFAF6] shadow-[0_12px_24px_-18px_rgba(27,67,50,0.45)] transition hover:bg-[#24533F]"
          href="/landing"
        >
          Retour a l'accueil
        </Link>
        <Link
          className="inline-flex h-11 items-center justify-center rounded-full border border-[#D6DCD3] bg-[#F5F2EB] px-6 text-sm font-medium text-[#173A2E] transition hover:border-[#B8C3B5] hover:bg-[#F1EEE5]"
          href="/parcours"
        >
          Parcours marchand
        </Link>
      </div>
      <p className="mt-8 text-xs leading-relaxed text-[#6A726B]">
        Pour finaliser le flux, configure dans Stripe le webhook vers <code>/api/stripe/webhook</code> et l'URL de retour vers cette page.
      </p>
      <div className="mt-12">
        <PublicFooter />
      </div>
    </main>
  )
}