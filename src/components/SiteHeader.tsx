"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

const NAV_ITEMS = [
  { href: "/#impact", label: "Impact" },
  { href: "/challenge", label: "Challenge" },
  { href: "/parcours", label: "Saison" },
  { href: "/#contact", label: "Contact" },
]

export function SiteHeader() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#E4E7E0]/80 bg-[#F6F5F0]/95 pt-safe">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <div className="flex h-14 items-center justify-between">
        <Link className="flex flex-col leading-none" href="/">
          <span className="font-serif text-[1.15rem] font-semibold tracking-[0.06em] text-[#15372B]">CARDIN</span>
          <span className="mt-0.5 text-[9px] tracking-[0.08em] text-[#6B766D]">by Symi</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_ITEMS.map((item) => {
            const active =
              (item.href === "/parcours" && (pathname === "/parcours" || pathname.startsWith("/parcours/"))) ||
              (item.href === "/challenge" && pathname === "/challenge")
            return (
              <Link
                className={[
                  "text-[13px] tracking-[0.04em] transition",
                  active ? "font-medium text-[#15372B]" : "text-[#6B766D] hover:text-[#15372B]",
                ].join(" ")}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

          <div className="flex items-center gap-3 md:hidden">
            <Link
              className="inline-flex h-9 items-center justify-center rounded-full border border-[#D6DCD3] bg-[#FFFDF8] px-3.5 text-[13px] font-medium text-[#173A2E] transition hover:border-[#B8C3B5]"
              href="/challenge"
            >
              Lancer
            </Link>
            <button
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#D6DCD3] bg-[#FFFDF8] text-[#173A2E]"
              onClick={() => setMobileOpen((open) => !open)}
              type="button"
            >
              <span className="relative block h-3.5 w-4">
                <span className={["absolute left-0 top-0 h-px w-4 bg-current transition", mobileOpen ? "translate-y-[7px] rotate-45" : ""].join(" ")} />
                <span className={["absolute left-0 top-[7px] h-px w-4 bg-current transition", mobileOpen ? "opacity-0" : "opacity-100"].join(" ")} />
                <span className={["absolute left-0 top-[14px] h-px w-4 bg-current transition", mobileOpen ? "-translate-y-[7px] -rotate-45" : ""].join(" ")} />
              </span>
            </button>
          </div>
        </div>

        {mobileOpen ? (
          <div className="border-t border-[#E4E7E0] py-3 md:hidden">
            <nav className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  className="rounded-2xl px-3 py-2.5 text-[12px] uppercase tracking-[0.14em] text-[#173A2E] transition hover:bg-[#FFFDF8]"
                  href={item.href}
                  key={item.href}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        ) : null}
      </div>
    </header>
  )
}
