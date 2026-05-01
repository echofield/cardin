"use client"

import { useMemo, useState } from "react"

import { cn } from "@/lib/utils"

import styles from "./CbdJournalPage.module.css"

type PushTab = "drop" | "mot" | "anniversaire" | "curation"

const KEY_ITEMS = [
  { value: "31", label: "passages validés", tone: "default" },
  { value: "9", label: "mots reconnus", tone: "default" },
  { value: "6", label: "nouvelles cartes", tone: "default" },
  { value: "4", label: "drops réservés", tone: "green" },
] as const

const FLOW_ITEMS = [
  {
    mark: "Entrées",
    value: "6 nouvelles",
    label: "Cartes créées aujourd'hui · mot choisi · anonymat conservé",
    sub: "Dont 4 avec date de naissance optionnelle pour anniversaire et majorité.",
  },
  {
    mark: "Retours",
    value: "9 mots",
    label: "Clients reconnus par le mot au comptoir, sans nom ni téléphone",
    sub: "3 profils orientés vers sommeil, 4 vers détente, 2 vers récupération.",
  },
  {
    mark: "Drops",
    value: "4 réservés",
    label: "Lots rares et prix membre activés depuis la carte ou en boutique",
    sub: "14 places restantes · mécanique rareté privée, jamais affichée publiquement.",
  },
] as const

const HOURS = ["10h", "11h", "12h", "13h", "14h", "15h", "16h", "17h", "18h", "19h", "20h", "21h"] as const
const BAR_HEIGHTS = [18, 24, 34, 46, 28, 22, 38, 62, 100, 84, 58, 35] as const

const STREAM_ROWS = [
  { time: "10:18", word: "Lune", event: "premier passage · carte ouverte · profil détente", tone: "new" },
  { time: "11:42", word: "Tigre", event: "retour · débloque Habitué · infusion offerte", tone: "reward" },
  { time: "13:07", word: "Arsène", event: "mot reconnu · conseil huile sommeil", tone: "return" },
  { time: "15:33", word: "Mistral", event: "date naissance ajoutée · cadeau anniversaire programmé", tone: "gift" },
  { time: "17:21", word: "Atlas", event: "drop du mois réservé · lot rare", tone: "drop" },
  { time: "18:46", word: "Nacre", event: "transmet une carte · Confidence enclenché", tone: "confidence" },
  { time: "19:14", word: "Tigre", event: "deuxième passage du cycle · avance vers Cercle", tone: "return" },
] as const

const PUSH_TABS: Record<PushTab, { label: string; sub: string; selected: string; toast: string }> = {
  drop: { label: "Drop", sub: "lot rare", selected: "Lot rare du mois", toast: "Drop envoyé" },
  mot: { label: "Le Mot", sub: "retours", selected: "Rappel mot discret", toast: "Rappel prêt" },
  anniversaire: { label: "Anniversaire", sub: "cadeau", selected: "Cadeau jour J", toast: "Cadeau programmé" },
  curation: { label: "Curation", sub: "privé", selected: "Séance de curation", toast: "Curation ouverte" },
}

const PUSH_CARDS: Record<PushTab, Array<{ title: string; desc: string; cards: string }>> = {
  drop: [
    {
      title: "Lot rare du mois · accès carte",
      desc: "Ouvre une réservation limitée pour les porteurs Habitué et Confidence.",
      cards: "68 cartes",
    },
    {
      title: "Prix membre après 18h",
      desc: "Un prix discret sur un format premium, visible uniquement après scan ou mot reconnu.",
      cards: "41 retours",
    },
  ],
  mot: [
    {
      title: "Revenir avec votre mot",
      desc: "Une invitation privée, sans notification sociale ni langage communautaire.",
      cards: "94 cartes",
    },
    {
      title: "Conseil mis de côté",
      desc: "Le commerçant prépare une recommandation avant le passage suivant.",
      cards: "27 profils",
    },
  ],
  anniversaire: [
    {
      title: "Cadeau jour J",
      desc: "Une infusion ou un accessoire léger réservé aux clients qui ont donné leur date.",
      cards: "36 dates",
    },
    {
      title: "Mois anniversaire",
      desc: "Une fenêtre de 30 jours, plus souple qu'un seul passage le jour exact.",
      cards: "12 ce mois",
    },
  ],
  curation: [
    {
      title: "Séance privée 15 minutes",
      desc: "Réserver un créneau court pour guider un client premium sans foule au comptoir.",
      cards: "18 clients",
    },
    {
      title: "Passage Confidence",
      desc: "Une invitation à transmettre une carte à quelqu'un de confiance.",
      cards: "22 cartes",
    },
  ],
}

function toneLabel(tone: string) {
  if (tone === "new") return "Nouveau"
  if (tone === "reward") return "Cadeau"
  if (tone === "drop") return "Drop"
  if (tone === "confidence") return "Confidence"
  if (tone === "gift") return "Jour J"
  return "Retour"
}

export function CbdJournalPage() {
  const [pushTab, setPushTab] = useState<PushTab>("drop")
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
          <span className={styles.brandPompette}>CBD BOUTIQUE</span>
          <span className={styles.brandSep}>·</span>
          <span className={styles.brandJournal}>JOURNAL DU JOUR</span>
        </div>
        <div className={styles.dateBadge}>
          <strong>{dateLabel}</strong>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroKicker}>Aujourd&apos;hui en boutique</div>
        <p className={styles.heroSentence}>
          <em>31 passages</em>, <em>9 mots</em> reconnus, <em>6 cartes</em> créées
          <br />
          et <em>4 drops</em> réservés.
        </p>
        <div className={styles.heroCost}>
          Coût estimé des attentions · <strong>18,60 EUR</strong>
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
            Le <em>flux</em> discret
          </div>
          <div className={styles.sectionHint}>mot de passage · pas de nom client</div>
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
              Votre <em>moment fort</em> · 18h-20h
            </div>
            <div className={styles.timelinePeak}>8 passages au pic</div>
          </div>

          <div className={styles.bars}>
            {BAR_HEIGHTS.map((height, index) => (
              <div className={cn(styles.bar, index >= 8 && index <= 9 && styles.barPeak)} key={`${height}-${index}`} style={{ height: `${height}%` }} />
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
          <div className={styles.sectionHint}>uniquement des mots, jamais des noms</div>
        </div>

        <div className={styles.stream}>
          {STREAM_ROWS.map((row) => (
            <div className={styles.streamRow} key={`${row.time}-${row.word}`}>
              <div className={styles.streamTime}>{row.time}</div>
              <div className={styles.streamNum}>{row.word}</div>
              <div className={styles.streamEvent}>
                <strong>{row.word}</strong> · {row.event}
              </div>
              <div
                className={cn(
                  styles.pill,
                  row.tone === "new" && styles.pillNew,
                  row.tone === "return" && styles.pillReturn,
                  row.tone === "confidence" && styles.pillCopain,
                  (row.tone === "reward" || row.tone === "gift") && styles.pillReward,
                  row.tone === "drop" && styles.pillDrop,
                )}
              >
                {toneLabel(row.tone)}
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
          <div className={styles.sectionHint}>choisir un geste, pousser sur les cartes</div>
        </div>

        <div className={styles.pushBlock}>
          <div className={styles.pushHead}>
            <span>Push comptoir</span>
            <h3>
              Animer le <em>cycle</em> sans rendre le client visible.
            </h3>
            <p>
              La carte reçoit le geste choisi : drop, rappel du mot, cadeau anniversaire ou curation privée.
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
            <div className={styles.highlightLabel}>Le Mot</div>
            <div className={styles.highlightQuote}>
              <em>9 clients reconnus sans identité civile.</em> C&apos;est la mécanique CBD la plus Cardin.
            </div>
            <div className={styles.highlightSub}>Reconnaissance intime · conseil plus précis · aucune scène publique.</div>
          </div>

          <div className={styles.highlightCard}>
            <div className={cn(styles.highlightCorner, styles.highlightCornerTl)} />
            <div className={cn(styles.highlightCorner, styles.highlightCornerBr)} />
            <div className={styles.highlightLabel}>Drop privé</div>
            <div className={styles.highlightQuote}>
              <em>4 réservations sur le lot rare</em> avec seulement 18,60 EUR d&apos;attentions consommées.
            </div>
            <div className={styles.highlightSub}>La rareté remplace la remise · meilleur panier, meilleure discrétion.</div>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        Journal généré par Cardin · <em>sans compte client nominatif</em>, <em>sans feed public</em>.
        <br />
        Le rythme du cycle. Rien de plus.
      </footer>
    </div>
  )
}
