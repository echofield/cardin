"use client"

import Link from "next/link"
import { useMemo, useState } from "react"

import { cn } from "@/lib/utils"

import styles from "./MalaPages.module.css"

type PushTab = "roulette" | "sondage" | "quiz" | "jour" | "onboard"
type StoreKey = "all" | "sorbier" | "paris9" | "reims" | "bayonne"

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

const STORES: Array<{ key: StoreKey; label: string; count: string }> = [
  { key: "all", label: "Toutes", count: "214" },
  { key: "sorbier", label: "Sorbier", count: "78" },
  { key: "paris9", label: "Paris 9", count: "52" },
  { key: "reims", label: "Reims", count: "43" },
  { key: "bayonne", label: "Bayonne", count: "41" },
]

const KEY_ITEMS = [
  { value: "86", label: "passages", tone: "cream" },
  { value: "31", label: "retours", tone: "cream" },
  { value: "14", label: "duos", tone: "red" },
  { value: "42,80 €", label: "coût cadeaux", tone: "gold" },
] as const

const STORE_PERF = [
  { name: "Sorbier", num: "31", label: "passages", trend: "+18 % vs mardi", down: false },
  { name: "Paris 9", num: "22", label: "passages", trend: "roulette forte", down: false },
  { name: "Reims", num: "17", label: "passages", trend: "+6 duos", down: false },
  { name: "Bayonne", num: "16", label: "passages", trend: "creux 16h", down: true },
] as const

const HOURS = ["11h", "12h", "13h", "14h", "15h", "16h", "17h", "18h", "19h", "20h", "21h", "22h"] as const
const BAR_HEIGHTS = [18, 65, 100, 55, 20, 15, 22, 35, 55, 80, 65, 28] as const

const TAB_LABELS: Record<PushTab, { main: string; sub: string; selected: string; toast: string }> = {
  roulette: { main: "Roulette", sub: "timing", selected: "Roulette timing", toast: "Roulette poussée" },
  sondage: { main: "Sondage", sub: "du jour", selected: "Sondage du jour", toast: "Sondage ouvert" },
  quiz: { main: "Quiz", sub: "maison", selected: "Quiz maison", toast: "Quiz envoyé" },
  jour: { main: "Jour", sub: "clé", selected: "Jour clé", toast: "Jour clé activé" },
  onboard: { main: "Premier", sub: "passage", selected: "Premier passage", toast: "Premier passage activé" },
}

const STATIC_CARDS: Record<Exclude<PushTab, "roulette">, Array<{ title: string; accent: string; pill: string; desc: string }>> = {
  sondage: [
    { title: "Quel niveau de", accent: "piment par défaut ?", pill: "214 cartes", desc: "Doux, moyen ou Sichuan brûlant. Le niveau élu devient le défaut pendant une semaine." },
    { title: "Le prochain", accent: "plat du mois", pill: "214 cartes", desc: "Trois spécialités régionales en lice. Le gagnant rejoint la carte pendant quatre semaines." },
    { title: "Vin nature", accent: "préféré", pill: "214 cartes", desc: "Trois cuvées soumises au vote. La gagnante est proposée au verre tout le mois." },
  ],
  quiz: [
    { title: "D'où vient le", accent: "poivre du Sichuan ?", pill: "214 cartes", desc: "Question sur l'ingrédient signature. Bonne réponse = side offert au prochain passage." },
    { title: "Combien de", accent: "piments dans le Dan Dan ?", pill: "126 cartes", desc: "Pour les initiés. La bonne réponse donne accès à un dessert offert." },
    { title: "Que signifie", accent: "麻辣 ?", pill: "214 cartes", desc: "La bonne réponse installe l'histoire Mala dans la carte client." },
  ],
  jour: [
    { title: "Mardi Sichuan", accent: "compte double", pill: "214 cartes", desc: "Déplace du trafic vers le creux de semaine. Chaque passage mardi vaut deux dans la saison." },
    { title: "Créneau", accent: "14h-16h", pill: "88 cartes", desc: "Un thé ou un side offert sur toute commande dans le creux de l'après-midi." },
    { title: "Vendredi", accent: "soirée Mala", pill: "214 cartes", desc: "Boisson offerte après 20h le vendredi. Crée le réflexe fin de semaine." },
  ],
  onboard: [
    { title: "-10 %", accent: "première commande", pill: "62 cartes", desc: "Pousse les nouveaux entrants qui ont scanné mais n'ont pas encore commandé." },
    { title: "Side offert", accent: "au premier passage", pill: "62 cartes", desc: "Plus chaleureux qu'une remise. Le nouveau repart avec un souvenir gustatif." },
    { title: "Duo Mala", accent: "viens à deux", pill: "62 cartes", desc: "Le nouveau vient avec quelqu'un. On capture deux clients pour le prix d'un side." },
  ],
}

const STREAM_ROWS = [
  { time: "11:46", num: "0418", event: "Nora revient · passe Accro Mala", store: "Sorbier", pill: "Retour", tone: "default" },
  { time: "12:08", num: "0521", event: "Samir entre avec sa carte Mala", store: "Paris 9", pill: "Nouveau", tone: "red" },
  { time: "12:37", num: "0172", event: "Léa amène Hugo · Duo validé", store: "Sorbier", pill: "Duo", tone: "default" },
  { time: "13:12", num: "0094", event: "Maya consomme un side offert", store: "Reims", pill: "Cadeau", tone: "gold" },
  { time: "14:24", num: "0307", event: "Karim · 5e passage · débloque Accro Mala", store: "Bayonne", pill: "Retour", tone: "default" },
  { time: "15:47", num: "0047", event: "Élise tire le bon numéro · gagne un side", store: "Paris 9", pill: "Roulette", tone: "gold" },
  { time: "18:55", num: "0440", event: "Ilyes passe mardi · compte double", store: "Sorbier", pill: "Jour clé", tone: "default" },
] as const

function formatToday() {
  const now = new Date()
  return `${DAY_NAMES[now.getDay()]} ${now.getDate()} ${MONTH_NAMES[now.getMonth()]}`
}

export function MalaJournalPage() {
  const [store, setStore] = useState<StoreKey>("all")
  const [tab, setTab] = useState<PushTab>("roulette")
  const [selectedCard, setSelectedCard] = useState(0)
  const [roulettePool, setRoulettePool] = useState<[number, number]>([40, 60])
  const [rouletteNumber, setRouletteNumber] = useState<number | null>(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const today = useMemo(formatToday, [])

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 1900)
  }

  function spinRoulette() {
    if (isSpinning) return
    setIsSpinning(true)
    setRouletteNumber(null)
    const [min, max] = roulettePool
    let ticks = 0
    const timer = window.setInterval(() => {
      ticks += 1
      setRouletteNumber(Math.floor(min + Math.random() * (max - min + 1)))
      if (ticks >= 18) {
        window.clearInterval(timer)
        const finalNumber = Math.floor(min + Math.random() * (max - min + 1))
        setRouletteNumber(finalNumber)
        setIsSpinning(false)
        showToast(`Roulette envoyée · ${finalNumber}e client`)
      }
    }, 80)
  }

  return (
    <main className={styles.malaJournalPage}>
      <div className={styles.journalPage}>
        <header className={styles.jHeader}>
          <Link className={styles.brandMark} href="/mala">
            <span className={styles.malaH}>Atelier <span>Mala</span></span>
            <span className={styles.brandDot}>·</span>
            <span className={styles.brandJournal}>Journal Cardin</span>
          </Link>
          <div className={styles.jHeaderRight}>
            <Link className={styles.jNavButton} href="/mala">Carte</Link>
            <div className={styles.dateBadge}>
              <span className={styles.liveDot} />
              <span>{today}</span>
            </div>
          </div>
        </header>

        <div className={styles.storeSelector}>
          {STORES.map((item) => (
            <button
              className={cn(styles.storeTab, store === item.key && styles.active)}
              key={item.key}
              onClick={() => {
                setStore(item.key)
                showToast(`Vue ${item.label}`)
              }}
              type="button"
            >
              {item.label} <span>{item.count}</span>
            </button>
          ))}
        </div>

        <section className={styles.jHero}>
          <div className={styles.heroGreet}>Aujourd&apos;hui chez Mala</div>
          <h1>
            86 passages, 31 retours,
            <br />
            14 duos <em>et un mardi qui tient.</em>
          </h1>
          <div className={styles.heroCost}>Coût cadeaux du jour <strong>42,80 €</strong></div>
        </section>

        <section className={styles.keys}>
          {KEY_ITEMS.map((item) => (
            <div className={styles.keyItem} key={item.label}>
              <div className={cn(styles.keyBig, styles[item.tone])}>{item.value}</div>
              <div className={styles.keyLabel}>{item.label}</div>
            </div>
          ))}
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2>Ce que Mala <em>pilote</em></h2>
            <span>retour, duo, multi-adresses</span>
          </div>
          <div className={styles.flowGrid}>
            <article className={styles.flowCard}>
              <span>Retour</span>
              <strong>Faire <em>revenir</em></strong>
              <p>La carte donne un rendez-vous clair : revenir mardi, revenir avec quelqu&apos;un, atteindre le Diamond.</p>
            </article>
            <article className={cn(styles.flowCard, styles.accent)}>
              <span>Duo</span>
              <strong>Faire <em>venir</em></strong>
              <p>Les habitués deviennent acquisition. Chaque invité entre dans la saison et garde sa carte.</p>
            </article>
            <article className={styles.flowCard}>
              <span>Réseau</span>
              <strong>Voir <em>par adresse</em></strong>
              <p>Sorbier, Paris 9, Reims, Bayonne : une vue consolidée, mais chaque spot garde son rythme.</p>
            </article>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2>Performance <em>adresses</em></h2>
            <span>lecture consolidée</span>
          </div>
          <div className={styles.storePerf}>
            {STORE_PERF.map((item) => (
              <article className={styles.storePerfCard} key={item.name}>
                <span>{item.name}</span>
                <strong>{item.num}</strong>
                <p>{item.label}</p>
                <em className={cn(item.down && styles.down)}>{item.trend}</em>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.timeline}>
            <div className={styles.timelineHead}>
              <strong>Trafic <em>aujourd&apos;hui</em></strong>
              <span>pic 12h-14h</span>
            </div>
            <div className={styles.bars}>
              {BAR_HEIGHTS.map((height, index) => (
                <span
                  className={cn(styles.bar, index >= 1 && index <= 3 && styles.peak, index === 7 && styles.now)}
                  key={`${HOURS[index]}-${height}`}
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
            <div className={styles.barLabels}>
              {HOURS.map((hour) => <span key={hour}>{hour}</span>)}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2>Console <em>impulsion</em></h2>
            <span>le lieu anime, les cartes répondent</span>
          </div>
          <div className={styles.pushBlock}>
            <div className={styles.pushHead}>
              <span>Push comptoir</span>
              <h3>Anime la <em>communauté</em> aujourd&apos;hui</h3>
              <p>
                5 mécaniques pré-câblées : roulette, sondage, quiz, jour clé, premier passage. Choisis, lance,
                l&apos;offre part vers les cartes actives sur toutes les adresses ou une seule.
              </p>
            </div>
            <div className={styles.pushTabs}>
              {(Object.keys(TAB_LABELS) as PushTab[]).map((key) => (
                <button
                  className={cn(styles.pushTab, tab === key && styles.active)}
                  key={key}
                  onClick={() => {
                    setTab(key)
                    setSelectedCard(0)
                  }}
                  type="button"
                >
                  <span>{TAB_LABELS[key].main}</span>
                  <em>{TAB_LABELS[key].sub}</em>
                </button>
              ))}
            </div>
            <div className={styles.pushPanel}>
              {tab === "roulette" ? (
                <div className={styles.rouletteStage}>
                  <div className={cn(styles.rouletteNum, isSpinning && styles.spinning)}>{rouletteNumber ?? "??"}</div>
                  <div className={styles.roulettePrize}>
                    Le <em>{rouletteNumber ? `${rouletteNumber}e` : "Xème"}</em> client gagne <em>un side offert</em>
                  </div>
                  <div className={styles.roulettePoolRow}>
                    {([[40, 60], [20, 40], [60, 90]] as Array<[number, number]>).map((pool) => (
                      <button
                        className={cn(styles.roulettePool, roulettePool[0] === pool[0] && styles.active)}
                        disabled={isSpinning}
                        key={pool.join("-")}
                        onClick={() => setRoulettePool(pool)}
                        type="button"
                      >
                        Tirage {pool[0]}-{pool[1]}
                      </button>
                    ))}
                  </div>
                  <p>Le client scanne en arrivant. S&apos;il tombe sur le bon numéro de passage, son écran s&apos;illumine.</p>
                  <button className={styles.btnSpin} disabled={isSpinning} onClick={spinRoulette} type="button">
                    {isSpinning ? "Tirage..." : "Tirer le numéro"}
                  </button>
                </div>
              ) : (
                <div className={styles.staticCards}>
                  {STATIC_CARDS[tab].map((card, index) => (
                    <button
                      className={cn(styles.staticCard, selectedCard === index && styles.selected)}
                      key={`${card.title}-${card.accent}`}
                      onClick={() => setSelectedCard(index)}
                      type="button"
                    >
                      <span>{card.pill}</span>
                      <strong>{card.title} <em>{card.accent}</em></strong>
                      <p>{card.desc}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className={styles.pushAction}>
              <div>
                <span>Sélection</span>
                <strong>{TAB_LABELS[tab].selected}</strong>
              </div>
              <button onClick={() => showToast(TAB_LABELS[tab].toast)} type="button">Envoyer le push</button>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2>Le flux <em>comptoir</em></h2>
            <span>toutes adresses, en direct</span>
          </div>
          <div className={styles.stream}>
            {STREAM_ROWS.map((row) => (
              <div className={styles.streamRow} key={`${row.time}-${row.num}`}>
                <strong>{row.time}</strong>
                <span>N° {row.num}</span>
                <p>{row.event} <em>· {row.store}</em></p>
                <small className={cn(row.tone === "red" && styles.redPill, row.tone === "gold" && styles.goldPill)}>{row.pill}</small>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2>Ce que ça <em>peut générer</em></h2>
            <span>projection sur 4 adresses</span>
          </div>
          <div className={styles.projection}>
            <span>Projection simple</span>
            <div><p>Cap initial</p><strong>400 clients</strong></div>
            <div><p>Progression + duo</p><strong>~1 200 participants</strong></div>
            <div><p>1 200 × 2 × 18 €</p><strong>43 200 €</strong></div>
            <div><p>1 200 × 3 × 18 €</p><strong>64 800 €</strong></div>
            <em>Entre 43 000 € et 65 000 € de chiffre généré sur la saison, pour un coût Diamond inférieur à 2 000 € sur les 4 adresses.</em>
          </div>
        </section>

        <section className={styles.positionBlock}>
          <span>Résumé de la proposition</span>
          <p>
            Une saison Mala Club sur 4 adresses. Les clients entrent avec une carte mobile, chaque passage est validé au
            comptoir, et Mala peut animer la communauté avec roulette, sondage, quiz ou jour clé. À la fin, un seul gagne
            le sommet : 1 repas par mois pendant un an.
          </p>
          <div>
            <strong>Multi-store · 4 adresses</strong>
            <strong>Console push · 5 mécaniques</strong>
            <strong>Carte conservée saison à saison</strong>
            <strong>Différence · pas une carte de fidélité</strong>
          </div>
        </section>

        <footer className={styles.jFooter}>
          Journal généré par Cardin · sans toucher la caisse, <em>sans nouveau compte client.</em>
        </footer>
      </div>

      <div className={cn(styles.toast, toast && styles.show)}>{toast}</div>
    </main>
  )
}
