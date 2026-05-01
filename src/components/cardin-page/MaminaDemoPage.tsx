"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"

import { cn } from "@/lib/utils"

import styles from "./MaminaDemoPage.module.css"

type Screen = "entry" | "profile" | "card"

const CODE_LENGTH = 4

const MOMENT_CHIPS = [
  { key: "midi", label: "Déjeuner rapide" },
  { key: "bureau", label: "Pause bureau" },
  { key: "emporter", label: "À emporter" },
  { key: "cadeau", label: "Produit à offrir" },
] as const

const TASTE_CHIPS = [
  { key: "charcuterie", label: "Charcuterie corse" },
  { key: "fromage", label: "Fromage" },
  { key: "olive", label: "Olive & herbes" },
  { key: "sucre", label: "Douceurs" },
  { key: "guide", label: "Je veux découvrir" },
] as const

const STEP_LABELS = ["Passage", "Habitué", "Gourmet", "Mamina"] as const

function toggleSelection(current: string[], key: string) {
  return current.includes(key) ? current.filter((item) => item !== key) : [...current, key]
}

function resolveProgress(visits: number, productDiscoveryActive: boolean) {
  const adjustedVisits = productDiscoveryActive ? visits + 1 : visits

  if (adjustedVisits >= 5) {
    return {
      completed: 3,
      current: 3,
      countLabel: "5 sur 5",
      title: "Votre sandwich est offert.",
      action: "Votre prochain passage peut devenir une découverte Mamina.",
      reward: "Accès prioritaire aux dégustations et aux produits de saison.",
    }
  }

  if (adjustedVisits >= 3) {
    return {
      completed: 2,
      current: 2,
      countLabel: `${adjustedVisits} sur 5`,
      title: "Plus que deux passages.",
      action: "Passez cette semaine pour accéder à la prochaine dégustation.",
      reward: "Les membres Gourmet découvrent les produits avant la vitrine.",
    }
  }

  return {
    completed: 1,
    current: 1,
    countLabel: `${adjustedVisits} sur 5`,
    title: "Votre sandwich offert approche.",
    action: "Revenez deux fois cette semaine pour débloquer votre prochain avantage.",
    reward: "Essayez un produit épicerie pour accélérer votre progression.",
  }
}

export function MaminaDemoPage({ merchantId }: { merchantId?: string | null }) {
  const router = useRouter()
  const [screen, setScreen] = useState<Screen>("entry")
  const [digits, setDigits] = useState<string[]>(Array.from({ length: CODE_LENGTH }, () => ""))
  const [name, setName] = useState("")
  const [moments, setMoments] = useState<string[]>([])
  const [tastes, setTastes] = useState<string[]>([])
  const [cardIdLabel, setCardIdLabel] = useState("MAMINA · CARTE N° 0035")
  const [visits, setVisits] = useState(2)
  const [productDiscoveryActive, setProductDiscoveryActive] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const allDigitsFilled = digits.every((digit) => /^\d$/.test(digit))
  const progress = useMemo(() => resolveProgress(visits, productDiscoveryActive), [visits, productDiscoveryActive])
  const realScanHref = merchantId ? `/scan/${merchantId}?demo=1&vertical=mamina` : null
  const staffValidateHref = merchantId ? `/merchant/${merchantId}/valider?demo=1` : null

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
    setCardIdLabel(`MAMINA · CARTE N° ${code.padStart(4, "0")}`)
    setScreen("profile")
  }

  function openDemoCard() {
    setCardIdLabel("MAMINA · DÉMO")
    setScreen("card")
  }

  function handlePresentAtCounter() {
    if (staffValidateHref) {
      router.push(staffValidateHref)
      return
    }

    showToast("Passage prêt au comptoir.")
  }

  function handleInvite() {
    showToast("Invitation Mamina copiée.")
  }

  function handleProductDiscovery() {
    if (productDiscoveryActive) {
      showToast("Produit déjà ajouté à votre carte.")
      return
    }

    setProductDiscoveryActive(true)
    showToast("Produit du moment ajouté.")
  }

  function handleTasting() {
    showToast("Dégustation réservée aux membres.")
  }

  return (
    <div className={styles.shell}>
      <div className={styles.app}>
        <header className={styles.topBar}>
          <div className={styles.brandMark}>
            <span className={styles.brandPlace}>MAMINA</span>
            <span className={styles.brandSep}>·</span>
            <span className={styles.brandCardin}>CARDIN</span>
          </div>
          <div className={styles.topStatus}>
            <span className={styles.topStatusDot} />
            <span>Carte des saveurs</span>
          </div>
        </header>

        <section className={cn(styles.screen, screen === "entry" && styles.screenActive)}>
          <div className={styles.entryHeader}>
            <div className={styles.entryCoucou}>Bienvenue chez Mamina.</div>
            <div className={styles.entryKicker}>Votre carte des saveurs</div>
            <h1 className={styles.entryTitle}>
              Revenez pour le <em>goût</em>.
            </h1>
            <p className={styles.entrySub}>
              Votre carte garde le rythme de vos passages, vos découvertes et les petites attentions de la maison.
            </p>
          </div>

          <div className={styles.codeBlock}>
            <div className={cn(styles.corner, styles.cornerTl)} />
            <div className={cn(styles.corner, styles.cornerTr)} />
            <div className={cn(styles.corner, styles.cornerBl)} />
            <div className={cn(styles.corner, styles.cornerBr)} />

            <div className={styles.codeLabel}>Votre code Mamina</div>
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
            <div className={styles.codeHelper}>4 chiffres · donnés au comptoir</div>
          </div>

          <button className={styles.primaryButton} disabled={!allDigitsFilled} onClick={openProfileScreen} type="button">
            <span>Ouvrir ma carte</span>
            <span className={styles.arrow}>→</span>
          </button>

          <button className={styles.secondaryButton} onClick={openDemoCard} type="button">
            Voir une carte d&apos;exemple
          </button>

          <div className={styles.entryFooter}>
            Une carte simple pour revenir, goûter, découvrir.
            <br />
            <em>Pas une réduction. Un rythme.</em>
          </div>
        </section>

        <section className={cn(styles.screen, screen === "profile" && styles.screenActive)}>
          <div className={styles.profileHeader}>
            <div className={styles.profileKicker}>Un dernier geste</div>
            <h2 className={styles.profileTitle}>
              On vous sert <em>mieux</em>.
            </h2>
            <p className={styles.profileSub}>Quelques préférences pour orienter les prochaines découvertes. Rien n&apos;est obligatoire.</p>
          </div>

          <div className={styles.profileField}>
            <label className={styles.profileLabel}>Votre prénom (facultatif)</label>
            <input
              className={styles.profileInput}
              onChange={(event) => setName(event.target.value)}
              placeholder="Juste pour vous accueillir simplement"
              value={name}
            />
          </div>

          <div className={styles.profileField}>
            <label className={styles.profileLabel}>Votre moment Mamina</label>
            <div className={styles.chipsRow}>
              {MOMENT_CHIPS.map((item) => (
                <button
                  className={cn(styles.chip, moments.includes(item.key) && styles.chipActive)}
                  key={item.key}
                  onClick={() => setMoments((current) => toggleSelection(current, item.key))}
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
              {TASTE_CHIPS.map((item) => (
                <button
                  className={cn(styles.chip, tastes.includes(item.key) && styles.chipActive)}
                  key={item.key}
                  onClick={() => setTastes((current) => toggleSelection(current, item.key))}
                  type="button"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <button className={styles.primaryButton} onClick={() => setScreen("card")} type="button">
            <span>Continuer</span>
            <span className={styles.arrow}>→</span>
          </button>

          <div className={styles.profileSkip}>
            <button className={styles.profileSkipButton} onClick={() => setScreen("card")} type="button">
              Passer cette étape
            </button>
          </div>
        </section>

        <section className={cn(styles.screen, screen === "card" && styles.screenActive)}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHello}>
              {name.trim() ? (
                <>
                  Bonjour <em>{name.trim()}</em>, votre carte est prête.
                </>
              ) : (
                <>
                  Bonjour, <em>votre carte est prête</em>.
                </>
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
              <span>Cycle Mamina</span>
            </div>

            <div className={styles.cardWordmarkRow}>
              <div className={styles.cardWordmark}>MAMINA</div>
              <div className={styles.cardWordmarkSub}>Épicerie fine corse · Paris 8</div>
            </div>

            <div className={styles.cardPrize}>
              <div className={styles.cardPrizeLabel}>Votre avantage</div>
              <div className={styles.cardPrizeMain}>
                <em>1 sandwich offert</em> au 5e passage
              </div>
              <div className={styles.cardPrizeDetail}>+ un produit épicerie à découvrir pendant le cycle</div>
            </div>

            <div className={styles.cardProgress}>
              <div className={styles.progressHead}>
                <span className={styles.progressHeadLabel}>Progression</span>
                <span className={styles.progressHeadCount}>{progress.countLabel}</span>
              </div>
              <div className={styles.diamondsTrack}>
                {STEP_LABELS.map((label, index) => {
                  const isFilled = index < progress.completed
                  const isCurrent = index === progress.current
                  return (
                    <div className={cn(styles.diamond, isFilled && styles.diamondFilled, isCurrent && styles.diamondCurrent)} key={label}>
                      <div className={styles.diamondGlyph}>{isFilled || isCurrent ? "◆" : "◇"}</div>
                      <div className={styles.diamondName}>{label}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className={cn(styles.dailyPush, productDiscoveryActive && styles.dailyPushActive)}>
              <div className={styles.dailyPushLabel}>Produit du moment</div>
              <div className={styles.dailyPushTitle}>Canistrelli citron · à découvrir avec votre sandwich</div>
              <div className={styles.dailyPushDesc}>Une petite découverte épicerie accélère votre progression et change le passage du midi.</div>
              <button className={styles.dailyPushButton} onClick={handleProductDiscovery} type="button">
                {productDiscoveryActive ? "Ajouté à ma carte" : "Ajouter à ma carte"}
              </button>
            </div>

            <div className={styles.nextAction}>
              <div className={styles.nextActionLabel}>Votre prochaine étape</div>
              <div className={styles.nextActionText}>
                {progress.action.includes("dégustation") ? (
                  <>
                    Passez cette semaine pour accéder à la prochaine <em>dégustation</em>.
                  </>
                ) : progress.action.includes("découverte") ? (
                  <>
                    Votre prochain passage peut devenir une <em>découverte Mamina</em>.
                  </>
                ) : (
                  <>
                    Revenez <em>deux fois cette semaine</em> pour débloquer votre prochain avantage.
                  </>
                )}
              </div>
              <div className={styles.nextActionWhy}>{progress.reward}</div>
            </div>

            <div className={styles.visitsStrip}>
              <div className={styles.visitsItem}>
                <span className={styles.visitsLabel}>Passages</span>
                <span className={styles.visitsValue}>{visits}</span>
              </div>
              <div className={cn(styles.visitsItem, styles.visitsRight)}>
                <span className={styles.visitsLabel}>Découverte</span>
                <span className={styles.visitsNote}>{productDiscoveryActive ? "produit ajouté" : "à choisir"}</span>
              </div>
            </div>

            <div className={styles.cardFooterStripe}>
              <span>Dégustations</span>
              <em>débloquées dès Gourmet</em>
            </div>
          </article>

          <div className={styles.cardActions}>
            <button className={styles.actionTile} onClick={handleInvite} type="button">
              <div className={styles.actionMark}>+</div>
              <div className={styles.actionBody}>
                <div className={styles.actionTitle}>
                  Amener <em>un copain</em>
                </div>
                <div className={styles.actionDesc}>Vous avancez ensemble et il entre dans le cycle Mamina.</div>
              </div>
              <div className={styles.actionArrow}>→</div>
            </button>

            <button className={styles.actionTile} onClick={handlePresentAtCounter} type="button">
              <div className={styles.actionMark}>◆</div>
              <div className={styles.actionBody}>
                <div className={styles.actionTitle}>
                  Scanner <em>un passage</em>
                </div>
                <div className={styles.actionDesc}>Montrez la carte au comptoir. Votre visite compte tout de suite.</div>
              </div>
              <div className={styles.actionArrow}>→</div>
            </button>

            <button className={styles.actionTile} onClick={handleProductDiscovery} type="button">
              <div className={styles.actionMark}>◇</div>
              <div className={styles.actionBody}>
                <div className={styles.actionTitle}>
                  Découvrir <em>un produit</em>
                </div>
                <div className={styles.actionDesc}>Un produit épicerie du moment accélère votre progression.</div>
              </div>
              <div className={styles.actionArrow}>→</div>
            </button>

            <button className={styles.actionTile} onClick={handleTasting} type="button">
              <div className={styles.actionMark}>°</div>
              <div className={styles.actionBody}>
                <div className={styles.actionTitle}>
                  Accéder aux <em>dégustations</em>
                </div>
                <div className={styles.actionDesc}>Réservé aux membres Mamina · produits de saison à découvrir.</div>
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
                      <div className={styles.realFlowTitle}>Ouvrir l&apos;entrée client</div>
                      <div className={styles.realFlowDesc}>Le vrai flow scan Cardin, en mode Mamina.</div>
                    </div>
                    <div className={styles.actionArrow}>→</div>
                  </Link>
                  <Link className={styles.realFlowLink} href={staffValidateHref ?? "#"}>
                    <div>
                      <div className={styles.realFlowTitle}>Ouvrir l&apos;écran comptoir</div>
                      <div className={styles.realFlowDesc}>Le staff valide le passage ou l&apos;avantage.</div>
                    </div>
                    <div className={styles.actionArrow}>→</div>
                  </Link>
                </>
              ) : null}
              <Link className={styles.realFlowLink} href="/mamina/journal">
                <div>
                  <div className={styles.realFlowTitle}>Voir le journal Mamina</div>
                  <div className={styles.realFlowDesc}>Passages, retours, produits et dégustations du jour.</div>
                </div>
                <div className={styles.actionArrow}>→</div>
              </Link>
            </div>
          </div>

          <div className={styles.shopBlock}>
            <div className={styles.shopLabel}>Votre boutique</div>
            <div className={styles.shopName}>
              <em>MAMINA</em>
            </div>
            <div className={styles.shopAddress}>35 avenue de Friedland · Paris 8<br />Épicerie fine corse & sandwicherie</div>
          </div>

          <div className={styles.installHint}>
            Ajoutez la carte <em>à votre écran d&apos;accueil</em>
            <br />
            pour retrouver Mamina au prochain midi.
          </div>
        </section>
      </div>

      <div className={cn(styles.toast, toast && styles.toastVisible)}>{toast ?? "Passage enregistré"}</div>
    </div>
  )
}
