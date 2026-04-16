import nodemailer from "nodemailer"

import { formatDecimal } from "@/lib/number-format"
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

type ContactEmailInput = {
  businessName: string
  city?: string
  email: string
  request: string
  origin?: string
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

export async function sendContactEmails(input: ContactEmailInput) {
  const config = getEmailConfig()
  const siteUrl = getSiteUrl(input.origin)
  const requestLine = input.request.trim() || "Merchant asked to be contacted later."
  const cityLine = input.city?.trim() ? input.city.trim() : "Not provided"

  const internalText = [
    "New merchant contact request",
    "",
    `Business: ${input.businessName}`,
    `City: ${cityLine}`,
    `Email: ${input.email}`,
    "",
    requestLine,
    "",
    `Landing: ${siteUrl}/landing`,
  ].join("\n")

  const internalHtml = `
    <h2>New merchant contact request</h2>
    <p><strong>Business:</strong> ${escapeHtml(input.businessName)}</p>
    <p><strong>City:</strong> ${escapeHtml(cityLine)}</p>
    <p><strong>Email:</strong> ${escapeHtml(input.email)}</p>
    <p><strong>Request:</strong><br />${escapeHtml(requestLine).replace(/\n/g, "<br />")}</p>
    <p><strong>Landing:</strong> <a href="${siteUrl}/landing">${siteUrl}/landing</a></p>
  `

  const merchantText = [
    `Bonjour,`,
    "",
    "Nous avons bien recu votre demande Cardin.",
    "",
    "Prochaine etape:",
    "- nous vous recontactons avec le recapitulatif marchand,",
    "- puis nous reprenons le parcours au bon moment.",
    "",
    `Si besoin, repondez directement a ${config.contactToEmail}.`,
    `${siteUrl}/parcours`,
  ].join("\n")

  const merchantHtml = `
    <p>Bonjour,</p>
    <p>Nous avons bien recu votre demande Cardin.</p>
    <p>Prochaine etape:</p>
    <ul>
      <li>nous vous recontactons avec le recapitulatif marchand,</li>
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
    subject: "Cardin - demande bien recue",
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