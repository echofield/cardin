"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const NAV_ITEMS = [
  { href: "#methode", label: "Méthode" },
  { href: "#cas", label: "Cas" },
  { href: "/landing", label: "Simuler" },
  { href: "#contact", label: "Contact" },
]

export function SiteHeader() {
  const pathname = usePathname()

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#E4E7E0]/60 bg-[#F6F5F0]/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 sm:px-6">
        <Link className="flex flex-col leading-none" href="/landing">
          <span className="font-serif text-[1.15rem] font-semibold tracking-[0.06em] text-[#15372B]">CARDIN</span>
          <span className="hidden text-[10px] tracking-[0.08em] text-[#8A9389] sm:block">Systèmes de rétention pour commerces physiques</span>
        </Link>

        <nav className="flex items-center gap-6">
          {NAV_ITEMS.map((item) => {
            const active = item.href === pathname
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
      </div>
    </header>
  )
}
