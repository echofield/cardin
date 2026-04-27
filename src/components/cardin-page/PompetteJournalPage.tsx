"use client"

import { useMemo, useState } from "react"

import { cn } from "@/lib/utils"

import styles from "./PompetteJournalPage.module.css"

type PushTab = "moment" | "duo" | "sondage" | "roulette"

const KEY_ITEMS = [
  { value: "23", label: "passages validés", tone: "default" },
  { value: "4", label: "nouveaux clients", tone: "default" },
  { value: "3", label: "duos déclenchés", tone: "default" },
  { value: "5", label: "cadeaux consommés", tone: "green" },
] as const

const FLOW_ITEMS = [
  {
    mark: "Entrées",
    value: "4 nouveaux",
    label: "Premiers passages aujourd'hui · carte ouverte",
    sub: "Dont 2 venus avec un habitué (mécanique duo).",
  },
  {
    mark: "Retours",
    value: "7 clients",
    label: "Des habitués qui sont passés aujourd'hui et avancent dans leur saison",
    sub: "Rythme moyen 3 visites cette semaine pour les plus réguliers.",
  },
  {
    mark: "Cadeaux",
    value: "5 consommés",
    label: "Cafés offerts, viennoiseries signature, Diamond Régulier validés",
    sub: "Coût estimé 8,40 EUR · valeur perçue bien supérieure.",
  },
] as const

const HOURS = ["7h", "8h", "9h", "10h", "12h", "13h", "14h", "15h", "16h", "17h", "18h", "19h"] as const
const BAR_HEIGHTS = [22, 38, 55, 45, 30, 18, 25, 42, 100, 85, 55, 30] as const

const STREAM_ROWS = [
  { time: "07:42", num: "N° 0042", event: "Léa · 3ème passage · débloque Régulier", tone: "return" },
  { time: "08:15", num: "N° 0117", event: "Théo · premier passage · entre dans la saison", tone: "new" },
  { time: "09:03", num: "N° 0089", event: "Sarah · viennoiserie offerte · Diamond Régulier validé", tone: "reward" },
  { time: "11:27", num: "N° 0056", event: "Marie amène Paul · déclenche Duo", tone: "duo" },
  { time: "16:14", num: "N° 0033", event: "Mehdi · 8ème passage · café offert", tone: "reward" },
  { time: "17:22", num: "N° 0125", event: "Julie · premier passage · amenée par Mehdi", tone: "new" },
  { time: "18:05", num: "N° 0042", event: "Léa amène Anaïs · déclenche Duo", tone: "duo" },
] as const

const PUSH_TABS: Record<PushTab, { label: string; sub: string; selected: string; toast: string }> = {
  moment: { label: "Moment", sub: "16h-18h", selected: "Goûter 16h-18h", toast: "Moment envoyé" },
  duo: { label: "Duo", sub: "invitation", selected: "Invitation duo", toast: "Duo poussé" },
  sondage: { label: "Sondage", sub: "du jour", selected: "Sondage du jour", toast: "Sondage ouvert" },
  roulette: { label: "Roulette", sub: "timing", selected: "Roulette timing", toast: "Roulette lancée" },
}

const PUSH_CARDS: Record<PushTab, Array<{ title: string; desc: string; cards: string }>> = {
  moment: [
    { title: "Goûter 16h-18h compte double", desc: "Chaque passage sur le creux de l'après-midi vaut deux dans la progression.", cards: "126 cartes" },
    { title: "Café offert après 15h", desc: "Un geste simple pour déplacer du trafic sans remise permanente.", cards: "88 cartes récentes" },
  ],
  duo: [
    { title: "Venez avec quelqu'un cette semaine", desc: "L'habitué débloque Duo et l'invité entre dans la saison.", cards: "73 habitués" },
    { title: "Petit-déjeuner à deux", desc: "Mécanique sociale pour faire venir une nouvelle personne au comptoir.", cards: "52 cartes actives" },
  ],
  sondage: [
    { title: "Choisir la viennoiserie du vendredi", desc: "Croissant amande, roulé cannelle, brioche chocolat : la carte vote.", cards: "126 cartes" },
    { title: "Pain spécial du week-end", desc: "Le gagnant devient le pain mis en avant samedi matin.", cards: "126 cartes" },
  ],
  roulette: [
    { title: "Le 40ème client gagne", desc: "Le client scanne. Si son rang tombe juste, l'écran s'illumine.", cards: "126 cartes" },
    { title: "Tirage 16h-18h", desc: "Une roulette limitée au créneau faible pour créer un vrai rendez-vous.", cards: "88 cartes" },
  ],
}

function formatStreamEvent(event: string) {
  return event
    .replace(/Léa|Théo|Sarah|Marie|Paul|Mehdi|Julie|Anaïs/g, (name) => `<strong>${name}</strong>`)
    .replace(/Régulier|Duo|café offert|viennoiserie offerte|Diamond/g, (token) => `<em>${token}</em>`)
}

export function PompetteJournalPage() {
  const [pushTab, setPushTab] = useState<PushTab>("moment")
  const [selectedPushIndex, setSelectedPushIndex] = useState(0)
  const [pushSent, setPushSent] = useState(false)
  const dateLabel = useMemo(() => {
    return new Intl.DateTimeFormat("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(new Date())
  }, [])

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brandMark}>
          <span className={styles.brandPompette}>BOULANGERIE</span>
          <span className={styles.brandSep}>·</span>
          <span className={styles.brandJournal}>JOURNAL DU JOUR</span>
        </div>
        <div className={styles.dateBadge}>
          <strong>{dateLabel}</strong>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroKicker}>Aujourd&apos;hui à la boulangerie</div>
        <p className={styles.heroSentence}>
          <em>23 passages</em>, <em>7 retours</em>, <em>3 duos</em> déclenchés
          <br />
          et <em>5 cadeaux</em> consommés.
        </p>
        <div className={styles.heroCost}>
          Coût estimé des cadeaux · <strong>8,40 EUR</strong>
        </div>
      </section>

      <div className={styles.keys}>
        {KEY_ITEMS.map((item) => (
          <div className={styles.keyItem} key={item.label}>
            <div className={cn(styles.keyBig, item.tone === "green" && styles.keyBigGreen)}>
              <em>{item.value}</em>
            </div>
            <div className={styles.keyLabel}>{item.label}</div>
          </div>
        ))}
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div className={styles.sectionTitle}>
            Le <em>flux</em> de la journée
          </div>
          <div className={styles.sectionHint}>pas besoin de caisse · Cardin suit tout seul</div>
        </div>

        <div className={styles.flowGrid}>
          {FLOW_ITEMS.map((item) => (
            <div className={styles.flowCard} key={item.mark}>
              <div className={styles.flowMark}>{item.mark}</div>
              <div className={styles.flowBig}>
                <em>{item.value.split(" ")[0]}</em> {item.value.split(" ").slice(1).join(" ")}
              </div>
              <div className={styles.flowLabel}>{item.label}</div>
              <div className={styles.flowSub}>{item.sub}</div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div className={styles.sectionTitle}>
            Les <em>heures fortes</em>
          </div>
          <div className={styles.sectionHint}>passages par créneau</div>
        </div>

        <div className={styles.timeline}>
          <div className={styles.timelineHead}>
            <div className={styles.timelineTitle}>
              Votre <em>moment fort</em> · 16h–18h
            </div>
            <div className={styles.timelinePeak}>6 passages au pic</div>
          </div>

          <div className={styles.bars}>
            {BAR_HEIGHTS.map((height, index) => (
              <div
                className={cn(styles.bar, index >= 8 && index <= 9 && styles.barPeak)}
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
            Quelques <em>moments</em> à retenir
          </div>
          <div className={styles.sectionHint}>les passages qui comptent</div>
        </div>

        <div className={styles.stream}>
          {STREAM_ROWS.map((row) => (
            <div className={styles.streamRow} key={`${row.time}-${row.num}`}>
              <div className={styles.streamTime}>{row.time}</div>
              <div className={styles.streamNum}>{row.num}</div>
              <div
                className={styles.streamEvent}
                dangerouslySetInnerHTML={{ __html: formatStreamEvent(row.event) }}
              />
              <div
                className={cn(
                  styles.pill,
                  row.tone === "new" && styles.pillNew,
                  row.tone === "return" && styles.pillReturn,
                  row.tone === "duo" && styles.pillCopain,
                  row.tone === "reward" && styles.pillReward,
                )}
              >
                {row.tone === "new"
                  ? "Nouveau"
                  : row.tone === "return"
                    ? "Retour"
                    : row.tone === "duo"
                      ? "Duo"
                      : "Cadeau"}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div className={styles.sectionTitle}>
            Console <em>d&apos;animation</em>
          </div>
          <div className={styles.sectionHint}>choisir un moment, pousser sur les cartes</div>
        </div>

        <div className={styles.pushBlock}>
          <div className={styles.pushHead}>
            <span>Push comptoir</span>
            <h3>
              Animer la <em>journée</em> en 30 secondes.
            </h3>
            <p>
              La carte client reçoit le moment choisi : créneau goûter, invitation duo, sondage produit ou roulette timing.
            </p>
          </div>

          <div className={styles.pushTabs}>
            {(Object.keys(PUSH_TABS) as PushTab[]).map((tab) => (
              <button
                className={cn(styles.pushTab, pushTab === tab && styles.pushTabActive)}
                key={tab}
                onClick={() => {
                  setPushTab(tab)
                  setSelectedPushIndex(0)
                  setPushSent(false)
                }}
                type="button"
              >
                <strong>{PUSH_TABS[tab].label}</strong>
                <span>{PUSH_TABS[tab].sub}</span>
              </button>
            ))}
          </div>

          <div className={styles.pushChoices}>
            {PUSH_CARDS[pushTab].map((card, index) => (
              <button
                className={cn(styles.pushChoice, selectedPushIndex === index && styles.pushChoiceActive)}
                key={card.title}
                onClick={() => {
                  setSelectedPushIndex(index)
                  setPushSent(false)
                }}
                type="button"
              >
                <span>{card.cards}</span>
                <strong>{card.title}</strong>
                <p>{card.desc}</p>
              </button>
            ))}
          </div>

          <div className={styles.pushAction}>
            <div>
              <span>Sélection</span>
              <strong>{PUSH_TABS[pushTab].selected}</strong>
            </div>
            <button
              className={cn(pushSent && styles.pushSent)}
              onClick={() => {
                setPushSent(true)
                window.setTimeout(() => setPushSent(false), 1800)
              }}
              type="button"
            >
              {pushSent ? PUSH_TABS[pushTab].toast : "Envoyer le push"}
            </button>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div className={styles.sectionTitle}>
            Ce que Cardin <em>retient</em> de la journée
          </div>
        </div>

        <div className={styles.highlights}>
          <div className={cn(styles.highlightCard, styles.highlightStrong)}>
            <div className={cn(styles.highlightCorner, styles.highlightCornerTl)} />
            <div className={cn(styles.highlightCorner, styles.highlightCornerBr)} />
            <div className={styles.highlightLabel}>Mécanique duo</div>
            <div className={styles.highlightQuote}>
              <em>3 duos déclenchés aujourd&apos;hui.</em> C&apos;est la mécanique qui tire le plus cette semaine.
            </div>
            <div className={styles.highlightSub}>À encourager en vitrine cette semaine · se propage seul.</div>
          </div>

          <div className={styles.highlightCard}>
            <div className={cn(styles.highlightCorner, styles.highlightCornerTl)} />
            <div className={cn(styles.highlightCorner, styles.highlightCornerBr)} />
            <div className={styles.highlightLabel}>Rythme de retour</div>
            <div className={styles.highlightQuote}>
              <em>7 habitués</em> sont passés, dont 4 qui avancent plus vite que la moyenne.
            </div>
            <div className={styles.highlightSub}>Ceux qui reviennent vite progressent plus · Diamond rapproché.</div>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        Journal généré par Cardin · <em>sans toucher votre caisse</em>, <em>sans nouveau compte client</em>.
        <br />
        Le rythme de votre saison. Rien de plus.
      </footer>
    </div>
  )
}
