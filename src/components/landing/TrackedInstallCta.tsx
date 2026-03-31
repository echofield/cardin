"use client"

import Link from "next/link"

import { trackEvent } from "@/lib/analytics"

type TrackedInstallCtaProps = {
  href: string
  label: string
  source: string
  className?: string
}

export function TrackedInstallCta({ href, label, source, className }: TrackedInstallCtaProps) {
  return (
    <Link
      className={className}
      href={href}
      onClick={() => {
        trackEvent("hero_cta", { source })
      }}
    >
      {label}
    </Link>
  )
}
