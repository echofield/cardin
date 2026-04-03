import { buildCalendarPlan } from "@/lib/calendar-engine"
import { type BehaviorScenarioId } from "@/lib/behavior-engine"
import { projectScenarioImpact } from "@/lib/projection-engine"

export type AnnualProjectionInput = {
  merchantType: string
  scenarioId: BehaviorScenarioId
  monthlyClients: number
  avgTicket: number
  inactivePercent: number
  baseRecoveryPercent: number
}

export type AnnualProjectionMonth = {
  label: string
  revenue: number
  focus: string
  emphasis: "base" | "peak"
}

export type AnnualProjectionResult = {
  annualRevenueMin: number
  annualRevenueMax: number
  yearlyRecoveredReturns: number
  plannedActivations: number
  protectedPeriods: string[]
  monthlyBreakdown: AnnualProjectionMonth[]
  annualNarrative: string
}

const MONTH_LABELS = ["Jan", "Fev", "Mar", "Avr", "Mai", "Jun", "Jul", "Aou", "Sep", "Oct", "Nov", "Dec"]

export function projectAnnualCardinPlan(input: AnnualProjectionInput): AnnualProjectionResult {
  const monthlyProjection = projectScenarioImpact({
    merchantType: input.merchantType,
    scenarioId: input.scenarioId,
    monthlyClients: input.monthlyClients,
    avgTicket: input.avgTicket,
    inactivePercent: input.inactivePercent,
    baseRecoveryPercent: input.baseRecoveryPercent,
  })

  const calendarPlan = buildCalendarPlan(input.merchantType, input.scenarioId)
  const momentByMonth = new Map(calendarPlan.annualMoments.map((moment) => [moment.month, moment]))

  const monthlyBreakdown = MONTH_LABELS.map((label, month) => {
    const moment = momentByMonth.get(month)
    const seasonalWeight = moment ? (moment.priority === "high" ? 1.18 : 1.08) : 0.92
    const revenue = Math.round(monthlyProjection.monthlyRevenue * seasonalWeight)

    return {
      label,
      revenue,
      focus: moment?.label ?? "Rythme de fond",
      emphasis: moment ? "peak" : "base",
    } satisfies AnnualProjectionMonth
  })

  const annualRevenueBase = monthlyBreakdown.reduce((sum, month) => sum + month.revenue, 0)
  const annualRevenueMin = Math.round(annualRevenueBase * 0.88)
  const annualRevenueMax = Math.round(annualRevenueBase * 1.08)
  const yearlyRecoveredReturns = Math.round(monthlyProjection.monthlyReturns * 12)

  return {
    annualRevenueMin,
    annualRevenueMax,
    yearlyRecoveredReturns,
    plannedActivations: 12,
    protectedPeriods: [calendarPlan.currentMoment.label, calendarPlan.nextMoment.label, calendarPlan.quietPeriodLabel],
    monthlyBreakdown,
    annualNarrative: `Cardin protège les périodes fragiles et ajoute des temps forts tout au long de l'année pour votre activité.`,
  }
}
