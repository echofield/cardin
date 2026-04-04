import { Card } from "@/ui"

type WalletPassPreviewProps = {
  businessLabel: string
  rewardLabel: string
  progressDots: number
  activeDots?: number
  eyebrowLabel?: string
  statusLabel?: string
  footerLabel?: string
  notificationLabel?: string
  caption?: string
}

export function WalletPassPreview({
  businessLabel,
  rewardLabel,
  progressDots,
  activeDots,
  eyebrowLabel = "Dans le téléphone du client",
  statusLabel = "Actif",
  footerLabel = "PROGRESSION CARDIN",
  notificationLabel,
  caption,
}: WalletPassPreviewProps) {
  const filledDots = activeDots ?? Math.max(1, Math.floor(progressDots * 0.4))

  return (
    <Card className="mt-6 overflow-hidden border-[#9EB2A4] bg-[linear-gradient(180deg,#254C3C_0%,#1B4332_58%,#153327_100%)] p-0 text-[#F7F5EF] shadow-[0_20px_50px_-32px_rgba(27,67,50,0.58)]">
      <div className="relative border-b border-[rgba(221,233,226,0.24)] px-6 py-4">
        <div className="absolute left-0 top-0 h-3 w-3 border-l border-t border-[rgba(221,233,226,0.34)]" />
        <div className="absolute bottom-0 right-0 h-3 w-3 border-b border-r border-[rgba(221,233,226,0.34)]" />
        <div className="flex items-center justify-between">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[#D9E6DE]">{eyebrowLabel}</p>
          <span className="rounded-full border border-[rgba(221,233,226,0.28)] bg-[rgba(250,248,242,0.06)] px-2.5 py-0.5 text-[10px] text-[#EEF4F0]">
            {statusLabel}
          </span>
        </div>
        <h3 className="mt-4 font-serif text-3xl tracking-[-0.02em]">{businessLabel}</h3>
        <p className="mt-1 text-sm text-[#D9E6DE]">{rewardLabel}</p>
      </div>

      {notificationLabel ? (
        <div className="border-b border-[rgba(221,233,226,0.24)] px-6 py-4">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[#D9E6DE]">Notification douce</p>
          <div className="mt-3 rounded-2xl border border-[rgba(221,233,226,0.18)] bg-[rgba(250,248,242,0.055)] px-4 py-3 text-sm text-[#EEF4F0]">
            {notificationLabel}
          </div>
          {caption ? <p className="mt-3 text-xs text-[#D1DFD6]">{caption}</p> : null}
        </div>
      ) : null}

      <div className="px-6 py-5">
        <p className="text-[11px] uppercase tracking-[0.16em] text-[#D9E6DE]">Progression visible</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {Array.from({ length: progressDots }).map((_, index) => (
            <span
              className={[
                "inline-flex h-8 w-8 items-center justify-center rounded-full border text-xs",
                index < filledDots
                  ? "border-[#DCE9E1] bg-[#F7F5EF] text-[#1B4332]"
                  : "border-[rgba(221,233,226,0.24)] bg-transparent text-[#D9E6DE]",
              ].join(" ")}
              key={index}
            >
              {index + 1}
            </span>
          ))}
        </div>
      </div>

      <div className="border-t border-[rgba(221,233,226,0.18)] bg-[#10281F] px-6 py-4">
        <div className="h-12 rounded-lg border border-[rgba(221,233,226,0.18)] bg-[repeating-linear-gradient(90deg,#E5EFE8_0,#E5EFE8_2px,#10281F_2px,#10281F_4px)]" />
        <p className="mt-2 text-center text-[11px] tracking-[0.2em] text-[#D5E2DA]">{footerLabel}</p>
      </div>
    </Card>
  )
}
