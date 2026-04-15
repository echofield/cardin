export const CARDIN_CONTACT_EMAIL = "contact@getcardin.com"

export function buildContactMailto(subject: string, body: string): string {
  const params = new URLSearchParams({
    subject,
    body,
  })

  return `mailto:${CARDIN_CONTACT_EMAIL}?${params.toString()}`
}