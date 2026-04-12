import { DEFAULT_DAYS_OPEN } from "@/lib/calculator"
import { getTemplateById } from "@/lib/merchant-templates"

/**
 * Same defaults as `EngineFlow` (`assumptionsByFrequency` + clients/jour × jours ouverts).
 * Keeps parcours / démo projections comparable to step 3 du moteur (+X € / mois).
 */
const FREQUENCY_ASSUMPTIONS = {
  high: { clientsPerDay: 120, avgTicket: 9, lossRatePercent: 28 },
  medium: { clientsPerDay: 85, avgTicket: 17, lossRatePercent: 32 },
  low: { clientsPerDay: 35, avgTicket: 39, lossRatePercent: 36 },
} as const

export function getEngineAlignedAssumptions(merchantType: string) {
  const template = getTemplateById(merchantType)
  const base = FREQUENCY_ASSUMPTIONS[template.defaults.average_frequency]
  const monthlyClients = Math.round(base.clientsPerDay * DEFAULT_DAYS_OPEN)
  return {
    monthlyClients,
    avgTicket: base.avgTicket,
    inactivePercent: base.lossRatePercent,
    recoveryPercent: Math.round(template.defaults.calculator_recovery_rate * 100),
  }
}
