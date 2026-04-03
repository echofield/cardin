import { Card } from "@/ui"

const proofCases = [
  {
    segment: "Commerce · Boulangerie de quartier",
    result: "+18% de clients revenant régulièrement en 30 jours",
    detail: "Un rythme s'installe, sans remise permanente.",
  },
  {
    segment: "Commerce · Café urbain",
    result: "+1 à 2 retours supplémentaires par jour",
    detail: "Sans acquisition, uniquement sur la base existante.",
  },
  {
    segment: "Commerce · Salon / bien-être",
    result: "Clients plus réguliers",
    detail: "Fréquence stabilisée sur le mois.",
  },
]

export function MerchantProofStrip() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12" id="proof">
      <div className="mb-6 max-w-4xl">
        <p className="text-xs uppercase tracking-[0.14em] text-[#647068]">Preuves</p>
        <h2 className="mt-2 font-serif text-4xl text-[#173A2E]">Des résultats simples, dans des contextes différents</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {proofCases.map((item) => (
          <Card className="p-6" key={item.segment}>
            <p className="text-xs uppercase tracking-[0.12em] text-[#627067]">{item.segment}</p>
            <p className="mt-3 text-lg font-serif text-[#173A2E]">{item.result}</p>
            <p className="mt-2 text-sm leading-relaxed text-[#2A3F35]">{item.detail}</p>
          </Card>
        ))}
      </div>
    </section>
  )
}
