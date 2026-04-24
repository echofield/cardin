"use client"

import { useMemo } from "react"

import { cn } from "@/lib/utils"

import styles from "./PompetteJournalPage.module.css"

const KEY_ITEMS = [
  { value: "23", label: "passages validés", tone: "default" },
  { value: "4", label: "nouveaux clients", tone: "default" },
  { value: "3", label: "copains déclenchés", tone: "default" },
  { value: "5", label: "cadeaux consommés", tone: "green" },
] as const

const FLOW_ITEMS = [
  {
    mark: "Entrées",
    value: "4 nouveaux",
    label: "Premiers passages aujourd'hui · Diamond Coucou débloqué",
    sub: "Dont 2 venus avec un habitué (mécanique copain).",
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
  { time: "11:27", num: "N° 0056", event: "Marie amène Paul · déclenche Copain", tone: "copain" },
  { time: "16:14", num: "N° 0033", event: "Mehdi · 8ème passage · café offert", tone: "reward" },
  { time: "17:22", num: "N° 0125", event: "Julie · premier passage · amenée par Mehdi", tone: "new" },
  { time: "18:05", num: "N° 0042", event: "Léa amène Anaïs · déclenche Copain", tone: "copain" },
] as const

function formatStreamEvent(event: string) {
  return event
    .replace(/Léa|Théo|Sarah|Marie|Paul|Mehdi|Julie|Anaïs/g, (name) => `<strong>${name}</strong>`)
    .replace(/Coucou|Régulier|Copain|café offert|viennoiserie offerte|Diamond/g, (token) => `<em>${token}</em>`)
}

export function PompetteJournalPage() {
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
          <span className={styles.brandPompette}>POMPETTE!</span>
          <span className={styles.brandSep}>·</span>
          <span className={styles.brandJournal}>JOURNAL DU JOUR</span>
        </div>
        <div className={styles.dateBadge}>
          <strong>{dateLabel}</strong>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroKicker}>Aujourd&apos;hui chez Pompette</div>
        <p className={styles.heroSentence}>
          <em>23 passages</em>, <em>7 retours</em>, <em>3 copains</em> invités
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
                  row.tone === "copain" && styles.pillCopain,
                  row.tone === "reward" && styles.pillReward,
                )}
              >
                {row.tone === "new"
                  ? "Nouveau"
                  : row.tone === "return"
                    ? "Retour"
                    : row.tone === "copain"
                      ? "Copain"
                      : "Cadeau"}
              </div>
            </div>
          ))}
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
            <div className={styles.highlightLabel}>Mécanique copain</div>
            <div className={styles.highlightQuote}>
              <em>3 copains amenés aujourd&apos;hui.</em> C&apos;est la mécanique qui tire le plus cette semaine.
            </div>
            <div className={styles.highlightSub}>À encourager en vitrine cet été · se propage seul.</div>
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
