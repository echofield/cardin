"use client"

import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"

import { cn } from "@/lib/utils"

import styles from "./MalaPages.module.css"

const CODE_LENGTH = 4
const DAY_NAMES = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"] as const

const MALA_STEPS = [
  {
    name: "Premier passage",
    state: "filled",
    action: "Entrer dans Mala Club.",
    detail: "La carte est créée au scan. Elle reste après la saison avec son historique.",
    icon: "辣",
  },
  {
    name: "Régulier",
    state: "filled",
    action: "Revenir une première fois.",
    detail: "Chaque passage validé au comptoir fait avancer la progression.",
    icon: "麻",
  },
  {
    name: "Duo",
    state: "filled",
    action: "Faire entrer quelqu'un.",
    detail: "Le lien duo transforme un habitué en canal d'acquisition local.",
    icon: "+1",
  },
  {
    name: "Accro Mala",
    state: "current",
    action: "Tenir le rythme de la semaine.",
    detail: "Un jour clé ou 3 passages dans la semaine déclenchent le statut fort.",
    icon: "火",
  },
  {
    name: "Diamond",
    state: "empty",
    action: "Entrer dans la liste finale.",
    detail: "Quand la quête est complète, le client entre dans le tirage Diamond de fin de saison.",
    icon: "◇",
  },
] as const

const STORES = ["Sorbier", "Paris 9", "Reims", "Bayonne"] as const

function getClock(now: Date) {
  return {
    hour: String(now.getHours()).padStart(2, "0"),
    minute: String(now.getMinutes()).padStart(2, "0"),
    second: String(now.getSeconds()).padStart(2, "0"),
    day: DAY_NAMES[now.getDay()],
  }
}

export function MalaDemoPage() {
  const [screen, setScreen] = useState<"entry" | "card">("entry")
  const [digits, setDigits] = useState<string[]>(Array.from({ length: CODE_LENGTH }, () => ""))
  const [firstName, setFirstName] = useState("")
  const [selectedStepIndex, setSelectedStepIndex] = useState(3)
  const [selectedStore, setSelectedStore] = useState<(typeof STORES)[number]>("Sorbier")
  const [now, setNow] = useState(() => new Date())
  const [visits, setVisits] = useState(8)
  const [pending, setPending] = useState(false)
  const [pushActivated, setPushActivated] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [pendingTime, setPendingTime] = useState("14:32")
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])
  const toastTimerRef = useRef<number | null>(null)

  const allDigitsFilled = digits.every((digit) => /^\d$/.test(digit))
  const cardNumber = useMemo(() => {
    const value = digits.join("")
    return value ? value.padStart(4, "0") : "0418"
  }, [digits])
  const clock = getClock(now)
  const selectedStep = MALA_STEPS[selectedStepIndex]
  const displayName = firstName.trim() || "toi"

  useEffect(() => {
    if (screen !== "entry") return
    const timer = window.setTimeout(() => inputRefs.current[0]?.focus(), 300)
    return () => window.clearTimeout(timer)
  }, [screen])

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current)
    }
  }, [])

  function showToast(message: string) {
    setToast(message)
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current)
    toastTimerRef.current = window.setTimeout(() => setToast(null), 1900)
  }

  function updateDigit(index: number, value: string) {
    const nextValue = value.replace(/\D/g, "").slice(-1)
    setDigits((current) => current.map((digit, digitIndex) => (digitIndex === index ? nextValue : digit)))
    if (nextValue && index < CODE_LENGTH - 1) inputRefs.current[index + 1]?.focus()
  }

  function enterCard() {
    if (!allDigitsFilled) return
    setScreen("card")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function validatePassage() {
    if (pending) return
    const stamp = new Date()
    setPending(true)
    setPendingTime(`${String(stamp.getHours()).padStart(2, "0")}:${String(stamp.getMinutes()).padStart(2, "0")}`)
    showToast("Passage détecté")
  }

  function activateDailyPush() {
    if (pushActivated) {
      showToast("Mardi Sichuan déjà actif")
      return
    }
    setPushActivated(true)
    setVisits((current) => current + 1)
    showToast("Mardi Sichuan activé")
  }

  return (
    <main className={styles.malaCardPage}>
      <div className={styles.cardApp}>
        <header className={styles.topBar}>
          <Link className={styles.topBrand} href="/mala" aria-label="Retour à la carte Mala">
            <span className={styles.malaMark}>Atelier <span>Mala</span></span>
            <span className={styles.brandDot}>·</span>
            <span className={styles.topCardin}>Cardin</span>
          </Link>
          <Link className={styles.topStatus} href="/mala/journal">
            <span className={styles.liveDot} />
            <span>Journal</span>
          </Link>
        </header>

        {screen === "entry" ? (
          <section className={styles.entryScreen}>
            <div className={styles.entryHeader}>
              <div className={styles.entryGreet}>你好,</div>
              <h1 className={styles.entryTitle}>
                Bienvenue
                <br />
                au <em>Mala Club</em>
              </h1>
              <p className={styles.entrySub}>
                Tape ton code pour ouvrir ta carte. Tu vois ce que tu peux gagner, où tu en es, et l&apos;animation du jour.
                Pas de compte, pas d&apos;app.
              </p>
              <div className={styles.storeStrip}>
                {STORES.map((store) => (
                  <button
                    className={cn(styles.storePill, selectedStore === store && styles.active)}
                    key={store}
                    onClick={() => setSelectedStore(store)}
                    type="button"
                  >
                    {store === "Sorbier" ? "Paris 20 · Sorbier" : store}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.codeBlock}>
              <label className={styles.identityField}>
                <span>Prénom optionnel</span>
                <input
                  autoComplete="given-name"
                  onChange={(event) => setFirstName(event.target.value)}
                  placeholder="Nora"
                  type="text"
                  value={firstName}
                />
              </label>
              <div className={styles.codeLabel}>Ton code Mala</div>
              <div className={styles.codeInputRow}>
                {digits.map((digit, index) => (
                  <input
                    aria-label={`Chiffre ${index + 1}`}
                    autoComplete="off"
                    className={cn(styles.codeDigit, digit && styles.filled)}
                    inputMode="numeric"
                    key={index}
                    maxLength={1}
                    onChange={(event) => updateDigit(index, event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Backspace" && !digits[index] && index > 0) inputRefs.current[index - 1]?.focus()
                    }}
                    ref={(node) => {
                      inputRefs.current[index] = node
                    }}
                    type="text"
                    value={digit}
                  />
                ))}
              </div>
              <div className={styles.codeHelper}>4 chiffres · au comptoir ou sur table</div>
            </div>

            <button className={styles.btnPrimary} disabled={!allDigitsFilled} onClick={enterCard} type="button">
              <span>Ouvrir ma carte</span>
              <span aria-hidden="true">→</span>
            </button>
            <button className={styles.btnSecondary} onClick={() => setScreen("card")} type="button">
              Voir une carte exemple
            </button>

            <div className={styles.notLoyalty}>
              <div>Ce n&apos;est pas une carte de fidélité</div>
              <p>
                C&apos;est une saison. Tu entres, tu progresses, tu reçois les moments du restaurant, et un seul gagne le
                sommet. Ta carte reste après chaque saison.
              </p>
            </div>
          </section>
        ) : (
          <section className={styles.cardScreen}>
            <div className={styles.cardHeader}>
              <div className={styles.cardGreet}>Welcome, {displayName}</div>
              <div className={styles.cardId}>Mala Club · carte <strong>N° {cardNumber}</strong></div>
            </div>

            <article className={styles.malaCard}>
              <div className={styles.cardLive}>
                <span className={styles.liveDot} />
                <span>Carte active</span>
              </div>

              <div className={styles.cardWordmarkRow}>
                <div className={styles.cardMalaMark}>Mala <span>Club</span></div>
                <div className={styles.cardClubTag}>Saison vivante · toutes adresses</div>
              </div>

              <div className={styles.cardStore}>
                {STORES.map((store) => (
                  <button
                    className={cn(styles.cardStorePill, selectedStore === store && styles.active)}
                    key={store}
                    onClick={() => setSelectedStore(store)}
                    type="button"
                  >
                    {store}
                  </button>
                ))}
              </div>

              <div className={styles.cardPrize}>
                <div className={styles.cardPrizeLabel}>Le sommet de la saison</div>
                <div className={styles.cardPrizeMain}>
                  1 repas Mala par mois
                  <br />
                  <em>pendant 1 an</em>
                </div>
                <div className={styles.cardPrizeDetail}>Attribué à une seule personne à la fin</div>
              </div>

              <div className={styles.cardProgress}>
                <div className={styles.progressHead}>
                  <span>Progression</span>
                  <strong>4 sur 5</strong>
                </div>
                <div className={styles.roundsTrack}>
                  {MALA_STEPS.map((step, index) => (
                    <button
                      className={cn(styles.stepTile, styles[step.state])}
                      key={step.name}
                      onClick={() => setSelectedStepIndex(index)}
                      type="button"
                    >
                      <span>{step.icon}</span>
                      <strong>{step.name}</strong>
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.visibleStep}>
                <span>Étape visible</span>
                <strong>{selectedStep.name}</strong>
                <p>{selectedStep.action} {selectedStep.detail}</p>
              </div>

              <div className={cn(styles.dailyPush, pushActivated && styles.pushDone)}>
                <div className={styles.dailyPushLabel}>Animation du jour · reçue</div>
                <div className={styles.dailyPushTitle}>Mardi Sichuan : compte double</div>
                <p>Chaque passage aujourd&apos;hui vaut 2 dans ta saison. Montre ta carte au comptoir.</p>
                <button onClick={activateDailyPush} type="button">
                  {pushActivated ? "Activé sur ma carte" : "Activer sur ma carte"}
                </button>
              </div>

              <div className={styles.nextAction}>
                <div>Prochaine action</div>
                <strong>Viens <em>avec quelqu&apos;un</em> qui n&apos;a pas encore sa carte Mala</strong>
                <p>3 passages cette semaine et tu débloques l&apos;entrée Diamond.</p>
              </div>

              <div className={styles.visitsStrip}>
                <div>
                  <span>Passages</span>
                  <strong>{visits}</strong>
                </div>
                <div>
                  <span>Rythme</span>
                  <em>3 cette semaine</em>
                </div>
              </div>

              <div className={styles.cardFooterStripe}>
                <span>Historique</span>
                <em>gardé saison à saison</em>
              </div>
            </article>

            <div className={styles.proofBlock}>
              <div className={styles.proofClock}>
                <span>{clock.hour}</span>
                <span className={styles.proofSep}>:</span>
                <span>{clock.minute}</span>
                <em>{clock.second}</em>
              </div>
              <div className={styles.proofDate}>{clock.day}</div>
              <div className={styles.proofInstruction}>
                Montre cet écran <em>au comptoir</em>
              </div>
              <div className={styles.proofTick}>
                <span className={styles.liveDot} />
                <span>Carte vivante · seconde par seconde</span>
              </div>
            </div>

            <div className={styles.cardActions}>
              <button className={styles.actionTile} onClick={validatePassage} type="button">
                <span className={styles.actionMark}>QR</span>
                <span className={styles.actionBody}>
                  <strong>{pending ? "Passage en attente" : "Je suis au comptoir"}</strong>
                  <em>{pending ? "Mala t'a vu. Montre l'écran au comptoir." : "Mala valide ton passage. Tu avances dans la saison."}</em>
                </span>
                <span className={styles.actionArr}>→</span>
              </button>
              <button className={styles.actionTile} onClick={() => showToast("Lien duo copié")} type="button">
                <span className={styles.actionMark}>+1</span>
                <span className={styles.actionBody}>
                  <strong>Venir à deux</strong>
                  <em>Un habitué fait entrer quelqu&apos;un dans la saison.</em>
                </span>
                <span className={styles.actionArr}>→</span>
              </button>
              <Link className={styles.actionTile} href="/mala/journal">
                <span className={styles.actionMark}>J</span>
                <span className={styles.actionBody}>
                  <strong>Voir le journal</strong>
                  <em>Passer à la vue commerçant : données, pushs, lecture business.</em>
                </span>
                <span className={styles.actionArr}>→</span>
              </Link>
            </div>

            <div className={cn(styles.pendingBlock, pending && styles.show)}>
              <div>
                <span className={styles.liveDot} />
                <strong>Passage détecté</strong>
              </div>
              <em>{pendingTime} · en attente</em>
            </div>

            <div className={styles.shopBlock}>
              <span>Ton spot</span>
              <strong>Atelier <em>Mala</em> · {selectedStore}</strong>
              <p>Cuisine sichuanaise · vins nature · saison Mala Club en cours</p>
            </div>
          </section>
        )}
      </div>

      <div className={cn(styles.toast, toast && styles.show)}>{toast}</div>
    </main>
  )
}
