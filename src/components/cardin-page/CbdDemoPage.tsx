"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"

import { cn } from "@/lib/utils"

import styles from "./CbdDemoPage.module.css"

type Screen = "entry" | "profile" | "card"

const GOAL_CHIPS = [
  { key: "detente", label: "Détente" },
  { key: "sommeil", label: "Sommeil" },
  { key: "focus", label: "Focus" },
  { key: "recup", label: "Récupération" },
  { key: "curiosite", label: "Curiosité" },
] as const

const FORMAT_CHIPS = [
  { key: "huile", label: "Huile" },
  { key: "fleur", label: "Fleur" },
  { key: "infusion", label: "Infusion" },
  { key: "topique", label: "Topique" },
  { key: "guide", label: "Je veux être guidé" },
] as const

const LEVEL_CHIPS = [
  { key: "premier", label: "Premier essai" },
  { key: "occasionnel", label: "Occasionnel" },
  { key: "regulier", label: "Régulier" },
  { key: "connaisseur", label: "Connaisseur" },
] as const

const PALIER_STEPS = ["Premier", "Habitué", "Confidence", "Cercle"] as const

function toggleSelection(current: string[], key: string) {
  return current.includes(key) ? current.filter((item) => item !== key) : [...current, key]
}

function displayWord(value: string) {
  const clean = value.trim().replace(/\s+/g, " ")
  if (!clean) return "Tigre"
  return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase()
}

function resolveProgress(visits: number) {
  if (visits >= 8) {
    return {
      completed: 3,
      current: 3,
      countLabel: "3 sur 4",
      action: "Encore un passage pour rejoindre le Cercle.",
      reward: "Vous ouvrez une séance privée de curation avec accès au lot rare du mois.",
    }
  }

  if (visits >= 5) {
    return {
      completed: 2,
      current: 2,
      countLabel: "2 sur 4",
      action: "Transmettez une carte à quelqu'un de confiance pour débloquer Confidence.",
      reward: "Vous recevez tous les deux une sélection guidée hors vitrine.",
    }
  }

  return {
    completed: 1,
    current: 1,
    countLabel: "1 sur 4",
    action: "Repassez une fois ce mois pour débloquer Habitué.",
    reward: "Vous gagnerez une infusion offerte au choix du commerçant.",
  }
}

export function CbdDemoPage({ merchantId }: { merchantId?: string | null }) {
  const router = useRouter()
  const [screen, setScreen] = useState<Screen>("entry")
  const [word, setWord] = useState("")
  const [birthdateOpen, setBirthdateOpen] = useState(false)
  const [birthDay, setBirthDay] = useState("")
  const [birthMonth, setBirthMonth] = useState("")
  const [birthYear, setBirthYear] = useState("")
  const [goals, setGoals] = useState<string[]>([])
  const [formats, setFormats] = useState<string[]>([])
  const [levels, setLevels] = useState<string[]>([])
  const [cardWord, setCardWord] = useState("Tigre")
  const [cardIdLabel, setCardIdLabel] = useState("CBD BOUTIQUE · CARTE N° 0042")
  const [visits, setVisits] = useState(2)
  const [dropActive, setDropActive] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const wordInputRef = useRef<HTMLInputElement | null>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const canEnter = word.trim().length >= 2
  const progress = useMemo(() => resolveProgress(visits), [visits])
  const realScanHref = merchantId ? `/scan/${merchantId}?demo=1&vertical=cbd` : null
  const staffValidateHref = merchantId ? `/merchant/${merchantId}/valider?demo=1` : null

  useEffect(() => {
    if (screen !== "entry") return
    const timer = window.setTimeout(() => wordInputRef.current?.focus(), 320)
    return () => window.clearTimeout(timer)
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

  function openProfileScreen() {
    const nextWord = displayWord(word)
    setCardWord(nextWord)
    setCardIdLabel(`CBD BOUTIQUE · CARTE N° ${Math.floor(Math.random() * 9000 + 1000)}`)
    setScreen("profile")
  }

  function openDemoCard() {
    setCardWord("Tigre")
    setCardIdLabel("CBD BOUTIQUE · DÉMO")
    setScreen("card")
  }

  function continueToCard() {
    setScreen("card")
  }

  function handlePresentWord() {
    if (staffValidateHref) {
      router.push(staffValidateHref)
      return
    }

    showToast("Le commerçant vous attend.")
  }

  function handleDrop() {
    if (dropActive) {
      showToast("Drop déjà réservé.")
      return
    }

    setDropActive(true)
    setVisits((current) => current + 1)
    showToast("Drop du mois · 14 places restantes")
  }

  function handleInvite() {
    showToast("Carte transmise en privé.")
  }

  return (
    <div className={styles.shell}>
      <div className={styles.app}>
        <header className={styles.topBar}>
          <div className={styles.brandMark}>
            <span className={styles.brandPlace}>CBD BOUTIQUE</span>
            <span className={styles.brandSep}>·</span>
            <span className={styles.brandCardin}>CARDIN</span>
          </div>
          <div className={styles.topStatus}>
            <span className={styles.topStatusDot} />
            <span>Cycle discret</span>
          </div>
        </header>

        <section className={cn(styles.screen, screen === "entry" && styles.screenActive)}>
          <div className={styles.entryHeader}>
            <div className={styles.entryCoucou}>Bienvenue.</div>
            <div className={styles.entryKicker}>Votre carte · Le Mot</div>
            <h1 className={styles.entryTitle}>
              Choisissez <em>un mot</em>.
              <br />
              C&apos;est tout ce qu&apos;il vous faut.
            </h1>
            <p className={styles.entrySub}>
              Pas de nom. Pas de numéro. Juste un mot que vous prononcerez en boutique pour qu&apos;on vous reconnaisse.
            </p>
          </div>

          <div className={styles.wordBlock}>
            <div className={cn(styles.corner, styles.cornerTl)} />
            <div className={cn(styles.corner, styles.cornerTr)} />
            <div className={cn(styles.corner, styles.cornerBl)} />
            <div className={cn(styles.corner, styles.cornerBr)} />

            <label className={styles.wordLabel} htmlFor="cbd-word">
              Votre mot de passage
            </label>
            <input
              autoCapitalize="words"
              autoComplete="off"
              className={styles.wordInput}
              id="cbd-word"
              maxLength={20}
              onChange={(event) => setWord(event.target.value)}
              placeholder="ex. Tigre, Arsène, Lune"
              ref={wordInputRef}
              value={word}
            />
            <div className={styles.wordHelper}>
              Choisissez bien. Vous le direz à voix basse à chaque passage. <em>C&apos;est votre signe.</em>
            </div>
          </div>

          <div className={styles.birthBlock}>
            <div className={styles.birthRow}>
              <div>
                <div className={styles.birthTitle}>
                  Ajouter votre <em>date de naissance</em>
                </div>
                <div className={styles.birthSub}>Optionnel · utile pour l&apos;anniversaire et le contrôle de majorité.</div>
              </div>
              <button
                aria-pressed={birthdateOpen}
                className={cn(styles.birthToggle, birthdateOpen && styles.birthToggleOn)}
                onClick={() => setBirthdateOpen((current) => !current)}
                type="button"
              />
            </div>

            <div className={cn(styles.birthFields, birthdateOpen && styles.birthFieldsShown)}>
              <input
                className={styles.birthInput}
                inputMode="numeric"
                maxLength={2}
                onChange={(event) => setBirthDay(event.target.value.replace(/\D/g, "").slice(0, 2))}
                placeholder="JJ"
                value={birthDay}
              />
              <input
                className={styles.birthInput}
                inputMode="numeric"
                maxLength={2}
                onChange={(event) => setBirthMonth(event.target.value.replace(/\D/g, "").slice(0, 2))}
                placeholder="MM"
                value={birthMonth}
              />
              <input
                className={styles.birthInput}
                inputMode="numeric"
                maxLength={4}
                onChange={(event) => setBirthYear(event.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="AAAA"
                value={birthYear}
              />
            </div>
          </div>

          <button className={styles.primaryButton} disabled={!canEnter} onClick={openProfileScreen} type="button">
            <span>Entrer dans le cycle</span>
            <span className={styles.arrow}>→</span>
          </button>

          <button className={styles.secondaryButton} onClick={openDemoCard} type="button">
            Voir une carte d&apos;exemple
          </button>

          <div className={styles.entryFooter}>
            Aucun mail. Aucun téléphone. Aucun nom.
            <br />
            <em>Votre passage reste votre passage.</em>
          </div>
        </section>

        <section className={cn(styles.screen, screen === "profile" && styles.screenActive)}>
          <div className={styles.profileHeader}>
            <div className={styles.profileKicker}>Étape 2 · facultative</div>
            <h2 className={styles.profileTitle}>
              Pour vous <em>orienter</em>, quelques préférences.
            </h2>
            <p className={styles.profileSub}>
              Le commerçant voit ces préférences quand vous donnez votre mot. Rien de plus.
            </p>
          </div>

          <div className={styles.profileField}>
            <label className={styles.profileLabel}>Ce que vous cherchez</label>
            <div className={styles.chipsRow}>
              {GOAL_CHIPS.map((item) => (
                <button
                  className={cn(styles.chip, goals.includes(item.key) && styles.chipActive)}
                  key={item.key}
                  onClick={() => setGoals((current) => toggleSelection(current, item.key))}
                  type="button"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.profileField}>
            <label className={styles.profileLabel}>Format préféré</label>
            <div className={styles.chipsRow}>
              {FORMAT_CHIPS.map((item) => (
                <button
                  className={cn(styles.chip, formats.includes(item.key) && styles.chipActive)}
                  key={item.key}
                  onClick={() => setFormats((current) => toggleSelection(current, item.key))}
                  type="button"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.profileField}>
            <label className={styles.profileLabel}>Votre rapport au produit</label>
            <div className={styles.chipsRow}>
              {LEVEL_CHIPS.map((item) => (
                <button
                  className={cn(styles.chip, levels.includes(item.key) && styles.chipActive)}
                  key={item.key}
                  onClick={() => setLevels((current) => toggleSelection(current, item.key))}
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
              Bonjour <em>{cardWord}</em>, vous êtes ici.
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
              <span>Cycle en cours</span>
            </div>

            <div className={styles.cardWordmarkRow}>
              <div className={styles.cardWordmark}>CARDIN</div>
              <div className={styles.cardWordmarkSub}>Cycle · Boutique CBD</div>
            </div>

            <div className={styles.cardPrize}>
              <div className={styles.cardPrizeLabel}>Votre Cercle</div>
              <div className={styles.cardPrizeMain}>
                Une <em>séance privée de curation</em>
              </div>
              <div className={styles.cardPrizeDetail}>avec accès au lot rare du mois</div>
            </div>

            <div className={styles.cardProgress}>
              <div className={styles.progressHead}>
                <span className={styles.progressHeadLabel}>Progression</span>
                <span className={styles.progressHeadCount}>{progress.countLabel}</span>
              </div>
              <div className={styles.paliersTrack}>
                {PALIER_STEPS.map((label, index) => {
                  const isFilled = index < progress.completed
                  const isCurrent = index === progress.current
                  return (
                    <div className={cn(styles.palier, isFilled && styles.palierFilled, isCurrent && styles.palierCurrent)} key={label}>
                      <div className={styles.palierGlyph}>{isFilled || isCurrent ? "❋" : "❀"}</div>
                      <div className={styles.palierName}>{label}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className={cn(styles.dropBlock, dropActive && styles.dropBlockActive)}>
              <div className={styles.dropLabel}>Drop discret · reçu</div>
              <div className={styles.dropTitle}>Lot rare du mois : 14 places restantes</div>
              <div className={styles.dropDesc}>
                Réservation privée, visible uniquement depuis la carte ou au comptoir après votre mot.
              </div>
              <button className={styles.dropButton} onClick={handleDrop} type="button">
                {dropActive ? "Réservé sur ma carte" : "Réserver ma place"}
              </button>
            </div>

            <div className={styles.nextAction}>
              <div className={styles.nextActionLabel}>Votre prochaine étape</div>
              <div className={styles.nextActionText}>
                {progress.action.includes("Habitué") ? (
                  <>
                    Repassez <em>une fois ce mois</em> pour débloquer <em>Habitué</em>.
                  </>
                ) : progress.action.includes("Confidence") ? (
                  <>
                    Transmettez <em>une carte</em> pour débloquer <em>Confidence</em>.
                  </>
                ) : (
                  <>
                    Encore <em>un passage</em> pour rejoindre <em>le Cercle</em>.
                  </>
                )}
              </div>
              <div className={styles.nextActionWhy}>{progress.reward}</div>
            </div>

            <div className={styles.visitsStrip}>
              <div className={styles.visitsItem}>
                <span className={styles.visitsLabel}>Passages · cycle</span>
                <span className={styles.visitsValue}>{visits}</span>
              </div>
              <div className={cn(styles.visitsItem, styles.visitsRight)}>
                <span className={styles.visitsLabel}>Dernier</span>
                <span className={styles.visitsNote}>il y a 11 jours</span>
              </div>
            </div>

            <div className={styles.cardFooterStripe}>
              <span>Historique</span>
              <em>gardé cycle après cycle</em>
            </div>
          </article>

          <div className={styles.cardActions}>
            <button className={styles.actionTile} onClick={handlePresentWord} type="button">
              <div className={styles.actionMark}>❋</div>
              <div className={styles.actionBody}>
                <div className={styles.actionTitle}>
                  Donner votre <em>mot</em> en boutique
                </div>
                <div className={styles.actionDesc}>Le commerçant vous reconnaît · pas de scan, pas d&apos;app à ouvrir.</div>
              </div>
              <div className={styles.actionArrow}>→</div>
            </button>

            <button className={styles.actionTile} onClick={handleDrop} type="button">
              <div className={styles.actionMark}>❀</div>
              <div className={styles.actionBody}>
                <div className={styles.actionTitle}>
                  Voir les <em>drops</em> du mois
                </div>
                <div className={styles.actionDesc}>Lots rares, prix membre, places limitées · réservés aux porteurs de carte.</div>
              </div>
              <div className={styles.actionArrow}>→</div>
            </button>

            <button className={styles.actionTile} onClick={handleInvite} type="button">
              <div className={styles.actionMark}>+</div>
              <div className={styles.actionBody}>
                <div className={styles.actionTitle}>
                  Transmettre <em>une carte</em>
                </div>
                <div className={styles.actionDesc}>Vous parrainez quelqu&apos;un · vous débloquez Confidence ensemble.</div>
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
                      <div className={styles.realFlowDesc}>Le vrai flow scan Cardin, en mode démo discret.</div>
                    </div>
                    <div className={styles.actionArrow}>→</div>
                  </Link>
                  <Link className={styles.realFlowLink} href={staffValidateHref ?? "#"}>
                    <div>
                      <div className={styles.realFlowTitle}>Ouvrir l&apos;écran comptoir</div>
                      <div className={styles.realFlowDesc}>Le staff retrouve la carte par le mot et valide la visite.</div>
                    </div>
                    <div className={styles.actionArrow}>→</div>
                  </Link>
                </>
              ) : null}
              <Link className={styles.realFlowLink} href="/cbd/journal">
                <div>
                  <div className={styles.realFlowTitle}>Voir le journal CBD</div>
                  <div className={styles.realFlowDesc}>La boutique lit les retours, les drops et les mots reconnus.</div>
                </div>
                <div className={styles.actionArrow}>→</div>
              </Link>
            </div>
          </div>

          <div className={styles.shopBlock}>
            <div className={styles.shopLabel}>Votre boutique</div>
            <div className={styles.shopName}>
              <em>CBD Boutique</em> · Paris
            </div>
            <div className={styles.shopAddress}>Carte anonyme · conseil privé · cycle de 90 jours</div>
          </div>

          <div className={styles.installHint}>
            Ajoutez votre carte <em>à votre écran d&apos;accueil</em>
            <br />
            pour la retrouver d&apos;un geste, sans application.
          </div>
        </section>
      </div>

      <div className={cn(styles.toast, toast && styles.toastVisible)}>{toast ?? "Enregistré"}</div>
    </div>
  )
}
