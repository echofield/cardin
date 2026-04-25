"use client"

import { useMemo, useState } from "react"

import { cn } from "@/lib/utils"

import styles from "./RoundJournalPage.module.css"

const KEY_ITEMS = [
  { value: "41", label: "passages aujourd'hui", tone: "default" },
  { value: "12", label: "retours verifies", tone: "default" },
  { value: "6", label: "invites amenes", tone: "accent" },
  { value: "18,60 EUR", label: "cout cadeaux", tone: "cost" },
] as const

const SCENARIOS = [
  {
    name: "Retour Round",
    goal: "Faire revenir les clients.",
    line: "On recompense les clients qui reviennent vraiment.",
    signal: "19 clients ont deja 2 passages ou plus.",
  },
  {
    name: "Duo Round",
    goal: "Faire venir de nouvelles personnes.",
    line: "Vos habitues deviennent le canal d'acquisition.",
    signal: "6 invites entres aujourd'hui, dont 3 au dejeuner.",
  },
  {
    name: "Jour plein",
    goal: "Remplir mercredi.",
    line: "On deplace du trafic vers le jour qui compte.",
    signal: "Mercredi progresse de 28% vs la semaine derniere.",
  },
] as const

const PROMOS = [
  {
    key: "first",
    label: "-10% premiere commande",
    detail: "pousse les nouveaux entrants qui viennent de scanner",
    audience: "42 cartes recentes",
  },
  {
    key: "duo",
    label: "Table duo ce soir",
    detail: "invite un client actif a venir accompagne",
    audience: "88 cartes actives",
  },
  {
    key: "day",
    label: "Mercredi compte double",
    detail: "deplace le trafic vers le jour plein",
    audience: "126 cartes actives",
  },
] as const

const HOURS = ["11h", "12h", "13h", "14h", "15h", "16h", "17h", "18h", "19h", "20h", "21h", "22h"] as const
const BAR_HEIGHTS = [28, 78, 100, 72, 22, 18, 24, 44, 64, 82, 58, 34] as const

const STREAM_ROWS = [
  { time: "11:46", card: "N 0418", event: "Nora revient - passe Challenger", pill: "Retour" },
  { time: "12:08", card: "N 0521", event: "Samir entre avec la carte Round", pill: "Nouveau" },
  { time: "12:37", card: "N 0172", event: "Lea amene Hugo - Duo valide", pill: "Duo" },
  { time: "13:12", card: "N 0094", event: "Maya consomme un side offert", pill: "Cadeau" },
  { time: "18:55", card: "N 0440", event: "Ilyes passe mercredi - compte double", pill: "Jour cle" },
  { time: "20:18", card: "N 0328", event: "Ana devient Finaliste Diamond", pill: "Finaliste" },
] as const

export function RoundJournalPage() {
  const [activePromo, setActivePromo] = useState<(typeof PROMOS)[number]["key"]>("day")
  const [pushState, setPushState] = useState<"idle" | "ready" | "sent">("idle")

  const dateLabel = useMemo(() => {
    return new Intl.DateTimeFormat("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(new Date())
  }, [])

  const selectedPromo = PROMOS.find((promo) => promo.key === activePromo) ?? PROMOS[0]

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brandMark}>
          <span className={styles.brandRound}>ROUND</span>
          <span className={styles.brandSep}>x</span>
          <span className={styles.brandJournal}>JOURNAL CARDIN</span>
        </div>
        <div className={styles.dateBadge}>{dateLabel}</div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroKicker}>Aujourd'hui chez Round</div>
        <p className={styles.heroSentence}>
          <em>41 passages</em>, <em>12 retours</em>, <em>6 invites</em>,
          <br />
          <em>3 finalistes</em> qui montent.
        </p>
        <div className={styles.heroCost}>
          Cout cadeaux du jour <strong>18,60 EUR</strong>
        </div>
      </section>

      <div className={styles.keys}>
        {KEY_ITEMS.map((item) => (
          <div className={styles.keyItem} key={item.label}>
            <div
              className={cn(
                styles.keyBig,
                item.tone === "accent" && styles.keyBigAccent,
                item.tone === "cost" && styles.keyBigCost,
              )}
            >
              <em>{item.value}</em>
            </div>
            <div className={styles.keyLabel}>{item.label}</div>
          </div>
        ))}
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div className={styles.sectionTitle}>
            Les <em>3 saisons possibles</em>
          </div>
          <div className={styles.sectionHint}>ce que Round choisit, pas ce que le client subit</div>
        </div>

        <div className={styles.scenarioGrid}>
          {SCENARIOS.map((item) => (
            <article className={styles.scenarioCard} key={item.name}>
              <div className={styles.scenarioName}>{item.name}</div>
              <div className={styles.scenarioGoal}>{item.goal}</div>
              <p>{item.line}</p>
              <div className={styles.scenarioSignal}>{item.signal}</div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div className={styles.sectionTitle}>
            Le <em>controle economique</em>
          </div>
          <div className={styles.sectionHint}>genereux, mais borne</div>
        </div>

        <div className={styles.prizeBoard}>
          <div className={styles.prizePrimary}>
            <div className={styles.prizeLabel}>Diamond unique</div>
            <div className={styles.prizeMain}>1 menu Round par mois pendant 1 an</div>
            <div className={styles.prizeSub}>1 personne seulement - le prix est visible, le cout est plafonne.</div>
          </div>
          <div className={styles.prizeSecondary}>
            <span>Prix 2</span>
            <strong>1 menu duo offert</strong>
          </div>
          <div className={styles.prizeSecondary}>
            <span>Prix 3</span>
            <strong>25 EUR de credit Round</strong>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div className={styles.sectionTitle}>
            Jour fort / <em>jour faible</em>
          </div>
          <div className={styles.sectionHint}>trafic par creneau</div>
        </div>

        <div className={styles.timeline}>
          <div className={styles.timelineHead}>
            <div className={styles.timelineTitle}>
              Mercredi pilote <em>compte double</em>
            </div>
            <div className={styles.timelinePeak}>pic 12h-14h</div>
          </div>
          <div className={styles.bars}>
            {BAR_HEIGHTS.map((height, index) => (
              <div
                className={cn(styles.bar, index >= 1 && index <= 3 && styles.barPeak, index === 7 && styles.barKey)}
                key={`${height}-${index}`}
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
          <div className={styles.barLabels}>
            {HOURS.map((hour) => (
              <span key={hour}>{hour}</span>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div className={styles.sectionTitle}>
            Mobilite <em>du jour</em>
          </div>
          <div className={styles.sectionHint}>le systeme cree les patterns, Round peut pousser le bon signal</div>
        </div>

        <div className={styles.pushPanel}>
          <div className={styles.pushIntro}>
            <div className={styles.pushLabel}>Push comptoir</div>
            <h3>Pousser une impulsion aujourd'hui</h3>
            <p>
              La saison donne la structure. Le journal donne la mobilite: si Round veut pousser une table, un retour
              ou une premiere commande, l'offre part vers les cartes actives.
            </p>
          </div>

          <div className={styles.pushChoices}>
            {PROMOS.map((promo) => (
              <button
                className={cn(styles.pushChoice, activePromo === promo.key && styles.pushChoiceActive)}
                key={promo.key}
                onClick={() => {
                  setActivePromo(promo.key)
                  setPushState("ready")
                }}
                type="button"
              >
                <strong>{promo.label}</strong>
                <span>{promo.detail}</span>
                <em>{promo.audience}</em>
              </button>
            ))}
          </div>

          <div className={styles.pushAction}>
            <div>
              <span>Selection</span>
              <strong>{selectedPromo.label}</strong>
              <em>{selectedPromo.audience} - pas une promo permanente</em>
            </div>
            <button onClick={() => setPushState("sent")} type="button">
              {pushState === "sent" ? "Push envoye" : "Pousser aux cartes"}
            </button>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div className={styles.sectionTitle}>
            Le <em>flux comptoir</em>
          </div>
          <div className={styles.sectionHint}>le lieu emet, le client recoit</div>
        </div>

        <div className={styles.stream}>
          {STREAM_ROWS.map((row) => (
            <div className={styles.streamRow} key={`${row.time}-${row.card}`}>
              <div className={styles.streamTime}>{row.time}</div>
              <div className={styles.streamCard}>{row.card}</div>
              <div className={styles.streamEvent}>{row.event}</div>
              <div className={styles.pill}>{row.pill}</div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.meetingBlock}>
        <div className={styles.meetingLabel}>Position lundi</div>
        <p>
          On vous propose une saison Round de 90 jours. Les clients entrent avec une carte mobile. A chaque passage,
          le comptoir valide. Certains reviennent, certains amenent quelqu'un, et a la fin un seul gagne le Diamond:
          1 menu par mois pendant un an.
        </p>
        <div className={styles.meetingChoices}>
          <span>Objectif: retour / duo / jour plein</span>
          <span>Jour cle: mardi, mercredi ou jeudi</span>
          <span>Diamond: 1 menu par mois pendant 1 an</span>
          <span>Prix secondaires: menu duo, credit, side, boisson</span>
        </div>
      </section>
    </div>
  )
}
