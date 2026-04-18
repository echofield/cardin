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
      <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between gap-4 bg-[linear-gradient(to_bottom,#f2ede4_70%,transparent)] px-4 py-3 sm:px-6 sm:py-4 lg:px-10">
        <Link
          className="inline-flex min-w-0 items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#8a8578] transition hover:text-[#0f3d2e] sm:text-[11px] sm:tracking-[0.24em]"
          href={backHref}
        >
          <span aria-hidden="true">←</span>
          <span className="truncate font-serif text-[14px] tracking-[0.22em] text-[#1a2a22] sm:text-[16px] sm:tracking-[0.32em]">{backLabel}</span>
        </Link>

        <div className="flex items-center gap-3 sm:gap-6">
          <div className="hidden sm:block">{rightSlot}</div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            {PARCOURS_STEP_LABELS.map((label, index) => (
              <div
                aria-label={label}
                className={[
                  "h-px bg-[#d4cdbd] transition-all duration-300",
                  index < stepIndex ? "w-3.5 bg-[#0f3d2e] sm:w-5" : index === stepIndex ? "w-7 bg-[#0f3d2e] sm:w-10" : "w-3.5 sm:w-5",
                ].join(" ")}
                key={label}
              />
            ))}
          </div>
        </div>
      </header>

      <div className="px-4 pb-12 pt-[76px] sm:px-6 sm:pt-[88px] lg:px-10 lg:pt-[104px]">{children}</div>
    </main>
  )
}
