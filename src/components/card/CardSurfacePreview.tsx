"use client"

import Link from "next/link"
import QRCode from "qrcode"
import { useEffect, useMemo, useRef, useState } from "react"

import { Button, Card } from "@/ui"

import { WalletPassPreview } from "@/components/engine/WalletPassPreview"

type PreviewTab = "card" | "qr" | "install" | "process"

const TABS: Array<{ id: PreviewTab; label: string }> = [
  { id: "card", label: "Carte" },
  { id: "qr", label: "Mon QR" },
  { id: "install", label: "Installer" },
  { id: "process", label: "Démo" },
]

const PROCESS_STEPS = [
  "1. QR du lieu au comptoir",
  "2. La carte s'ouvre tout de suite",
  "3. Le client montre Mon QR",
  "4. Le staff scanne et valide",
  "5. La carte reste sur le téléphone",
]

function PreviewQr({ value }: { value: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    void QRCode.toCanvas(canvasRef.current, value, {
      margin: 2,
      width: 220,
      color: { dark: "#173A2E", light: "#FCFBF7" },
    })
  }, [value])

  return <canvas ref={canvasRef} />
}

export function CardSurfacePreview() {
  const [tab, setTab] = useState<PreviewTab>("card")
  const activeStep = useMemo(() => PROCESS_STEPS[2], [])

  return (
    <main className="min-h-dvh-safe bg-[radial-gradient(circle_at_top,rgba(15,61,46,0.08),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(209,177,124,0.14),transparent_30%),#F7F3EA] px-4 py-10 text-[#173A2E] sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <section className="space-y-6">
          <div className="space-y-4">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#8C6A44]">La Carte Cardin</p>
            <h1 className="max-w-3xl font-serif text-[clamp(3rem,8vw,5.4rem)] leading-[0.96]">
              La surface simple
              <br />
              devant le moteur.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-[#556159] sm:text-lg">
              Cette route montre exactement l'intention de la nouvelle couche client: une carte mobile lisible en 3 secondes,
              puis un reveal progressif vers la profondeur Cardin.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="p-5">
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#7B837D]">Ce qui est visible</p>
              <div className="mt-4 space-y-2 text-sm leading-6 text-[#173A2E]">
                <p>Nom du lieu</p>
                <p>Saison en cours</p>
                <p>Moment actif</p>
                <p>Progression</p>
                <p>Mon QR</p>
                <p>Installer la carte</p>
              </div>
            </Card>

            <Card className="p-5">
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#7B837D]">Ce qui reste derriere</p>
              <div className="mt-4 space-y-2 text-sm leading-6 text-[#173A2E]">
                <p>Diamond et sommet</p>
                <p>Mission eventuelle</p>
                <p>Etat saisonnier</p>
                <p>Reward detail</p>
                <p>Propagation</p>
                <p>Logique de retour</p>
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <div className="flex flex-wrap gap-2">
              {TABS.map((item) => (
                <button
                  key={item.id}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    tab === item.id
                      ? "border-[#173A2E] bg-[#173A2E] text-[#FBFAF6]"
                      : "border-[#D9D3C7] bg-[#FBFAF6] text-[#173A2E]"
                  }`}
                  onClick={() => setTab(item.id)}
                  type="button"
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="mt-6 rounded-[1.4rem] border border-[#E6DED1] bg-[#FBFAF6] p-5">
              {tab === "card" ? (
                <div className="space-y-3">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[#8C6A44]">Lecture immediate</p>
                  <p className="font-serif text-3xl leading-[1.05]">Mardi, un diner offert</p>
                  <p className="text-sm leading-6 text-[#556159]">
                    Le client n'a pas besoin de comprendre le moteur. Il comprend juste ce qui se passe ici et ce qu'il peut montrer.
                  </p>
                </div>
              ) : null}

              {tab === "qr" ? (
                <div className="space-y-3">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[#8C6A44]">Mode passage</p>
                  <p className="font-serif text-3xl leading-[1.05]">Mon QR devient l'identite client.</p>
                  <p className="text-sm leading-6 text-[#556159]">Le staff scanne, retrouve le passage, puis applique la validation Cardin existante.</p>
                </div>
              ) : null}

              {tab === "install" ? (
                <div className="space-y-3">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[#8C6A44]">Extension</p>
                  <p className="font-serif text-3xl leading-[1.05]">La carte s'installe, puis vit comme un pass.</p>
                  <p className="text-sm leading-6 text-[#556159]">La carte web reste vivante. L'écran d'accueil et le plein écran donnent la sensation wallet-like. Le natif vient seulement ensuite.</p>
                </div>
              ) : null}

              {tab === "process" ? (
                <div className="space-y-3">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[#8C6A44]">Demo terrain</p>
                  <p className="font-serif text-3xl leading-[1.05]">Une narration simple en 5 gestes.</p>
                  <div className="space-y-2 pt-2 text-sm leading-6 text-[#173A2E]">
                    {PROCESS_STEPS.map((step) => (
                      <p key={step}>{step}</p>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </Card>

          <div className="flex flex-wrap gap-3">
            <Link href="/commencer">
              <Button size="lg">Voir l'entree acquisition</Button>
            </Link>
            <Link href="/presentation">
              <Button size="lg" variant="secondary">
                Voir la presentation privee
              </Button>
            </Link>
          </div>
        </section>

        <section className="lg:sticky lg:top-10">
          <div className="mx-auto max-w-[390px] rounded-[2.2rem] border border-[#DDD7CA] bg-[#FDFBF6] p-3 shadow-[0_40px_120px_-50px_rgba(23,58,46,0.48)]">
            <div className="rounded-[1.8rem] border border-[#E7E0D3] bg-[linear-gradient(180deg,#FFFDF8_0%,#F8F4EC_100%)] p-4">
              {tab === "card" ? (
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.16em] text-[#7A847C]">Carte Cardin</p>
                      <p className="mt-2 font-serif text-[2.35rem] leading-[0.94]">Cafe Montmartre</p>
                      <p className="mt-2 text-sm text-[#556159]">Alix Martin</p>
                    </div>
                    <div className="rounded-full border border-[#D9D3C7] bg-[#FBFAF6] px-3 py-2 text-right">
                      <p className="text-[10px] uppercase tracking-[0.14em] text-[#7A847C]">Saison en cours</p>
                      <p className="mt-1 text-xs">47 jours</p>
                    </div>
                  </div>

                  <div className="rounded-[1.35rem] border border-[#E6DED1] bg-[#FFFEFB] px-4 py-4">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-[#8C6A44]">Cette semaine</p>
                    <p className="mt-2 font-serif text-[1.8rem] leading-[1.05]">Mardi, un diner offert</p>
                    <p className="mt-3 text-sm leading-6 text-[#556159]">Encore 1 passage et le palier visible bascule. Diamond en cours sur la saison.</p>
                  </div>

                  <div className="rounded-[1.35rem] border border-[#E6DED1] bg-[#FBFAF6] px-4 py-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-[10px] uppercase tracking-[0.16em] text-[#7B837D]">Progression</p>
                      <p className="text-sm text-[#8C6A44]">3 / 4</p>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {[1, 2, 3, 4].map((item) => (
                        <div
                          key={item}
                          className={`flex aspect-square items-center justify-center rounded-[1rem] border ${
                            item < 4 ? "border-[#D1B17C] bg-[rgba(209,177,124,0.12)] text-[#9C6E2B]" : "border-[#1B4332] bg-[rgba(27,67,50,0.06)] text-[#1B4332]"
                          }`}
                        >
                          <span className="font-serif text-base">{item < 4 ? "◆" : "◇"}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button className="w-full">Mon QR</Button>
                    <Button className="w-full" variant="secondary">
                      Installer la carte
                    </Button>
                  </div>

                  <button className="w-full rounded-[1rem] border border-[#E2DDD3] bg-[#FBFAF6] px-4 py-3 text-sm text-[#173A2E]" type="button">
                    Voir le detail
                  </button>
                </div>
              ) : null}

              {tab === "qr" ? (
                <div className="space-y-4 text-center">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-[#7B837D]">Mon QR</p>
                    <p className="mt-2 font-serif text-[2rem] leading-[1]">Cafe Montmartre</p>
                    <p className="mt-2 text-sm text-[#556159]">Le client montre ceci. Le staff scanne.</p>
                  </div>
                  <div className="flex min-h-[300px] items-center justify-center rounded-[1.4rem] border border-[#E6DED1] bg-[#FCFBF7]">
                    <PreviewQr value="CD-001024" />
                  </div>
                  <p className="font-mono text-sm tracking-[0.18em] text-[#173A2E]">CD-001024</p>
                </div>
              ) : null}

              {tab === "install" ? (
                <div className="space-y-4">
                  <WalletPassPreview
                    activeDots={3}
                    businessLabel="Cafe Montmartre"
                    caption="Carte web dynamique, installée comme un pass."
                    eyebrowLabel="Sur l'ecran d'accueil"
                    footerLabel="CARTE INSTALLEE"
                    progressDots={6}
                    rewardLabel="Mardi, un diner offert"
                    statusLabel="Installable"
                  />
                  <div className="grid gap-2">
                    <button className="rounded-[1rem] border border-[#173A2E] bg-[#173A2E] px-4 py-4 text-left text-sm text-[#FBFAF6]" type="button">
                      Installer maintenant
                    </button>
                    <button className="rounded-[1rem] border border-[#E2DDD3] bg-[#F7F3EA] px-4 py-4 text-left text-sm text-[#8A9389]" type="button">
                      Partager ou ajouter a l'ecran d'accueil
                    </button>
                  </div>
                </div>
              ) : null}

              {tab === "process" ? (
                <div className="space-y-4">
                  <div className="rounded-[1.35rem] border border-[#E6DED1] bg-[#FFFEFB] px-4 py-4">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-[#8C6A44]">Sequence demo</p>
                    <p className="mt-2 font-serif text-[1.7rem] leading-[1.05]">{activeStep}</p>
                    <p className="mt-3 text-sm leading-6 text-[#556159]">Ici, tu fais sentir la fluidite. Ensuite seulement tu reveles le moteur complet.</p>
                  </div>
                  <div className="space-y-2">
                    {PROCESS_STEPS.map((step, index) => (
                      <div
                        key={step}
                        className={`rounded-[1rem] border px-4 py-3 text-sm ${
                          index === 2 ? "border-[#173A2E] bg-[rgba(23,58,46,0.06)] text-[#173A2E]" : "border-[#E2DDD3] bg-[#FBFAF6] text-[#556159]"
                        }`}
                      >
                        {step}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
