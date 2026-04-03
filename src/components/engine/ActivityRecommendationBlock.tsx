import { type BehaviorPlan } from "@/lib/behavior-engine"
import { type MerchantTemplate } from "@/lib/merchant-templates"
import { Card } from "@/ui"

type ActivityRecommendationBlockProps = {
  template: MerchantTemplate
  plan: BehaviorPlan
  eyebrow?: string
  title?: string
  className?: string
}

export function ActivityRecommendationBlock({
  template,
  plan,
  eyebrow = "Recommandation Cardin",
  title = "Cardin a compris votre activité. Voici ce que vous pouvez lancer.",
  className,
}: ActivityRecommendationBlockProps) {
  return (
    <Card className={["overflow-hidden border-[#C9D3C8] bg-gradient-to-br from-[#FEFDF9] via-[#F6F6F0] to-[#EEF3EA] p-6", className].filter(Boolean).join(" ")}>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-[#607067]">{eyebrow}</p>
          <h3 className="mt-2 max-w-2xl font-serif text-3xl text-[#173A2E]">{title}</h3>
          <p className="mt-3 text-sm text-[#556159]">Pour cette activité, Cardin recommande une mise en place simple, puis des couches qui peuvent évoluer chaque mois.</p>

          <div className="mt-5 space-y-3">
            {plan.recommendations.map((recommendation) => (
              <div className="rounded-2xl border border-[#D7DED4] bg-[#FBFCF8] p-4" key={recommendation.title}>
                <p className="text-sm font-medium text-[#173A2E]">{recommendation.title}</p>
                <p className="mt-1 text-sm text-[#556159]">{recommendation.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-[#D7DED4] bg-[#FBFCF8] p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-[#607067]">Ce que cette activité demande</p>
            <div className="mt-3 space-y-2 text-sm text-[#203B31]">
              {template.needs.map((need) => (
                <p key={need}>{need}</p>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[#D7DED4] bg-[#FBFCF8] p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-[#607067]">Point de départ</p>
            <p className="mt-3 text-sm font-medium text-[#173A2E]">{plan.pointOfDeparture}</p>
          </div>

          <div className="rounded-2xl border border-[#D7DED4] bg-[#FBFCF8] p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-[#607067]">Peut évoluer vers</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {plan.evolutionOptions.map((option) => (
                <span className="rounded-full border border-[#C8D3C7] bg-[#F4F7F0] px-3 py-1 text-xs text-[#173A2E]" key={option}>
                  {option}
                </span>
              ))}
            </div>
            <p className="mt-3 text-xs text-[#556159]">{plan.invitationLayer}</p>
          </div>
        </div>
      </div>
    </Card>
  )
}
