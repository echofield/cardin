import { Card } from "@/ui"

const proofCases = [
  {
    segment: "Commerce · Boulangerie de quartier",
    loop: "Ritual",
    story:
      "En 30 jours, 18% de clients en plus revenaient chaque matin - pas parce qu'ils avaient un bon de réduction, mais parce qu'ils avaient un cap à atteindre.",
  },
  {
    segment: "Creator · Studio yoga",
    loop: "Mission",
    story:
      "Les membres ne suivaient plus une promo, ils suivaient leur progression. +27% de présences régulières en 6 semaines.",
  },
  {
    segment: "Community · Club running",
    loop: "Domino",
    story:
      "L'objectif collectif a relancé l'engagement individuel. +31% de participation active sur le mois.",
  },
]

export function MerchantProofStrip() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12" id="proof">
      <div className="mb-6 max-w-4xl">
        <p className="text-xs uppercase tracking-[0.14em] text-[#647068]">Preuves de terrain</p>
        <h2 className="mt-2 font-serif text-4xl text-[#173A2E]">Des cas réels, trois contextes</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {proofCases.map((item) => (
          <Card className="p-6" key={item.segment}>
            <p className="text-xs uppercase tracking-[0.12em] text-[#627067]">{item.segment}</p>
            <p className="mt-2 text-sm text-[#556159]">Boucle {item.loop}</p>
            <p className="mt-4 text-sm leading-relaxed text-[#2A3F35]">{item.story}</p>
          </Card>
        ))}
      </div>
    </section>
  )
}


