/** Shared types for Cardin projection (single source of truth). */

export type SeasonProjectionLayers = {
  /** Gross season — recovery lever */
  recovery: number
  /** Gross season — frequency lever */
  frequency: number
  /** Gross season — domino lever */
  domino: number
  /** Sum of gross season layers */
  total: number
  activeCardholders: number
  dominoNewClients: number
}

export type MonthCandle = {
  month: number
  open: number
  high: number
  low: number
  close: number
}

export type ParcoursProjectionResult = {
  layers: SeasonProjectionLayers
  /** Monthly gross before reward / diamond / system (sum of monthly layer gross) */
  grossMonth: number
  rewardCostMonth: number
  diamondCostMonth: number
  systemFeeMonth: number
  /** Net EUR / month after costs */
  netCardinMonth: number
  /** Net EUR over full season (primary headline) */
  netCardinSeason: number
  /** Retours projetés / mois (recovery path, same engine as gross layers) */
  monthlyReturns: number
  /** Clients récupérés / mois (approx., base_return path) */
  recoveredClientsMonth: number
  /** Label de confiance (scénario base_return) */
  confidenceLabel: string
  /** Net monthly (same as netCardinMonth rounded for display) */
  monthlyAverage: number
  /** Band on net monthly */
  monthlyLow: number
  monthlyHigh: number
  cumulativeByMonth: number[]
  candles: MonthCandle[]
  merchantType: string
}
