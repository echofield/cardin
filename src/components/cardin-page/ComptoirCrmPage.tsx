"use client"

import { motion } from "framer-motion"
import { useMemo, useState } from "react"

import { cn } from "@/lib/utils"

import styles from "./ComptoirCrmPage.module.css"

type VerticalId = "caviste" | "bar"

type Client = {
  name: string
  tag: string
  value: string
  last: string
  next: string
  note: string
  tastes: string[]
}

type Activation = {
  title: string
  detail: string
  reach: string
  cost: string
}

type VerticalConfig = {
  label: string
  place: string
  headline: string
  subline: string
  crmName: string
  rhythm: string
  revenue: string
  memory: string
  queueTitle: string
  pushTitle: string
  pushBody: string
  cardTitle: string
  cardAction: string
  clients: Client[]
  activations: Activation[]
  journal: string[]
}

const VERTICALS: Record<VerticalId, VerticalConfig> = {
  caviste: {
    label: "Caviste",
    place: "Maison Vigne",
    headline: "Le carnet client qui sait quand rappeler, quoi proposer, et pourquoi maintenant.",
    subline:
      "Cardin transforme les achats, goûts et événements en queue de relance claire. Pas un CRM froid : une mémoire de comptoir qui fait revenir.",
    crmName: "Cave Book",
    rhythm: "42 relances utiles cette semaine",
    revenue: "8 740 € en cave suivie",
    memory: "goûts, budgets, occasions, bouteilles achetées",
    queueTitle: "À rappeler avant le week-end",
    pushTitle: "Arrivage Jura · 18 bouteilles",
    pushBody:
      "Proposer aux profils nature blanc et dîner maison. Réservation en un tap, retrait vendredi.",
    cardTitle: "Votre sélection cave",
    cardAction: "3 bouteilles du Jura sont arrivées. Réservez avant samedi.",
    clients: [
      {
        name: "Camille Moreau",
        tag: "nature blanc · 35-55 €",
        value: "420 €",
        last: "Achat il y a 31 jours",
        next: "Relance aujourd'hui",
        note: "Dîner samedi. A aimé Savagnin, évite les rouges puissants.",
        tastes: ["Jura", "blanc sec", "dîner", "bio"],
      },
      {
        name: "Nicolas Perrin",
        tag: "champagne · cadeaux",
        value: "1 180 €",
        last: "Dernier contact il y a 9 jours",
        next: "Anniversaire J-6",
        note: "Achète par caisse quand l'histoire est claire. Préférer brut nature.",
        tastes: ["bulles", "cadeau", "premium", "réserve"],
      },
      {
        name: "Sarah Cohen",
        tag: "rouge léger · 20-30 €",
        value: "285 €",
        last: "Achat il y a 44 jours",
        next: "Dormante",
        note: "Revient sur recommandation repas. Bonne cible dégustation jeudi.",
        tastes: ["Loire", "rouge léger", "soirée", "dégustation"],
      },
    ],
    activations: [
      {
        title: "Dégustation jeudi",
        detail: "12 clients à inviter selon goûts et historique.",
        reach: "126 cartes",
        cost: "42 €",
      },
      {
        title: "Caisse saison",
        detail: "Relancer les profils dîner maison avant le week-end.",
        reach: "84 cartes",
        cost: "0 €",
      },
      {
        title: "Allocation rare",
        detail: "Prévenir les clients premium avant affichage public.",
        reach: "19 cartes",
        cost: "0 €",
      },
    ],
    journal: [
      "10:12 · Camille ouvre l'arrivage Jura",
      "10:47 · 3 réservations sur la sélection dîner",
      "11:20 · Nicolas entre dans la liste champagne",
      "12:04 · Dégustation jeudi atteint 9 inscrits",
    ],
  },
  bar: {
    label: "Bar",
    place: "Le Bar des Amis",
    headline: "Le CRM de nuit qui reconnaît les groupes, relance les habitués et pousse le bon moment.",
    subline:
      "Cardin garde la mémoire des tables, anniversaires, soirs préférés et jeux joués. Le bar choisit une activation, la carte client reçoit l'invitation.",
    crmName: "Night Book",
    rhythm: "31 groupes à réveiller",
    revenue: "64 cartes actives ce soir",
    memory: "habitués, tables, anniversaires, soirs faibles",
    queueTitle: "Groupes à faire revenir",
    pushTitle: "Mercredi compte double",
    pushBody:
      "Pousser les groupes venus le mois dernier. Roulette ouverte 20h-22h, lot au comptoir.",
    cardTitle: "Votre table est invitée",
    cardAction: "Mercredi compte double. Venez à 3 avant 21h30 pour entrer dans le tirage.",
    clients: [
      {
        name: "Table Léa",
        tag: "groupe de 4 · cocktails",
        value: "312 €",
        last: "Venue il y a 18 jours",
        next: "Mercredi faible",
        note: "Réagit aux blind tests. Prévenir avant 18h, pas après.",
        tastes: ["cocktails", "blind test", "mercredi", "groupe"],
      },
      {
        name: "Samir & Hugo",
        tag: "match · bière",
        value: "226 €",
        last: "Dernier match France",
        next: "Score exact",
        note: "Table sportive. Bonne cible pronostic et classement.",
        tastes: ["match", "bière", "score", "duo"],
      },
      {
        name: "Maya birthday",
        tag: "anniversaire · 8 pers.",
        value: "640 €",
        last: "Réservé en mars",
        next: "J-12",
        note: "A demandé une table calme. Peut revenir avec groupe complet.",
        tastes: ["anniversaire", "groupe", "bouteille", "vendredi"],
      },
    ],
    activations: [
      {
        title: "Roulette comptoir",
        detail: "Un tour par carte, lots petits, salle vivante.",
        reach: "64 cartes",
        cost: "36 €",
      },
      {
        title: "Score exact",
        detail: "Chaque table pose un score avant le match.",
        reach: "41 cartes",
        cost: "54 €",
      },
      {
        title: "Retour groupe",
        detail: "Invitation ciblée aux tables venues il y a 15-45 jours.",
        reach: "27 cartes",
        cost: "18 €",
      },
    ],
    journal: [
      "18:06 · Push mercredi envoyé à 64 cartes",
      "18:22 · Table Léa confirme 4 personnes",
      "19:11 · 7 scores exacts déjà posés",
      "20:03 · Roulette ouverte au comptoir",
    ],
  },
}

const METRICS = [
  { label: "Mémoire", key: "memory" },
  { label: "Rythme", key: "rhythm" },
  { label: "Valeur", key: "revenue" },
] as const

export function ComptoirCrmPage() {
  const [verticalId, setVerticalId] = useState<VerticalId>("caviste")
  const [selectedClient, setSelectedClient] = useState(0)
  const [selectedActivation, setSelectedActivation] = useState(0)

  const vertical = VERTICALS[verticalId]
  const client = vertical.clients[selectedClient] ?? vertical.clients[0]
  const activation = vertical.activations[selectedActivation] ?? vertical.activations[0]

  const customerInitials = useMemo(
    () =>
      client.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    [client.name],
  )

  function chooseVertical(id: VerticalId) {
    setVerticalId(id)
    setSelectedClient(0)
    setSelectedActivation(0)
  }

  return (
    <main className={styles.shell}>
      <section className={styles.hero}>
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className={styles.heroCopy}
          initial={{ opacity: 0, y: 18 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className={styles.brandLine}>
            <span>Cardin</span>
            <em>CRM Comptoir</em>
          </div>

          <div className={styles.verticalSwitch} aria-label="Choisir la verticale">
            {(Object.keys(VERTICALS) as VerticalId[]).map((id) => (
              <button
                className={cn(styles.switchButton, verticalId === id && styles.switchButtonActive)}
                key={id}
                onClick={() => chooseVertical(id)}
                type="button"
              >
                {VERTICALS[id].label}
              </button>
            ))}
          </div>

          <p className={styles.kicker}>Verticale démo · {vertical.place}</p>
          <h1>{vertical.headline}</h1>
          <p className={styles.subline}>{vertical.subline}</p>
        </motion.div>

        <motion.aside
          animate={{ opacity: 1, y: 0 }}
          className={styles.phone}
          initial={{ opacity: 0, y: 22 }}
          transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className={styles.phoneTop}>
            <span>{vertical.place}</span>
            <em>Carte active</em>
          </div>
          <div className={styles.cardFace}>
            <div className={styles.liveDot}>Live</div>
            <p>{vertical.cardTitle}</p>
            <strong>{vertical.cardAction}</strong>
            <div className={styles.cardMeta}>
              <span>{activation.reach}</span>
              <span>coût prévu {activation.cost}</span>
            </div>
          </div>
          <div className={styles.trace}>
            <span>Trace gardée</span>
            <p>{client.name} garde l'historique après le moment.</p>
          </div>
        </motion.aside>
      </section>

      <section className={styles.metricsGrid}>
        {METRICS.map((metric) => (
          <article className={styles.metricCard} key={metric.label}>
            <span>{metric.label}</span>
            <strong>{vertical[metric.key]}</strong>
          </article>
        ))}
      </section>

      <section className={styles.operatorGrid}>
        <article className={styles.panel}>
          <div className={styles.panelHead}>
            <span>{vertical.crmName}</span>
            <strong>{vertical.queueTitle}</strong>
          </div>

          <div className={styles.clientQueue}>
            {vertical.clients.map((item, index) => (
              <button
                className={cn(styles.clientRow, selectedClient === index && styles.clientRowActive)}
                key={item.name}
                onClick={() => setSelectedClient(index)}
                type="button"
              >
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.tag}</span>
                </div>
                <em>{item.next}</em>
              </button>
            ))}
          </div>
        </article>

        <article className={cn(styles.panel, styles.profilePanel)}>
          <div className={styles.avatar}>{customerInitials}</div>
          <div className={styles.profileMain}>
            <span>Fiche client</span>
            <h2>{client.name}</h2>
            <p>{client.note}</p>
          </div>

          <div className={styles.profileStats}>
            <div>
              <span>Valeur</span>
              <strong>{client.value}</strong>
            </div>
            <div>
              <span>Dernier signal</span>
              <strong>{client.last}</strong>
            </div>
          </div>

          <div className={styles.tasteCloud}>
            {client.tastes.map((taste) => (
              <span key={taste}>{taste}</span>
            ))}
          </div>
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHead}>
            <span>Moteur d'activation</span>
            <strong>{vertical.pushTitle}</strong>
          </div>
          <p className={styles.pushCopy}>{vertical.pushBody}</p>

          <div className={styles.activationList}>
            {vertical.activations.map((item, index) => (
              <button
                className={cn(styles.activationButton, selectedActivation === index && styles.activationButtonActive)}
                key={item.title}
                onClick={() => setSelectedActivation(index)}
                type="button"
              >
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.detail}</span>
                </div>
                <em>{item.reach}</em>
              </button>
            ))}
          </div>

          <div className={styles.sendBar}>
            <div>
              <span>Sélection</span>
              <strong>{activation.title}</strong>
            </div>
            <button type="button">Envoyer le push</button>
          </div>
        </article>

        <article className={cn(styles.panel, styles.journalPanel)}>
          <div className={styles.panelHead}>
            <span>Journal vivant</span>
            <strong>Ce qui bouge aujourd'hui</strong>
          </div>
          <div className={styles.journalList}>
            {vertical.journal.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
          <div className={styles.journalSummary}>
            <span>Lecture business</span>
            <strong>
              {verticalId === "caviste"
                ? "La cave sait qui relancer avant que le besoin disparaisse."
                : "Le bar voit quel groupe revient et quel moment remplit la salle."}
            </strong>
          </div>
        </article>
      </section>

      <section className={styles.position}>
        <p>
          Ce n'est pas un CRM générique. C'est une couche Cardin pour les commerces où la mémoire humaine vaut de
          l'argent : qui aime quoi, qui revient quand, qui peut être invité aujourd'hui, et quel geste peut déclencher
          le prochain passage.
        </p>
        <div>
          <span>Base vendable</span>
          <strong>carnet client + relance + carte + journal + push</strong>
        </div>
      </section>
    </main>
  )
}
