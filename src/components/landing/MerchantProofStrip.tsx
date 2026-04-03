import { Card } from "@/ui"

const proofCases = [
  {
    segment: "Commerce · Boulangerie de quartier",
    quote: "On a recréé l'habitude du matin.",
    loop: "Ritual",
    result: "+18% de clients récurrents en 30 jours",
  },
  {
    segment: "Creator · Studio yoga",
    quote: "Les membres suivent une progression, pas une promo.",
    loop: "Mission",
    result: "+27% de présences régulières sur 6 semaines",
  },
  {
    segment: "Community · Club running",
    quote: "Le collectif a relancé l'engagement individuel.",
    loop: "Domino",
    result: "+31% de participation active sur le mois",
  },
]

export function MerchantProofStrip() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12" id="proof">
      <div className="mb-6 max-w-3xl">
        <p className="text-xs uppercase tracking-[0.14em] text-[#647068]">Preuves de terrain</p>
        <h2 className="mt-2 font-serif text-4xl text-[#173A2E]">Business. Creator. Community.</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {proofCases.map((item) => (
          <Card className="p-6" key={item.segment}>
            <p className="text-xs uppercase tracking-[0.12em] text-[#627067]">{item.segment}</p>
            <p className="mt-3 text-lg font-serif text-[#173A2E]">"{item.quote}"</p>
            <p className="mt-3 text-sm text-[#556159]">Boucle utilisée: {item.loop}</p>
            <p className="mt-2 text-sm text-[#2A3F35]">{item.result}</p>
          </Card>
        ))}
      </div>
    </section>
  )
}

