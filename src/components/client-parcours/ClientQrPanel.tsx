"use client"

import QRCode from "qrcode"
import { useEffect, useRef } from "react"

type Props = {
  clientId: string
  onClose: () => void
}

export function ClientQrPanel({ clientId, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const scanUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/scan/demo?client=${clientId}&demo=1`
      : `/scan/demo?client=${clientId}&demo=1`

  useEffect(() => {
    if (!canvasRef.current) return
    QRCode.toCanvas(canvasRef.current, scanUrl, {
      margin: 2,
      width: 280,
      color: { dark: "#173A2E", light: "#FDFCF8" },
    })
  }, [scanUrl])

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#18271F]/60 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Panel — stop propagation so clicking inside doesn't close */}
      <div
        className="relative mx-4 w-full max-w-xs rounded-[1.8rem] bg-[#FDFCF8] p-8 shadow-[0_40px_100px_-30px_rgba(23,58,46,0.45)]"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-[10px] uppercase tracking-[0.22em] text-[#69736C]">Parcours client</p>
        <p className="mt-2 font-serif text-xl text-[#173A2E]">Votre QR de passage</p>
        <p className="mt-1 text-xs leading-5 text-[#6B766D]">
          Présentez ce QR au staff. Le scan valide le passage des deux côtés.
        </p>

        {/* QR canvas */}
        <div className="mt-6 flex items-center justify-center rounded-[1.2rem] border border-[#E2DDD1] bg-[#FDFCF8] p-4">
          <canvas ref={canvasRef} />
        </div>

        {/* Client ID hint — subtle, helps for demo debugging */}
        <p className="mt-3 text-center font-mono text-[9px] text-[#B0BAB4]">{clientId.slice(0, 8)}…</p>

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-2">
          <button
            className="inline-flex h-11 w-full items-center justify-center rounded-full border border-[#173A2E] bg-[#173A2E] px-5 text-sm font-medium text-[#FBFAF6] transition hover:bg-[#24533F]"
            onClick={() => window.print()}
            type="button"
          >
            Imprimer ce QR
          </button>
          <button
            className="inline-flex h-11 w-full items-center justify-center rounded-full border border-[#DAD4C7] px-5 text-sm text-[#556159] transition hover:border-[#B9C4B8]"
            onClick={onClose}
            type="button"
          >
            Fermer
          </button>
        </div>
      </div>

      {/* Print-only styles — only canvas + ID visible when printing */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          .cardin-print-qr { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
