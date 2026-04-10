type Props = {
  visits: number
  targetVisits: number
  summitLabel: string
}

export function ScreenSommet({ visits, targetVisits, summitLabel }: Props) {
  return (
    <div className="space-y-5">
      <div className="rounded-[1.6rem] border border-[#173A2E]/20 bg-[#173A2E] p-6 text-[#FBFAF6]">
        <p className="text-[10px] uppercase tracking-[0.18em] text-[#C7D2C6]">Sommet</p>
        <h2 className="mt-3 font-serif text-3xl leading-tight">
          Sommet atteint
        </h2>
        <p className="mt-3 text-sm leading-7 text-[#E4E8E2]">
          Votre avantage est disponible
        </p>
      </div>

      <div className="rounded-[1.6rem] border border-[#173A2E]/20 bg-[#EEF3EC] p-6">
        <p className="text-[10px] uppercase tracking-[0.18em] text-[#355246]">Votre avantage</p>
        <p className="mt-3 font-serif text-2xl text-[#173A2E]">
          {summitLabel}
        </p>
        <p className="mt-3 text-sm text-[#2A3F35]">
          À utiliser lors de votre prochain passage
        </p>
      </div>

      <div className="rounded-[1.6rem] border border-[#D8DED4] bg-[#FFFEFA] p-6">
        <div className="flex gap-1">
          {Array.from({ length: targetVisits }).map((_, i) => (
            <div
              key={i}
              className="h-2 flex-1 rounded-full bg-[#173A2E] transition-colors duration-300"
            />
          ))}
        </div>
        <p className="mt-3 text-sm text-[#556159]">
          {visits} / {targetVisits} passages — parcours complet
        </p>
      </div>
    </div>
  )
}
