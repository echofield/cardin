import { Card } from "@/ui"

const proofCases = [
  {
    business: "Café de quartier · Lyon",
    result: "+1 280€/mois",
    detail: "34 clients revenus en 30 jours",
  },
  {
    business: "Restaurant midi · Lille",
    result: "+2 140€/mois",
    detail: "22 tables réactivées en 5 semaines",
  },
  {
    business: "Coiffeur · Nantes",
    result: "+860€/mois",
    detail: "16 rendez-vous récupérés",
  },
]

export function MerchantProofStrip() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="mb-6 max-w-3xl">
        <p className="text-xs uppercase tracking-[0.14em] text-[#647068]">Preuves terrain</p>
        <h2 className="mt-2 font-serif text-4xl text-[#173A2E]">Des résultats visibles sur le chiffre</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {proofCases.map((item) => (
          <Card className="p-6" key={item.business}>
            <p className="text-sm text-[#5B655E]">{item.business}</p>
            <p className="mt-3 font-serif text-4xl text-[#173A2E]">{item.result}</p>
            <p className="mt-2 text-sm text-[#3B4D43]">{item.detail}</p>
          </Card>
        ))}
      </div>
    </section>
  )
}
