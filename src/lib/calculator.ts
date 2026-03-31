export const DEFAULT_DAYS_OPEN = 26

export type CalculatorInputs = {
  clientsPerDay: number
  avgTicket: number
  returnLossRate: number
  recoveryRate: number
  daysOpen?: number
}

export type CalculatorResult = {
  monthlyClients: number
  lostClients: number
  recoveredClients: number
  extraRevenue: number
}

export function calculateRecovery(inputs: CalculatorInputs): CalculatorResult {
  const daysOpen = inputs.daysOpen ?? DEFAULT_DAYS_OPEN
  const monthlyClients = Math.max(0, inputs.clientsPerDay) * daysOpen
  const lostClients = monthlyClients * clampRate(inputs.returnLossRate)
  const recoveredClients = lostClients * clampRate(inputs.recoveryRate)
  const extraRevenue = recoveredClients * Math.max(0, inputs.avgTicket)

  return {
    monthlyClients,
    lostClients,
    recoveredClients,
    extraRevenue,
  }
}

export function percentToRate(percent: number): number {
  return clampRate(percent / 100)
}

export function formatEuro(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value)
}

function clampRate(value: number): number {
  if (!Number.isFinite(value)) {
    return 0
  }

  if (value < 0) {
    return 0
  }

  if (value > 1) {
    return 1
  }

  return value
}
