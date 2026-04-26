"use client"

import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"

import { cn } from "@/lib/utils"

import styles from "./RoundDemoPage.module.css"

const CODE_LENGTH = 4
const ROUND_STEPS = [
  {
    name: "First Round",
    state: "filled",
    action: "Entrer avec un code Round.",
    detail: "La carte est creee, le client voit le sommet et garde son historique.",
  },
  {
    name: "Second Round",
    state: "filled",
    action: "Revenir une premiere fois.",
    detail: "Le comptoir valide le passage. Le client comprend que chaque retour compte.",
  },
  {
    name: "Duo Round",
    state: "current",
    action: "Venir avec quelqu'un.",
    detail: "Un habitue fait entrer une nouvelle personne dans la saison.",
  },
  {
    name: "Heavy Round",
    state: "empty",
    action: "Atteindre le rythme fort.",
    detail: "3 passages dans la semaine ou un jour cle valide debloquent le statut.",
  },
  {
    name: "Diamond",
    state: "empty",
    action: "Arriver au sommet.",
    detail: "Un seul gagnant obtient 1 menu Round par mois pendant 1 an.",
  },
] as const

const DAY_NAMES = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"] as const

function formatClock(now: Date) {
  return {
    hour: String(now.getHours()).padStart(2, "0"),
    minute: String(now.getMinutes()).padStart(2, "0"),
    second: String(now.getSeconds()).padStart(2, "0"),
    day: DAY_NAMES[now.getDay()],
  }
}

export function RoundDemoPage() {
  const [screen, setScreen] = useState<"entry" | "card">("entry")
  const [digits, setDigits] = useState<string[]>(Array.from({ length: CODE_LENGTH }, () => ""))
  const [now, setNow] = useState(() => new Date())
  const [selectedStepIndex, setSelectedStepIndex] = useState(2)
  const [pending, setPending] = useState(false)
  const [pendingTime, setPendingTime] = useState("14:32")
  const [toast, setToast] = useState<string | null>(null)
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const allDigitsFilled = digits.every((digit) => /^\d$/.test(digit))
  const cardNumber = useMemo(() => {
    const joined = digits.join("")
    return joined ? joined.padStart(4, "0") : "0418"
  }, [digits])
  const clock = formatClock(now)
  const selectedStep = ROUND_STEPS[selectedStepIndex]

  useEffect(() => {
    if (screen !== "entry") return
    const timer = setTimeout(() => inputRefs.current[0]?.focus(), 350)
    return () => clearTimeout(timer)
  }, [screen])

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    }
  }, [])

  function showToast(message: string) {
    setToast(message)
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => setToast(null), 1800)
  }

  function handleDigitChange(index: number, rawValue: string) {
    const value = rawValue.replace(/\D/g, "").slice(-1)
    const next = [...digits]
    next[index] = value
    setDigits(next)
    if (value && index < CODE_LENGTH - 1) inputRefs.current[index + 1]?.focus()
  }

  function handleDigitKeyDown(index: number, key: string) {
    if (key === "Backspace" && !digits[index] && index > 0) inputRefs.current[index - 1]?.focus()
  }

  function openCard() {
    setScreen("card")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function openDemoCard() {
    setDigits(["0", "4", "1", "8"])
    openCard()
  }

  function detectPassage() {
    if (pending) return
    const detectedAt = new Date()
    setPending(true)
    setPendingTime(`${String(detectedAt.getHours()).padStart(2, "0")}:${String(detectedAt.getMinutes()).padStart(2, "0")}`)
    showToast("Passage detecte")
  }

  return (
    <div className={styles.shell}>
      <main className={styles.app}>
        <header className={styles.topBar}>
          <div className={styles.topBrand}>
            <span className={styles.roundmark}>Round</span>
            <span className={styles.topX}>x</span>
            <span className={styles.topCardin}>Cardin</span>
          </div>
          <div className={styles.topRight}>
            <button className={styles.topLink} onClick={openCard} type="button">
              Carte
            </button>
            <Link className={styles.topLinkStrong} href="/round/journal">
              Moteur
            </Link>
          </div>
        </header>

        <section className={cn(styles.screen, screen === "entry" && styles.screenActive)}>
          <div className={styles.entryHeader}>
            <div className={styles.entryGreet}>Hey</div>
            <h1 className={styles.entryTitle}>
              Entre au <em>Round Club</em>
            </h1>
            <p className={styles.entrySub}>
              Tape ton code pour ouvrir ta carte. Tu vois ce que tu peux gagner et ou tu en es. Pas de compte,
              pas d&apos;app.
            </p>
          </div>

          <div className={styles.codeBlock}>
            <div className={styles.codeLabel}>Ton code Round</div>
            <div className={styles.codeInputRow}>
              {digits.map((digit, index) => (
                <input
                  autoComplete="off"
                  className={cn(styles.codeDigit, digit && styles.codeDigitFilled)}
                  inputMode="numeric"
                  key={index}
                  maxLength={1}
                  onChange={(event) => handleDigitChange(index, event.target.value)}
                  onKeyDown={(event) => handleDigitKeyDown(index, event.key)}
                  ref={(element) => {
                    inputRefs.current[index] = element
                  }}
                  value={digit}
                />
              ))}
            </div>
            <div className={styles.codeHelper}>4 chiffres au comptoir</div>
          </div>

          <button className={styles.btnPrimary} disabled={!allDigitsFilled} onClick={openCard} type="button">
            <span>Ouvrir ma carte</span>
            <span className={styles.arrow}>-&gt;</span>
          </button>

          <button className={styles.btnSecondary} onClick={openDemoCard} type="button">
            Voir une carte exemple
          </button>

          <div className={styles.entryFooter}>Ta carte reste apres la saison, avec son historique Round.</div>
        </section>

        <section className={cn(styles.screen, screen === "card" && styles.screenActive)}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHello}>
              Tu es dans <em>Round Club</em>
            </div>
            <div className={styles.cardId}>
              ROUND CLUB · CARTE <strong>N {cardNumber}</strong>
            </div>
          </div>

          <article className={styles.roundCard}>
            <div className={styles.cardLive}>
              <span className={styles.cardLiveDot} />
              <span>Carte active</span>
            </div>

            <div className={styles.cardBrand}>
              <span className={styles.cardRoundmark}>
                Round <span>Club</span>
              </span>
              <div className={styles.cardClubTag}>
                Saison <strong>90 jours</strong> · Round Paris
              </div>
            </div>

            <div className={styles.cardPrize}>
              <div className={styles.cardPrizeLabel}>Le sommet de la saison</div>
              <div className={styles.cardPrizeMain}>
                1 menu Round par mois
                <br />
                <em>pendant 1 an</em>
              </div>
              <div className={styles.cardPrizeDetail}>Attribue a une seule personne a la fin</div>
            </div>

            <div className={styles.cardProgress}>
              <div className={styles.progressHead}>
                <span>Progression</span>
                <strong>3 sur 5</strong>
              </div>
              <div className={styles.roundsTrack}>
                {ROUND_STEPS.map((step) => (
                  <div
                    className={cn(
                      styles.rd,
                      step.state === "filled" && styles.rdFilled,
                      step.state === "current" && styles.rdCurrent,
                      selectedStepIndex === ROUND_STEPS.indexOf(step) && styles.rdSelected,
                    )}
                    key={step.name}
                    onClick={() => setSelectedStepIndex(ROUND_STEPS.indexOf(step))}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") setSelectedStepIndex(ROUND_STEPS.indexOf(step))
                    }}
                  >
                    <div className={styles.rdGlyph}>{step.state === "empty" ? "o" : "*"}</div>
                    <div className={styles.rdName}>{step.name}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.stepExplorer}>
              <div className={styles.stepExplorerLabel}>Etape visible</div>
              <div className={styles.stepExplorerTitle}>{selectedStep.name}</div>
              <div className={styles.stepExplorerAction}>{selectedStep.action}</div>
              <div className={styles.stepExplorerDetail}>{selectedStep.detail}</div>
            </div>

            <div className={styles.nextAction}>
              <div className={styles.nextActionLabel}>Prochaine action</div>
              <div className={styles.nextActionText}>
                Viens <em>avec quelqu&apos;un</em> qui n&apos;a pas encore sa carte Round
              </div>
              <div className={styles.nextActionWhy}>3 passages cette semaine et tu debloques Heavy Round.</div>
            </div>

            <div className={styles.visitsStrip}>
              <div className={styles.visitsItem}>
                <span className={styles.visitsLabel}>Passages</span>
                <span className={styles.visitsValue}>8</span>
              </div>
              <div className={cn(styles.visitsItem, styles.visitsRight)}>
                <span className={styles.visitsLabel}>Rythme</span>
                <span className={styles.visitsNote}>3 cette semaine</span>
              </div>
            </div>

            <div className={styles.cardFooterStripe}>
              <span>Historique</span>
              <em>garde saison a saison</em>
            </div>
          </article>

          <div className={styles.proofBlock}>
            <div className={styles.proofClock}>
              <span>{clock.hour}</span>
              <span className={styles.proofSep}>:</span>
              <span>{clock.minute}</span>
              <span className={styles.proofSec}>{clock.second}</span>
            </div>
            <div className={styles.proofDate}>{clock.day}</div>
            <div className={styles.proofInstruction}>
              Montre cet ecran <em>au comptoir</em>
            </div>
            <div className={styles.proofTick}>
              <span className={styles.proofTickDot} />
              <span>Carte vivante · seconde par seconde</span>
            </div>
          </div>

          <div className={styles.cardActions}>
            <button className={styles.actionTile} disabled={pending} onClick={detectPassage} type="button">
              <div className={styles.actionMark}>QR</div>
              <div className={styles.actionBody}>
                <div className={styles.actionTitle}>
                  {pending ? (
                    <>
                      Passage <em>en attente</em>
                    </>
                  ) : (
                    <>
                      Je suis au <em>comptoir</em>
                    </>
                  )}
                </div>
                <div className={styles.actionDesc}>
                  {pending ? "Round t'a vu. Montre l'ecran au comptoir." : "Round valide ton passage. Tu avances dans la saison."}
                </div>
              </div>
              <div className={styles.actionArr}>-&gt;</div>
            </button>

            <button className={styles.actionTile} onClick={() => showToast("Lien copain copie")} type="button">
              <div className={styles.actionMark}>+1</div>
              <div className={styles.actionBody}>
                <div className={styles.actionTitle}>
                  Venir <em>a deux</em>
                </div>
                <div className={styles.actionDesc}>Un habitue fait entrer quelqu&apos;un dans la saison.</div>
              </div>
              <div className={styles.actionArr}>-&gt;</div>
            </button>

            <Link className={cn(styles.actionTile, styles.actionTileStrong)} href="/round/journal">
              <div className={styles.actionMark}>J</div>
              <div className={styles.actionBody}>
                <div className={styles.actionTitle}>
                  Voir le <em>moteur</em>
                </div>
                <div className={styles.actionDesc}>Passer au journal marchand, aux pushs et a la lecture business.</div>
              </div>
              <div className={styles.actionArr}>-&gt;</div>
            </Link>
          </div>

          <div className={cn(styles.pendingBlock, pending && styles.pendingBlockShow)}>
            <div className={styles.pendingLeft}>
              <span className={styles.pendingDot} />
              <div className={styles.pendingBody}>
                <span className={styles.pendingLabel}>Passage detecte</span>
                <span className={styles.pendingValue}>{pendingTime}</span>
              </div>
            </div>
            <span className={styles.pendingStatus}>en attente</span>
          </div>

          <div className={styles.shopBlock}>
            <div className={styles.shopLabel}>Ton spot</div>
            <div className={styles.shopName}>
              <em>Round</em> · Saucy egg buns
            </div>
            <div className={styles.shopAddress}>Smashed burgers, eggbuns, sides · sur place ou click & collect</div>
          </div>

          <div className={styles.installHint}>
            Ajoute Round <em>a ton ecran d&apos;accueil</em>
            <br />
            pour retrouver ta carte en un geste.
          </div>

        </section>

      </main>

      <div className={cn(styles.toast, toast && styles.toastShow)}>{toast ?? "Passage detecte"}</div>
    </div>
  )
}
