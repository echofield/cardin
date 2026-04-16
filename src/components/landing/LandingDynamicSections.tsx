"use client"

import dynamic from "next/dynamic"

const SectionSkeleton = ({ height }: { height: number }) => (
  <section
    aria-hidden
    className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
    style={{ paddingTop: "2rem", paddingBottom: "2rem" }}
  >
    <div
      className="rounded-[1.8rem] border border-[#E3DDD0] bg-[#FFFEFA]"
      style={{
        height,
        background:
          "linear-gradient(110deg, rgba(251,250,246,1) 30%, rgba(241,238,229,0.7) 50%, rgba(251,250,246,1) 70%)",
        backgroundSize: "200% 100%",
        animation: "cardin-shimmer 2.4s ease-in-out infinite",
      }}
    />
    <style jsx>{`
      @keyframes cardin-shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `}</style>
  </section>
)

export const LandingOnboardingJourneyDynamic = dynamic(
  () =>
    import("@/components/landing/LandingOnboardingJourney").then((mod) => ({
      default: mod.LandingOnboardingJourney,
    })),
  {
    ssr: false,
    loading: () => <SectionSkeleton height={420} />,
  },
)

export const MerchantSeasonStudioDynamic = dynamic(
  () =>
    import("@/components/landing/MerchantSeasonStudio").then((mod) => ({
      default: mod.MerchantSeasonStudio,
    })),
  {
    ssr: false,
    loading: () => <SectionSkeleton height={520} />,
  },
)
