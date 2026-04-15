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
    console.error("[CARDIN_ERROR_BOUNDARY] Message:", error.message)
    console.error("[CARDIN_ERROR_BOUNDARY] Stack:", error.stack)
  }, [error])

  return (
    <main className="min-h-screen bg-[#F8F7F2] px-6 py-16 text-[#173A2E]">
      <div className="mx-auto max-w-xl rounded-3xl border border-[#D8DED4] bg-[#FFFEFA] p-8">
        <p className="text-xs uppercase tracking-[0.14em] text-[#5E6961]">Cardin — Debug</p>
        <h1 className="mt-3 font-serif text-4xl">Une erreur est survenue.</h1>
        <p className="mt-3 text-sm text-[#556159]">
          Rechargez la page ou relancez le parcours. Si le probleme persiste, contactez Cardin avec ce code: {error?.digest ?? "n/a"}.
        </p>

        {/* TEMPORARY DEBUG INFO - REMOVE AFTER FIXING */}
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-red-900">Debug (Samsung):</p>
          <p className="mt-2 text-xs text-red-800">
            <strong>Error:</strong> {error?.message ?? "No message"}
          </p>
          <p className="mt-2 text-xs text-red-800">
            <strong>Name:</strong> {error?.name ?? "No name"}
          </p>
          {error?.stack && (
            <pre className="mt-2 max-h-40 overflow-auto text-[10px] text-red-700">
              {error.stack.slice(0, 500)}
            </pre>
          )}
        </div>

        <button
          className="mt-6 inline-flex h-11 items-center justify-center rounded-full border border-[#1B4332] bg-[#1B4332] px-6 text-sm font-medium text-[#FBFAF6]"
          onClick={() => reset()}
          type="button"
        >
          Reessayer
        </button>
      </div>
    </main>
  )
}
