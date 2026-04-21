import { ParcoursParticles } from "@/components/parcours-v2/ParcoursParticles"
import { PresentationLockButton } from "@/components/presentation/PresentationLockButton"
import { LANDING_PRICING } from "@/lib/landing-content"

const DEALER_COMMISSION = 150
const DEALER_BONUS_THRESHOLD = 10
const DEALER_BONUS_AMOUNT = 200

const problemPoints = [
  "Le problème n'est pas seulement le trafic. C'est le retour.",
  "Les jours faibles restent vides alors que la base client existe déjà.",
  "Les remises et promotions créent peu de mémoire et dégradent la marge.",
]

const solutionPillars = [
  {
    icon: "◇",
    title: "Saison de 90 jours",
    detail: "Un cadre vendu, installé, puis tenu dans le lieu.",
  },
  {
    icon: "→",
    title: "Moments visibles",
    detail: "Chaque semaine, il se passe quelque chose de clair pour le client.",
  },
  {
    icon: "◆",
    title: "Diamond en jeu",
    detail: "Le sommet reste visible et donne une tension réelle à la saison.",
  },
  {
    icon: "↺",
    title: "Marchand gagnant d'abord",
    detail: "Le lieu gagne avant la résolution finale: retour, panier, créneau rempli.",
  },
]

const distributionPoints = [
  {
    title: "Acquisition directe",
    detail: "Démonstration iPad, lecture du lieu, closing rapide, activation sous 48 h.",
  },
  {
    title: "Cadre duplicable",
    detail: "Même saison, même langage, même installation. Le produit reste simple à déployer.",
  },
  {
    title: "Réseaux et partenaires",
    detail: "Commerciaux terrain, agences locales, cercles de commerçants, réseaux de lieux.",
  },
  {
    title: "Partenariat simple",
    detail: `${DEALER_COMMISSION} € par saison activée, puis ${DEALER_BONUS_AMOUNT} € de bonus toutes les ${DEALER_BONUS_THRESHOLD} activations.`,
  },
]

export function CardinPresentationPage() {
  return (
    <main className="relative overflow-hidden bg-[radial-gradient(circle_at_top,rgba(15,61,46,0.06),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(184,149,106,0.12),transparent_34%),#f2ede4] text-[#18271f]">
      <ParcoursParticles />

      <div className="relative z-[2] mx-auto max-w-[1240px] px-6 py-10">
        <div className="mb-12 flex items-center justify-between text-[12px] uppercase tracking-[0.22em] text-[#8a8578]">
          <div className="font-serif text-[30px] tracking-[0.12em] text-[#003d2c]">CARDIN</div>
          <div className="flex items-center gap-3">
            <span>Présentation</span>
            <PresentationLockButton />
          </div>
        </div>

        <section className="mb-12 grid gap-8 border border-[#ded9cf] bg-[rgba(255,253,248,0.72)] p-8 backdrop-blur-sm lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] lg:items-end">
          <div>
            <p className="mb-4 text-[11px] uppercase tracking-[0.28em] text-[#8a8578]">Présentation Cardin</p>
            <h1 className="font-serif text-[clamp(54px,8vw,96px)] leading-[0.94] tracking-[-0.03em] text-[#18271f]">
              Le moteur de retour <em className="font-medium italic text-[#003d2c]">pour le commerce physique.</em>
            </h1>
            <p className="mt-6 max-w-[760px] font-serif text-[clamp(22px,2.5vw,31px)] italic leading-[1.3] text-[#3d4d43]">
              Cardin vend une saison de 90 jours. Chaque semaine, un moment visible donne une raison de revenir. Et au bout, un Diamond reste en jeu.
            </p>
          </div>

          <aside className="border border-[#d4cdbd] bg-[rgba(240,237,230,0.76)] p-6">
            <div className="mb-3 text-[10px] uppercase tracking-[0.22em] text-[#8a8578]">Modèle</div>
            <div className="font-serif text-[56px] leading-none text-[#003d2c]">{LANDING_PRICING.activationFee} €</div>
            <div className="mt-2 text-sm leading-7 text-[#5d675f]">
              Saison de 90 jours<br />
              Activation sous 48 h<br />
              Aucun revenue share
            </div>
          </aside>
        </section>

        <section className="mb-12 grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(300px,0.95fr)]">
          <article className="border border-[#ded9cf] bg-[rgba(255,253,248,0.74)] p-7">
            <p className="mb-3 text-[11px] uppercase tracking-[0.24em] text-[#8a8578]">Le problème</p>
            <h2 className="mb-5 font-serif text-[clamp(34px,4vw,48px)] leading-[1.02] text-[#003d2c]">Le chiffre part avec les clients.</h2>
            <div className="space-y-4">
              {problemPoints.map((point, index) => (
                <div className="border border-[#ded9cf] bg-[rgba(242,237,228,0.68)] px-5 py-4" key={point}>
                  <div className="mb-2 font-serif text-sm italic text-[#a38767]">{`${index + 1}.`}</div>
                  <p className="text-[15px] leading-7 text-[#35453c]">{point}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="border border-[#ded9cf] bg-[linear-gradient(to_bottom,rgba(15,61,46,0.03),rgba(184,149,106,0.05))] p-7">
            <p className="mb-3 text-[11px] uppercase tracking-[0.24em] text-[#8a8578]">Exemple conservateur</p>
            <h2 className="mb-3 font-serif text-[clamp(34px,4vw,48px)] leading-[1.02] text-[#18271f]">Le ROI reste lisible.</h2>
            <div className="mb-6 font-serif text-[62px] leading-none text-[#003d2c]">800 €</div>
            <p className="text-[15px] leading-7 text-[#35453c]">
              Exemple simple: +20 clients qui reviennent 2 fois dans le mois avec un panier moyen de 20 €.
            </p>
            <div className="mt-6 border-t border-[#d4cdbd] pt-5">
              <div className="grid gap-4 sm:grid-cols-3">
                <Metric label="Investissement" value="490 €" sub="une saison" />
                <Metric label="Payback" value="< 1 mois" sub="scénario conservateur" />
                <Metric label="Marge" value="préservée" sub="pas de remise permanente" />
              </div>
            </div>
          </article>
        </section>

        <section className="mb-12 border border-[#ded9cf] bg-[rgba(255,253,248,0.72)] p-7">
          <p className="mb-3 text-[11px] uppercase tracking-[0.24em] text-[#8a8578]">La solution</p>
          <h2 className="mb-6 font-serif text-[clamp(36px,4.2vw,52px)] leading-[1.02] text-[#003d2c]">Une saison vendue. Des moments visibles. Un Diamond au sommet.</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {solutionPillars.map((pillar) => (
              <article className="border border-[#ded9cf] bg-[rgba(242,237,228,0.65)] px-5 py-6" key={pillar.title}>
                <div className="mb-3 font-serif text-[28px] leading-none text-[#a38767]">{pillar.icon}</div>
                <h3 className="mb-2 font-serif text-[28px] leading-[1.05] text-[#18271f]">{pillar.title}</h3>
                <p className="text-[14px] leading-7 text-[#3d4d43]">{pillar.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mb-12 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <article className="border border-[#ded9cf] bg-[rgba(255,253,248,0.74)] p-7">
            <p className="mb-3 text-[11px] uppercase tracking-[0.24em] text-[#8a8578]">Le moteur Cardin</p>
            <h2 className="mb-5 font-serif text-[clamp(34px,4vw,48px)] leading-[1.02] text-[#003d2c]">Le site vend le système sans l'alourdir.</h2>
            <div className="grid gap-4">
              <StoryCard
                title="1. Lecture"
                detail="Le lieu comprend où le retour casse: disparition, fréquence, creux, propagation."
              />
              <StoryCard
                title="2. Saison"
                detail="Le marchand pose un jour clé, un moment de la semaine, une entrée claire et un Diamond."
              />
              <StoryCard
                title="3. Impact"
                detail="Cardin montre pourquoi le lieu gagne d'abord: trafic, retour, panier, tension."
              />
              <StoryCard
                title="4. Offre"
                detail="La vente se ferme sur une saison simple, cadrée, activée rapidement."
              />
            </div>
          </article>

          <article className="border border-[#ded9cf] bg-[rgba(255,253,248,0.74)] p-7">
            <p className="mb-3 text-[11px] uppercase tracking-[0.24em] text-[#8a8578]">Distribution</p>
            <h2 className="mb-5 font-serif text-[clamp(34px,4vw,48px)] leading-[1.02] text-[#003d2c]">Simple aujourd'hui. Duplicable demain.</h2>
            <div className="grid gap-4">
              {distributionPoints.map((point) => (
                <StoryCard detail={point.detail} title={point.title} key={point.title} />
              ))}
            </div>
          </article>
        </section>

        <section className="border border-[#d4b892] bg-[linear-gradient(to_right,rgba(184,149,106,0.08),rgba(255,253,248,0.7))] px-8 py-10 text-center">
          <p className="mb-4 text-[11px] uppercase tracking-[0.26em] text-[#8a8578]">Vision</p>
          <h2 className="mx-auto max-w-[920px] font-serif text-[clamp(40px,5vw,68px)] leading-[1] text-[#18271f]">
            Faire de Cardin la couche standard de <em className="font-medium italic text-[#003d2c]">rétention</em> pour le commerce physique.
          </h2>
          <p className="mx-auto mt-6 max-w-[820px] font-serif text-[clamp(22px,2.6vw,30px)] italic leading-[1.32] text-[#3d4d43]">
            Un système déployé lieu par lieu, avec un langage simple, un modèle direct, et une lecture du retour client enfin opérable.
          </p>
        </section>
      </div>
    </main>
  )
}

function Metric({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="border border-[#d4cdbd] bg-[rgba(255,253,248,0.55)] px-4 py-4 text-center">
      <div className="mb-2 text-[9px] uppercase tracking-[0.24em] text-[#8a8578]">{label}</div>
      <div className="font-serif text-[30px] leading-none text-[#18271f]">{value}</div>
      <div className="mt-2 text-[12px] italic text-[#8a8578]">{sub}</div>
    </div>
  )
}

function StoryCard({ title, detail }: { title: string; detail: string }) {
  return (
    <article className="border border-[#ded9cf] bg-[rgba(242,237,228,0.66)] px-5 py-5">
      <h3 className="mb-2 font-serif text-[28px] leading-[1.04] text-[#18271f]">{title}</h3>
      <p className="text-[14px] leading-7 text-[#3d4d43]">{detail}</p>
    </article>
  )
}
