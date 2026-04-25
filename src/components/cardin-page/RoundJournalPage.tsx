"use client"

import { useMemo, useRef, useState } from "react"

import { cn } from "@/lib/utils"

import styles from "./RoundJournalPage.module.css"

type PushTab = "roulette" | "sondage" | "quiz" | "jour" | "onboard"

const DAY_NAMES = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"] as const
const MONTH_NAMES = [
  "janvier",
  "fevrier",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "aout",
  "septembre",
  "octobre",
  "novembre",
  "decembre",
] as const

const KEY_ITEMS = [
  { value: "41", label: "passages", leaf: false },
  { value: "12", label: "retours", leaf: false },
  { value: "6", label: "invites", leaf: true },
  { value: "18,60 EUR", label: "cout cadeaux", leaf: true },
] as const

const BAR_HEIGHTS = [28, 78, 100, 72, 22, 18, 24, 44, 64, 82, 58, 34] as const
const HOURS = ["11h", "12h", "13h", "14h", "15h", "16h", "17h", "18h", "19h", "20h", "21h", "22h"] as const

const TAB_LABELS: Record<PushTab, { main: string; sub: string; selected: string; toast: string }> = {
  roulette: { main: "Roulette", sub: "timing", selected: "Roulette timing", toast: "Roulette poussee" },
  sondage: { main: "Sondage", sub: "du jour", selected: "Sondage du jour", toast: "Sondage ouvert" },
  quiz: { main: "Quiz", sub: "maison", selected: "Quiz maison", toast: "Quiz envoye" },
  jour: { main: "Jour", sub: "cle", selected: "Jour cle", toast: "Jour cle active" },
  onboard: { main: "Premiere", sub: "commande", selected: "Premiere commande", toast: "Premiere commande activee" },
}

const STATIC_CARDS: Record<Exclude<PushTab, "roulette">, Array<{ title: string; pill: string; desc: string }>> = {
  sondage: [
    {
      title: "Burger de mercredi",
      pill: "88 cartes",
      desc: "3 options soumises au vote. Le plat gagnant est servi mercredi midi. Le 3e voteur gagnant a -50 %.",
    },
    {
      title: "Sauce de la semaine",
      pill: "126 cartes",
      desc: "Sriracha mayo, Gochujang, BBQ Round. La sauce qui gagne devient gratuite pendant 1 semaine.",
    },
    {
      title: "Nom du prochain eggbun",
      pill: "126 cartes",
      desc: "Round propose 3 noms. Celui choisi par la majorite a -3 EUR pendant 1 semaine.",
    },
  ],
  quiz: [
    {
      title: "Playlist Round",
      pill: "88 cartes",
      desc: "Round met une playlist de la semaine. Le 1er a reconnaitre les 3 morceaux gagne un drink.",
    },
    {
      title: "Ingredient mystere",
      pill: "88 cartes",
      desc: "Question maison sur la recette. La bonne reponse a acces a un side offert au prochain passage.",
    },
    {
      title: "L'origine du nom Round",
      pill: "126 cartes",
      desc: "Pour les vrais. Trouve l'inspiration et gagne une formule offerte au prochain passage.",
    },
  ],
  jour: [
    {
      title: "Mercredi compte double",
      pill: "126 cartes",
      desc: "Deplace du trafic vers le jour faible. Chaque passage mercredi vaut 2 sur la saison.",
    },
    {
      title: "Gouter 16h-18h",
      pill: "42 cartes recentes",
      desc: "Cree un moment dans le creux de l'apres-midi. Side offert dans le creneau.",
    },
    {
      title: "Dimanche brunch",
      pill: "88 cartes",
      desc: "Pousse le brunch du week-end. Boisson offerte avec toute formule eggbun.",
    },
  ],
  onboard: [
    {
      title: "-10% premiere commande",
      pill: "42 cartes recentes",
      desc: "Pousse les nouveaux entrants qui viennent de scanner mais n'ont pas encore commande.",
    },
    {
      title: "Side de bienvenue",
      pill: "42 cartes recentes",
      desc: "Plus chaleureux qu'une remise. Le nouveau ressort avec quelque chose en plus.",
    },
    {
      title: "Premiere table duo",
      pill: "42 cartes recentes",
      desc: "Le nouveau vient avec quelqu'un. On capture deux clients pour le prix d'un.",
    },
  ],
}

const STREAM_ROWS = [
  { time: "11:46", num: "N 0418", event: "Nora revient - passe Heavy Round", pill: "Retour", tone: "default" },
  { time: "12:08", num: "N 0521", event: "Samir entre avec la carte Round", pill: "Nouveau", tone: "new" },
  { time: "12:37", num: "N 0172", event: "Lea amene Hugo - Duo valide", pill: "Duo", tone: "duo" },
  { time: "13:12", num: "N 0094", event: "Maya consomme un side offert", pill: "Cadeau", tone: "gift" },
  { time: "14:24", num: "N 0307", event: "Karim - 5e passage - debloque Heavy Round", pill: "Retour", tone: "default" },
  { time: "15:47", num: "N 0047", event: "Elise tire le bon numero - gagne un side", pill: "Roulette", tone: "gift" },
  { time: "18:55", num: "N 0440", event: "Ilyes passe mercredi - compte double", pill: "Jour cle", tone: "default" },
] as const

function parsePool(pool: string) {
  const [min, max] = pool.split("-").map(Number)
  return { min, max }
}

export function RoundJournalPage() {
  const [activeTab, setActiveTab] = useState<PushTab>("roulette")
  const [activePool, setActivePool] = useState("40-60")
  const [rouletteNumber, setRouletteNumber] = useState(47)
  const [rouletteResult, setRouletteResult] = useState<number | null>(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const [selectedStatic, setSelectedStatic] = useState<Record<string, number>>({})
  const [sent, setSent] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const dateLabel = useMemo(() => {
    const now = new Date()
    return `${DAY_NAMES[now.getDay()]} ${now.getDate()} ${MONTH_NAMES[now.getMonth()]}`
  }, [])

  function showToast(message: string) {
    setToast(message)
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => setToast(null), 2000)
  }

  function spinRoulette() {
    if (isSpinning) return
    const { min, max } = parsePool(activePool)
    const final = Math.floor(min + Math.random() * (max - min + 1))
    const startedAt = Date.now()
    const duration = 1600
    setIsSpinning(true)
    setRouletteResult(null)

    function tick() {
      const progress = Math.min((Date.now() - startedAt) / duration, 1)
      if (progress < 1) {
        setRouletteNumber(Math.floor(min + Math.random() * (max - min + 1)))
        window.setTimeout(tick, 34 + progress * 120)
        return
      }
      setRouletteNumber(final)
      setRouletteResult(final)
      setIsSpinning(false)
      showToast("Roulette envoyee")
    }

    tick()
  }

  function selectTab(tab: PushTab) {
    setActiveTab(tab)
    setSent(false)
  }

  function sendPush() {
    setSent(true)
    showToast(TAB_LABELS[activeTab].toast)
    window.setTimeout(() => setSent(false), 2400)
  }

  function renderStaticCards(tab: Exclude<PushTab, "roulette">) {
    return (
      <div className={styles.staticCards}>
        {STATIC_CARDS[tab].map((card, index) => {
          const selected = (selectedStatic[tab] ?? 0) === index
          return (
            <button
              className={cn(styles.staticCard, selected && styles.staticCardSelected)}
              key={card.title}
              onClick={() => setSelectedStatic((current) => ({ ...current, [tab]: index }))}
              type="button"
            >
              <div className={styles.staticCardHead}>
                <div className={styles.staticCardTitle}>{card.title}</div>
                <span className={styles.staticCardPill}>{card.pill}</span>
              </div>
              <div className={styles.staticCardDesc}>{card.desc}</div>
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brandMark}>
          <span className={styles.roundmark}>Round</span>
          <span className={styles.brandX}>·</span>
          <span className={styles.brandJournal}>Journal Cardin</span>
        </div>
        <div className={styles.dateBadge}>
          <span className={styles.liveDot} />
          <span>{dateLabel}</span>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroGreet}>Aujourd&apos;hui chez Round</div>
        <h1 className={styles.heroSentence}>
          <em>41 passages</em>, 12 retours,
          <br />
          6 invites, 3 Heavy Round.
        </h1>
        <div className={styles.heroCost}>
          Cout cadeaux du jour <strong>18,60 EUR</strong>
        </div>
      </section>

      <div className={styles.keys}>
        {KEY_ITEMS.map((item) => (
          <div className={styles.keyItem} key={item.label}>
            <div className={cn(styles.keyBig, item.leaf && styles.keyBigLeaf)}>{item.value}</div>
            <div className={styles.keyLabel}>{item.label}</div>
          </div>
        ))}
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div className={styles.sectionTitle}>
            Les <em>3 saisons</em> possibles
          </div>
          <div className={styles.sectionHint}>ce que Round choisit</div>
        </div>

        <div className={styles.flowGrid}>
          <article className={styles.flowCard}>
            <span className={styles.flowMark}>Retour Round</span>
            <div className={styles.flowBig}>
              Faire <em>revenir</em>
            </div>
            <div className={styles.flowLabel}>On recompense les clients qui reviennent vraiment.</div>
            <div className={styles.flowSub}>
              <strong>19 clients</strong> ont deja 2 passages ou plus.
            </div>
          </article>
          <article className={styles.flowCard}>
            <span className={styles.flowMark}>Duo Round</span>
            <div className={styles.flowBig}>
              Faire <em>venir</em>
            </div>
            <div className={styles.flowLabel}>Les habitues deviennent ton canal d&apos;acquisition.</div>
            <div className={styles.flowSub}>
              <strong>6 invites</strong> entres aujourd&apos;hui, dont 3 au dejeuner.
            </div>
          </article>
          <article className={styles.flowCard}>
            <span className={styles.flowMark}>Jour plein</span>
            <div className={styles.flowBig}>
              Remplir <em>mercredi</em>
            </div>
            <div className={styles.flowLabel}>On deplace du trafic vers le jour qui compte.</div>
            <div className={styles.flowSub}>
              Mercredi <strong>+28 %</strong> vs semaine derniere.
            </div>
          </article>
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
                className={cn(styles.bar, index >= 1 && index <= 3 && styles.barPeak, index === 7 && styles.barNow)}
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
            Console <em>push</em>
          </div>
          <div className={styles.sectionHint}>le lieu anime, les cartes repondent</div>
        </div>

        <div className={styles.pushBlock}>
          <div className={styles.pushHead}>
            <span className={styles.pushMark}>Push comptoir</span>
            <h3 className={styles.pushTitle}>
              Anime la <em>communaute</em> aujourd&apos;hui
            </h3>
            <p className={styles.pushSub}>
              5 mecaniques pre-cablees : roulette, sondage, quiz, jour cle, premiere commande. Choisis, lance,
              l&apos;offre part vers les cartes actives.
            </p>
          </div>

          <div className={styles.pushTabs}>
            {(Object.keys(TAB_LABELS) as PushTab[]).map((tab) => (
              <button
                className={cn(styles.pushTab, activeTab === tab && styles.pushTabActive)}
                key={tab}
                onClick={() => selectTab(tab)}
                type="button"
              >
                <span>{TAB_LABELS[tab].main}</span>
                <em>{TAB_LABELS[tab].sub}</em>
              </button>
            ))}
          </div>

          <div className={styles.pushPanel}>
            {activeTab === "roulette" ? (
              <div className={styles.rouletteStage}>
                <div className={styles.rouletteDisplay}>
                  <span className={cn(styles.rouletteNum, isSpinning && styles.rouletteNumSpinning)}>{rouletteNumber}</span>
                  <span className={cn(styles.rouletteStamp, rouletteResult && styles.rouletteStampShow)}>gagne</span>
                </div>
                <div className={styles.rouletteControls}>
                  {["1-20", "21-40", "40-60", "61-88", "89-126"].map((pool) => (
                    <button
                      className={cn(styles.roulettePool, activePool === pool && styles.roulettePoolActive)}
                      disabled={isSpinning}
                      key={pool}
                      onClick={() => setActivePool(pool)}
                      type="button"
                    >
                      N {pool}
                    </button>
                  ))}
                </div>
                <button className={styles.btnSpin} disabled={isSpinning} onClick={spinRoulette} type="button">
                  Lancer une roulette timing
                </button>
                <div className={cn(styles.rouletteStatus, rouletteResult && styles.rouletteStatusShow)}>
                  {rouletteResult ? (
                    <>
                      N {rouletteResult} gagne un side. Push parti vers 126 cartes actives.
                    </>
                  ) : (
                    <>Choisis une plage puis lance une impulsion courte.</>
                  )}
                </div>
              </div>
            ) : (
              renderStaticCards(activeTab)
            )}
          </div>

          <div className={styles.pushAction}>
            <div className={styles.pushSelected}>
              <span className={styles.pushSelectedLabel}>Selection</span>
              <span className={styles.pushSelectedValue}>{TAB_LABELS[activeTab].selected}</span>
            </div>
            <button className={cn(styles.pushBtn, sent && styles.pushBtnSent)} onClick={sendPush} type="button">
              {sent ? "Envoye" : "Envoyer le push"}
            </button>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div className={styles.sectionTitle}>
            Le flux <em>comptoir</em>
          </div>
          <div className={styles.sectionHint}>le lieu emet, le client recoit</div>
        </div>

        <div className={styles.stream}>
          {STREAM_ROWS.map((row) => (
            <div className={styles.streamRow} key={`${row.time}-${row.num}`}>
              <div className={styles.streamTime}>{row.time}</div>
              <div className={styles.streamNum}>{row.num}</div>
              <div className={styles.streamEvent}>{row.event}</div>
              <div
                className={cn(
                  styles.streamPill,
                  row.tone === "new" && styles.streamPillNew,
                  row.tone === "gift" && styles.streamPillGift,
                  row.tone === "duo" && styles.streamPillDuo,
                )}
              >
                {row.pill}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.positionBlock}>
          <span className={styles.positionMark}>A presenter lundi</span>
          <p className={styles.positionText}>
            On vous propose une <strong>saison Round de 90 jours.</strong> Les clients entrent avec une carte mobile.
            A chaque passage, le comptoir valide. Et chaque jour Round peut <em>animer la communaute</em> avec une
            roulette, un sondage, un quiz ou une impulsion jour cle. A la fin, un seul gagne le sommet : 1 menu par
            mois pendant un an.
          </p>
          <div className={styles.positionMeta}>
            <div className={styles.positionTag}>
              <strong>Objectif</strong> · retour / duo / animation
            </div>
            <div className={styles.positionTag}>
              <strong>Console push</strong> · 5 mecaniques pre-cablees
            </div>
            <div className={styles.positionTag}>
              <strong>Sommet</strong> · 1 menu par mois pendant 1 an
            </div>
            <div className={styles.positionTag}>
              <strong>Effort operationnel</strong> · 30 secondes par push
            </div>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        Journal genere par Cardin · sans toucher votre caisse, <em>sans nouveau compte client.</em>
        <br />
        Le rythme Round, et la console pour l&apos;animer.
      </footer>

      <div className={cn(styles.toast, toast && styles.toastShow)}>{toast ?? "Push envoye"}</div>
    </div>
  )
}
