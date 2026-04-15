"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

type ScannerState = 'idle' | 'starting' | 'scanning' | 'manual' | 'confirmed'
type DetectionResult = { rawValue?: string }
type BarcodeDetectorLike = { detect: (source: ImageBitmapSource) => Promise<DetectionResult[]> }

declare global {
  interface Window {
    BarcodeDetector?: new (options: { formats: string[] }) => BarcodeDetectorLike
  }
}

type RecentValidation = {
  id: string
  name: string
  initials: string
  lastVisit: string
  visits: number
}

export function DashboardScannerPanel({
  visitWord,
  validatedLabel,
  recentValidations,
}: {
  visitWord: string
  validatedLabel: string
  recentValidations: RecentValidation[]
}) {
  const [state, setState] = useState<ScannerState>('idle')
  const [note, setNote] = useState('')
  const [manualCode, setManualCode] = useState('')
  const [lastScan, setLastScan] = useState('')
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const detectorRef = useRef<BarcodeDetectorLike | null>(null)
  const frameRef = useRef<number | null>(null)
  const scanningRef = useRef(false)

  const scanLabel = useMemo(() => {
    if (!lastScan) return validatedLabel
    return lastScan.length > 42 ? `${lastScan.slice(0, 39)}...` : lastScan
  }, [lastScan, validatedLabel])

  const stopScanner = useCallback(() => {
    scanningRef.current = false
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    frameRef.current = null
    if (streamRef.current) streamRef.current.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.srcObject = null
    }
  }, [])

  const confirmScan = useCallback((value: string) => {
    stopScanner()
    setLastScan(value)
    setState('confirmed')
    setNote('QR détecté. Le passage client peut maintenant être validé au comptoir.')
  }, [stopScanner])

  useEffect(() => () => stopScanner(), [stopScanner])

  useEffect(() => {
    if (state !== 'scanning') return
    scanningRef.current = true
    const loop = async () => {
      const video = videoRef.current
      const detector = detectorRef.current
      if (!scanningRef.current || !video || !detector) return
      if (video.readyState >= 2) {
        try {
          const codes = await detector.detect(video)
          const value = codes[0]?.rawValue?.trim()
          if (value) {
            confirmScan(value)
            return
          }
        } catch {
          stopScanner()
          setState('manual')
          setNote('Lecture QR indisponible sur cet appareil. Utilisez la saisie manuelle.')
          return
        }
      }
      frameRef.current = requestAnimationFrame(loop)
    }
    frameRef.current = requestAnimationFrame(loop)
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    }
  }, [confirmScan, state, stopScanner])

  const startScanner = async () => {
    setNote('')
    if (!navigator.mediaDevices?.getUserMedia || !window.BarcodeDetector) {
      setState('manual')
      setNote('Caméra QR non disponible ici. Utilisez la saisie manuelle ou Chrome Android sur tablette.')
      return
    }
    try {
      setState('starting')
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false })
      streamRef.current = stream
      detectorRef.current = new window.BarcodeDetector({ formats: ['qr_code'] })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setState('scanning')
      setNote('Placez le QR client dans le cadre.')
    } catch {
      stopScanner()
      setState('manual')
      setNote('Accès caméra refusé ou bloqué. Utilisez la saisie manuelle.')
    }
  }

  const reset = () => {
    stopScanner()
    setState('idle')
    setNote('')
    setManualCode('')
  }

  return (
    <div style={{ backgroundColor: '#FFFDF8', borderRadius: '14px', padding: '16px 18px', marginBottom: '10px', border: '1px solid rgba(21,55,43,0.1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <div style={{ width: '24px', height: '24px', borderRadius: '6px', backgroundColor: 'rgba(21,55,43,0.08)', display: 'grid', placeItems: 'center', color: '#15372B', fontSize: '10px', fontWeight: 700 }}>QR</div>
        <span style={{ fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#15372B' }}>Validation comptoir</span>
      </div>
      <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: 'minmax(0,1.1fr) minmax(0,0.9fr)' }}>
        <div>
          {state === 'scanning' || state === 'starting' ? (
            <div style={{ borderRadius: '14px', overflow: 'hidden', backgroundColor: '#111714', position: 'relative', minHeight: '260px', border: '1px solid rgba(21,55,43,0.12)' }}>
              <video ref={videoRef} muted playsInline style={{ width: '100%', height: '260px', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: '20% 18%', border: '2px solid rgba(250,248,242,0.8)', borderRadius: '16px', boxShadow: '0 0 0 999px rgba(0,0,0,0.18)' }} />
              <div style={{ position: 'absolute', left: '18%', right: '18%', top: '50%', height: '2px', backgroundColor: '#4ADE80', boxShadow: '0 0 10px rgba(74,222,128,0.7)' }} />
            </div>
          ) : state === 'manual' ? (
            <div style={{ borderRadius: '14px', border: '1px solid rgba(21,55,43,0.12)', backgroundColor: '#F8FAF6', padding: '18px', minHeight: '260px' }}>
              <div style={{ fontSize: '0.75rem', color: '#173A2E', marginBottom: '8px' }}>Saisie manuelle</div>
              <div style={{ fontSize: '0.66rem', color: '#556159', lineHeight: 1.6, marginBottom: '14px' }}>Utilisez le code visible sur la carte client si la caméra n'est pas disponible sur la tablette.</div>
              <input value={manualCode} onChange={(e) => setManualCode(e.target.value)} placeholder="CARDIN-XXXX" style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(21,55,43,0.12)', backgroundColor: '#FFFDF8', color: '#173A2E', marginBottom: '10px', fontSize: '0.85rem', letterSpacing: '0.08em', textTransform: 'uppercase' }} />
              <button onClick={() => manualCode.trim().length >= 4 && confirmScan(manualCode.trim().toUpperCase())} style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: 'none', backgroundColor: '#173A2E', color: '#FAF8F2', cursor: 'pointer' }} type="button">Valider le code client</button>
            </div>
          ) : (
            <button onClick={startScanner} style={{ width: '100%', padding: '18px', borderRadius: '14px', border: '1px solid rgba(21,55,43,0.12)', backgroundColor: '#173A2E', color: '#FAF8F2', cursor: 'pointer', textAlign: 'left', minHeight: '260px' }} type="button">
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '14px', border: '1px solid rgba(250,248,242,0.16)', display: 'grid', placeItems: 'center', backgroundColor: 'rgba(250,248,242,0.04)', fontSize: '0.72rem', letterSpacing: '0.1em' }}>SCAN</div>
                  <div>
                    <div style={{ fontSize: '0.95rem', marginBottom: '4px' }}>Scanner le QR du client</div>
                    <div style={{ fontSize: '0.68rem', opacity: 0.6, lineHeight: 1.5 }}>Ouvre la caméra tablette, lit le QR et prépare la validation du passage.</div>
                  </div>
                </div>
                <div style={{ fontSize: '0.68rem', opacity: 0.68 }}>Sur Android Chrome, la lecture QR peut se faire directement en caméra.</div>
              </div>
            </button>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: '8px' }}>{['QR client', `1 ${visitWord} validé`, 'Impact instantané'].map((item) => <div key={item} style={{ borderRadius: '10px', backgroundColor: 'rgba(21,55,43,0.04)', padding: '10px 12px', fontSize: '0.62rem', color: '#556159', lineHeight: 1.5 }}>{item}</div>)}</div>
          <div style={{ borderRadius: '12px', backgroundColor: 'rgba(21,55,43,0.05)', border: '1px solid rgba(21,55,43,0.08)', padding: '12px 14px', minHeight: '98px' }}>
            <div style={{ fontSize: '0.62rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8A9389', marginBottom: '6px' }}>Dernière validation</div>
            <div style={{ fontSize: '0.84rem', color: '#173A2E', marginBottom: '3px' }}>{scanLabel}</div>
            <div style={{ fontSize: '0.68rem', color: '#556159' }}>{state === 'confirmed' ? note : `Le staff scanne, confirme le ${visitWord}, puis lit l'effet dans le tableau.`}</div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => { stopScanner(); setState('manual'); setNote('Saisissez le code visible sur la carte client.') }} style={{ flex: 1, padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(21,55,43,0.12)', backgroundColor: '#FFFDF8', color: '#173A2E', cursor: 'pointer' }} type="button">Code manuel</button>
            <button onClick={reset} style={{ flex: 1, padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(21,55,43,0.12)', backgroundColor: '#FFFDF8', color: '#173A2E', cursor: 'pointer' }} type="button">Réinitialiser</button>
          </div>
          {note ? <div style={{ fontSize: '0.64rem', color: '#8A9389', lineHeight: 1.6 }}>{note}</div> : null}
        </div>
      </div>
      <div style={{ marginTop: '12px' }}>
        <div style={{ fontSize: '0.62rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8A9389', marginBottom: '8px' }}>Validations récentes</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {recentValidations.map((client) => (
            <div key={client.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '6px', backgroundColor: 'rgba(21,55,43,0.08)', display: 'grid', placeItems: 'center', color: '#15372B', fontSize: '10px', fontWeight: 700 }}>{client.initials}</div>
                <div><div style={{ fontSize: '0.76rem', color: '#173A2E' }}>{client.name}</div><div style={{ fontSize: '0.62rem', color: '#8A9389' }}>{client.lastVisit}</div></div>
              </div>
              <div style={{ fontSize: '0.68rem', color: '#556159' }}>{visitWord} {client.visits}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}