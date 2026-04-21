"use client"

import { useTransition } from "react"

export function PresentationLockButton() {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      className="border border-[#d4cdbd] bg-[rgba(255,253,248,0.72)] px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-[#8a8578] transition hover:border-[#003d2c] hover:text-[#003d2c]"
      onClick={() => {
        startTransition(async () => {
          await fetch("/api/presentation/auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "logout" }),
          })
          window.location.reload()
        })
      }}
      type="button"
    >
      {isPending ? "Verrouillage..." : "Verrouiller"}
    </button>
  )
}
