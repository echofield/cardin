"use client"

import { useMemo, useState } from "react"

import { cn } from "@/lib/utils"

import styles from "./MaminaJournalPage.module.css"

type PushTab = "midi" | "produit" | "degustation" | "copain"

const KEY_ITEMS = [
  { value: "42", label: "passages", tone: "default" },
  { value: "8", label: "nouveaux clients", tone: "default" },
  { value: "14", label: "retours", tone: "default" },
  { value: "6", label: "produits offerts", tone: "green" },
  { value: "5", label: "venus via dégustation", tone: "warm" },
] as const

const FLOW_ITEMS = [
  {
    mark: "Entrées",
    value: "8 nouveaux",
    label: "Premiers passages aujourd'hui · carte ouverte au comptoir",
    sub: "Dont 3 venus avec un habitué de bureau autour de Friedland.",
  },
  {
    mark: "Retours",
    value: "14 habitués",
    label: "Clients revenus vite pour le sandwich du midi",
    sub: "Le retour sous 7 jours progresse quand un produit épicerie est ajouté.",
  },
  {
    mark: "Produits",
    value: "17 découverts",
    label: "Produits épicerie découverts via Cardin",
    sub: "9 achetés après découverte · canistrelli citron et terrine corse en tête.",
  },
  {
    mark: "Dégustations",
    value: "7 participants",
    label: "Clients venus pour une dégustation ou invités à la prochaine",
    sub: "5 premiers passages générés · bon levier pour les creux après-midi.",
  },
] as const

const HOURS = ["9h", "10h", "11h", "12h", "13h", "14h", "15h", "16h", "17h", "18h", "19h", "20h"] as const
const BAR_HEIGHTS = [10, 16, 34, 92, 100, 62, 24, 18, 22, 28, 20, 12] as const

const STREAM_ROWS = [
  { time: "11:38", code: "N° 0035", event: "premier passage · sandwich figatellu · carte ouverte", tone: "new" },
  { time: "12:07", code: "N° 0112", event: "retour bureau · 3e passage · débloque Habitué", tone: "return" },
  { time: "12:46", code: "N° 0041", event: "vient avec un collègue · deux cartes créées", tone: "copain" },
  { time: "13:18", code: "N° 0098", event: "ajoute canistrelli citron · progression accélérée", tone: "product" },
  { time: "15:42", code: "N° 0064", event: "venu pour dégustation · découvre terrine corse", tone: "tasting" },
  { time: "17:06", code: "N° 0027", event: "produit épicerie acheté via Cardin · miel du maquis", tone: "product" },
  { time: "18:21", code: "N° 0112", event: "invité à la prochaine dégustation", tone: "tasting" },
] as const

const PUSH_TABS: Record<PushTab, { label: string; sub: string; selected: string; toast: string }> = {
  midi: { label: "Midi", sub: "retour rapide", selected: "Retour midi cette semaine", toast: "Moment midi prêt" },
  produit: { label: "Produit", sub: "découverte", selected: "Produit du moment", toast: "Produit envoyé" },
  degustation: { label: "Dégustation", sub: "invitation", selected: "Dégustation de saison", toast: "Dégustation ouverte" },
  copain: { label: "Copain", sub: "bureau", selected: "Invitation collègue", toast: "Invitation prête" },
}

const PUSH_CARDS: Record<PushTab, Array<{ title: string; desc: string; cards: string }>> = {
  midi: [
    {
      title: "Revenir deux fois cette semaine",
      desc: "Déclenche le retour rapide sans remise permanente.",
      cards: "72 cartes",
    },
    {
      title: "Creux 15h-17h",
      desc: "Petit avantage sur produit épicerie pour déplacer un passage hors rush.",
      cards: "39 cartes",
    },
  ],
  produit: [
    {
      title: "Canistrelli citron · produit du moment",
      desc: "Produit simple, visible dans la carte, ajouté au sandwich.",
      cards: "88 cartes",
    },
    {
      title: "Terrine corse à découvrir",
      desc: "Pour les clients qui reviennent déjà deux fois par mois.",
      cards: "31 habitués",
    },
  ],
  degustation: [
    {
      title: "Dégustation de saison",
      desc: "Invite les membres Gourmet à passer goûter un produit choisi.",
      cards: "24 membres",
    },
    {
      title: "Avant-midi bureaux",
      desc: "Créer un petit rendez-vous de découverte avant le rush déjeuner.",
      cards: "18 cartes proches",
    },
  ],
  copain: [
    {
      title: "Amener un collègue",
      desc: "Mécanique simple pour transformer un client bureau en petit groupe.",
      cards: "46 habitués",
    },
    {
      title: "Sandwich à deux",
      desc: "Un geste léger pour faire entrer une nouvelle personne dans le cycle.",
      cards: "28 cartes actives",
    },
  ],
}

function pillLabel(tone: string) {
  if (tone === "new") return "Nouveau"
  if (tone === "return") return "Retour"
  if (tone === "copain") return "Copain"
  if (tone === "tasting") return "Dégustation"
  return "Produit"
}

export function MaminaJournalPage() {
  const [pushTab, setPushTab] = useState<PushTab>("produit")
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
          <span className={styles.brandPompette}>MAMINA</span>
          <span className={styles.brandSep}>·</span>
          <span className={styles.brandJournal}>JOURNAL DU JOUR</span>
        </div>
        <div className={styles.dateBadge}>
          <strong>{dateLabel}</strong>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroKicker}>Aujourd&apos;hui chez Mamina</div>
        <p className={styles.heroSentence}>
          <em>42 passages</em>, <em>14 retours</em>, <em>17 produits</em> découverts
          <br />
          et <em>5 clients</em> venus via dégustation.
        </p>
        <div className={styles.heroCost}>
          Produits offerts · <strong>6 attentions</strong>
        </div>
      </section>

      <div className={styles.keys}>
        {KEY_ITEMS.map((item) => (
          <div className={styles.keyItem} key={item.label}>
            <div className={cn(styles.keyBig, item.tone === "green" && styles.keyBigGreen, item.tone === "warm" && styles.keyBigWarm)}>
              <em>{item.value}</em>
            </div>
            <div className={styles.keyLabel}>{item.label}</div>
          </div>
        ))}
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div className={styles.sectionTitle}>
            Le <em>flux</em> Mamina
          </div>
          <div className={styles.sectionHint}>passages · produits · dégustations</div>
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
          <div className={styles.sectionHint}>pic midi · activation après-midi</div>
        </div>

        <div className={styles.timeline}>
          <div className={styles.timelineHead}>
            <div className={styles.timelineTitle}>
              Pic <em>midi</em> · 12h-14h
            </div>
            <div className={styles.timelinePeak}>rush saturé · soir disponible</div>
          </div>

          <div className={styles.bars}>
            {BAR_HEIGHTS.map((height, index) => (
              <div className={cn(styles.bar, index >= 3 && index <= 5 && styles.barPeak)} key={`${height}-${index}`} style={{ height: `${height}%` }} />
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
          <div className={styles.sectionHint}>les passages qui changent le rythme</div>
        </div>

        <div className={styles.stream}>
          {STREAM_ROWS.map((row) => (
            <div className={styles.streamRow} key={`${row.time}-${row.code}`}>
              <div className={styles.streamTime}>{row.time}</div>
              <div className={styles.streamNum}>{row.code}</div>
              <div className={styles.streamEvent}>{row.event}</div>
              <div
                className={cn(
                  styles.pill,
                  row.tone === "new" && styles.pillNew,
                  row.tone === "return" && styles.pillReturn,
                  row.tone === "copain" && styles.pillCopain,
                  row.tone === "product" && styles.pillProduct,
                  row.tone === "tasting" && styles.pillReward,
                )}
              >
                {pillLabel(row.tone)}
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
          <div className={styles.sectionHint}>un geste simple, visible sur les cartes</div>
        </div>

        <div className={styles.pushBlock}>
          <div className={styles.pushHead}>
            <span>Animation Mamina</span>
            <h3>
              Faire revenir sans <em>alourdir</em> l&apos;expérience.
            </h3>
            <p>Un produit du moment, une dégustation ou une invitation collègue suffit à créer le prochain passage.</p>
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
            Opportunités <em>proches</em>
          </div>
          <div className={styles.sectionHint}>insight léger</div>
        </div>
        <div className={styles.localOpportunity}>
          <strong>Bureaux autour de Friedland.</strong>
          <span>Potentiel pour dégustations midi et retours groupés en semaine.</span>
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
            <div className={styles.highlightLabel}>Découverte produit</div>
            <div className={styles.highlightQuote}>
              <em>Les clients qui ajoutent un produit épicerie reviennent plus vite.</em>
            </div>
            <div className={styles.highlightSub}>La découverte transforme le sandwich en visite Mamina.</div>
          </div>

          <div className={styles.highlightCard}>
            <div className={cn(styles.highlightCorner, styles.highlightCornerTl)} />
            <div className={cn(styles.highlightCorner, styles.highlightCornerBr)} />
            <div className={styles.highlightLabel}>Dégustations</div>
            <div className={styles.highlightQuote}>
              <em>Les dégustations génèrent des premiers passages</em> et augmentent la découverte produit.
            </div>
            <div className={styles.highlightSub}>Le midi est fort, l&apos;après-midi peut devenir un moment de goût.</div>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        Journal généré par Cardin · <em>sans toucher votre caisse</em>, <em>sans système lourd</em>.
        <br />
        Le rythme de Mamina. Rien de plus.
      </footer>
    </div>
  )
}
