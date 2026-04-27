"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"

import { cn } from "@/lib/utils"

import styles from "./PompetteDemoPage.module.css"

type Screen = "entry" | "profile" | "card"

const CODE_LENGTH = 4

const PREFERENCE_CHIPS = [
  { key: "matin", label: "Le matin" },
  { key: "midi", label: "Le midi" },
  { key: "gouter", label: "Le goûter" },
  { key: "weekend", label: "Le week-end" },
] as const

const STYLE_CHIPS = [
  { key: "sucre", label: "Sucré" },
  { key: "sale", label: "Salé" },
  { key: "signature", label: "Signature" },
  { key: "saison", label: "De saison" },
] as const

const DIAMOND_STEPS = ["Entré", "Régulier", "Duo", "Diamond"] as const

function toggleSelection(current: string[], key: string) {
  return current.includes(key) ? current.filter((item) => item !== key) : [...current, key]
}

function resolveProgress(visits: number) {
  if (visits >= 7) {
    return {
      completed: 3,
      current: 3,
      countLabel: "3 sur 4",
      action: "Encore un passage pour toucher Diamond.",
      reward: "Le week-end peut s'ouvrir en petit-déjeuner pour deux.",
    }
  }

  if (visits >= 4) {
    return {
      completed: 2,
      current: 2,
      countLabel: "2 sur 4",
      action: "Venez avec quelqu'un pour débloquer Duo.",
      reward: "Vous ouvrez un petit-déjeuner partagé ou un saut de progression.",
    }
  }

  return {
    completed: 1,
    current: 1,
    countLabel: "1 sur 4",
    action: "Passez deux fois cette semaine pour débloquer Régulier.",
    reward: "Vous gagnerez une viennoiserie signature offerte.",
  }
}

export function PompetteDemoPage({ merchantId }: { merchantId?: string | null }) {
  const router = useRouter()
  const [screen, setScreen] = useState<Screen>("entry")
  const [digits, setDigits] = useState<string[]>(Array.from({ length: CODE_LENGTH }, () => ""))
  const [name, setName] = useState("")
  const [preferences, setPreferences] = useState<string[]>([])
  const [stylesSelected, setStylesSelected] = useState<string[]>([])
  const [cardIdLabel, setCardIdLabel] = useState("BOULANGERIE · CARTE N° 0042")
  const [visits, setVisits] = useState(3)
  const [dailyPushActive, setDailyPushActive] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const allDigitsFilled = digits.every((digit) => /^\d$/.test(digit))
  const progress = useMemo(() => resolveProgress(visits), [visits])
  const cardHello = name.trim() ? `Bonjour ${name.trim()}, vous êtes ici` : "Bonjour, vous êtes ici"

  const realScanHref = merchantId ? `/scan/${merchantId}?demo=1` : null
  const staffValidateHref = merchantId ? `/merchant/${merchantId}/valider?demo=1` : null
  const journalHref = "/boulangerie/journal"

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
    const value = rawValue.replace(/\D/g, "").slice(-1)
    const next = [...digits]
    next[index] = value
    setDigits(next)

    if (value && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handleDigitKeyDown(index: number, key: string) {
    if (key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  function openProfileScreen() {
    const code = digits.join("")
    setCardIdLabel(`BOULANGERIE · CARTE N° ${code.padStart(4, "0")}`)
    setScreen("profile")
  }

  function openDemoCard() {
    setCardIdLabel("BOULANGERIE · DÉMO")
    setScreen("card")
  }

  function continueToCard() {
    setScreen("card")
  }

  function handlePresentAtCounter() {
    if (staffValidateHref) {
      router.push(staffValidateHref)
      return
    }

    showToast("Ajoutez un merchantId pour ouvrir l'écran caisse")
  }

  function handleInvite() {
    showToast("Lien duo copié")
  }

  function handleDailyPush() {
    if (dailyPushActive) {
      showToast("Moment déjà activé")
      return
    }

    setDailyPushActive(true)
    setVisits((current) => current + 1)
    showToast("Goûter 16h activé")
  }

  return (
    <div className={styles.shell}>
      <div className={styles.app}>
        <header className={styles.topBar}>
          <div className={styles.brandMark}>
            <span className={styles.brandPlace}>BOULANGERIE</span>
            <span className={styles.brandSep}>·</span>
            <span className={styles.brandCardin}>CARDIN</span>
          </div>
          <div className={styles.topStatus}>
            <span className={styles.topStatusDot} />
            <span>Saison fournil</span>
          </div>
        </header>

        <section className={cn(styles.screen, screen === "entry" && styles.screenActive)}>
          <div className={styles.entryHeader}>
            <div className={styles.entryCoucou}>Bonjour !</div>
            <div className={styles.entryKicker}>Votre carte boulangerie</div>
            <h1 className={styles.entryTitle}>
              Entrez dans la <em>saison</em>.
            </h1>
            <p className={styles.entrySub}>
              Votre carte vous attend. Entrez le code donné au comptoir.
            </p>
          </div>

          <div className={styles.codeBlock}>
            <div className={cn(styles.corner, styles.cornerTl)} />
            <div className={cn(styles.corner, styles.cornerTr)} />
            <div className={cn(styles.corner, styles.cornerBl)} />
            <div className={cn(styles.corner, styles.cornerBr)} />

            <div className={styles.codeLabel}>Votre code boulangerie</div>
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
            <div className={styles.codeHelper}>4 chiffres · disponible au comptoir</div>
          </div>

          <button className={styles.primaryButton} disabled={!allDigitsFilled} onClick={openProfileScreen} type="button">
            <span>Ouvrir ma carte</span>
            <span className={styles.arrow}>→</span>
          </button>

          <button className={styles.secondaryButton} onClick={openDemoCard} type="button">
            Voir un exemple de carte
          </button>

          <div className={styles.entryFooter}>
            Cette boulangerie fait partie d&apos;une saison <em>Cardin</em>. Pas de compte, pas d&apos;app à télécharger. Juste votre code.
          </div>
        </section>

        <section className={cn(styles.screen, screen === "profile" && styles.screenActive)}>
          <div className={styles.profileHeader}>
            <div className={styles.profileKicker}>Un dernier geste</div>
            <h2 className={styles.profileTitle}>
              On vous <em>reconnaît</em> mieux.
            </h2>
            <p className={styles.profileSub}>
              Trois mini-informations pour vous proposer la bonne chose au bon moment. Rien n&apos;est obligatoire.
            </p>
          </div>

          <div className={styles.profileField}>
            <label className={styles.profileLabel}>Votre prénom (facultatif)</label>
            <input
              className={styles.profileInput}
              onChange={(event) => setName(event.target.value)}
              placeholder="Juste pour vous dire bonjour par votre prénom"
              value={name}
            />
          </div>

          <div className={styles.profileField}>
            <label className={styles.profileLabel}>Ce que vous préférez</label>
            <div className={styles.chipsRow}>
              {PREFERENCE_CHIPS.map((item) => (
                <button
                  className={cn(styles.chip, preferences.includes(item.key) && styles.chipActive)}
                  key={item.key}
                  onClick={() => setPreferences((current) => toggleSelection(current, item.key))}
                  type="button"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.profileField}>
            <label className={styles.profileLabel}>Ce qui vous attire</label>
            <div className={styles.chipsRow}>
              {STYLE_CHIPS.map((item) => (
                <button
                  className={cn(styles.chip, stylesSelected.includes(item.key) && styles.chipActive)}
                  key={item.key}
                  onClick={() => setStylesSelected((current) => toggleSelection(current, item.key))}
                  type="button"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <button className={styles.primaryButton} onClick={continueToCard} type="button">
            <span>Continuer</span>
            <span className={styles.arrow}>→</span>
          </button>

          <div className={styles.profileSkip}>
            <button className={styles.profileSkipButton} onClick={continueToCard} type="button">
              Passer cette étape
            </button>
          </div>
        </section>

        <section className={cn(styles.screen, screen === "card" && styles.screenActive)}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHello}>
              {cardHello.split(name.trim()).length > 1 && name.trim() ? (
                <>
                  Bonjour <em>{name.trim()}</em>, vous êtes ici
                </>
              ) : (
                <>Bonjour, <em>vous êtes ici</em></>
              )}
            </div>
            <div className={styles.cardId}>{cardIdLabel}</div>
          </div>

          <article className={cn(styles.demoCard, "animate-rise-in")}>
            <div className={cn(styles.corner, styles.cornerTl)} />
            <div className={cn(styles.corner, styles.cornerTr)} />
            <div className={cn(styles.corner, styles.cornerBl)} />
            <div className={cn(styles.corner, styles.cornerBr)} />

            <div className={styles.cardLive}>
              <span className={styles.cardLiveDot} />
              <span>En direct</span>
            </div>

            <div className={styles.cardWordmarkRow}>
              <div className={styles.cardWordmark}>CARDIN</div>
              <div className={styles.cardWordmarkSub}>Saison · boulangerie de quartier</div>
            </div>

            <div className={styles.cardPrize}>
              <div className={styles.cardPrizeLabel}>Votre Diamond</div>
              <div className={styles.cardPrizeMain}>
                Un <em>petit-déjeuner pour deux offert</em>
              </div>
              <div className={styles.cardPrizeDetail}>tiré parmi les clients Diamond de la saison</div>
            </div>

            <div className={styles.cardProgress}>
              <div className={styles.progressHead}>
                <span className={styles.progressHeadLabel}>Progression</span>
                <span className={styles.progressHeadCount}>{progress.countLabel}</span>
              </div>
              <div className={styles.diamondsTrack}>
                {DIAMOND_STEPS.map((label, index) => {
                  const isFilled = index < progress.completed
                  const isCurrent = index === progress.current
                  return (
                    <div
                      className={cn(
                        styles.diamond,
                        isFilled && styles.diamondFilled,
                        isCurrent && styles.diamondCurrent,
                      )}
                      key={label}
                    >
                      <div className={styles.diamondGlyph}>{isFilled || isCurrent ? "◆" : "◇"}</div>
                      <div className={styles.diamondName}>{label}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className={cn(styles.dailyPush, dailyPushActive && styles.dailyPushActive)}>
              <div className={styles.dailyPushLabel}>Animation du jour · reçue</div>
              <div className={styles.dailyPushTitle}>Goûter 16h-18h : compte double</div>
              <div className={styles.dailyPushDesc}>
                Passez cet après-midi : votre passage avance deux fois dans la saison.
              </div>
              <button className={styles.dailyPushButton} onClick={handleDailyPush} type="button">
                {dailyPushActive ? "Activé sur ma carte" : "Activer sur ma carte"}
              </button>
            </div>

            <div className={styles.nextAction}>
              <div className={styles.nextActionLabel}>Votre prochaine étape</div>
              <div className={styles.nextActionText}>
                {progress.action.includes("Régulier") ? (
                  <>
                    Passez <em>deux fois cette semaine</em> pour débloquer <em>Régulier</em>.
                  </>
                ) : progress.action.includes("Duo") ? (
                  <>
                    Venez avec <em>quelqu&apos;un</em> pour débloquer <em>Duo</em>.
                  </>
                ) : (
                  <>
                    Encore <em>un passage</em> pour toucher <em>Diamond</em>.
                  </>
                )}
              </div>
              <div className={styles.nextActionWhy}>{progress.reward}</div>
            </div>

            <div className={styles.visitsStrip}>
              <div className={styles.visitsItem}>
                <span className={styles.visitsLabel}>Passages · saison</span>
                <span className={styles.visitsValue}>{visits}</span>
              </div>
              <div className={cn(styles.visitsItem, styles.visitsRight)}>
                <span className={styles.visitsLabel}>Rythme</span>
                <span className={styles.visitsNote}>2 cette semaine</span>
              </div>
            </div>

            <div className={styles.cardFooterStripe}>
              <span>Historique</span>
              <em>gardé saison à saison</em>
            </div>
          </article>

          <div className={styles.cardActions}>
            <button className={styles.actionTile} onClick={handleInvite} type="button">
              <div className={styles.actionMark}>+</div>
              <div className={styles.actionBody}>
                <div className={styles.actionTitle}>
                  Venir <em>à deux</em>
                </div>
                <div className={styles.actionDesc}>Vous débloquez “Duo”, ils rentrent dans la saison aussi.</div>
              </div>
              <div className={styles.actionArrow}>→</div>
            </button>

            <button className={styles.actionTile} onClick={handlePresentAtCounter} type="button">
              <div className={styles.actionMark}>◆</div>
              <div className={styles.actionBody}>
                <div className={styles.actionTitle}>
                  Je suis à la <em>caisse</em>
                </div>
                <div className={styles.actionDesc}>Montrez cette carte au comptoir. L&apos;équipe valide votre visite.</div>
              </div>
              <div className={styles.actionArrow}>→</div>
            </button>
          </div>

          <div className={styles.realFlowBlock}>
            <div className={styles.realFlowLabel}>La boucle complète</div>
            <div className={styles.realFlowLinks}>
              {merchantId ? (
                <>
                  <Link className={styles.realFlowLink} href={realScanHref ?? "#"}>
                    <div>
                      <div className={styles.realFlowTitle}>Ouvrir l’entrée client</div>
                      <div className={styles.realFlowDesc}>Le vrai flow scan Cardin, en mode démo.</div>
                    </div>
                    <div className={styles.actionArrow}>→</div>
                  </Link>
                  <Link className={styles.realFlowLink} href={staffValidateHref ?? "#"}>
                    <div>
                      <div className={styles.realFlowTitle}>Ouvrir l’écran caisse</div>
                      <div className={styles.realFlowDesc}>Le staff valide la visite ou consomme l&apos;avantage.</div>
                    </div>
                    <div className={styles.actionArrow}>→</div>
                  </Link>
                </>
              ) : null}
              <Link className={styles.realFlowLink} href={journalHref}>
                <div>
                  <div className={styles.realFlowTitle}>Voir le journal du jour</div>
                  <div className={styles.realFlowDesc}>La gérante voit les passages, retours, duos et cadeaux du jour.</div>
                </div>
                <div className={styles.actionArrow}>→</div>
              </Link>
            </div>
          </div>

          <div className={styles.shopBlock}>
            <div className={styles.shopLabel}>Votre boulangerie</div>
            <div className={styles.shopName}>
              <em>Boulangerie</em> · quartier
            </div>
            <div className={styles.shopAddress}>Pain chaud · viennoiseries · goûter · saison de retour en cours</div>
          </div>

          <div className={styles.installHint}>
            Ajoutez la carte <em>à votre écran d’accueil</em>
            <br />
            pour retrouver votre carte en un geste.
          </div>
        </section>
      </div>

      <div className={cn(styles.toast, toast && styles.toastVisible)}>{toast ?? "Passage enregistré"}</div>
    </div>
  )
}
