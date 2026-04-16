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
  phone?: string
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
  const requestLine = input.request.trim() || "Le marchand souhaite être recontacté plus tard."
  const cityLine = input.city?.trim() ? input.city.trim() : "Non précisée"
  const phoneLine = input.phone?.trim() ? input.phone.trim() : "Non précisé"

  const recap = input.parcoursSelections ? formatParcoursRecap(input.parcoursSelections) : null

  const internalText = [
    "Nouveau contact marchand",
    "",
    `Lieu : ${input.businessName}`,
    `Ville : ${cityLine}`,
    `Téléphone : ${phoneLine}`,
    `E-mail : ${input.email}`,
    "",
    "Demande :",
    requestLine,
    ...(recap ? ["", "─────", "", recap.text] : []),
    "",
    `Landing : ${siteUrl}/landing`,
  ].join("\n")

  const internalHtml = `
    <h2 style="font-family:Georgia,serif;color:#163328;">Nouveau contact marchand</h2>
    <p><strong>Lieu :</strong> ${escapeHtml(input.businessName)}</p>
    <p><strong>Ville :</strong> ${escapeHtml(cityLine)}</p>
    <p><strong>Téléphone :</strong> ${escapeHtml(phoneLine)}</p>
    <p><strong>E-mail :</strong> ${escapeHtml(input.email)}</p>
    <p><strong>Demande :</strong><br />${escapeHtml(requestLine).replace(/\n/g, "<br />")}</p>
    ${recap ? recap.html : ""}
    <p><strong>Landing :</strong> <a href="${siteUrl}/landing">${siteUrl}/landing</a></p>
  `

  const businessGreeting = input.businessName?.trim()
    ? `Bonjour ${input.businessName.trim()},`
    : "Bonjour,"

  const merchantText = recap
    ? [
        businessGreeting,
        "",
        "Merci — votre configuration Cardin est enregistrée.",
        "Vous trouverez ci-dessous le récapitulatif de votre saison : récompense, activation et ce que vos clients vont concrètement faire.",
        "",
        recap.text,
        "",
        "Prochaine étape :",
        "— notre équipe revient vers vous pour valider les derniers réglages,",
        "— puis nous lançons l'activation au rythme qui vous convient.",
        "",
        `Une question ou une envie d'ajustement ? Répondez simplement à ce message ou écrivez à ${config.contactToEmail}.`,
        "",
        "À très vite,",
        "L'équipe Cardin",
        "",
        `${siteUrl}/parcours`,
      ].join("\n")
    : [
        businessGreeting,
        "",
        "Merci — votre demande Cardin est bien reçue.",
        "Un membre de l'équipe revient vers vous très rapidement avec le récapitulatif marchand et les prochaines étapes.",
        "",
        `En attendant, si une question se précise, écrivez-nous directement à ${config.contactToEmail}.`,
        "",
        "À très vite,",
        "L'équipe Cardin",
        "",
        `${siteUrl}/parcours`,
      ].join("\n")

  const merchantHtml = recap
    ? `
      <div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif;color:#163328;line-height:1.6;">
        <p>${escapeHtml(businessGreeting)}</p>
        <p>Merci — votre configuration Cardin est enregistrée.</p>
        <p style="margin:0 0 12px;">Vous trouverez ci-dessous le récapitulatif de votre saison : récompense, activation, et ce que vos clients vont concrètement faire.</p>
        ${recap.html}
        <p style="margin-top:24px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#1f5a46;">Prochaine étape</p>
        <ul style="margin:8px 0 16px;padding-left:18px;">
          <li>notre équipe revient vers vous pour valider les derniers réglages,</li>
          <li>puis nous lançons l'activation au rythme qui vous convient.</li>
        </ul>
        <p>Une question ou une envie d'ajustement ? Répondez simplement à ce message ou écrivez à <a href="mailto:${escapeHtml(config.contactToEmail)}" style="color:#1f5a46;">${escapeHtml(config.contactToEmail)}</a>.</p>
        <p style="margin-top:20px;">À très vite,<br />L'équipe Cardin</p>
        <p><a href="${siteUrl}/parcours" style="color:#1f5a46;">Revoir le parcours marchand</a></p>
      </div>
    `
    : `
      <div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif;color:#163328;line-height:1.6;">
        <p>${escapeHtml(businessGreeting)}</p>
        <p>Merci — votre demande Cardin est bien reçue.</p>
        <p>Un membre de l'équipe revient vers vous très rapidement avec le récapitulatif marchand et les prochaines étapes.</p>
        <p>En attendant, si une question se précise, écrivez-nous directement à <a href="mailto:${escapeHtml(config.contactToEmail)}" style="color:#1f5a46;">${escapeHtml(config.contactToEmail)}</a>.</p>
        <p style="margin-top:20px;">À très vite,<br />L'équipe Cardin</p>
        <p><a href="${siteUrl}/parcours" style="color:#1f5a46;">Revoir le parcours marchand</a></p>
      </div>
    `

  await sendMail({
    to: config.contactToEmail,
    replyTo: input.email,
    subject: `Cardin · nouveau contact marchand — ${input.businessName}`,
    text: internalText,
    html: internalHtml,
  })

  await sendMail({
    to: input.email,
    replyTo: config.contactToEmail,
    subject: recap ? "Cardin · votre configuration de saison" : "Cardin · votre demande est bien reçue",
    text: merchantText,
    html: merchantHtml,
  })
}

function formatCheckoutAmount(amountTotal?: number | null, currency?: string | null): string {
  if (typeof amountTotal !== "number" || !Number.isFinite(amountTotal)) {
    return "Montant confirmé"
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
    "Paiement Stripe confirmé",
    "",
    `Session : ${input.sessionId}`,
    `Montant : ${amountLine}`,
    `E-mail client : ${customerEmail || "Non précisé"}`,
    `Payment link : ${input.paymentLinkId ?? "Non précisé"}`,
    "",
    `${siteUrl}/apres-paiement`,
  ].join("\n")

  await sendMail({
    to: config.contactToEmail,
    replyTo: customerEmail || undefined,
    subject: `Cardin · paiement Stripe reçu — ${customerEmail || input.sessionId}`,
    text: internalText,
    html: `
      <h2 style="font-family:Georgia,serif;color:#163328;">Paiement Stripe confirmé</h2>
      <p><strong>Session :</strong> ${escapeHtml(input.sessionId)}</p>
      <p><strong>Montant :</strong> ${escapeHtml(amountLine)}</p>
      <p><strong>E-mail client :</strong> ${escapeHtml(customerEmail || "Non précisé")}</p>
      <p><strong>Payment link :</strong> ${escapeHtml(input.paymentLinkId ?? "Non précisé")}</p>
      <p><a href="${siteUrl}/apres-paiement">Page après paiement</a></p>
    `,
  })

  if (!customerEmail) {
    return
  }

  const merchantText = [
    `Bonjour ${customerName},`,
    "",
    `Votre paiement Cardin est bien reçu (${amountLine}). Bienvenue dans la saison.`,
    "",
    "Ce qui se passe maintenant :",
    "— Stripe vous a envoyé son reçu, c'est votre justificatif officiel,",
    "— notre équipe prépare le récap d'activation sur mesure pour votre lieu,",
    "— vous recevrez ensuite les prochaines étapes pour lancer le parcours au bon moment.",
    "",
    "Utile à garder sous la main :",
    `— page après paiement : ${siteUrl}/apres-paiement`,
    `— votre parcours marchand : ${siteUrl}/parcours`,
    "",
    `Une question ? Écrivez-nous à ${config.contactToEmail} — on répond rapidement.`,
    "",
    "À très vite,",
    "L'équipe Cardin",
  ].join("\n")

  const merchantHtml = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif;color:#163328;line-height:1.6;">
      <p>Bonjour ${escapeHtml(customerName)},</p>
      <p>Votre paiement Cardin est bien reçu (<strong>${escapeHtml(amountLine)}</strong>). Bienvenue dans la saison.</p>
      <p style="margin-top:20px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#1f5a46;">Ce qui se passe maintenant</p>
      <ul style="margin:8px 0 16px;padding-left:18px;">
        <li>Stripe vous a envoyé son reçu, c'est votre justificatif officiel,</li>
        <li>notre équipe prépare le récap d'activation sur mesure pour votre lieu,</li>
        <li>vous recevrez ensuite les prochaines étapes pour lancer le parcours au bon moment.</li>
      </ul>
      <p style="margin-top:20px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#1f5a46;">À garder sous la main</p>
      <p style="margin:8px 0;"><a href="${siteUrl}/apres-paiement" style="color:#1f5a46;">Page après paiement</a><br /><a href="${siteUrl}/parcours" style="color:#1f5a46;">Votre parcours marchand</a></p>
      <p>Une question ? Écrivez-nous à <a href="mailto:${escapeHtml(config.contactToEmail)}" style="color:#1f5a46;">${escapeHtml(config.contactToEmail)}</a> — on répond rapidement.</p>
      <p style="margin-top:20px;">À très vite,<br />L'équipe Cardin</p>
    </div>
  `

  await sendMail({
    to: customerEmail,
    replyTo: config.contactToEmail,
    subject: "Cardin · paiement bien reçu",
    text: merchantText,
    html: merchantHtml,
  })
}