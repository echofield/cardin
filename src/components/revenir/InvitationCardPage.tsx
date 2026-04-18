"use client"

import QRCode from "qrcode"
import { useEffect, useMemo, useRef, useState } from "react"

export function InvitationCardPage({ initialUrl }: { initialUrl?: string | null }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [urlValue, setUrlValue] = useState("")
  const [ready, setReady] = useState(false)

  const defaultUrl = useMemo(() => {
    if (typeof window === "undefined") return "https://getcardin.com/revenir?source=carte"
    return `${window.location.origin}/revenir?source=carte`
  }, [])

  useEffect(() => {
    setUrlValue(initialUrl?.trim() || defaultUrl)
    setReady(true)
  }, [defaultUrl, initialUrl])

  useEffect(() => {
    let active = true

    async function renderQr() {
      if (!ready || !canvasRef.current || !urlValue.trim()) return

      try {
        await QRCode.toCanvas(canvasRef.current, urlValue.trim(), {
          width: 280,
          margin: 0,
          errorCorrectionLevel: "H",
          color: {
            dark: "#1a2a22",
            light: "#ffffff",
          },
        })
      } catch {
        if (active && canvasRef.current) {
          const context = canvasRef.current.getContext("2d")
          context?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        }
      }
    }

    void renderQr()

    return () => {
      active = false
    }
  }, [ready, urlValue])

  return (
    <main className="min-h-dvh bg-[#e5e0d4] text-[#1a2a22] print:bg-white">
      <style>{`
        @page {
          size: A5 portrait;
          margin: 0;
        }
      `}</style>
      <div className="fixed right-5 top-5 z-20 flex w-[260px] flex-col gap-3 rounded border border-[#d4cdbd] bg-[#f2ede4] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.08)] print:hidden">
        <label className="block">
          <span className="mb-2 block text-[10px] uppercase tracking-[0.14em] text-[#8a8578]">URL du QR code</span>
          <input
            className="w-full rounded-[2px] border border-[#d4cdbd] bg-[#f2ede4] px-3 py-2 text-[13px] text-[#1a2a22] outline-none focus:border-[#0f3d2e]"
            onChange={(event) => setUrlValue(event.target.value)}
            value={urlValue}
          />
        </label>
        <button
          className="rounded-[2px] border border-[#0f3d2e] bg-[#0f3d2e] px-4 py-2.5 text-[11px] uppercase tracking-[0.15em] text-[#f2ede4] transition hover:border-[#1a2a22] hover:bg-[#1a2a22]"
          onClick={() => window.print()}
          type="button"
        >
          Imprimer · PDF
        </button>
        <p className="text-[10px] leading-[1.4] text-[#8a8578]">
          Format A5 · 148 × 210 mm. Imprimer en portrait sans marges pour un rendu fidèle.
        </p>
      </div>

      <div className="flex min-h-dvh items-center justify-center px-5 py-10 print:block print:min-h-0 print:p-0">
        <article className="relative flex h-[210mm] w-[148mm] flex-col overflow-hidden bg-[#f2ede4] px-[20mm] py-[22mm] shadow-[0_20px_60px_rgba(0,0,0,0.12)] print:shadow-none">
          <span className="pointer-events-none absolute right-[-50mm] top-[-50mm] h-[120mm] w-[120mm] rounded-full bg-[radial-gradient(circle,rgba(184,149,106,0.08),transparent_70%)]" />
          <span className="pointer-events-none absolute bottom-[-30mm] left-[-30mm] h-[100mm] w-[100mm] rounded-full bg-[radial-gradient(circle,rgba(15,61,46,0.04),transparent_70%)]" />

          <div className="relative z-[1] text-center">
            <div className="font-serif text-[28pt] font-medium tracking-[0.32em] text-[#1a2a22]">CARDIN</div>
            <div className="mt-[2mm] text-[8pt] uppercase tracking-[0.25em] text-[#8a8578]">par Symi</div>
          </div>

          <div className="relative z-[1] mb-[18mm] mt-[22mm] flex items-center justify-center gap-3">
            <span className="h-px w-[24mm] bg-[#b8956a] opacity-55" />
            <span className="font-serif text-[16pt] text-[#b8956a]">◇</span>
            <span className="h-px w-[24mm] bg-[#b8956a] opacity-55" />
          </div>

          <h1 className="relative z-[1] text-center font-serif text-[28pt] leading-[1.1] tracking-[-0.01em] text-[#1a2a22]">
            Revenez à
            <br />
            <em className="italic text-[#0f3d2e]">votre saison.</em>
          </h1>

          <p className="relative z-[1] mx-auto mb-[14mm] mt-[10mm] max-w-[110mm] text-center font-serif text-[12pt] italic leading-[1.55] text-[#3d4d43]">
            Si le moment n&apos;était pas le bon,
            <br />
            retrouvez votre lecture Cardin ici.
          </p>

          <div className="relative z-[1] flex flex-1 flex-col items-center justify-center gap-[6mm]">
            <div className="relative flex h-[62mm] w-[62mm] items-center justify-center border border-[#d4cdbd] bg-white p-[4mm]">
              <span className="absolute left-[-2mm] top-[-2mm] h-[8mm] w-[8mm] border-l border-t border-[#b8956a]" />
              <span className="absolute bottom-[-2mm] right-[-2mm] h-[8mm] w-[8mm] border-b border-r border-[#b8956a]" />
              <canvas className="h-full w-full" ref={canvasRef} />
            </div>
            <div className="text-center text-[9pt] uppercase tracking-[0.2em] text-[#8a8578]">Scannez pour continuer</div>
            <p className="text-center font-serif text-[10pt] italic leading-[1.4] text-[#3d4d43]">
              Laissez votre contact, reprenez la simulation
              <br />
              ou activez votre première saison.
            </p>
          </div>

          <footer className="relative z-[1] mt-auto border-t border-[#d4cdbd] pt-[8mm] text-center">
            <div className="flex items-center justify-center gap-2 text-[8pt] uppercase tracking-[0.22em] text-[#8a8578]">
              <span>Saison Cardin</span>
              <span className="h-[3px] w-[3px] rounded-full bg-[#8a8578]/50" />
              <span>90 jours</span>
              <span className="h-[3px] w-[3px] rounded-full bg-[#8a8578]/50" />
              <span>Activation sous 48 h</span>
            </div>
            <div className="mt-[2mm] font-serif text-[9pt] italic text-[#8a8578]">getcardin.com</div>
          </footer>
        </article>
      </div>
    </main>
  )
}
