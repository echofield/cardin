"use client"

import { useEffect } from "react"

export default function GlobalAppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[CARDIN_ERROR_BOUNDARY]", error)
  }, [error])

  return (
    <main className="min-h-screen bg-[#F8F7F2] px-6 py-16 text-[#173A2E]">
      <div className="mx-auto max-w-xl rounded-3xl border border-[#D8DED4] bg-[#FFFEFA] p-8">
        <p className="text-xs uppercase tracking-[0.14em] text-[#5E6961]">Cardin</p>
        <h1 className="mt-3 font-serif text-4xl">Une erreur est survenue.</h1>
        <p className="mt-3 text-sm text-[#556159]">
          Rechargez la page ou relancez le parcours. Si le problème persiste, écrivez à{" "}
          <a className="underline underline-offset-2" href="mailto:contact@getcardin.com">
            contact@getcardin.com
          </a>
          {error?.digest ? ` en mentionnant le code ${error.digest}` : ""}.
        </p>

        <button
          className="mt-6 inline-flex h-11 items-center justify-center rounded-full border border-[#1B4332] bg-[#1B4332] px-6 text-sm font-medium text-[#FBFAF6] transition hover:brightness-110"
          onClick={() => reset()}
          type="button"
        >
          Réessayer
        </button>
      </div>
    </main>
  )
}
