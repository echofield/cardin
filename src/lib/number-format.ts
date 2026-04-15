const DEFAULT_LOCALE = "fr-FR"
const MIN_FRACTION_DIGITS = 0
const MAX_FRACTION_DIGITS = 20

function toFiniteNumber(value: unknown, fallback = 0): number {
  const parsed = typeof value === "number" ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export function clampFractionDigits(value: unknown, fallback = 0): number {
  const parsed = Math.trunc(toFiniteNumber(value, fallback))
  if (parsed < MIN_FRACTION_DIGITS) return MIN_FRACTION_DIGITS
  if (parsed > MAX_FRACTION_DIGITS) return MAX_FRACTION_DIGITS
  return parsed
}

export function safeNumberFormat(
  locale: string = DEFAULT_LOCALE,
  options: Intl.NumberFormatOptions = {},
): Intl.NumberFormat {
  const minimumFractionDigits =
    options.minimumFractionDigits == null
      ? undefined
      : clampFractionDigits(options.minimumFractionDigits, MIN_FRACTION_DIGITS)

  const maximumFractionDigits =
    options.maximumFractionDigits == null
      ? undefined
      : clampFractionDigits(options.maximumFractionDigits, minimumFractionDigits ?? MIN_FRACTION_DIGITS)

  const normalizedOptions: Intl.NumberFormatOptions = {
    ...options,
    minimumFractionDigits,
    maximumFractionDigits:
      minimumFractionDigits != null && maximumFractionDigits != null
        ? Math.max(minimumFractionDigits, maximumFractionDigits)
        : maximumFractionDigits,
  }

  try {
    return new Intl.NumberFormat(locale, normalizedOptions)
  } catch {
    return new Intl.NumberFormat(locale, {
      useGrouping: normalizedOptions.useGrouping,
      minimumFractionDigits,
      maximumFractionDigits: normalizedOptions.maximumFractionDigits,
    })
  }
}

export function formatDecimal(
  value: unknown,
  options: {
    locale?: string
    minimumFractionDigits?: number
    maximumFractionDigits?: number
  } = {},
): string {
  const locale = options.locale ?? DEFAULT_LOCALE
  const minimumFractionDigits =
    options.minimumFractionDigits == null
      ? undefined
      : clampFractionDigits(options.minimumFractionDigits, MIN_FRACTION_DIGITS)
  const maximumFractionDigits =
    options.maximumFractionDigits == null
      ? undefined
      : clampFractionDigits(options.maximumFractionDigits, minimumFractionDigits ?? MIN_FRACTION_DIGITS)

  return safeNumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(toFiniteNumber(value, 0))
}

export function formatEuro(
  value: unknown,
  options: {
    locale?: string
    minimumFractionDigits?: number
    maximumFractionDigits?: number
  } = {},
): string {
  return `${formatDecimal(value, options)} €`
}
