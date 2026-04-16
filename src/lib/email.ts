import nodemailer from "nodemailer"

import type { LandingWorldId } from "@/lib/landing-content"
import { LANDING_WORLDS } from "@/lib/landing-content"
import { formatDecimal } from "@/lib/number-format"
import {
  ACCESS_OPTIONS,
  INTENSITE_OPTIONS,
  MOMENT_OPTIONS,
  PROPAGATION_OPTIONS,
  SEASON_REWARDS,
  TRIGGER_OPTIONS,
  type AccessTypeId,
  type MomentId,
  type PropagationTypeId,
  type RewardTypeId,
  type SeasonRewardId,
  type TriggerTypeId,
} from "@/lib/parcours-selection-config"
import type { ParcoursSummitStyleId } from "@/lib/parcours-contract"
import { CARDIN_CONTACT_EMAIL } from "@/lib/site-contact"

type EmailConfig = {
  host: string
  port: number
  secure: boolean
  user: string
  pass: string
  fromEmail: string
  contactToEmail: string
}

export type ParcoursSelectionsPayload = {
  worldId: LandingWorldId
  seasonRewardId: SeasonRewardId | null
  rewardType: RewardTypeId | null
  intensite: ParcoursSummitStyleId | null
  moment: MomentId | null
  accessType: AccessTypeId | null
  triggerType: TriggerTypeId | null
  propagationType: PropagationTypeId | null
  summaryLine: string
  nextStepLine: string
}

type ContactEmailInput = {
  businessName: string
  city?: string
  email: string
  request: string
  origin?: string
  parcoursSelections?: ParcoursSelectionsPayload | null
}

type StripeCheckoutEmailInput = {
  sessionId: string
  amountTotal?: number | null
  currency?: string | null
  customerEmail?: string | null
  customerName?: string | null
  paymentLinkId?: string | null
  origin?: string
}

let transporter: nodemailer.Transporter | null = null

function getEmailConfig(): EmailConfig {
  const host = process.env.SMTP_HOST?.trim()
  const port = Number(process.env.SMTP_PORT ?? "465")
  const user = process.env.SMTP_USER?.trim()
  const pass = process.env.SMTP_PASS?.trim()
  const fromEmail = process.env.SMTP_FROM_EMAIL?.trim() || CARDIN_CONTACT_EMAIL
  const contactToEmail = process.env.CONTACT_TO_EMAIL?.trim() || CARDIN_CONTACT_EMAIL
  const secure = process.env.SMTP_SECURE == null ? port === 465 : process.env.SMTP_SECURE === "true"

  if (!host || !Number.isFinite(port) || !user || !pass) {
    throw new Error("Email transport is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER and SMTP_PASS.")
  }

  return { host, port, secure, user, pass, fromEmail, contactToEmail }
}

export function isEmailConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)
}

function getTransporter() {
  if (transporter) return transporter

  const config = getEmailConfig()
  transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  })

  return transporter
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function getSiteUrl(origin?: string): string {
  return process.env.CARDIN_SITE_URL?.trim() || process.env.NEXT_PUBLIC_SITE_URL?.trim() || origin || "https://getcardin.com"
}

async function sendMail(options: nodemailer.SendMailOptions) {
  const config = getEmailConfig()
  const client = getTransporter()

  await client.sendMail({
    from: config.fromEmail,
    ...options,
  })
}

// ─── Parcours recap formatter ────────────────────────────────────────────────
// Renders the merchant's Step 3/4 configuration as a sales-ready recap block,
// in both plain text (for email body) and HTML (for email body).

function lookupLabel<T extends { id: string; label: string }>(list: readonly T[], id: string | null): string | null {
  if (!id) return null
  return list.find((o) => o.id === id)?.label ?? null
}

function lookupSeasonReward(worldId: LandingWorldId, id: SeasonRewardId | null): string | null {
  if (!id) return null
  return SEASON_REWARDS[worldId]?.find((o) => o.id === id)?.label ?? null
}

export function formatParcoursRecap(selections: ParcoursSelectionsPayload): { text: string; html: string } {
  const world = LANDING_WORLDS[selections.worldId]
  const season = lookupSeasonReward(selections.worldId, selections.seasonRewardId)
  const rewardType = lookupLabel(
    [
      { id: "direct", label: "Direct" },
      { id: "progression", label: "Progression" },
      { id: "invitation", label: "Invitation" },
      { id: "evenement", label: "Événement" },
    ] as const,
    selections.rewardType,
  )
  const intensite = lookupLabel(INTENSITE_OPTIONS, selections.intensite)
  const moment = lookupLabel(MOMENT_OPTIONS, selections.moment)
  const access = lookupLabel(ACCESS_OPTIONS, selections.accessType)
  const trigger = lookupLabel(TRIGGER_OPTIONS, selections.triggerType)
  const propagation = lookupLabel(PROPAGATION_OPTIONS, selections.propagationType)

  const text = [
    "Configuration Cardin",
    `Vertical : ${world?.label ?? selections.worldId}`,
    "",
    "Récompense de saison",
    `  → ${season ?? "—"}`,
    "",
    "Récompense au quotidien",
    `  → ${selections.summaryLine || [rewardType, intensite, moment].filter(Boolean).join(" · ") || "—"}`,
    "",
    "Activation",
    `  → Qui : ${access ?? "—"}`,
    `  → Déclencheur : ${trigger ?? "—"}`,
    `  → Propagation : ${propagation ?? "—"}`,
    "",
    "Ce que vos clients vont faire",
    `  → ${selections.nextStepLine || "—"}`,
  ].join("\n")

  const row = (label: string, value: string | null) => `
    <tr>
      <td style="padding:4px 12px 4px 0;color:#6b766d;font-size:13px;vertical-align:top;width:180px;">${escapeHtml(label)}</td>
      <td style="padding:4px 0;color:#163328;font-size:14px;">${escapeHtml(value ?? "—")}</td>
    </tr>`

  const html = `
    <div style="margin-top:28px;padding:20px 22px;border:1px solid #DED9CF;border-radius:16px;background:#FBFAF6;">
      <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#6b766d;">Configuration Cardin</p>
      <p style="margin:0 0 16px;font-family:Georgia,serif;font-size:20px;color:#163328;">${escapeHtml(world?.label ?? selections.worldId)}</p>

      <p style="margin:16px 0 6px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#1f5a46;">Récompense de saison</p>
      <p style="margin:0 0 12px;font-size:15px;color:#163328;">${escapeHtml(season ?? "—")}</p>

      <p style="margin:16px 0 6px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#1f5a46;">Récompense au quotidien</p>
      <p style="margin:0 0 12px;font-size:14px;color:#163328;">${escapeHtml(selections.summaryLine || [rewardType, intensite, moment].filter(Boolean).join(" · ") || "—")}</p>

      <p style="margin:16px 0 6px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#1f5a46;">Activation</p>
      <table style="border-collapse:collapse;width:100%;margin:0 0 12px;">
        ${row("Qui peut y accéder", access)}
        ${row("Déclencheur", trigger)}
        ${row("Propagation", propagation)}
      </table>

      <p style="margin:16px 0 6px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#1f5a46;">Ce que vos clients vont faire</p>
      <p style="margin:0;font-size:14px;line-height:1.55;color:#163328;">${escapeHtml(selections.nextStepLine || "—")}</p>
    </div>
  `

  return { text, html }
}

export async function sendContactEmails(input: ContactEmailInput) {
  const config = getEmailConfig()
  const siteUrl = getSiteUrl(input.origin)
  const requestLine = input.request.trim() || "Merchant asked to be contacted later."
  const cityLine = input.city?.trim() ? input.city.trim() : "Not provided"

  const recap = input.parcoursSelections ? formatParcoursRecap(input.parcoursSelections) : null

  const internalText = [
    "New merchant contact request",
    "",
    `Business: ${input.businessName}`,
    `City: ${cityLine}`,
    `Email: ${input.email}`,
    "",
    requestLine,
    ...(recap ? ["", "─────", "", recap.text] : []),
    "",
    `Landing: ${siteUrl}/landing`,
  ].join("\n")

  const internalHtml = `
    <h2>New merchant contact request</h2>
    <p><strong>Business:</strong> ${escapeHtml(input.businessName)}</p>
    <p><strong>City:</strong> ${escapeHtml(cityLine)}</p>
    <p><strong>Email:</strong> ${escapeHtml(input.email)}</p>
    <p><strong>Request:</strong><br />${escapeHtml(requestLine).replace(/\n/g, "<br />")}</p>
    ${recap ? recap.html : ""}
    <p><strong>Landing:</strong> <a href="${siteUrl}/landing">${siteUrl}/landing</a></p>
  `

  const merchantText = [
    `Bonjour,`,
    "",
    recap
      ? "Voici votre configuration Cardin. Gardez cet email : il contient le plan de votre saison."
      : "Nous avons bien recu votre demande Cardin.",
    ...(recap ? ["", recap.text] : []),
    "",
    "Prochaine etape:",
    "- notre equipe revient vers vous avec le recapitulatif marchand,",
    "- puis nous reprenons le parcours au bon moment.",
    "",
    `Si besoin, repondez directement a ${config.contactToEmail}.`,
    `${siteUrl}/parcours`,
  ].join("\n")

  const merchantHtml = `
    <p>Bonjour,</p>
    <p>${recap
      ? "Voici votre configuration Cardin. Gardez cet email : il contient le plan de votre saison."
      : "Nous avons bien recu votre demande Cardin."}</p>
    ${recap ? recap.html : ""}
    <p style="margin-top:24px;">Prochaine etape :</p>
    <ul>
      <li>notre equipe revient vers vous avec le recapitulatif marchand,</li>
      <li>puis nous reprenons le parcours au bon moment.</li>
    </ul>
    <p>Si besoin, repondez directement a ${escapeHtml(config.contactToEmail)}.</p>
    <p><a href="${siteUrl}/parcours">Voir le parcours marchand</a></p>
  `

  await sendMail({
    to: config.contactToEmail,
    replyTo: input.email,
    subject: `Cardin - nouveau contact marchand - ${input.businessName}`,
    text: internalText,
    html: internalHtml,
  })

  await sendMail({
    to: input.email,
    replyTo: config.contactToEmail,
    subject: recap ? "Cardin - votre configuration de saison" : "Cardin - demande bien recue",
    text: merchantText,
    html: merchantHtml,
  })
}

function formatCheckoutAmount(amountTotal?: number | null, currency?: string | null): string {
  if (typeof amountTotal !== "number" || !Number.isFinite(amountTotal)) {
    return "Montant confirme"
  }

  const majorAmount = amountTotal / 100
  const currencyLabel = (currency ?? "eur").toUpperCase()
  return `${formatDecimal(majorAmount, { maximumFractionDigits: majorAmount % 1 === 0 ? 0 : 2 })} ${currencyLabel}`
}

export async function sendStripeCheckoutEmails(input: StripeCheckoutEmailInput) {
  const config = getEmailConfig()
  const siteUrl = getSiteUrl(input.origin)
  const amountLine = formatCheckoutAmount(input.amountTotal, input.currency)
  const customerEmail = input.customerEmail?.trim() || ""
  const customerName = input.customerName?.trim() || "Client"

  const internalText = [
    "Stripe checkout completed",
    "",
    `Session: ${input.sessionId}`,
    `Amount: ${amountLine}`,
    `Customer email: ${customerEmail || "Not provided"}`,
    `Payment link: ${input.paymentLinkId ?? "Not provided"}`,
    "",
    `${siteUrl}/apres-paiement`,
  ].join("\n")

  await sendMail({
    to: config.contactToEmail,
    replyTo: customerEmail || undefined,
    subject: `Cardin - paiement Stripe recu - ${customerEmail || input.sessionId}`,
    text: internalText,
    html: `
      <h2>Stripe checkout completed</h2>
      <p><strong>Session:</strong> ${escapeHtml(input.sessionId)}</p>
      <p><strong>Amount:</strong> ${escapeHtml(amountLine)}</p>
      <p><strong>Customer email:</strong> ${escapeHtml(customerEmail || "Not provided")}</p>
      <p><strong>Payment link:</strong> ${escapeHtml(input.paymentLinkId ?? "Not provided")}</p>
      <p><a href="${siteUrl}/apres-paiement">After payment page</a></p>
    `,
  })

  if (!customerEmail) {
    return
  }

  const merchantText = [
    `Bonjour ${customerName},`,
    "",
    `Nous avons bien recu votre paiement Cardin (${amountLine}).`,
    "",
    "Suite immediate:",
    "- gardez l'email Stripe de confirmation,",
    "- revenez sur la page apres paiement,",
    "- notre equipe vous envoie ensuite le recap d'activation et les prochaines etapes.",
    "",
    `${siteUrl}/apres-paiement`,
    `${siteUrl}/parcours`,
    "",
    `Besoin d'aide: ${config.contactToEmail}`,
  ].join("\n")

  const merchantHtml = `
    <p>Bonjour ${escapeHtml(customerName)},</p>
    <p>Nous avons bien recu votre paiement Cardin (<strong>${escapeHtml(amountLine)}</strong>).</p>
    <p>Suite immediate:</p>
    <ul>
      <li>gardez l'email Stripe de confirmation,</li>
      <li>revenez sur la page apres paiement,</li>
      <li>notre equipe vous envoie ensuite le recap d'activation et les prochaines etapes.</li>
    </ul>
    <p><a href="${siteUrl}/apres-paiement">Voir la page apres paiement</a></p>
    <p><a href="${siteUrl}/parcours">Revoir le parcours marchand</a></p>
    <p>Besoin d'aide: ${escapeHtml(config.contactToEmail)}</p>
  `

  await sendMail({
    to: customerEmail,
    replyTo: config.contactToEmail,
    subject: "Cardin - paiement bien recu",
    text: merchantText,
    html: merchantHtml,
  })
}