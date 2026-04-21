import { createHash, timingSafeEqual } from "crypto"

export const PRESENTATION_COOKIE_NAME = "cardin_presentation_access"

const DEFAULT_PRESENTATION_PASSWORD = "presentation"

function getPresentationPassword() {
  return process.env.CARDIN_PRESENTATION_PASSWORD?.trim() || DEFAULT_PRESENTATION_PASSWORD
}

export function getPresentationToken() {
  return createHash("sha256").update(`cardin:presentation:${getPresentationPassword()}`).digest("hex")
}

export function isPresentationAuthorized(value: string | undefined | null) {
  if (!value) return false

  const expected = Buffer.from(getPresentationToken())
  const received = Buffer.from(value)

  if (expected.length !== received.length) return false
  return timingSafeEqual(expected, received)
}

export function verifyPresentationPassword(input: string) {
  const normalized = input.trim()
  if (!normalized) return false

  const expected = Buffer.from(getPresentationToken())
  const received = Buffer.from(createHash("sha256").update(`cardin:presentation:${normalized}`).digest("hex"))

  if (expected.length !== received.length) return false
  return timingSafeEqual(expected, received)
}
