"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useMemo, useState } from "react"

import { cn } from "@/lib/utils"

import styles from "./ComptoirCrmPage.module.css"

type VerticalId = "caviste" | "bar"

type Client = {
  id: string
  name: string
  initials: string
  segment: string
  reason: string
  spend: number
  lastSignal: string
  nextMove: string
  score: number
  note: string
  tags: string[]
  timeline: string[]
}

type Activation = {
  id: string
  title: string
  family: string
  intent: string
  audience: string
  cost: number
  cardTitle: string
  cardCopy: string
  playLabel: string
  results: string[]
}

type Bottle = {
  id: string
  name: string
  region: string
  price: number
  stock: number
  tags: string[]
}

type VerticalConfig = {
  label: string
  place: string
  operatorTitle: string
  operatorSub: string
  queueTitle: string
  cardLabel: string
  metrics: Array<{ label: string; value: string; tone?: "dark" }>
  clients: Client[]
  activations: Activation[]
  bottles?: Bottle[]
  baseEvents: string[]
}

const VERTICALS: Record<VerticalId, VerticalConfig> = {
  caviste: {
    label: "Caviste",
    place: "Maison Vigne",
    operatorTitle: "Cave Book",
    operatorSub:
      "Une queue de relance, des goûts mémorisés, des sélections prêtes, et une carte client qui reçoit le bon message.",
    queueTitle: "Clients à traiter",
    cardLabel: "Carte cave",
    metrics: [
      { label: "Relances utiles", value: "42" },
      { label: "Cave suivie", value: "8 740 €", tone: "dark" },
      { label: "Réservations", value: "12" },
      { label: "Événements", value: "3" },
    ],
    clients: [
      {
        id: "camille",
        name: "Camille Moreau",
        initials: "CM",
        segment: "Nature blanc · 35-55 €",
        reason: "Dîner samedi",
        spend: 420,
        lastSignal: "Achat il y a 31 jours",
        nextMove: "Proposer 3 bouteilles Jura",
        score: 91,
        note: "A aimé Savagnin, évite les rouges puissants. Répond bien aux sélections courtes avec retrait rapide.",
        tags: ["Jura", "blanc sec", "bio", "dîner"],
        timeline: ["Savagnin acheté en mars", "A demandé un blanc salin", "Dîner prévu samedi"],
      },
      {
        id: "nicolas",
        name: "Nicolas Perrin",
        initials: "NP",
        segment: "Champagne · cadeaux",
        reason: "Anniversaire J-6",
        spend: 1180,
        lastSignal: "Dernier contact il y a 9 jours",
        nextMove: "Réserver brut nature premium",
        score: 86,
        note: "Achète par caisse quand l'histoire est claire. Préférer brut nature, coffret propre, livraison possible.",
        tags: ["bulles", "cadeau", "premium", "réserve"],
        timeline: ["Coffret acheté en décembre", "Budget habituel 80-120 €", "Anniversaire dans 6 jours"],
      },
      {
        id: "sarah",
        name: "Sarah Cohen",
        initials: "SC",
        segment: "Rouge léger · 20-30 €",
        reason: "Dormante 44 jours",
        spend: 285,
        lastSignal: "Achat il y a 44 jours",
        nextMove: "Inviter dégustation jeudi",
        score: 74,
        note: "Revient sur recommandation repas. Bonne cible dégustation jeudi, surtout si le message reste simple.",
        tags: ["Loire", "rouge léger", "soirée", "dégustation"],
        timeline: ["A pris Gamay Loire", "A cliqué dégustation en février", "Pas revenue depuis 44 jours"],
      },
      {
        id: "antoine",
        name: "Antoine Ravel",
        initials: "AR",
        segment: "Caisse mensuelle · 150 €",
        reason: "Cycle terminé",
        spend: 1640,
        lastSignal: "Caisse livrée il y a 37 jours",
        nextMove: "Composer caisse avril",
        score: 93,
        note: "Client régulier. Il veut gagner du temps, pas choisir. Trois lignes suffisent : apéro, dîner, garde.",
        tags: ["caisse", "abonnement", "rouge", "garde"],
        timeline: ["Caisse mars terminée", "Budget stable", "Répond le matin"],
      },
    ],
    activations: [
      {
        id: "jura",
        title: "Arrivage Jura",
        family: "Sélection",
        intent: "Transformer un arrivage court en réservations rapides.",
        audience: "38 profils blancs / nature",
        cost: 0,
        cardTitle: "3 bouteilles du Jura sont arrivées",
        cardCopy: "Une sélection courte vous attend. Réservez avant samedi, retrait en cave.",
        playLabel: "Réserver la sélection",
        results: [
          "Camille réserve 2 bouteilles Jura.",
          "3 cartes ouvrent la sélection dans les 4 minutes.",
          "Une bouteille rare passe en stock réservé.",
        ],
      },
      {
        id: "degustation",
        title: "Dégustation jeudi",
        family: "Événement",
        intent: "Remplir 12 places avec les bons profils, pas avec une promo publique.",
        audience: "24 profils dégustation",
        cost: 42,
        cardTitle: "Dégustation jeudi soir",
        cardCopy: "Vous êtes invité sur une dégustation courte : 4 vins, 12 places, jeudi 19h.",
        playLabel: "Inviter ce client",
        results: [
          "Sarah rejoint la liste dégustation.",
          "2 nouvelles places prises sur jeudi.",
          "Le journal marque un retour événement.",
        ],
      },
      {
        id: "caisse",
        title: "Caisse week-end",
        family: "Relance",
        intent: "Transformer les clients dîner maison en panier préparé.",
        audience: "61 cartes dîner",
        cost: 0,
        cardTitle: "Votre caisse week-end est prête",
        cardCopy: "Trois bouteilles : apéritif, dîner, bouteille à garder. Réponse en un tap.",
        playLabel: "Composer la caisse",
        results: [
          "Une caisse week-end est proposée.",
          "Antoine reçoit une caisse en 3 lignes.",
          "Panier prévu ajouté au journal : 126 €.",
        ],
      },
    ],
    bottles: [
      { id: "savagnin", name: "Savagnin ouillé", region: "Jura", price: 38, stock: 9, tags: ["salin", "dîner"] },
      { id: "gamay", name: "Gamay vieilles vignes", region: "Loire", price: 24, stock: 18, tags: ["léger", "soirée"] },
      { id: "champagne", name: "Brut nature", region: "Champagne", price: 72, stock: 6, tags: ["cadeau", "premium"] },
      { id: "chenin", name: "Chenin sec", region: "Anjou", price: 31, stock: 14, tags: ["blanc", "apéritif"] },
    ],
    baseEvents: [
      "10:12 - Camille ouvre l'arrivage Jura",
      "10:47 - 3 réservations sur la sélection dîner",
      "11:20 - Nicolas entre dans la liste champagne",
      "12:04 - Dégustation jeudi atteint 9 inscrits",
    ],
  },
  bar: {
    label: "Bar",
    place: "Le Bar des Amis",
    operatorTitle: "Night Book",
    operatorSub:
      "Une mémoire des groupes, des soirs faibles, des jeux joués, puis une carte qui reçoit l'invitation du soir.",
    queueTitle: "Tables à réveiller",
    cardLabel: "Carte bar",
    metrics: [
      { label: "Cartes actives", value: "64", tone: "dark" },
      { label: "Groupes à relancer", value: "31" },
      { label: "Tables prévues", value: "7" },
      { label: "Coût lots", value: "36 €" },
    ],
    clients: [
      {
        id: "lea",
        name: "Table Léa",
        initials: "TL",
        segment: "Groupe de 4 · cocktails",
        reason: "Mercredi faible",
        spend: 312,
        lastSignal: "Venue il y a 18 jours",
        nextMove: "Inviter roulette 20h-22h",
        score: 89,
        note: "Réagit aux blind tests et aux petits jeux. Prévenir avant 18h, pas après.",
        tags: ["cocktails", "blind test", "mercredi", "groupe"],
        timeline: ["4 cocktails signature", "Blind test joué", "A ramené 2 amis"],
      },
      {
        id: "samir",
        name: "Samir & Hugo",
        initials: "SH",
        segment: "Match · bière",
        reason: "Score exact",
        spend: 226,
        lastSignal: "Dernier match France",
        nextMove: "Pousser pronostic",
        score: 81,
        note: "Table sportive. Bonne cible pronostic, classement, et tirage au coup d'envoi.",
        tags: ["match", "bière", "score", "duo"],
        timeline: ["France-Brésil joué", "Score posé 2-1", "Table revenue deux fois"],
      },
      {
        id: "maya",
        name: "Maya birthday",
        initials: "MB",
        segment: "Anniversaire · 8 pers.",
        reason: "J-12",
        spend: 640,
        lastSignal: "Réservé en mars",
        nextMove: "Préparer table anniversaire",
        score: 94,
        note: "A demandé une table calme. Peut revenir avec groupe complet si on propose tôt.",
        tags: ["anniversaire", "groupe", "bouteille", "vendredi"],
        timeline: ["8 personnes en mars", "Bouteille maison offerte", "Préférence table arrière"],
      },
      {
        id: "noa",
        name: "Noa comptoir",
        initials: "NC",
        segment: "Solo · jeudi",
        reason: "Habitué discret",
        spend: 148,
        lastSignal: "Passage il y a 12 jours",
        nextMove: "Prévenir cocktail invité",
        score: 68,
        note: "Vient tôt, au comptoir. Préfère une invitation calme plutôt qu'un gros jeu de salle.",
        tags: ["comptoir", "cocktail", "jeudi", "solo"],
        timeline: ["3 jeudis consécutifs", "A testé cocktail invité", "Part avant 22h"],
      },
    ],
    activations: [
      {
        id: "roulette",
        title: "Roulette comptoir",
        family: "Jeu",
        intent: "Créer un vrai moment avec un coût faible et visible.",
        audience: "64 cartes ce soir",
        cost: 36,
        cardTitle: "Roulette du comptoir",
        cardCopy: "Un tour par carte. Shot, double chance, table inscrite, ou rien ce soir.",
        playLabel: "Tourner la roulette",
        results: ["Shot maison gagné.", "Double chance pour la table.", "Table inscrite au tirage.", "Rien ce tour, mais la carte reste active."],
      },
      {
        id: "score",
        title: "Score exact",
        family: "Match",
        intent: "Faire rester les tables jusqu'au coup d'envoi.",
        audience: "41 cartes sport",
        cost: 54,
        cardTitle: "Pose le score exact",
        cardCopy: "France - Brésil. Donnez votre score avant le coup d'envoi. La table juste prend le lot.",
        playLabel: "Valider le score",
        results: ["Score 2-1 posé pour Samir & Hugo.", "7 scores exacts déjà posés.", "Le match devient un moment de salle."],
      },
      {
        id: "groupe",
        title: "Retour groupe",
        family: "Relance",
        intent: "Faire revenir les tables venues il y a 15 à 45 jours.",
        audience: "27 tables dormantes",
        cost: 18,
        cardTitle: "Votre table est invitée",
        cardCopy: "Venez à 3 avant 21h30. Votre table entre dans le tirage du soir.",
        playLabel: "Confirmer une table",
        results: ["Table Léa confirme 4 personnes.", "Une table entre dans le tirage de 22h.", "Le mercredi passe de faible à jouable."],
      },
    ],
    baseEvents: [
      "18:06 - Push mercredi envoyé à 64 cartes",
      "18:22 - Table Léa confirme 4 personnes",
      "19:11 - 7 scores exacts déjà posés",
      "20:03 - Roulette ouverte au comptoir",
    ],
  },
}

const INITIAL_EVENTS: Record<VerticalId, string[]> = {
  caviste: VERTICALS.caviste.baseEvents,
  bar: VERTICALS.bar.baseEvents,
}

const INITIAL_CLIENT: Record<VerticalId, string> = {
  caviste: VERTICALS.caviste.clients[0].id,
  bar: VERTICALS.bar.clients[0].id,
}

const INITIAL_ACTIVATION: Record<VerticalId, string> = {
  caviste: VERTICALS.caviste.activations[0].id,
  bar: VERTICALS.bar.activations[0].id,
}

const EMPTY_BOTTLES: Bottle[] = []

function formatMoney(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    currency: "EUR",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value)
}

function timeStamp() {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
}

export function ComptoirCrmPage() {
  const [verticalId, setVerticalId] = useState<VerticalId>("caviste")
  const [selectedClients, setSelectedClients] = useState(INITIAL_CLIENT)
  const [selectedActivations, setSelectedActivations] = useState(INITIAL_ACTIVATION)
  const [events, setEvents] = useState(INITIAL_EVENTS)
  const [selectedBottles, setSelectedBottles] = useState(["savagnin", "chenin"])
  const [pushCount, setPushCount] = useState({ caviste: 38, bar: 64 })
  const [reservationCount, setReservationCount] = useState({ caviste: 12, bar: 7 })
  const [lastResult, setLastResult] = useState<Record<VerticalId, string>>({
    caviste: "Sélection prête à envoyer.",
    bar: "Roulette prête au comptoir.",
  })

  const vertical = VERTICALS[verticalId]
  const selectedClientId = selectedClients[verticalId]
  const selectedActivationId = selectedActivations[verticalId]
  const client = vertical.clients.find((item) => item.id === selectedClientId) ?? vertical.clients[0]
  const activation = vertical.activations.find((item) => item.id === selectedActivationId) ?? vertical.activations[0]
  const bottleShelf = vertical.bottles ?? EMPTY_BOTTLES
  const selectedBottleItems = useMemo(
    () => bottleShelf.filter((bottle) => selectedBottles.includes(bottle.id)),
    [bottleShelf, selectedBottles],
  )
  const basketTotal = selectedBottleItems.reduce((total, bottle) => total + bottle.price, 0)

  function addEvent(text: string) {
    setEvents((current) => ({
      ...current,
      [verticalId]: [`${timeStamp()} - ${text}`, ...current[verticalId]].slice(0, 8),
    }))
  }

  function chooseVertical(next: VerticalId) {
    setVerticalId(next)
  }

  function chooseClient(clientId: string) {
    setSelectedClients((current) => ({ ...current, [verticalId]: clientId }))
    const nextClient = vertical.clients.find((item) => item.id === clientId)
    if (nextClient) addEvent(`${nextClient.name} ouvert dans le carnet.`)
  }

  function chooseActivation(activationId: string) {
    setSelectedActivations((current) => ({ ...current, [verticalId]: activationId }))
    const nextActivation = vertical.activations.find((item) => item.id === activationId)
    if (nextActivation) addEvent(`${nextActivation.title} préparé côté carte.`)
  }

  function toggleBottle(bottleId: string) {
    setSelectedBottles((current) => {
      if (current.includes(bottleId)) {
        return current.length === 1 ? current : current.filter((id) => id !== bottleId)
      }
      return [...current, bottleId].slice(-3)
    })
  }

  function sendPush() {
    setPushCount((current) => ({ ...current, [verticalId]: current[verticalId] + 1 }))
    setLastResult((current) => ({ ...current, [verticalId]: `${activation.title} envoyé à ${client.name}.` }))
    addEvent(`${activation.title} envoyé à ${client.name}.`)
  }

  function markDone() {
    setReservationCount((current) => ({ ...current, [verticalId]: current[verticalId] + 1 }))
    setLastResult((current) => ({ ...current, [verticalId]: activation.results[0] }))
    addEvent(`${client.name} traité : ${client.nextMove.toLowerCase()}.`)
  }

  function playActivation() {
    const result = activation.results[Math.floor(Math.random() * activation.results.length)]
    setReservationCount((current) => ({ ...current, [verticalId]: current[verticalId] + 1 }))
    setLastResult((current) => ({ ...current, [verticalId]: result }))
    addEvent(result)
  }

  return (
    <main className={styles.shell}>
      <header className={styles.appHeader}>
        <div className={styles.brand}>
          <span>Cardin</span>
          <em>Comptoir CRM</em>
        </div>

        <nav className={styles.verticalSwitch} aria-label="Choisir une verticale">
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
        </nav>

        <div className={styles.liveBadge}>
          <span />
          {vertical.place}
        </div>
      </header>

      <section className={styles.commandIntro}>
        <div>
          <p>{vertical.label} · moteur opérateur</p>
          <h1>{vertical.operatorTitle}</h1>
        </div>
        <span>{vertical.operatorSub}</span>
      </section>

      <section className={styles.metricsGrid}>
        {vertical.metrics.map((metric) => (
          <article className={cn(styles.metricCard, metric.tone === "dark" && styles.metricCardDark)} key={metric.label}>
            <span>{metric.label}</span>
            <strong>
              {metric.label === "Réservations" || metric.label === "Tables prévues"
                ? reservationCount[verticalId]
                : metric.value}
            </strong>
          </article>
        ))}
      </section>

      <section className={styles.workbench}>
        <aside className={styles.queuePanel}>
          <div className={styles.panelHead}>
            <span>{vertical.queueTitle}</span>
            <strong>{vertical.clients.length} profils</strong>
          </div>

          <div className={styles.queueList}>
            {vertical.clients.map((item) => (
              <button
                className={cn(styles.queueRow, item.id === client.id && styles.queueRowActive)}
                key={item.id}
                onClick={() => chooseClient(item.id)}
                type="button"
              >
                <div className={styles.queueTop}>
                  <strong>{item.name}</strong>
                  <em>{item.score}</em>
                </div>
                <span>{item.segment}</span>
                <p>{item.reason}</p>
                <i style={{ width: `${item.score}%` }} />
              </button>
            ))}
          </div>
        </aside>

        <section className={styles.clientPanel}>
          <div className={styles.clientTop}>
            <div className={styles.avatar}>{client.initials}</div>
            <div>
              <span>Fiche active</span>
              <h2>{client.name}</h2>
              <p>{client.segment}</p>
            </div>
          </div>

          <div className={styles.clientNote}>{client.note}</div>

          <div className={styles.clientStats}>
            <div>
              <span>Dépense suivie</span>
              <strong>{formatMoney(client.spend)}</strong>
            </div>
            <div>
              <span>Dernier signal</span>
              <strong>{client.lastSignal}</strong>
            </div>
            <div>
              <span>Prochaine action</span>
              <strong>{client.nextMove}</strong>
            </div>
          </div>

          <div className={styles.tagCloud}>
            {client.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>

          <div className={styles.timeline}>
            {client.timeline.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </section>

        <aside className={styles.phonePanel}>
          <div className={styles.phone}>
            <div className={styles.phoneTop}>
              <span>{vertical.place}</span>
              <em>{vertical.cardLabel}</em>
            </div>

            <AnimatePresence mode="wait">
              <motion.article
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                className={styles.cardPreview}
                exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                key={`${verticalId}-${client.id}-${activation.id}-${lastResult[verticalId]}`}
                transition={{ duration: 0.25 }}
              >
                <div className={styles.cardLive}>Push prêt</div>
                <p>{activation.cardTitle}</p>
                <strong>{activation.cardCopy}</strong>

                {verticalId === "caviste" ? (
                  <div className={styles.mobileSelection}>
                    {selectedBottleItems.map((bottle) => (
                      <div key={bottle.id}>
                        <span>{bottle.region}</span>
                        <strong>{bottle.name}</strong>
                        <em>{formatMoney(bottle.price)}</em>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.mobileGame}>
                    <span>{activation.family}</span>
                    <strong>{lastResult.bar}</strong>
                  </div>
                )}

                <button onClick={playActivation} type="button">
                  {activation.playLabel}
                </button>
              </motion.article>
            </AnimatePresence>

            <div className={styles.phoneTrace}>
              <span>Trace</span>
              <p>{client.name} garde l'historique après le moment.</p>
            </div>
          </div>
        </aside>
      </section>

      <section className={styles.engineGrid}>
        <article className={styles.activationPanel}>
          <div className={styles.panelHead}>
            <span>Moteur d'activation</span>
            <strong>{pushCount[verticalId]} cartes ciblées</strong>
          </div>

          <div className={styles.activationGrid}>
            {vertical.activations.map((item) => (
              <button
                className={cn(styles.activationCard, item.id === activation.id && styles.activationCardActive)}
                key={item.id}
                onClick={() => chooseActivation(item.id)}
                type="button"
              >
                <span>{item.family}</span>
                <strong>{item.title}</strong>
                <p>{item.intent}</p>
                <em>
                  {item.audience} · coût {formatMoney(item.cost)}
                </em>
              </button>
            ))}
          </div>

          <div className={styles.actionBar}>
            <div>
              <span>Action prête</span>
              <strong>{activation.title}</strong>
              <p>{activation.cardCopy}</p>
            </div>
            <div className={styles.actionButtons}>
              <button onClick={sendPush} type="button">Envoyer push</button>
              <button onClick={markDone} type="button">Marquer traité</button>
            </div>
          </div>
        </article>

        {verticalId === "caviste" ? (
          <article className={styles.playPanel}>
            <div className={styles.panelHead}>
              <span>Composer une caisse</span>
              <strong>{formatMoney(basketTotal)}</strong>
            </div>

            <div className={styles.bottleGrid}>
              {bottleShelf.map((bottle) => (
                <button
                  className={cn(styles.bottleCard, selectedBottles.includes(bottle.id) && styles.bottleCardActive)}
                  key={bottle.id}
                  onClick={() => toggleBottle(bottle.id)}
                  type="button"
                >
                  <span>{bottle.region}</span>
                  <strong>{bottle.name}</strong>
                  <p>{bottle.tags.join(" · ")}</p>
                  <em>
                    {formatMoney(bottle.price)} · {bottle.stock} en stock
                  </em>
                </button>
              ))}
            </div>

            <button className={styles.playButton} onClick={playActivation} type="button">
              Réserver pour {client.name}
            </button>
          </article>
        ) : (
          <article className={styles.playPanel}>
            <div className={styles.panelHead}>
              <span>Jeu live</span>
              <strong>{activation.title}</strong>
            </div>

            <div className={styles.rouletteTable}>
              {activation.results.map((result, index) => (
                <span key={result} style={{ transform: `rotate(${index * (360 / activation.results.length)}deg)` }}>
                  {result.split(" ")[0]}
                </span>
              ))}
              <button onClick={playActivation} type="button">
                Jouer
              </button>
            </div>

            <div className={styles.gameResult}>
              <span>Résultat carte</span>
              <strong>{lastResult.bar}</strong>
            </div>
          </article>
        )}

        <article className={styles.journalPanel}>
          <div className={styles.panelHead}>
            <span>Journal vivant</span>
            <strong>Derniers signaux</strong>
          </div>

          <div className={styles.journalList}>
            {events[verticalId].map((event, index) => (
              <p key={`${event}-${index}`}>{event}</p>
            ))}
          </div>
        </article>
      </section>
    </main>
  )
}
