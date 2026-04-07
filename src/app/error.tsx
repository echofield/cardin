"use client"

export default function GlobalAppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="min-h-screen bg-[#F8F7F2] px-6 py-16 text-[#173A2E]">
      <div className="mx-auto max-w-xl rounded-3xl border border-[#D8DED4] bg-[#FFFEFA] p-8">
        <p className="text-xs uppercase tracking-[0.14em] text-[#5E6961]">Cardin</p>
        <h1 className="mt-3 font-serif text-4xl">Une erreur est survenue.</h1>
        <p className="mt-3 text-sm text-[#556159]">
          Rechargez la page ou relancez le parcours. Si le probleme persiste, contactez Cardin avec ce code: {error?.digest ?? "n/a"}.
        </p>
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
