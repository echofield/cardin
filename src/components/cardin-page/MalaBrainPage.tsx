"use client"

import Link from "next/link"
import { useMemo, useState } from "react"

import { cn } from "@/lib/utils"

import styles from "./MalaPages.module.css"

type ScenarioKey = "tonight" | "stock" | "slow" | "margin"

const DAY_NAMES = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"] as const
const MONTH_NAMES = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
] as const

const SCENARIOS: Record<
  ScenarioKey,
  {
    tab: string
    label: string
    title: string
    detail: string
    action: string
    risk: string
    impact: string
    confidence: string
    bars: number[]
    sourceStatus: Array<"hot" | "ok" | "watch">
    actions: Array<{ title: string; detail: string; tag: string }>
  }
> = {
  tonight: {
    tab: "Ce soir",
    label: "Décision 18:00",
    title: "Prépare le rush Spritz + gin avant 21h.",
    detail: "Les ventes de jeudi, les réservations et la météo pointent vers un pic long entre 20h30 et 23h. Le poste cocktails va bloquer avant la salle.",
    action: "Batch 42 Spritz, remonte 2 caisses de gin, mets Clara au poste rapide.",
    risk: "Risque rupture gin 23h10",
    impact: "+14 % débit bar attendu",
    confidence: "92 %",
    bars: [22, 34, 48, 58, 76, 92, 100, 84, 61, 42],
    sourceStatus: ["hot", "watch", "hot", "ok", "hot"],
    actions: [
      { title: "Batch Spritz", detail: "Prépare 42 portions avant ouverture du pic.", tag: "Bar" },
      { title: "Remonter le gin", detail: "2 caisses froides en station 2 avant 20h.", tag: "Stock" },
      { title: "Staff shift", detail: "Clara au poste rapide de 20h à 23h30.", tag: "Staff" },
    ],
  },
  stock: {
    tab: "Stock",
    label: "Alerte samedi",
    title: "Commande vodka et tonic maintenant.",
    detail: "Le niveau stock paraît correct, mais les sorties du dernier samedi + le push du week-end créent une rupture probable avant minuit.",
    action: "Commander 3 caisses vodka, 6 cartons tonic, bloquer livraison vendredi matin.",
    risk: "Rupture probable samedi 00h20",
    impact: "1 900 € de ventes protégées",
    confidence: "88 %",
    bars: [18, 24, 31, 44, 59, 71, 96, 100, 86, 63],
    sourceStatus: ["watch", "hot", "ok", "hot", "watch"],
    actions: [
      { title: "Commande fournisseur", detail: "3 vodka, 6 tonic, 2 ginger beer.", tag: "Achat" },
      { title: "Menu temporaire", detail: "Désactive Moscow Mule si ginger < 18 bouteilles.", tag: "Carte" },
      { title: "Seuil auto", detail: "Nouvelle alerte dès 31 % de stock restant.", tag: "Règle" },
    ],
  },
  slow: {
    tab: "Mardi",
    label: "Moment faible",
    title: "Transforme mardi en rendez-vous groupe.",
    detail: "Le mardi ne manque pas de demande : il manque un signal. Les cartes actives proches du bar répondent mieux aux formats duo qu'aux remises.",
    action: "Push 17h30 : deuxième cocktail signature à -50 % si la table vient à 3 ou plus.",
    risk: "Creux 19h-21h récurrent",
    impact: "+38 tables potentielles",
    confidence: "81 %",
    bars: [16, 18, 21, 26, 31, 29, 24, 20, 18, 15],
    sourceStatus: ["ok", "ok", "watch", "watch", "hot"],
    actions: [
      { title: "Push 17h30", detail: "Cible cartes actives à moins de 1,8 km.", tag: "Client" },
      { title: "Format groupe", detail: "Avantage uniquement à partir de 3 personnes.", tag: "Offre" },
      { title: "Objectif comptoir", detail: "Faire scanner chaque table avant 20h.", tag: "Staff" },
    ],
  },
  margin: {
    tab: "Marge",
    label: "Prix & carte",
    title: "Le cocktail le plus vendu tire la marge vers le bas.",
    detail: "Le Spicy Mule accélère le volume, mais consomme trop de ginger premium. Il faut soit ajuster prix, soit pousser l'alternative maison.",
    action: "Passe le Spicy Mule à 13 €, pousse le Highball maison en reco staff.",
    risk: "Marge boisson -4,6 pts",
    impact: "+620 € marge/semaine",
    confidence: "86 %",
    bars: [44, 52, 57, 63, 66, 71, 69, 62, 55, 48],
    sourceStatus: ["hot", "watch", "ok", "ok", "watch"],
    actions: [
      { title: "Ajuster prix", detail: "Spicy Mule à 13 € dès vendredi.", tag: "Marge" },
      { title: "Reco staff", detail: "Highball maison proposé en premier.", tag: "Vente" },
      { title: "Suivi 7 jours", detail: "Comparer volume, marge et satisfaction.", tag: "Mesure" },
    ],
  },
}

const SOURCES = [
  { name: "Caisse", detail: "ventes, produits, heures de pic" },
  { name: "Stock", detail: "niveaux, pertes, seuils critiques" },
  { name: "Staff", detail: "postes, cadence, scripts qui vendent" },
  { name: "Fournisseurs", detail: "délais, commandes, prix d'achat" },
  { name: "Cartes Cardin", detail: "retours, groupes, pushs, proximité" },
] as const

const SYSTEM_ROWS = [
  { signal: "Mojito explose vendredi", decision: "stock + staff bar 2", owner: "Manager", status: "Prêt" },
  { signal: "Gin bas + météo chaude", decision: "commande avant 11h", owner: "Achat", status: "À faire" },
  { signal: "Mardi creux stable", decision: "push groupe 17h30", owner: "Cardin", status: "Auto" },
  { signal: "Clara vend +22 %", decision: "copier son script tonic", owner: "Staff", status: "Test" },
] as const

function formatToday() {
  const now = new Date()
  return `${DAY_NAMES[now.getDay()]} ${now.getDate()} ${MONTH_NAMES[now.getMonth()]}`
}

export function MalaBrainPage() {
  const [scenario, setScenario] = useState<ScenarioKey>("tonight")
  const [toast, setToast] = useState<string | null>(null)
  const today = useMemo(formatToday, [])
  const active = SCENARIOS[scenario]

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 1800)
  }

  return (
    <main className={styles.malaJournalPage}>
      <div className={styles.journalPage}>
        <header className={styles.jHeader}>
          <Link className={styles.brandMark} href="/mala">
            <span className={styles.malaH}>Atelier <span>Mala</span></span>
            <span className={styles.brandDot}>·</span>
            <span className={styles.brandJournal}>Brain Cardin</span>
          </Link>
          <div className={styles.jHeaderRight}>
            <Link className={styles.jNavButton} href="/mala">Carte</Link>
            <Link className={styles.jNavButton} href="/mala/journal">Journal</Link>
            <div className={styles.dateBadge}>
              <span className={styles.liveDot} />
              <span>{today}</span>
            </div>
          </div>
        </header>

        <section className={styles.jHero}>
          <div className={styles.heroGreet}>Tour de contrôle bar</div>
          <h1>
            Pas un dashboard.
            <br />
            Un cerveau qui donne <em>la prochaine décision.</em>
          </h1>
          <div className={styles.heroCost}>Sources connectées <strong>5 organes · 1 décision</strong></div>
        </section>

        <section className={styles.brainHeroGrid}>
          <article className={styles.brainDecision}>
            <div className={styles.brainDecisionTop}>
              <span>{active.label}</span>
              <strong>{active.confidence} confiance</strong>
            </div>
            <h2>{active.title}</h2>
            <p>{active.detail}</p>
            <div className={styles.brainAction}>
              <span>Action recommandée</span>
              <strong>{active.action}</strong>
            </div>
            <div className={styles.brainDecisionFoot}>
              <em>{active.risk}</em>
              <em>{active.impact}</em>
            </div>
          </article>

          <aside className={styles.brainSwitch}>
            <span>Mode décision</span>
            {(Object.keys(SCENARIOS) as ScenarioKey[]).map((key) => (
              <button
                className={cn(styles.brainSwitchButton, scenario === key && styles.active)}
                key={key}
                onClick={() => setScenario(key)}
                type="button"
              >
                {SCENARIOS[key].tab}
              </button>
            ))}
          </aside>
        </section>

        <section className={styles.keys}>
          <div className={styles.keyItem}>
            <div className={cn(styles.keyBig, styles.cream)}>1</div>
            <div className={styles.keyLabel}>décision prioritaire</div>
          </div>
          <div className={styles.keyItem}>
            <div className={cn(styles.keyBig, styles.red)}>5</div>
            <div className={styles.keyLabel}>sources qui parlent</div>
          </div>
          <div className={styles.keyItem}>
            <div className={cn(styles.keyBig, styles.gold)}>23h</div>
            <div className={styles.keyLabel}>risque anticipé</div>
          </div>
          <div className={styles.keyItem}>
            <div className={cn(styles.keyBig, styles.cream)}>0</div>
            <div className={styles.keyLabel}>tableau à interpréter</div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2>Les organes <em>connectés</em></h2>
            <span>caisse, stock, staff, fournisseur, clients</span>
          </div>
          <div className={styles.sourceGrid}>
            {SOURCES.map((source, index) => (
              <article className={cn(styles.sourceCard, styles[active.sourceStatus[index]])} key={source.name}>
                <span>{source.name}</span>
                <strong>{source.detail}</strong>
                <em>{active.sourceStatus[index] === "hot" ? "signal fort" : active.sourceStatus[index] === "watch" ? "à surveiller" : "stable"}</em>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2>Prévision <em>ce soir</em></h2>
            <span>le cerveau voit le blocage avant le rush</span>
          </div>
          <div className={styles.timeline}>
            <div className={styles.timelineHead}>
              <strong>Charge opérationnelle <em>prévue</em></strong>
              <span>{active.risk}</span>
            </div>
            <div className={styles.brainBars}>
              {active.bars.map((height, index) => (
                <span
                  className={cn(styles.brainBar, height > 82 && styles.peak, index === 5 && styles.now)}
                  key={`${scenario}-${index}-${height}`}
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
            <div className={styles.brainBarLabels}>
              {["18h", "19h", "20h", "21h", "22h", "23h", "00h", "01h", "02h", "03h"].map((hour) => <span key={hour}>{hour}</span>)}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2>Actions <em>proposées</em></h2>
            <span>1 insight devient 3 gestes terrain</span>
          </div>
          <div className={styles.brainActionGrid}>
            {active.actions.map((action) => (
              <article className={styles.brainActionCard} key={action.title}>
                <span>{action.tag}</span>
                <strong>{action.title}</strong>
                <p>{action.detail}</p>
                <button onClick={() => showToast(`${action.title} · appliqué`)} type="button">Appliquer</button>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2>File de <em>décision</em></h2>
            <span>le reporting devient recommandation</span>
          </div>
          <div className={styles.brainTable}>
            {SYSTEM_ROWS.map((row) => (
              <div className={styles.brainRow} key={row.signal}>
                <strong>{row.signal}</strong>
                <span>{row.decision}</span>
                <em>{row.owner}</em>
                <small>{row.status}</small>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.positionBlock}>
          <span>Position Cardin Brain</span>
          <p>
            Le bar a déjà les données : caisse, stocks, staff, fournisseurs, cartes clients. Le problème, c&apos;est
            qu&apos;elles ne se parlent pas. Cardin Brain les transforme en une sortie simple : une décision prioritaire,
            une raison, et les gestes à appliquer avant le rush.
          </p>
          <div>
            <strong>Pas un dashboard · un copilote</strong>
            <strong>1 décision utile par jour</strong>
            <strong>Pilotage stock + staff + push</strong>
            <strong>Bar OS · version terrain</strong>
          </div>
        </section>

        <footer className={styles.jFooter}>
          Cardin Brain · la couche qui relie les organes du bar, <em>sans demander au gérant de devenir analyste.</em>
        </footer>
      </div>

      <div className={cn(styles.toast, toast && styles.show)}>{toast}</div>
    </main>
  )
}
