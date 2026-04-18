"use client"

import Link from "next/link"

import { PARCOURS_STEP_LABELS } from "@/lib/parcours-v2"

type Props = {
  stepIndex: number
  children: React.ReactNode
  backHref?: string
  backLabel?: string
  rightSlot?: React.ReactNode
  className?: string
}

export function ParcoursShell({ stepIndex, children, backHref = "/", backLabel = "Cardin", rightSlot, className = "" }: Props) {
  return (
    <main className={`min-h-dvh bg-[#f2ede4] text-[#1a2a22] ${className}`}>
      <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between bg-[linear-gradient(to_bottom,#f2ede4_70%,transparent)] px-5 py-4 sm:px-8 lg:px-10">
        <Link
          className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-[#8a8578] transition hover:text-[#0f3d2e]"
          href={backHref}
        >
          <span aria-hidden="true">←</span>
          <span className="font-serif text-[16px] tracking-[0.32em] text-[#1a2a22]">{backLabel}</span>
        </Link>

        <div className="flex items-center gap-6">
          {rightSlot}
          <div className="flex items-center gap-2">
            {PARCOURS_STEP_LABELS.map((label, index) => (
              <div
                aria-label={label}
                className={[
                  "h-px bg-[#d4cdbd] transition-all duration-300",
                  index < stepIndex ? "w-5 bg-[#0f3d2e]" : index === stepIndex ? "w-10 bg-[#0f3d2e]" : "w-5",
                ].join(" ")}
                key={label}
              />
            ))}
          </div>
        </div>
      </header>

      <div className="px-5 pb-12 pt-[88px] sm:px-8 lg:px-10 lg:pt-[104px]">{children}</div>
    </main>
  )
}
