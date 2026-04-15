"use client"

import Link from 'next/link'

import { StoreProvider, useStore, type BusinessType } from '@/components/dashboard/store'
import { DashboardHome } from '@/components/dashboard/DashboardHome'

type SectorChip = {
  type: BusinessType
  label: string
  symbol: string
  tint: string
  bg: string
}

function SectorSelector() {
  const { business, setBusiness } = useStore()

  const sectors: SectorChip[] = [
    { type: 'cafe', label: 'Café', symbol: 'CF', tint: '#6E4B45', bg: 'rgba(110,75,69,0.08)' },
    { type: 'restaurant', label: 'Restaurant', symbol: 'RS', tint: '#8A6C4A', bg: 'rgba(138,108,74,0.08)' },
    { type: 'boulangerie', label: 'Boulangerie', symbol: 'BL', tint: '#B17838', bg: 'rgba(177,120,56,0.08)' },
    { type: 'coiffeur', label: 'Coiffeur', symbol: 'CO', tint: '#9B5B65', bg: 'rgba(155,91,101,0.08)' },
  ]

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        backgroundColor: 'rgba(250,248,242,0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
        padding: '12px 16px',
      }}
    >
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '0.55rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#8A9389',
                marginBottom: '2px',
              }}
            >
              Cardin — Démo
            </div>
            <div style={{ fontSize: '0.98rem', fontWeight: 600, color: '#15372B' }}>Vue marchand tablette</div>
          </div>
          <Link
            href="/landing"
            style={{
              fontSize: '0.65rem',
              padding: '6px 12px',
              borderRadius: '8px',
              backgroundColor: '#15372B',
              color: '#FAF8F2',
              textDecoration: 'none',
              letterSpacing: '0.04em',
            }}
          >
            Retour site
          </Link>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '8px',
          }}
        >
          {sectors.map(sector => {
            const active = business.type === sector.type
            return (
              <button
                key={sector.type}
                onClick={() => setBusiness(sector.type)}
                style={{
                  padding: '8px',
                  borderRadius: '12px',
                  border: active ? '2px solid #15372B' : '1px solid rgba(0,0,0,0.08)',
                  backgroundColor: active ? 'rgba(21,55,43,0.06)' : '#FFFDF8',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: '0.7rem',
                  color: active ? '#15372B' : '#6B766D',
                  fontWeight: active ? 600 : 400,
                }}
                type="button"
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    margin: '0 auto 6px',
                    borderRadius: '10px',
                    backgroundColor: sector.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: sector.tint,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  {sector.symbol}
                </div>
                {sector.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function DashboardContent() {
  return (
    <>
      <SectorSelector />
      <div style={{ paddingTop: '156px', paddingBottom: '36px' }}>
        <DashboardHome />
      </div>
    </>
  )
}

export default function DashboardDemoPage() {
  return (
    <StoreProvider>
      <DashboardContent />
    </StoreProvider>
  )
}