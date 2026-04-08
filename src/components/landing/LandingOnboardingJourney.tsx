"use client"

import { ParcoursOnboardingCore } from "@/components/parcours/ParcoursOnboardingCore"

/**
 * Landing: parcours marchand (embedded). Shares logic and motion with `/parcours`.
 * Hero, simulator, autres sections de `/landing` restent inchangés.
 */
export function LandingOnboardingJourney() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14" id="onboarding">
      <div className="overflow-hidden rounded-[2rem] border border-[#DED7CA] bg-[linear-gradient(180deg,#FFFDF8_0%,#F4F0E7_100%)] shadow-[0_28px_90px_-54px_rgba(21,47,37,0.38)]">
        <ParcoursOnboardingCore variant="embedded" />
      </div>
    </section>
  )
}
