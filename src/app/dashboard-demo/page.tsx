"use client"

import { useState } from 'react'
import Link from 'next/link'
import { StoreProvider, useStore, type BusinessType } from '@/components/dashboard/store'
import { DashboardHome } from '@/components/dashboard/DashboardHome'

function SectorSelector() {
  const { business, setBusiness } = useStore()

  const sectors: { type: BusinessType; label: string; emoji: string }[] = [
    { type: 'cafe', label: 'Café', emoji: '☕' },
    { type: 'restaurant', label: 'Restaurant', emoji: '🍽️' },
    { type: 'boulangerie', label: 'Boulangerie', emoji: '🥖' },
    { type: 'coiffeur', label: 'Coiffeur', emoji: '✂️' },
  ]

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      backgroundColor: 'rgba(250,248,242,0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(0,0,0,0.05)',
      padding: '12px 20px',
    }}>
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
        }}>
          <div>
            <div style={{
              fontSize: '0.55rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#8A9389',
              marginBottom: '2px',
            }}>
              Cardin — Démo
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#15372B' }}>
              Votre tableau de bord
            </div>
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
            Commencer
          </Link>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px',
        }}>
          {sectors.map(sector => (
            <button
              key={sector.type}
              onClick={() => setBusiness(sector.type)}
              style={{
                padding: '8px',
                borderRadius: '10px',
                border: business.type === sector.type ? '2px solid #15372B' : '1px solid rgba(0,0,0,0.08)',
                backgroundColor: business.type === sector.type ? 'rgba(21,55,43,0.06)' : '#FFFDF8',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontSize: '0.7rem',
                color: business.type === sector.type ? '#15372B' : '#6B766D',
                fontWeight: business.type === sector.type ? 600 : 400,
              }}
            >
              <div style={{ fontSize: '1.2rem', marginBottom: '2px' }}>{sector.emoji}</div>
              {sector.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function DashboardContent() {
  return (
    <>
      <SectorSelector />
      <div style={{ paddingTop: '140px' }}>
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
