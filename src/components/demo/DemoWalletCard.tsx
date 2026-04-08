import { cn } from "@/lib/utils"

type DemoWalletStage = "dormant" | "active" | "domino" | "diamond" | "summit"

type DemoWalletCardProps = {
  stage: DemoWalletStage
  businessName: string
  businessType: string
  clientName: string
  cardCode: string
  visits: number
  totalVisits: number
  summitLabel: string
  prompt?: string
  compact?: boolean
}

const STAGE_STYLES: Record<DemoWalletStage, { surface: string; badge: string; label: string; tone: string; glow: string }> = {
  dormant: {
    surface: "from-[#F4F1E8] via-[#ECE7DA] to-[#E2DCCB]",
    badge: "bg-[#173A2E]/10 text-[#173A2E]",
    label: "Nouveau",
    tone: "text-[#173A2E]",
    glow: "shadow-[0_20px_50px_-35px_rgba(23,58,46,0.35)]",
  },
  active: {
    surface: "from-[#E7EEE7] via-[#DCE6DC] to-[#D0DBD1]",
    badge: "bg-[#173A2E]/10 text-[#173A2E]",
    label: "Actif",
    tone: "text-[#173A2E]",
    glow: "shadow-[0_22px_54px_-38px_rgba(23,58,46,0.28)]",
  },
  domino: {
    surface: "from-[#E7EFFA] via-[#D9E4F7] to-[#CDD9F1]",
    badge: "bg-[#7FA4D3]/14 text-[#365E92]",
    label: "Domino",
    tone: "text-[#173A2E]",
    glow: "shadow-[0_24px_62px_-40px_rgba(79,122,180,0.42)]",
  },
  diamond: {
    surface: "from-[#103528] via-[#1B4A37] to-[#123126]",
    badge: "bg-[#8FB1DD]/20 text-[#D6E5FB]",
    label: "Diamond",
    tone: "text-[#FBFAF6]",
    glow: "shadow-[0_26px_66px_-38px_rgba(16,53,40,0.6)]",
  },
  summit: {
    surface: "from-[#173328] via-[#214238] to-[#54461A]",
    badge: "bg-[#D6C27A]/18 text-[#F7E7A8]",
    label: "Sommet",
    tone: "text-[#FBFAF6]",
    glow: "shadow-[0_28px_72px_-38px_rgba(83,69,24,0.55)]",
  },
}

export function DemoWalletCard({
  stage,
  businessName,
  businessType,
  clientName,
  cardCode,
  visits,
  totalVisits,
  summitLabel,
  prompt,
  compact = false,
}: DemoWalletCardProps) {
  const style = STAGE_STYLES[stage]
  const dark = stage === "diamond" || stage === "summit"
  const progress = totalVisits > 0 ? Math.min(100, Math.round((visits / totalVisits) * 100)) : 0

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.6rem] border border-white/20 bg-gradient-to-br p-5",
        compact ? "w-[296px]" : "w-full max-w-[360px] p-6",
        style.surface,
        style.glow
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={cn("font-serif text-2xl", style.tone)}>{businessName}</p>
          <p className={cn("mt-1 text-[11px] uppercase tracking-[0.18em]", dark ? "text-white/55" : "text-[#173A2E]/55")}>{businessType}</p>
        </div>
        <span className={cn("rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.16em]", style.badge)}>{style.label}</span>
      </div>

      <div className="mt-10">
        <p className={cn("font-serif text-3xl", style.tone)}>{clientName}</p>
        <p className={cn("mt-2 text-xs uppercase tracking-[0.18em]", dark ? "text-white/50" : "text-[#173A2E]/48")}>{cardCode}</p>
      </div>

      <div className="mt-12 space-y-3">
        <div className={cn("h-1.5 overflow-hidden rounded-full", dark ? "bg-white/15" : "bg-[#173A2E]/10")}>
          <div className="h-full rounded-full bg-[#A9C2E5]" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className={cn("text-sm", dark ? "text-white/68" : "text-[#173A2E]/62")}>{visits} / {totalVisits} visites</p>
            <p className={cn("mt-1 text-xs", dark ? "text-white/54" : "text-[#173A2E]/54")}>{stage === "summit" ? summitLabel : "La carte vit au rythme du lieu."}</p>
          </div>
          {prompt ? (
            <span className={cn("rounded-full border px-3 py-1 text-[11px]", dark ? "border-white/18 text-white/78" : "border-[#173A2E]/12 text-[#173A2E]/72")}>
              {prompt}
            </span>
          ) : null}
        </div>
      </div>

      <div className={cn("pointer-events-none absolute right-[-38px] top-[-34px] h-28 w-28 rounded-full blur-3xl", dark ? "bg-[#D6C27A]/20" : "bg-white/35")} />
    </div>
  )
}
