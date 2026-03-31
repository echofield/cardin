import { Card } from "@/ui"

type WalletPassPreviewProps = {
  businessLabel: string
  rewardLabel: string
  progressDots: number
}

export function WalletPassPreview({ businessLabel, rewardLabel, progressDots }: WalletPassPreviewProps) {
  return (
    <Card className="mt-6 overflow-hidden border-[#A4B7A9] bg-gradient-to-br from-[#1D4A39] via-[#1A4334] to-[#123025] p-0 text-[#F9FAF5]">
      <div className="border-b border-[#86A090] px-6 py-4">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.14em] text-[#D5E4DA]">Apple Wallet / Google Wallet</p>
          <span className="rounded-full border border-[#9DB5A8] px-2 py-0.5 text-[10px] text-[#E6F1EB]">Actif</span>
        </div>
        <h3 className="mt-3 font-serif text-3xl">{businessLabel}</h3>
        <p className="mt-1 text-sm text-[#DBE8E0]">{rewardLabel}</p>
      </div>

      <div className="px-6 py-5">
        <p className="text-xs uppercase tracking-[0.14em] text-[#D5E4DA]">Progression fidélité</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {Array.from({ length: progressDots }).map((_, index) => (
            <span
              className={[
                "inline-flex h-8 w-8 items-center justify-center rounded-full border text-xs",
                index < Math.max(1, Math.floor(progressDots * 0.4))
                  ? "border-[#D2E4D9] bg-[#EDF5F1] text-[#1B4435]"
                  : "border-[#8EA495] text-[#D9E8DE]",
              ].join(" ")}
              key={index}
            >
              {index + 1}
            </span>
          ))}
        </div>
      </div>

      <div className="border-t border-[#86A090] bg-[#10281F] px-6 py-4">
        <div className="h-12 rounded-lg border border-[#6E877A] bg-[repeating-linear-gradient(90deg,#DDECE2_0,#DDECE2_2px,#0F271E_2px,#0F271E_4px)]" />
        <p className="mt-2 text-center text-[11px] tracking-[0.18em] text-[#D1E3D8]">CARDIN PASS</p>
      </div>
    </Card>
  )
}
