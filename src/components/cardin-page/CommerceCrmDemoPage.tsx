"use client"

import Link from "next/link"
import { useMemo, useState } from "react"

import { cn } from "@/lib/utils"

import styles from "./CommerceCrmDemoPage.module.css"

type Variant = "bar" | "caviste"

type Client = {
  action: string
  avatar: string
  cells: Array<{ label: string; value: string; big?: boolean }>
  name: string
  quote: string
  score: number
  sub: string
  tags: string[]
  trace: string[]
}

type Activation = {
  audience: string
  cost: string
  detail: string
  label: string
  name: string
  pushLabel: string
  pushTitle: string
}

type Stock = {
  active?: boolean
  info: string
  name: string
  region: string
  style?: string
}

type DemoData = {
  activeActivation: number
  activeClient: number
  activations: Activation[]
  cardButton: string
  clients: Client[]
  journal: string[]
  metrics: Array<{ label: string; value: string; dark?: boolean }>
  navShop: string
  panelMeta: string
  queueTitle: string
  stocks: Stock[]
}

const DATA: Record<Variant, DemoData> = {
  caviste: {
    activeActivation: 1,
    activeClient: 0,
    cardButton: "Carte cave",
    navShop: "Maison Vigne",
    panelMeta: "38 cartes ciblées",
    queueTitle: "Clients à traiter",
    metrics: [
      { label: "Relances utiles", value: "42" },
      { label: "Cave suivie", value: "8 740 €", dark: true },
      { label: "Réservations", value: "12" },
      { label: "Événements", value: "3" },
    ],
    clients: [
      {
        action: "Dîner samedi",
        avatar: "CM",
        name: "Camille Moreau",
        quote:
          "A aimé Savagnin, évite les rouges puissants. Répond bien aux sélections courtes avec retrait rapide.",
        score: 91,
        sub: "Nature blanc · 35-55 €",
        tags: ["Jura", "blanc sec", "bio", "dîner"],
        cells: [
          { label: "Dépense suivie", value: "420 €", big: true },
          { label: "Dernier signal", value: "Achat il y a 31 jours" },
          { label: "Prochaine action", value: "Proposer 3 bouteilles Jura" },
        ],
        trace: ["Savagnin acheté en mars", "A demandé un blanc salin", "Dîner prévu samedi"],
      },
      {
        action: "Anniversaire J-6",
        avatar: "NP",
        name: "Nicolas Perrin",
        quote: "Achète par caisse quand l'histoire est claire. Préférer brut nature, coffret propre, livraison possible.",
        score: 86,
        sub: "Champagne · cadeaux",
        tags: ["bulles", "cadeau", "premium", "réserve"],
        cells: [
          { label: "Dépense suivie", value: "1 180 €", big: true },
          { label: "Dernier signal", value: "Contact il y a 9 jours" },
          { label: "Prochaine action", value: "Réserver brut nature premium" },
        ],
        trace: ["Coffret acheté en décembre", "Budget 80-120 €", "Anniversaire dans 6 jours"],
      },
      {
        action: "Dormante 44 jours",
        avatar: "SC",
        name: "Sarah Cohen",
        quote: "Revient sur recommandation repas. Bonne cible dégustation jeudi, surtout si le message reste simple.",
        score: 74,
        sub: "Rouge léger · 20-30 €",
        tags: ["Loire", "rouge léger", "soirée", "dégustation"],
        cells: [
          { label: "Dépense suivie", value: "285 €", big: true },
          { label: "Dernier signal", value: "Achat il y a 44 jours" },
          { label: "Prochaine action", value: "Inviter dégustation jeudi" },
        ],
        trace: ["A pris Gamay Loire", "A cliqué dégustation", "Pas revenue depuis 44 jours"],
      },
      {
        action: "Cycle terminé",
        avatar: "AR",
        name: "Antoine Ravel",
        quote: "Client régulier. Il veut gagner du temps, pas choisir. Trois lignes suffisent : apéro, dîner, garde.",
        score: 93,
        sub: "Caisse mensuelle · 150 €",
        tags: ["caisse", "abonnement", "rouge", "garde"],
        cells: [
          { label: "Dépense suivie", value: "1 640 €", big: true },
          { label: "Dernier signal", value: "Caisse livrée il y a 37 jours" },
          { label: "Prochaine action", value: "Composer caisse avril" },
        ],
        trace: ["Caisse mars terminée", "Budget stable", "Répond le matin"],
      },
    ],
    activations: [
      {
        audience: "38 profils blancs / nature",
        cost: "0 €",
        detail: "Transformer un arrivage court en réservations rapides.",
        label: "Sélection",
        name: "Arrivage Jura",
        pushLabel: "Arrivage Jura",
        pushTitle: "3 bouteilles du Jura sont arrivées. Réservez avant samedi, retrait en cave.",
      },
      {
        audience: "24 profils dégustation",
        cost: "42 €",
        detail: "Remplir 12 places avec les bons profils, pas avec une promo publique.",
        label: "Événement",
        name: "Dégustation jeudi",
        pushLabel: "Dégustation jeudi soir",
        pushTitle: "Vous êtes invité sur une dégustation courte : 4 vins, 12 places, jeudi 19h.",
      },
      {
        audience: "61 cartes dîner",
        cost: "0 €",
        detail: "Transformer les clients dîner maison en panier préparé.",
        label: "Relance",
        name: "Caisse week-end",
        pushLabel: "Caisse week-end",
        pushTitle: "Votre caisse week-end est prête : apéritif, dîner, bouteille à garder.",
      },
    ],
    stocks: [
      { active: true, info: "38 € · 9 en stock", name: "Savagnin ouillé", region: "Jura", style: "salin · dîner" },
      { info: "24 € · 18 en stock", name: "Gamay vieilles vignes", region: "Loire", style: "léger · soirée" },
      { info: "72 € · 6 en stock", name: "Brut nature", region: "Champagne", style: "cadeau · premium" },
      { active: true, info: "31 € · 14 en stock", name: "Chenin sec", region: "Anjou", style: "blanc · apéritif" },
    ],
    journal: [
      "22:18 · Dégustation jeudi préparée côté carte.",
      "22:18 · Caisse week-end préparée côté carte.",
      "10:12 · Camille ouvre l'arrivage Jura",
      "10:47 · 3 réservations sur la sélection dîner",
      "11:20 · Nicolas entre dans la liste champagne",
      "12:04 · Dégustation jeudi atteint 9 inscrits",
    ],
  },
  bar: {
    activeActivation: 0,
    activeClient: 0,
    cardButton: "Carte bar",
    navShop: "Le Bar des Amis",
    panelMeta: "64 cartes ciblées",
    queueTitle: "Tables à réveiller",
    metrics: [
      { label: "Cartes actives", value: "64", dark: true },
      { label: "Groupes à relancer", value: "31" },
      { label: "Tables prévues", value: "8" },
      { label: "Coût lots", value: "36 €" },
    ],
    clients: [
      {
        action: "Mercredi faible",
        avatar: "TL",
        name: "Table Léa",
        quote: "Réagit aux blind tests et aux petits jeux. Prévenir avant 18h, pas après.",
        score: 89,
        sub: "Groupe de 4 · cocktails",
        tags: ["cocktails", "blind test", "mercredi", "groupe"],
        cells: [
          { label: "Dépense suivie", value: "312 €", big: true },
          { label: "Dernier signal", value: "Venue il y a 18 jours" },
          { label: "Prochaine action", value: "Inviter roulette 20h-22h" },
        ],
        trace: ["4 cocktails signature", "Blind test joué", "A ramené 2 amis"],
      },
      {
        action: "Score exact",
        avatar: "SH",
        name: "Samir & Hugo",
        quote: "Table sportive. Bonne cible pronostic, classement, et tirage au coup d'envoi.",
        score: 81,
        sub: "Match · bière",
        tags: ["match", "bière", "score", "duo"],
        cells: [
          { label: "Dépense suivie", value: "226 €", big: true },
          { label: "Dernier signal", value: "Dernier match France" },
          { label: "Prochaine action", value: "Pousser pronostic" },
        ],
        trace: ["France-Brésil joué", "Score posé 2-1", "Table revenue deux fois"],
      },
      {
        action: "J-12",
        avatar: "MB",
        name: "Maya birthday",
        quote: "A demandé une table calme. Peut revenir avec groupe complet si on propose tôt.",
        score: 94,
        sub: "Anniversaire · 8 pers.",
        tags: ["anniversaire", "groupe", "bouteille", "vendredi"],
        cells: [
          { label: "Dépense suivie", value: "640 €", big: true },
          { label: "Dernier signal", value: "Réservé en mars" },
          { label: "Prochaine action", value: "Préparer table anniversaire" },
        ],
        trace: ["8 personnes en mars", "Bouteille maison offerte", "Préférence table arrière"],
      },
      {
        action: "Habitué discret",
        avatar: "NC",
        name: "Noa comptoir",
        quote: "Vient tôt, au comptoir. Préfère une invitation calme plutôt qu'un gros jeu de salle.",
        score: 68,
        sub: "Solo · jeudi",
        tags: ["comptoir", "cocktail", "jeudi", "solo"],
        cells: [
          { label: "Dépense suivie", value: "148 €", big: true },
          { label: "Dernier signal", value: "Passage il y a 12 jours" },
          { label: "Prochaine action", value: "Prévenir cocktail invité" },
        ],
        trace: ["3 jeudis consécutifs", "A testé cocktail invité", "Part avant 22h"],
      },
    ],
    activations: [
      {
        audience: "64 cartes ce soir",
        cost: "36 €",
        detail: "Créer un vrai moment avec un coût faible et visible.",
        label: "Jeu",
        name: "Roulette comptoir",
        pushLabel: "Roulette du comptoir",
        pushTitle: "Un tour par carte. Shot, double chance, table inscrite, ou rien ce soir.",
      },
      {
        audience: "41 cartes sport",
        cost: "54 €",
        detail: "Faire rester les tables jusqu'au coup d'envoi.",
        label: "Match",
        name: "Score exact",
        pushLabel: "Score exact",
        pushTitle: "France - Brésil. Donnez votre score avant le coup d'envoi.",
      },
      {
        audience: "27 tables dormantes",
        cost: "18 €",
        detail: "Faire revenir les tables venues il y a 15 à 45 jours.",
        label: "Relance",
        name: "Retour groupe",
        pushLabel: "Retour groupe",
        pushTitle: "Venez à 3 avant 21h30. Votre table entre dans le tirage du soir.",
      },
    ],
    stocks: [],
    journal: [
      "22:18 · Shot maison gagné",
      "18:06 · Push mercredi envoyé à 64 cartes",
      "18:22 · Table Léa confirme 4 personnes",
      "19:11 · 7 scores exacts déjà posés",
      "20:03 · Roulette ouverte au comptoir",
    ],
  },
}

const ROULETTE_RESULTS = [
  "Shot maison gagné",
  "Double chance · prochain tour",
  "Table inscrite pour ce soir",
  "Rien ce soir, retour bientôt",
]

function getTime() {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
}

export function CommerceCrmDemoPage({ variant }: { variant: Variant }) {
  const data = DATA[variant]
  const [activeClient, setActiveClient] = useState(data.activeClient)
  const [activeActivation, setActiveActivation] = useState(data.activeActivation)
  const [activeStocks, setActiveStocks] = useState(() => data.stocks.map((item, index) => item.active ?? index === 0))
  const [journal, setJournal] = useState(data.journal)
  const [rouletteRotation, setRouletteRotation] = useState(0)
  const [rouletteResult, setRouletteResult] = useState(ROULETTE_RESULTS[0])

  const client = data.clients[activeClient]
  const activation = data.activations[activeActivation]
  const activeStockTotal = useMemo(() => {
    if (variant !== "caviste") return "36 €"

    return data.stocks
      .filter((_, index) => activeStocks[index])
      .reduce((total, item) => total + Number.parseInt(item.info, 10), 0)
      .toLocaleString("fr-FR", { currency: "EUR", style: "currency", maximumFractionDigits: 0 })
  }, [activeStocks, data.stocks, variant])

  function addJournal(entry: string) {
    setJournal((current) => [`${getTime()} · ${entry}`, ...current].slice(0, 7))
  }

  function selectClient(index: number) {
    setActiveClient(index)
    addJournal(`${data.clients[index].name} ouvert dans le carnet.`)
  }

  function selectActivation(index: number) {
    setActiveActivation(index)
    addJournal(`${data.activations[index].name} préparé côté carte.`)
  }

  function sendPush() {
    addJournal(`${activation.name} envoyé à ${client.name}.`)
  }

  function markDone() {
    addJournal(`${client.name} marqué traité.`)
  }

  function toggleStock(index: number) {
    setActiveStocks((current) => current.map((value, itemIndex) => (itemIndex === index ? !value : value)))
  }

  function reserveSelection() {
    addJournal(`Caisse ${activeStockTotal} réservée pour ${client.name}.`)
  }

  function spinRoulette() {
    const index = Math.floor(Math.random() * ROULETTE_RESULTS.length)
    setRouletteRotation((current) => current + 1440 + index * 90 + 45)

    window.setTimeout(() => {
      setRouletteResult(ROULETTE_RESULTS[index])
      addJournal(ROULETTE_RESULTS[index])
    }, 900)
  }

  return (
    <main className={styles.page}>
      <nav className={styles.topnav}>
        <div className={styles.navBrand}>
          <span className={styles.brandCardin}>CARDIN</span>
          <span className={styles.brandBy}>by Symi</span>
        </div>

        <div className={styles.navPillGroup}>
          <Link className={cn(styles.navPill, variant === "caviste" && styles.active)} href="/caviste">
            Caviste
          </Link>
          <Link className={cn(styles.navPill, variant === "bar" && styles.active)} href="/bar">
            Bar
          </Link>
        </div>

        <div className={styles.navLinks}>
          <a className={styles.navLink}>Impact</a>
          <a className={styles.navLink}>Saison</a>
          <a className={styles.navLink}>Contact</a>
          <span className={styles.navShop}>
            <span className={styles.navShopDot} />
            {data.navShop}
          </span>
        </div>
      </nav>

      <div className={styles.container}>
        <section className={styles.statsRow}>
          {data.metrics.map((metric) => (
            <div className={cn(styles.stat, metric.dark && styles.dark)} key={metric.label}>
              <div className={styles.statLabel}>{metric.label}</div>
              <div className={styles.statValue}>{metric.value}</div>
            </div>
          ))}
        </section>

        <section className={styles.mainGrid}>
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <span className={styles.panelTitle}>{data.queueTitle}</span>
              <span className={styles.panelMeta}>{data.clients.length} profils</span>
            </div>

            {data.clients.map((item, index) => (
              <button
                className={cn(styles.clientRow, activeClient === index && styles.active)}
                key={item.name}
                onClick={() => selectClient(index)}
                type="button"
              >
                <span className={styles.clientRowTop}>
                  <span className={styles.clientName}>{item.name}</span>
                  <span className={styles.clientScore}>{item.score}</span>
                </span>
                <span className={styles.clientTags}>{item.sub}</span>
                <span className={styles.clientAction}>{item.action}</span>
                <span className={styles.clientBar}>
                  <span className={styles.clientBarFill} style={{ width: `${item.score}%` }} />
                </span>
              </button>
            ))}
          </div>

          <div className={styles.panel}>
            <div className={styles.ficheHead}>
              <div className={styles.ficheAvatar}>{client.avatar}</div>
              <div className={styles.ficheTitles}>
                <div className={styles.fichePretitle}>Fiche active</div>
                <div className={styles.ficheName}>{client.name}</div>
                <div className={styles.ficheSub}>{client.sub}</div>
              </div>
            </div>

            <p className={styles.ficheQuote}>{client.quote}</p>

            <div className={styles.ficheGrid}>
              {client.cells.map((cell) => (
                <div className={styles.ficheCell} key={cell.label}>
                  <div className={styles.ficheCellLabel}>{cell.label}</div>
                  <div className={cn(styles.ficheCellValue, cell.big && styles.big)}>{cell.value}</div>
                </div>
              ))}
            </div>

            <div className={styles.ficheTags}>
              {client.tags.map((tag) => (
                <span className={styles.ficheTag} key={tag}>{tag}</span>
              ))}
            </div>

            <div className={styles.ficheTrace}>
              {client.trace.map((line) => (
                <div className={styles.traceCell} key={line}>{line}</div>
              ))}
            </div>
          </div>

          <div className={styles.pushPanelWrap}>
            <div className={styles.pushPanelHead}>
              <span className={styles.pushShopName}>{data.navShop}</span>
              <button className={styles.pushCardBtn} type="button">{data.cardButton}</button>
            </div>
            <span className={styles.pushPill}>Push prêt</span>

            <div className={styles.pushEventLabel}>{activation.pushLabel}</div>
            <div className={styles.pushEventTitle}>{activation.pushTitle}</div>

            {variant === "caviste" ? (
              data.stocks.slice(0, 3).map((stock) => (
                <div className={styles.pushStockRow} key={stock.name}>
                  <div>
                    <div className={styles.pushStockRegion}>{stock.region}</div>
                    <div className={styles.pushStockName}>{stock.name}</div>
                  </div>
                  <div className={styles.pushStockInfo}>{stock.info}</div>
                </div>
              ))
            ) : (
              <>
                <div className={styles.pushGameCard}>
                  <div className={styles.pushGameLabel}>Jeu</div>
                  <button className={styles.btnSpinMini} onClick={spinRoulette} type="button">
                    Tourner la roulette
                  </button>
                </div>
                <div className={styles.pushTrace}>
                  <div className={styles.pushTraceLabel}>Trace</div>
                  <div className={styles.pushTraceText}>{client.name} garde l'historique après le moment.</div>
                </div>
              </>
            )}
          </div>
        </section>

        <section className={styles.bottomGrid}>
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <span className={styles.panelTitle}>Moteur d'activation</span>
              <span className={styles.panelMeta}>{data.panelMeta}</span>
            </div>

            <div className={styles.moteurCards}>
              {data.activations.map((item, index) => (
                <button
                  className={cn(styles.moteurCard, activeActivation === index && styles.dark)}
                  key={item.name}
                  onClick={() => selectActivation(index)}
                  type="button"
                >
                  <div className={styles.moteurCardLabel}>{item.label}</div>
                  <div className={styles.moteurCardName}>{item.name}</div>
                  <div className={styles.moteurCardThesis}>{item.detail}</div>
                  <div className={styles.moteurCardMeta}>
                    {item.audience}
                    <br />
                    coût {item.cost}
                  </div>
                </button>
              ))}
            </div>

            <div className={styles.moteurAction}>
              <div className={styles.moteurActionLabel}>Action prête</div>
              <div className={styles.moteurActionTitle}>{activation.name}</div>
              <div className={styles.moteurActionDetail}>{activation.pushTitle}</div>
              <div className={styles.moteurActionRow}>
                <button className={styles.btnPrimary} onClick={sendPush} type="button">Envoyer push</button>
                <button className={styles.btnSecondary} onClick={markDone} type="button">Marquer traité</button>
              </div>
            </div>
          </div>

          {variant === "caviste" ? (
            <div className={styles.panel}>
              <div className={styles.panelHead}>
                <span className={styles.panelTitle}>Composer une caisse</span>
                <span className={styles.panelMeta}>{activeStockTotal}</span>
              </div>

              <div className={styles.caisseGrid}>
                {data.stocks.map((stock, index) => (
                  <button
                    className={cn(styles.caisseCard, activeStocks[index] && styles.dark)}
                    key={stock.name}
                    onClick={() => toggleStock(index)}
                    type="button"
                  >
                    <div className={styles.caisseRegion}>{stock.region}</div>
                    <div className={styles.caisseName}>{stock.name}</div>
                    <div className={styles.caisseStyle}>{stock.style}</div>
                    <div className={styles.caisseInfo}>{stock.info}</div>
                  </button>
                ))}
              </div>

              <button className={styles.caisseCta} onClick={reserveSelection} type="button">
                Réserver pour {client.name}
              </button>
            </div>
          ) : (
            <div className={styles.jeuPanel}>
              <div className={styles.jeuHead}>
                <span className={styles.panelTitle}>Jeu live</span>
                <span className={styles.panelMeta}>{activation.name}</span>
              </div>

              <div className={styles.rouletteStage}>
                <div className={styles.rouletteDisc} style={{ transform: `rotate(${rouletteRotation}deg)` }}>
                  <div className={styles.rouletteSegmentLabel} style={{ top: "20%", left: "30%" }}>Shot</div>
                  <div className={styles.rouletteSegmentLabel} style={{ top: "30%", right: "18%" }}>Double</div>
                  <div className={styles.rouletteSegmentLabel} style={{ bottom: "22%", right: "30%" }}>Table</div>
                  <div className={styles.rouletteSegmentLabel} style={{ bottom: "30%", left: "18%" }}>Rien</div>
                </div>
                <button className={styles.rouletteCenter} onClick={spinRoulette} type="button">
                  <span className={styles.rouletteCenterLabel}>Jouer</span>
                </button>
              </div>

              <div className={styles.jeuResult}>
                <div className={styles.jeuResultLabel}>Résultat carte</div>
                <div className={styles.jeuResultText}>{rouletteResult}</div>
              </div>
            </div>
          )}

          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <span className={styles.panelTitle}>Journal vivant</span>
              <span className={styles.panelMeta}>Derniers signaux</span>
            </div>

            {journal.map((line, index) => {
              const [time, ...text] = line.split(" · ")

              return (
                <div className={cn(styles.journalRow, index === 0 && styles.now)} key={`${line}-${index}`}>
                  <span className={styles.journalTime}>{time}</span>
                  {text.join(" · ")}
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </main>
  )
}
