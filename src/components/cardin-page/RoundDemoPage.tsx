"use client"

import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"

import { cn } from "@/lib/utils"

import styles from "./RoundDemoPage.module.css"

type Screen = "entry" | "choice" | "card"
type ScenarioKey = "retour" | "duo" | "jour"
type OfferKey = "side" | "credit" | "menu" | "duo"
type DayKey = "mardi" | "mercredi" | "jeudi" | "weekend"
type TriggerKey = "scan" | "return" | "three"
type EntryKey = "all" | "afterReturn" | "invite"
type FormatKey = "solo" | "duo" | "group"
type DiamondKey = "monthlyMenu" | "table" | "credit"

const CODE_LENGTH = 4

const SCENARIOS: Record<
  ScenarioKey,
  {
    label: string
    short: string
    merchantLine: string
    nextAction: string
    rule: string
    step: number
    prizeTwo: string
    prizeThree: string
  }
> = {
  retour: {
    label: "Retour Round",
    short: "Faire revenir les clients qui ont deja aime.",
    merchantLine: "On recompense les clients qui reviennent vraiment.",
    nextAction: "Revenez cette semaine pour passer Challenger.",
    rule: "2 retours cette semaine = avance rapide",
    step: 2,
    prizeTwo: "1 menu duo offert",
    prizeThree: "25 EUR de credit Round",
  },
  duo: {
    label: "Duo Round",
    short: "Transformer les habitues en canal d'acquisition.",
    merchantLine: "Vos habitues deviennent le canal d'acquisition.",
    nextAction: "Venez avec quelqu'un qui n'a pas encore sa carte Round.",
    rule: "1 invite actif = etape Duo validee",
    step: 3,
    prizeTwo: "Menu duo offert",
    prizeThree: "Side + boisson pour 2",
  },
  jour: {
    label: "Jour plein",
    short: "Creer une raison de reserver sur le service a remplir.",
    merchantLine: "On ne fait pas une promo permanente. On remplit le jour qui porte la saison.",
    nextAction: "Passez mercredi: ce passage compte double.",
    rule: "Mercredi = progression double",
    step: 2,
    prizeTwo: "1 menu duo le jour cle",
    prizeThree: "Credit valable mercredi",
  },
}

const STEPS = ["Entre", "Revenu", "Duo", "Challenger", "Finaliste"] as const

const OFFER_OPTIONS: Array<{ key: OfferKey; label: string; detail: string }> = [
  { key: "side", label: "Side offert", detail: "simple a donner, visible au comptoir" },
  { key: "credit", label: "12 EUR de credit", detail: "souple, parfait pour retour" },
  { key: "menu", label: "Plat offert", detail: "fort pour faire basculer une table" },
  { key: "duo", label: "Table duo", detail: "pousse la venue a deux" },
]

const DAY_OPTIONS: Array<{ key: DayKey; label: string }> = [
  { key: "mardi", label: "Mardi" },
  { key: "mercredi", label: "Mercredi" },
  { key: "jeudi", label: "Jeudi" },
  { key: "weekend", label: "Weekend" },
]

const TRIGGER_OPTIONS: Array<{ key: TriggerKey; label: string; detail: string }> = [
  { key: "scan", label: "Des le scan", detail: "faire entrer sans friction" },
  { key: "return", label: "Apres retour", detail: "recompenser le vrai retour" },
  { key: "three", label: "3 passages", detail: "declencher quand le rythme existe" },
]

const ENTRY_OPTIONS: Array<{ key: EntryKey; label: string; detail: string }> = [
  { key: "all", label: "Tous", detail: "tout client peut entrer" },
  { key: "afterReturn", label: "Apres retour", detail: "plus selectif" },
  { key: "invite", label: "Sur invitation", detail: "plus club" },
]

const FORMAT_OPTIONS: Array<{ key: FormatKey; label: string; detail: string }> = [
  { key: "solo", label: "Solo", detail: "retour individuel" },
  { key: "duo", label: "Duo", detail: "venir a deux" },
  { key: "group", label: "Groupe", detail: "tables et bandes" },
]

const DIAMOND_OPTIONS: Array<{ key: DiamondKey; label: string; detail: string }> = [
  { key: "monthlyMenu", label: "1 menu / mois", detail: "pendant 1 an" },
  { key: "credit", label: "300 EUR credit", detail: "valeur claire" },
  { key: "table", label: "Table privilegiee", detail: "une fois par mois" },
]

function findOption<T extends { key: string }>(options: T[], key: string): T {
  return options.find((item) => item.key === key) ?? options[0]
}

function toggleDigitValue(rawValue: string) {
  return rawValue.replace(/\D/g, "").slice(-1)
}

export function RoundDemoPage() {
  const [screen, setScreen] = useState<Screen>("entry")
  const [digits, setDigits] = useState<string[]>(Array.from({ length: CODE_LENGTH }, () => ""))
  const [firstName, setFirstName] = useState("")
  const [scenario, setScenario] = useState<ScenarioKey>("duo")
  const [offer, setOffer] = useState<OfferKey>("menu")
  const [keyDay, setKeyDay] = useState<DayKey>("mardi")
  const [trigger, setTrigger] = useState<TriggerKey>("three")
  const [entry, setEntry] = useState<EntryKey>("all")
  const [format, setFormat] = useState<FormatKey>("group")
  const [diamond, setDiamond] = useState<DiamondKey>("monthlyMenu")
  const [toast, setToast] = useState<string | null>(null)
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const selected = SCENARIOS[scenario]
  const selectedOffer = findOption(OFFER_OPTIONS, offer)
  const selectedDay = findOption(DAY_OPTIONS, keyDay)
  const selectedTrigger = findOption(TRIGGER_OPTIONS, trigger)
  const selectedEntry = findOption(ENTRY_OPTIONS, entry)
  const selectedFormat = findOption(FORMAT_OPTIONS, format)
  const selectedDiamond = findOption(DIAMOND_OPTIONS, diamond)
  const allDigitsFilled = digits.every((digit) => /^\d$/.test(digit))
  const cardNumber = useMemo(() => digits.join("").padStart(4, "0"), [digits])

  useEffect(() => {
    if (screen !== "entry") return
    inputRefs.current[0]?.focus()
  }, [screen])

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
    const next = [...digits]
    next[index] = toggleDigitValue(rawValue)
    setDigits(next)
    if (next[index] && index < CODE_LENGTH - 1) inputRefs.current[index + 1]?.focus()
  }

  function handleDigitKeyDown(index: number, key: string) {
    if (key === "Backspace" && !digits[index] && index > 0) inputRefs.current[index - 1]?.focus()
  }

  function openChoice() {
    setScreen("choice")
  }

  function openDemoCard() {
    setDigits(["0", "4", "1", "8"])
    setScenario("duo")
    setScreen("card")
  }

  function selectScenario(key: ScenarioKey) {
    setScenario(key)
    if (key === "retour") {
      setOffer("credit")
      setTrigger("three")
      setEntry("all")
      setFormat("solo")
    }
    if (key === "duo") {
      setOffer("duo")
      setTrigger("return")
      setEntry("all")
      setFormat("duo")
    }
    if (key === "jour") {
      setOffer("menu")
      setTrigger("scan")
      setEntry("all")
      setFormat("group")
    }
  }

  function presentAtCounter() {
    showToast("Passage valide au comptoir")
  }

  function inviteFriend() {
    showToast("Lien Duo Round pret a partager")
  }

  return (
    <div className={styles.shell}>
      <div className={styles.app}>
        <header className={styles.topBar}>
          <div className={styles.brandMark}>
            <span className={styles.brandPlace}>ROUND</span>
            <span className={styles.brandSep}>x</span>
            <span className={styles.brandCardin}>CARDIN</span>
          </div>
          <div className={styles.topStatus}>
            <span className={styles.topStatusDot} />
            <span>Saison 90 jours</span>
          </div>
        </header>

        <section className={cn(styles.screen, screen === "entry" && styles.screenActive)}>
          <div className={styles.entryHero}>
            <div className={styles.entryKicker}>Round Club</div>
            <h1 className={styles.entryTitle}>
              Saison de <em>conquete locale</em>.
            </h1>
            <p className={styles.entrySub}>
              Une carte qui commence maintenant, accumule les passages, et reste apres la saison. Round choisit le
              rythme, les clients voient la prochaine raison de revenir.
            </p>
          </div>

          <div className={styles.summitPanel}>
            <div className={styles.summitLabel}>Le Sommet</div>
            <div className={styles.summitPrize}>1 menu Round par mois pendant 1 an</div>
            <div className={styles.summitNote}>attribue a une seule personne a la fin de la saison</div>
          </div>

          <div className={styles.codeBlock}>
            <div className={cn(styles.corner, styles.cornerTl)} />
            <div className={cn(styles.corner, styles.cornerTr)} />
            <div className={cn(styles.corner, styles.cornerBl)} />
            <div className={cn(styles.corner, styles.cornerBr)} />
            <div className={styles.codeLabel}>Code Round</div>
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
            <div className={styles.codeHelper}>4 chiffres au comptoir, sur table ou flyer</div>
          </div>

          <button className={styles.primaryButton} disabled={!allDigitsFilled} onClick={openChoice} type="button">
            <span>Ouvrir ma carte Round</span>
            <span className={styles.arrow}>-&gt;</span>
          </button>

          <button className={styles.secondaryButton} onClick={openDemoCard} type="button">
            Voir l'archetype
          </button>

          <div className={styles.entryFooter}>
            Pas de compte obligatoire. La carte reste apres la saison, avec son historique Round.
          </div>
        </section>

        <section className={cn(styles.screen, screen === "choice" && styles.screenActive)}>
          <div className={styles.choiceHeader}>
            <div className={styles.choiceKicker}>Preset Cardin pour Round</div>
            <h2 className={styles.choiceTitle}>
              Composer la <em>saison</em>.
            </h2>
            <p className={styles.choiceSub}>
              Le client garde une carte simple. Le restaurateur voit les leviers: offre, jour, declencheur, entree,
              format et Diamond.
            </p>
          </div>

          <div className={styles.profileField}>
            <label className={styles.profileLabel}>Prenom facultatif</label>
            <input
              className={styles.profileInput}
              onChange={(event) => setFirstName(event.target.value)}
              placeholder="Pour personnaliser la carte"
              value={firstName}
            />
          </div>

          <div className={styles.scenarioGrid}>
            {(Object.keys(SCENARIOS) as ScenarioKey[]).map((key) => {
              const item = SCENARIOS[key]
              return (
                <button
                  className={cn(styles.scenarioButton, scenario === key && styles.scenarioButtonActive)}
                  key={key}
                  onClick={() => selectScenario(key)}
                  type="button"
                >
                  <span>{item.label}</span>
                  <em>{item.short}</em>
                </button>
              )
            })}
          </div>

          <div className={styles.systemBuilder}>
            <div className={styles.systemRow}>
              <div className={styles.systemMeta}>
                <span>01</span>
                <strong>Ce qui se passe</strong>
                <em>ce qui tombe cette semaine</em>
              </div>
              <div className={styles.systemControl}>
                <div className={styles.optionRow}>
                  {OFFER_OPTIONS.map((item) => (
                    <button
                      className={cn(styles.pillButton, offer === item.key && styles.pillButtonActive)}
                      key={item.key}
                      onClick={() => setOffer(item.key)}
                      type="button"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <p>{selectedDay.label}: {selectedOffer.detail}.</p>
              </div>
            </div>

            <div className={styles.systemRow}>
              <div className={styles.systemMeta}>
                <span>02</span>
                <strong>Jour plein</strong>
                <em>le jour qui porte la saison</em>
              </div>
              <div className={styles.systemControl}>
                <div className={styles.optionRow}>
                  {DAY_OPTIONS.map((item) => (
                    <button
                      className={cn(styles.pillButton, keyDay === item.key && styles.pillButtonActive)}
                      key={item.key}
                      onClick={() => setKeyDay(item.key)}
                      type="button"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <p>Le preset garde ce jour visible dans la carte et le journal.</p>
              </div>
            </div>

            <div className={styles.systemRow}>
              <div className={styles.systemMeta}>
                <span>03</span>
                <strong>Declencheur</strong>
                <em>quand la saison recompense</em>
              </div>
              <div className={styles.systemControl}>
                <div className={styles.optionRow}>
                  {TRIGGER_OPTIONS.map((item) => (
                    <button
                      className={cn(styles.pillButton, trigger === item.key && styles.pillButtonActive)}
                      key={item.key}
                      onClick={() => setTrigger(item.key)}
                      type="button"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <p>{selectedTrigger.detail}.</p>
              </div>
            </div>

            <div className={styles.systemRow}>
              <div className={styles.systemMeta}>
                <span>04</span>
                <strong>Qui entre</strong>
                <em>qui peut entrer</em>
              </div>
              <div className={styles.systemControl}>
                <div className={styles.optionRow}>
                  {ENTRY_OPTIONS.map((item) => (
                    <button
                      className={cn(styles.pillButton, entry === item.key && styles.pillButtonActive)}
                      key={item.key}
                      onClick={() => setEntry(item.key)}
                      type="button"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <p>{selectedEntry.detail}.</p>
              </div>
            </div>

            <div className={styles.systemRow}>
              <div className={styles.systemMeta}>
                <span>05</span>
                <strong>Format</strong>
                <em>solo, duo ou groupe</em>
              </div>
              <div className={styles.systemControl}>
                <div className={styles.optionRow}>
                  {FORMAT_OPTIONS.map((item) => (
                    <button
                      className={cn(styles.pillButton, format === item.key && styles.pillButtonActive)}
                      key={item.key}
                      onClick={() => setFormat(item.key)}
                      type="button"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <p>{selectedFormat.detail}.</p>
              </div>
            </div>

            <div className={styles.summitChoice}>
              <div className={styles.summitChoiceLabel}>Le sommet - ce qui reste en vue</div>
              <div className={styles.systemRow}>
                <div className={styles.systemMeta}>
                  <span>06</span>
                  <strong>Diamond</strong>
                  <em>visible au comptoir toute la saison</em>
                </div>
                <div className={styles.systemControl}>
                  <div className={styles.optionRow}>
                    {DIAMOND_OPTIONS.map((item) => (
                      <button
                        className={cn(styles.pillButton, diamond === item.key && styles.pillButtonActiveGold)}
                        key={item.key}
                        onClick={() => setDiamond(item.key)}
                        type="button"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                  <p>{selectedDiamond.detail}. Un seul gagnant, cout borne.</p>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.merchantLine}>
            <span>Phrase merchant</span>
            <strong>{selected.merchantLine}</strong>
          </div>

          <button className={styles.primaryButton} onClick={() => setScreen("card")} type="button">
            <span>Voir la carte vivante</span>
            <span className={styles.arrow}>-&gt;</span>
          </button>
        </section>

        <section className={cn(styles.screen, screen === "card" && styles.screenActive)}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHello}>
              {firstName.trim() ? (
                <>
                  {firstName.trim()}, <em>vous etes dans Round Club</em>
                </>
              ) : (
                <>
                  Vous etes dans <em>Round Club</em>
                </>
              )}
            </div>
            <div className={styles.cardId}>ROUND CLUB - CARTE N {cardNumber}</div>
          </div>

          <article className={styles.memberCard}>
            <div className={cn(styles.corner, styles.cornerTl)} />
            <div className={cn(styles.corner, styles.cornerTr)} />
            <div className={cn(styles.corner, styles.cornerBl)} />
            <div className={cn(styles.corner, styles.cornerBr)} />

            <div className={styles.liveBadge}>
              <span className={styles.liveDot} />
              <span>Carte active</span>
            </div>

            <div className={styles.cardWordmark}>ROUND CLUB</div>
            <div className={styles.cardSub}>Saison de conquete locale - 90 jours</div>

            <div className={styles.diamondPrize}>
              <div className={styles.diamondLabel}>Diamond unique</div>
              <div className={styles.diamondMain}>
                {selectedDiamond.label} <em>{selectedDiamond.detail}</em>
              </div>
              <div className={styles.diamondDetail}>1 gagnant seulement - prix fort, cout borne</div>
            </div>

            <div className={styles.progressBlock}>
              <div className={styles.progressHead}>
                <span>Progression</span>
                <em>{selected.step} sur 5</em>
              </div>
              <div className={styles.stepsTrack}>
                {STEPS.map((step, index) => {
                  const isDone = index < selected.step
                  const isCurrent = index === selected.step
                  return (
                    <div className={cn(styles.step, isDone && styles.stepDone, isCurrent && styles.stepCurrent)} key={step}>
                      <div className={styles.stepGlyph}>{isDone || isCurrent ? "D" : "O"}</div>
                      <div className={styles.stepLabel}>{step}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className={styles.nextAction}>
              <div className={styles.nextActionLabel}>Prochaine action</div>
              <div className={styles.nextActionText}>
                {scenario === "jour" ? `Passez ${selectedDay.label.toLowerCase()}: ce passage compte plus.` : selected.nextAction}
              </div>
              <div className={styles.nextActionRule}>
                {selectedDay.label} - {selectedOffer.label} - {selectedTrigger.label}
              </div>
            </div>

            <div className={styles.prizeStack}>
              <div>
                <span>Prix 2</span>
                <strong>{selected.prizeTwo}</strong>
              </div>
              <div>
                <span>Prix 3</span>
                <strong>{selected.prizeThree}</strong>
              </div>
            </div>
          </article>

          <div className={styles.cardActions}>
            <button className={styles.actionTile} onClick={presentAtCounter} type="button">
              <div className={styles.actionMark}>QR</div>
              <div className={styles.actionBody}>
                <div className={styles.actionTitle}>
                  Je suis au <em>comptoir</em>
                </div>
                <div className={styles.actionDesc}>Round emet le geste. Le client recoit l'update.</div>
              </div>
              <div className={styles.actionArrow}>-&gt;</div>
            </button>

            <button className={styles.actionTile} onClick={inviteFriend} type="button">
              <div className={styles.actionMark}>2</div>
              <div className={styles.actionBody}>
                <div className={styles.actionTitle}>
                  Venir a <em>deux</em>
                </div>
                <div className={styles.actionDesc}>Un habitue fait entrer quelqu'un dans la saison.</div>
              </div>
              <div className={styles.actionArrow}>-&gt;</div>
            </button>
          </div>

          <div className={styles.salesBlock}>
            <div className={styles.salesLabel}>A presenter lundi</div>
            <p>
              Une saison Round configuree comme un systeme: le jour a remplir, l'offre a pousser, le declencheur,
              le format de participation et le Diamond. Apres la saison, la carte reste et la prochaine saison peut
              reprendre sur une base deja accumulee.
            </p>
            <Link className={styles.salesLink} href="/round/journal">
              Voir le journal merchant -&gt;
            </Link>
          </div>
        </section>
      </div>

      <div className={cn(styles.toast, toast && styles.toastVisible)}>{toast ?? "Passage valide"}</div>
    </div>
  )
}
