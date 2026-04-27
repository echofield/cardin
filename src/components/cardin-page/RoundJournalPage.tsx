"use client"

import { useMemo, useRef, useState } from "react"

import { cn } from "@/lib/utils"

import styles from "./RoundJournalPage.module.css"

type PushTab = "roulette" | "sondage" | "quiz" | "jour" | "onboard"

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

const KEY_ITEMS = [
  { value: "41", label: "passages", leaf: false },
  { value: "12", label: "retours", leaf: false },
  { value: "6", label: "invités", leaf: true },
  { value: "18,60 €", label: "coût cadeaux", leaf: true },
] as const

const BAR_HEIGHTS = [28, 78, 100, 72, 22, 18, 24, 44, 64, 82, 58, 34] as const
const HOURS = ["11h", "12h", "13h", "14h", "15h", "16h", "17h", "18h", "19h", "20h", "21h", "22h"] as const

const TAB_LABELS: Record<PushTab, { main: string; sub: string; selected: string; toast: string }> = {
  roulette: { main: "Roulette", sub: "timing", selected: "Roulette timing", toast: "Roulette poussée" },
  sondage: { main: "Sondage", sub: "du jour", selected: "Sondage du jour", toast: "Sondage ouvert" },
  quiz: { main: "Quiz", sub: "maison", selected: "Quiz maison", toast: "Quiz envoyé" },
  jour: { main: "Jour", sub: "clé", selected: "Jour clé", toast: "Jour clé activé" },
  onboard: { main: "Première", sub: "commande", selected: "Première commande", toast: "Première commande activée" },
}

const STATIC_CARDS: Record<Exclude<PushTab, "roulette">, Array<{ title: string; pill: string; desc: string }>> = {
  sondage: [
    {
      title: "Burger de mercredi",
      pill: "88 cartes",
      desc: "3 options soumises au vote. Le plat gagnant est servi mercredi midi. Le 3e votant obtient -50 %.",
    },
    {
      title: "Sauce de la semaine",
      pill: "126 cartes",
      desc: "Sriracha mayo, Gochujang, BBQ Round. La sauce qui gagne devient gratuite pendant 1 semaine.",
    },
    {
      title: "Nom du prochain eggbun",
      pill: "126 cartes",
      desc: "Round propose 3 noms. Celui choisi par la majorité donne -3 € pendant 1 semaine.",
    },
  ],
  quiz: [
    {
      title: "Playlist Round",
      pill: "88 cartes",
      desc: "Round met une playlist de la semaine. Le 1er à reconnaître les 3 morceaux gagne un drink.",
    },
    {
      title: "Ingrédient mystère",
      pill: "88 cartes",
      desc: "Question maison sur la recette. La bonne réponse a accès à un side offert au prochain passage.",
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
      desc: "Déplace du trafic vers le jour faible. Chaque passage mercredi vaut 2 sur la saison.",
    },
    {
      title: "Goûter 16h-18h",
      pill: "42 cartes récentes",
      desc: "Crée un moment dans le creux de l'après-midi. Side offert dans le créneau.",
    },
    {
      title: "Dimanche brunch",
      pill: "88 cartes",
      desc: "Pousse le brunch du week-end. Boisson offerte avec toute formule eggbun.",
    },
  ],
  onboard: [
    {
      title: "-10% première commande",
      pill: "42 cartes récentes",
      desc: "Pousse les nouveaux entrants qui viennent de scanner mais n'ont pas encore commandé.",
    },
    {
      title: "Side de bienvenue",
      pill: "42 cartes récentes",
      desc: "Plus chaleureux qu'une remise. Le nouveau ressort avec quelque chose en plus.",
    },
    {
      title: "Première table duo",
      pill: "42 cartes récentes",
      desc: "Le nouveau vient avec quelqu'un. On capture deux clients pour le prix d'un.",
    },
  ],
}

const STREAM_ROWS = [
  { time: "11:46", num: "N 0418", event: "Nora revient - passe Heavy Round", pill: "Retour", tone: "default" },
  { time: "12:08", num: "N 0521", event: "Samir entre avec la carte Round", pill: "Nouveau", tone: "new" },
  { time: "12:37", num: "N 0172", event: "Léa amène Hugo - Duo validé", pill: "Duo", tone: "duo" },
  { time: "13:12", num: "N 0094", event: "Maya consomme un side offert", pill: "Cadeau", tone: "gift" },
  { time: "14:24", num: "N 0307", event: "Karim - 5e passage - débloque Heavy Round", pill: "Retour", tone: "default" },
  { time: "15:47", num: "N 0047", event: "Élise tire le bon numéro - gagne un side", pill: "Roulette", tone: "gift" },
  { time: "18:55", num: "N 0440", event: "Ilyes passe mercredi - compte double", pill: "Jour clé", tone: "default" },
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
      showToast("Roulette envoyée")
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
          6 invités, 3 Heavy Round.
        </h1>
        <div className={styles.heroCost}>
          Coût cadeaux du jour <strong>18,60 €</strong>
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
            <div className={styles.flowLabel}>On récompense les clients qui reviennent vraiment.</div>
            <div className={styles.flowSub}>
              <strong>19 clients</strong> ont déjà 2 passages ou plus.
            </div>
          </article>
          <article className={styles.flowCard}>
            <span className={styles.flowMark}>Duo Round</span>
            <div className={styles.flowBig}>
              Faire <em>venir</em>
            </div>
            <div className={styles.flowLabel}>Les habitués deviennent ton canal d&apos;acquisition.</div>
            <div className={styles.flowSub}>
              <strong>6 invités</strong> entrés aujourd&apos;hui, dont 3 au déjeuner.
            </div>
          </article>
          <article className={styles.flowCard}>
            <span className={styles.flowMark}>Jour plein</span>
            <div className={styles.flowBig}>
              Remplir <em>mercredi</em>
            </div>
            <div className={styles.flowLabel}>On déplace du trafic vers le jour qui compte.</div>
            <div className={styles.flowSub}>
              Mercredi <strong>+28 %</strong> vs semaine dernière.
            </div>
          </article>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div className={styles.sectionTitle}>
            Jour fort / <em>jour faible</em>
          </div>
          <div className={styles.sectionHint}>trafic par créneau</div>
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
          <div className={styles.sectionHint}>le lieu anime, les cartes répondent</div>
        </div>

        <div className={styles.pushBlock}>
          <div className={styles.pushHead}>
            <span className={styles.pushMark}>Push comptoir</span>
            <h3 className={styles.pushTitle}>
              Anime la <em>communauté</em> aujourd&apos;hui
            </h3>
            <p className={styles.pushSub}>
              5 mécaniques pré-câblées : roulette, sondage, quiz, jour clé, première commande. Choisis, lance,
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
              <span className={styles.pushSelectedLabel}>Sélection</span>
              <span className={styles.pushSelectedValue}>{TAB_LABELS[activeTab].selected}</span>
            </div>
            <button className={cn(styles.pushBtn, sent && styles.pushBtnSent)} onClick={sendPush} type="button">
              {sent ? "Envoyé" : "Envoyer le push"}
            </button>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div className={styles.sectionTitle}>
            Le flux <em>comptoir</em>
          </div>
          <div className={styles.sectionHint}>le lieu émet, le client reçoit</div>
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

      <section className={styles.devSection} id="round-development">
        <div className={styles.devHero}>
          <h2>
            Installer une <em>carte vivante,</em>
            <br />
            puis créer un challenge qui fait revenir les clients.
          </h2>
          <p>
            Une saison Round transforme une première visite en plusieurs passages, en créant une progression visible
            et un Diamond en jeu.
          </p>
        </div>

        <div className={styles.mechanicsCard}>
          <div className={styles.mechanicsHead}>
            <span>Mécanique Round</span>
            <strong>compréhensible en 10 secondes</strong>
          </div>
          <div className={styles.mechanicsGrid}>
            {[
              "Saison Round",
              "Entrée via carte mobile (QR)",
              "Chaque passage compte",
              "Progression visible",
              "Moments hebdomadaires",
              "Diamond visible jusqu'au bout",
            ].map((item) => (
              <div className={styles.mechanicsItem} key={item}>
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.diamondBlock}>
          <div>
            <span>Diamond</span>
            <h3>1 repas offert par semaine pendant 1 an</h3>
          </div>
          <ul>
            <li>Visible toute la saison</li>
            <li>Crée la tension</li>
            <li>Motive les retours</li>
          </ul>
        </div>

        <div className={styles.revenueBlock}>
          <div className={styles.sectionHead}>
            <div className={styles.sectionTitle}>
              Ce que <em>ça peut générer</em>
            </div>
            <div className={styles.sectionHint}>projection simple</div>
          </div>
          <div className={styles.revenueGrid}>
            <div>
              <span>Cap initial</span>
              <strong>200 clients engagés</strong>
              <p>Base réaliste pour lancer la saison sur les cartes actives et les nouveaux entrants.</p>
            </div>
            <div>
              <span>Progression + invitation</span>
              <strong>jusqu&apos;à ~600 participants</strong>
              <p>Les retours et le Duo Round élargissent progressivement le nombre de participants.</p>
            </div>
          </div>
          <div className={styles.revenueMath}>
            <div>
              <span>600 × 2 × 15 €</span>
              <strong>18 000 €</strong>
            </div>
            <div>
              <span>600 × 3 × 15 €</span>
              <strong>27 000 €</strong>
            </div>
          </div>
          <p className={styles.revenueConclusion}>
            Entre <strong>18 000 € et 27 000 €</strong> de chiffre généré sur la saison, pour un coût Diamond
            inférieur à <strong>1 000 €</strong>.
          </p>
        </div>

        <div className={styles.roundPricingBlock}>
          <div className={styles.roundPricingHead}>
            <h3>Lancer une saison Round</h3>
            <p>
              Une saison complète pour faire revenir les clients, générer des invitations et créer du trafic sur
              plusieurs semaines.
            </p>
          </div>

          <div className={styles.roundPricingCards}>
            <article className={cn(styles.roundPricingCard, styles.roundPricingCardRecommended)}>
              <div className={styles.roundPricingTop}>
                <span>Option recommandée</span>
                <strong>2 500 €</strong>
              </div>
              <h4>2 boutiques</h4>
              <p>Saison complète + pilotage + animation</p>
              <ul className={styles.offerList}>
                <li>Mise en place complète</li>
                <li>Carte mobile + QR comptoir</li>
                <li>Progression + Diamond</li>
                <li>Console d&apos;animation</li>
                <li>Pushs et mécaniques du jour</li>
                <li>Suivi et ajustements</li>
              </ul>
              <div className={styles.roundPricingObjective}>
                Objectif de travail : viser 10x ce montant sur la saison.
              </div>
            </article>

            <article className={styles.roundPricingCard}>
              <div className={styles.roundPricingTop}>
                <span>Tester avant de déployer</span>
                <strong>1 500 €</strong>
              </div>
              <h4>1 boutique</h4>
              <p>Même système, sur une seule adresse.</p>
              <ul className={styles.offerList}>
                <li>Saison Round complète</li>
                <li>Carte mobile + QR comptoir</li>
                <li>Progression + Diamond</li>
                <li>Animation simple</li>
                <li>Idéal pour valider l&apos;impact</li>
              </ul>
            </article>
          </div>

          <div className={styles.roundPricingTiming}>
            <span>Timing</span>
            <p>Une saison dure jusqu&apos;à complétion, en moyenne 2 à 4 mois.</p>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        Journal généré par Cardin · sans toucher votre caisse, <em>sans nouveau compte client.</em>
        <br />
        Le rythme Round, et la console pour l&apos;animer.
      </footer>

      <div className={cn(styles.toast, toast && styles.toastShow)}>{toast ?? "Push envoyé"}</div>
    </div>
  )
}
