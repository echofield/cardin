import Link from "next/link"

import { getParcoursCheckoutStatus } from "@/lib/parcours-checkout-status"

export const dynamic = "force-dynamic"

type Props = {
  searchParams?: { session_id?: string | string[] }
}

function firstParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}

function formatAmount(amount: number | null, currency: string | null): string | null {
  if (amount == null || !currency) return null
  try {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: currency.toUpperCase(),
      maximumFractionDigits: 0,
    }).format(amount / 100)
  } catch {
    return null
  }
}

export default async function ParcoursSuccessRoute({ searchParams }: Props) {
  const sessionId = firstParam(searchParams?.session_id)
  const status = await getParcoursCheckoutStatus(sessionId)

  const isProcessed = status.state === "processed"
  const isPending = status.state === "processing" || status.state === "missing"

  const headline = isProcessed
    ? "Saison réservée."
    : isPending
      ? "Paiement en cours de confirmation."
      : "Un souci est survenu."

  const emphasis = isProcessed ? "Activation sous 48 h." : isPending ? "Quelques secondes." : "On reprend la main."

  const subline = isProcessed
    ? "Votre saison Cardin est confirmée. L'équipe reprend contact pour la mise en place."
    : isPending
      ? "Stripe finalise la confirmation. Cette page se mettra à jour dès réception — vous pouvez actualiser."
      : "Nous n'avons pas retrouvé cette session. Si le paiement a été débité, contactez-nous à hello@cardin.app."

  const amountLabel = formatAmount(status.amountPaid, status.currency)

  return (
    <main className="min-h-dvh bg-[#f2ede4] px-6 py-24 text-center text-[#1a2a22]">
      <div className="mx-auto max-w-2xl">
        <p className="text-[10px] uppercase tracking-[0.32em] text-[#8a8578]">
          {isProcessed ? "Saison activée" : isPending ? "Paiement en attente" : "Paiement introuvable"}
        </p>
        <h1 className="mt-4 font-serif text-[clamp(42px,6vw,68px)] leading-[1.04]">
          {headline} <em className="italic text-[#0f3d2e]">{emphasis}</em>
        </h1>
        <p className="mx-auto mt-5 max-w-xl font-serif text-xl italic leading-[1.5] text-[#3d4d43]">{subline}</p>

        {(status.businessName || amountLabel || status.customerEmail) && (
          <dl className="mx-auto mt-8 grid max-w-md gap-2 rounded-sm border border-[#d4cdbd] bg-[#f8f3ea] px-6 py-5 text-left text-sm text-[#3d4d43]">
            {status.businessName && (
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-[11px] uppercase tracking-[0.22em] text-[#8a8578]">Lieu</dt>
                <dd className="font-serif text-base text-[#1a2a22]">{status.businessName}</dd>
              </div>
            )}
            {amountLabel && (
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-[11px] uppercase tracking-[0.22em] text-[#8a8578]">Montant</dt>
                <dd className="font-serif text-base text-[#1a2a22]">{amountLabel}</dd>
              </div>
            )}
            {status.customerEmail && (
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-[11px] uppercase tracking-[0.22em] text-[#8a8578]">Email</dt>
                <dd className="font-serif text-base text-[#1a2a22]">{status.customerEmail}</dd>
              </div>
            )}
          </dl>
        )}

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            className="inline-flex min-h-12 items-center justify-center rounded-sm border border-[#0f3d2e] bg-[#0f3d2e] px-8 text-[12px] uppercase tracking-[0.2em] text-[#f2ede4] transition hover:border-[#1a2a22] hover:bg-[#1a2a22]"
            href="/"
          >
            Revenir à l&apos;accueil
          </Link>
          <Link
            className="inline-flex min-h-12 items-center justify-center rounded-sm border border-[#d4cdbd] px-8 text-[12px] uppercase tracking-[0.2em] text-[#1a2a22] transition hover:border-[#0f3d2e] hover:text-[#0f3d2e]"
            href="/parcours/lecture"
          >
            Refaire une simulation
          </Link>
        </div>
      </div>
    </main>
  )
}
