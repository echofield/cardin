import Link from "next/link"

import { LandingOnboardingJourney } from "@/components/landing/LandingOnboardingJourney"
import { MobileStickyInstallBar } from "@/components/landing/MobileStickyInstallBar"
import { MerchantSeasonStudio } from "@/components/landing/MerchantSeasonStudio"
import { PublicFooter } from "@/components/shared/PublicFooter"
import { LANDING_PRICING, LANDING_SECTOR_CARDS, STRIPE_PAYMENT_LINK } from "@/lib/landing-content"
import { CARDIN_CONTACT_EMAIL, buildContactMailto } from "@/lib/site-contact"

export default function LandingPage() {
  const recapMailto = buildContactMailto(
    "Cardin — envoyez-moi le récap",
    "Bonjour Cardin,\r\n\r\nJe veux le récapitulatif marchand et un retour plus tard.\r\n\r\nNom du lieu :\r\nVille :\r\nType de commerce :\r\nQuand vous rappeler :\r\n",
  )

  return (
    <main className="bg-[#F7F3EA] text-[#18271F]" id="top">
      <section className="relative overflow-hidden border-b border-[#E7E2D8]">
        <div className="absolute left-1/2 top-[-260px] hidden h-[440px] w-[440px] -translate-x-1/2 rounded-full bg-[#EEF2EA] blur-3xl sm:block" />
        <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-12 sm:px-6 sm:pb-14 sm:pt-14 lg:px-8 lg:pb-20 lg:pt-20">
          <div className="max-w-[60rem]">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#677168]">Cardin</p>
            <h1 className="mt-4 max-w-5xl font-serif text-[clamp(3rem,9vw,5.4rem)] leading-[1.02] text-[#163328]">
              Moteur de revenu saisonnier.<br className="hidden sm:block" /> Chaque passage devient un retour mesurable.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-[#566159] sm:text-lg">
              Débloquez le Diamond comme horizon dès le départ : missions en cours de route, retour, recommandation et
              moments activés, sans promesse creuse.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link className="inline-flex h-12 items-center justify-center rounded-full border border-[#173A2E] bg-[#173A2E] px-6 text-sm font-medium text-[#FBFAF6] shadow-[0_12px_24px_-18px_rgba(27,67,50,0.45)] transition hover:bg-[#24533F]" href="/parcours">
                Voir le parcours marchand
              </Link>
              <Link
                className="inline-flex h-12 items-center justify-center rounded-full border border-[#D6DCD3] bg-[#F5F2EB] px-6 text-sm font-medium text-[#173A2E] transition hover:border-[#B8C3B5] hover:bg-[#F1EEE5]"
                href="/parcours-client"
              >
                Parcours client
              </Link>
              <Link className="inline-flex h-12 items-center justify-center rounded-full border border-[#D6DCD3] bg-[#F5F2EB] px-6 text-sm font-medium text-[#173A2E] transition hover:border-[#B8C3B5] hover:bg-[#F1EEE5]" href="/dashboard-demo">
                Voir votre tableau de bord
              </Link>
            </div>
          </div>
        </div>
      </section>

      <LandingOnboardingJourney />

      <section className="pt-8 lg:pt-10" id="methode">
        <MerchantSeasonStudio />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8" id="cas">
        <div className="rounded-[1.8rem] border border-[#E3DDD0] bg-[#FFFEFA] p-6 sm:p-8">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#6D776F]">Par type de commerce</p>
          <h2 className="mt-3 font-serif text-3xl text-[#173328] sm:text-4xl">Une logique différente selon le lieu.</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {LANDING_SECTOR_CARDS.map((card) => (
              <div className="rounded-[1.4rem] border border-[#E2DDD1] bg-[#FBF9F3] p-5" key={card.label}>
                <p className="font-serif text-2xl text-[#173A2E]">{card.label}</p>
                <p className="mt-3 text-sm leading-7 text-[#556159]">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8 lg:pb-16">
        <div className="rounded-[1.8rem] border border-[#D7DDD2] bg-[linear-gradient(180deg,#FFFEFA_0%,#F1F5EE_100%)] p-6 shadow-[0_24px_60px_-42px_rgba(23,58,46,0.25)] sm:p-8 lg:p-10">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#6D776F]">Offre Cardin</p>
          <h2 className="mt-3 max-w-4xl font-serif text-3xl text-[#173328] sm:text-4xl">Une saison claire. Une activation sous 48 h. Un retour lisible sous 30 jours.</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[#556159] sm:text-base">
            Vous achetez une première saison de 3 mois : QR de validation, carte digitale, tableau marchand, récompense visible et budget borné. Le client comprend ce qu&apos;il peut gagner. L&apos;équipe sait quoi faire. Le coût reste cadré.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[1.4rem] border border-[#E2DDD1] bg-[#FBF9F3] p-5">
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">Ce que vous achetez</p>
              <div className="mt-3 space-y-2 text-sm leading-7 text-[#203B31]">
                <p>{LANDING_PRICING.compactLabel}</p>
                <p>QR de validation + carte digitale + tableau marchand</p>
                <p>Première saison calibrée avec vous</p>
              </div>
            </div>
            <div className="rounded-[1.4rem] border border-[#E2DDD1] bg-[#FBF9F3] p-5">
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">Sous 48 h</p>
              <div className="mt-3 space-y-2 text-sm leading-7 text-[#203B31]">
                <p>QR comptoir prêt</p>
                <p>Tableau marchand actif</p>
                <p>Carte digitale active</p>
              </div>
            </div>
            <div className="rounded-[1.4rem] border border-[#E2DDD1] bg-[#FBF9F3] p-5">
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">Sous 30 jours</p>
              <div className="mt-3 space-y-2 text-sm leading-7 text-[#203B31]">
                <p>Premiers passages validés</p>
                <p>Premiers retours lisibles</p>
                <p>Récompense comprise par les clients réguliers</p>
              </div>
            </div>
            <div className="rounded-[1.4rem] border border-[#E2DDD1] bg-[#FBF9F3] p-5">
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">Staff en 10 secondes</p>
              <div className="mt-3 space-y-2 text-sm leading-7 text-[#203B31]">
                <p>1. Scanner ou ouvrir le panneau</p>
                <p>2. Valider le passage réel</p>
                <p>3. Laisser Cardin mettre à jour le parcours</p>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[1.4rem] border border-[#D7DDD2] bg-[#FFFEFA] p-5">
            <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">Confiance</p>
            <p className="mt-3 max-w-4xl text-sm leading-7 text-[#203B31]">
              Coût borné, validation réelle du passage, contrôle simple contre la fraude et surtout aucun discount non contrôlé. La propagation reste cadrée. La récompense reste un actif du lieu, pas une promo qui fuit.
            </p>
          </div>

          <div className="mt-8 rounded-[1.4rem] border border-[#D7DDD2] bg-[#FFFEFA] p-5 sm:p-6">
            <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">Activation</p>
            <h3 className="mt-3 font-serif text-2xl text-[#173328] sm:text-3xl">Un seul chemin pour lancer.</h3>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#556159] sm:text-base">
              Payer maintenant. Activer sous 48 h. Valider les passages réels. Lire les premiers retours sous 30 jours. Le reste peut s&apos;ajuster ensuite sans casser le cadre.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:w-fit">
              <a
                className="inline-flex h-12 items-center justify-center rounded-full border border-[#173A2E] bg-[#173A2E] px-6 text-sm font-medium text-[#FBFAF6] shadow-[0_12px_24px_-18px_rgba(27,67,50,0.45)] transition hover:bg-[#24533F]"
                href={STRIPE_PAYMENT_LINK}
                rel="noreferrer"
                target="_blank"
              >
                Payer 490 € et lancer
              </a>
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
                <Link className="text-[#173A2E] underline underline-offset-2" href="/parcours">
                  Revoir le parcours marchand
                </Link>
                <Link className="text-[#173A2E] underline underline-offset-2" href="/apres-paiement">
                  Voir la suite après paiement
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8 lg:pb-16">
        <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[1.8rem] border border-[#D7DDD2] bg-[#FFFEFA] p-6 shadow-[0_20px_60px_-44px_rgba(23,58,46,0.22)] sm:p-8">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#6D776F]">RGPD et confidentialité</p>
            <h2 className="mt-3 max-w-2xl font-serif text-3xl text-[#173328] sm:text-4xl">Un cadre lisible, pas une boîte noire.</h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[#556159] sm:text-base">
              Cardin fonctionne avec des validations de passage, un accès staff contrôlé et un cadre de saison borné. Les données d&apos;activation ne sont pas revendues, la lecture reste liée au lieu, et les demandes d&apos;accès, correction ou suppression restent traitables.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.25rem] border border-[#E2DDD1] bg-[#FBF9F3] p-4">
                <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">Données utiles</p>
                <p className="mt-3 text-sm leading-7 text-[#203B31]">Passages validés, paramétrage marchand et lecture d&apos;activité. Rien de plus que ce qui sert à faire tourner le système.</p>
              </div>
              <div className="rounded-[1.25rem] border border-[#E2DDD1] bg-[#FBF9F3] p-4">
                <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">Contrôle</p>
                <p className="mt-3 text-sm leading-7 text-[#203B31]">Validation staff, QR, budget borné, pas de discount libre et pas d&apos;ouverture incontrôlée côté équipe.</p>
              </div>
              <div className="rounded-[1.25rem] border border-[#E2DDD1] bg-[#FBF9F3] p-4">
                <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">Demande RGPD</p>
                <p className="mt-3 text-sm leading-7 text-[#203B31]">Confidentialité, accès, correction ou suppression : point de contact direct et traitement lieu par lieu.</p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
              <Link className="text-[#173A2E] underline underline-offset-2" href="/privacy">
                Lire la politique de confidentialité
              </Link>
              <Link className="text-[#173A2E] underline underline-offset-2" href="/legal">
                Voir les mentions légales
              </Link>
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-[#C8D4CB] bg-[linear-gradient(180deg,#F6FAF4_0%,#EDF4EE_100%)] p-6 shadow-[0_20px_60px_-44px_rgba(23,58,46,0.22)] sm:p-8">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#587064]">Pas maintenant ?</p>
            <h2 className="mt-3 max-w-xl font-serif text-3xl text-[#173328] sm:text-4xl">Gardez une sortie douce.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#556159] sm:text-base">
              Si le commerce ne décide pas tout de suite, le bon geste n&apos;est pas de pousser plus fort. Le bon geste est d&apos;envoyer un récap clair, de laisser un contact propre, puis de reprendre au bon moment.
            </p>
            <div className="mt-6 rounded-[1.4rem] border border-[#D7DDD2] bg-[#FFFEFA] p-5">
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">Processus simple</p>
              <div className="mt-3 space-y-2 text-sm leading-7 text-[#203B31]">
                <p>1. Envoyer un récap marchand par e-mail</p>
                <p>2. Reprendre sous 24-72 h avec un point concret</p>
                <p>3. Revenir sur le parcours, le dashboard demo ou le paiement seulement si le lieu est prêt</p>
              </div>
            </div>
            <div className="mt-5 rounded-[1.4rem] border border-[#D7DDD2] bg-[#FFFEFA] p-5">
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#6D776F]">E-mail de contact</p>
              <p className="mt-3 text-lg font-medium text-[#173328]">{CARDIN_CONTACT_EMAIL}</p>
              <p className="mt-2 text-sm leading-7 text-[#556159]">
                À créer si ce n&apos;est pas encore fait. C&apos;est l&apos;adresse simple à donner aux lieux pour demander le récap, poser une question RGPD ou revenir plus tard.
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                className="inline-flex h-12 items-center justify-center rounded-full border border-[#173A2E] bg-[#173A2E] px-6 text-sm font-medium text-[#FBFAF6] shadow-[0_12px_24px_-18px_rgba(27,67,50,0.45)] transition hover:bg-[#24533F]"
                href={recapMailto}
              >
                Envoyer le récap par e-mail
              </a>
              <Link
                className="inline-flex h-12 items-center justify-center rounded-full border border-[#D6DCD3] bg-[#F5F2EB] px-6 text-sm font-medium text-[#173A2E] transition hover:border-[#B8C3B5] hover:bg-[#F1EEE5]"
                href="/dashboard-demo"
              >
                Revoir le tableau de bord
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
      <MobileStickyInstallBar />
    </main>
  )
}