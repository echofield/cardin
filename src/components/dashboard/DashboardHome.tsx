"use client"

import { motion } from 'framer-motion'

import { DashboardScannerPanel } from './DashboardScannerPanel'
import { useStore } from './store'

const fade = (i: number) => ({
  initial: { opacity: 0, y: 12 } as const,
  animate: { opacity: 1, y: 0 } as const,
  transition: { delay: 0.05 + i * 0.06, duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as const },
})

function MetricIcon({ label, tint = '#15372B', bg = 'rgba(21,55,43,0.08)' }: { label: string; tint?: string; bg?: string }) {
  return (
    <div
      style={{
        width: '24px',
        height: '24px',
        borderRadius: '6px',
        backgroundColor: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: tint,
        fontSize: '10px',
        fontWeight: 700,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        flexShrink: 0,
      }}
    >
      {label}
    </div>
  )
}

export function DashboardHome() {
  const { business, clients } = useStore()

  const active = clients.filter(c => c.level !== 'dormant').length
  const nearDiamond = clients.filter(c => c.visits >= 6 && c.visits < 8).length
  const nearSommet = clients.filter(c => c.visits === 7).length
  const returnsWeek = Math.round(active * 0.35)
  const avgTicket = business.avgTicket
  const revLow = Math.round(returnsWeek * avgTicket * 3.5)
  const revHigh = Math.round(returnsWeek * avgTicket * 5.2)
  const budgetUsed = 147
  const budgetTotal = 490
  const activationsToday = 3
  const dominoInvites = clients.filter(c => c.invitedBy).length
  const recentValidations = clients.filter(c => c.level !== 'dormant').slice(0, 3)

  return (
    <div style={{ padding: '20px', maxWidth: '720px', margin: '0 auto', backgroundColor: '#FAF8F2', minHeight: '100vh' }}>
      <div style={{ marginBottom: '16px' }}>
        <div
          style={{
            fontSize: '0.6rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#8A9389',
            marginBottom: '4px',
          }}
        >
          Vue marchand
        </div>
        <h1
          style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            color: '#15372B',
            marginBottom: '4px',
          }}
        >
          {business.label}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#4ADE80' }} />
          <span style={{ fontSize: '0.55rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#15372B' }}>
            Actif
          </span>
        </div>
      </div>

      <motion.div
        {...fade(0)}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
          marginBottom: '10px',
        }}
      >
        {[
          '1. Scanner le client',
          '2. Valider le passage',
          '3. Lire l’impact',
        ].map(step => (
          <div
            key={step}
            style={{
              borderRadius: '12px',
              padding: '10px 12px',
              backgroundColor: '#FFFDF8',
              border: '1px solid rgba(21,55,43,0.08)',
              fontSize: '0.62rem',
              lineHeight: 1.5,
              color: '#556159',
            }}
          >
            {step}
          </div>
        ))}
      </motion.div>

      <motion.div
        {...fade(1)}
        style={{
          backgroundColor: '#15372B',
          borderRadius: '14px',
          padding: '20px',
          marginBottom: '10px',
          color: '#FAF8F2',
        }}
      >
        <div style={{ fontSize: '0.5rem', letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.4, marginBottom: '4px' }}>
          Revenu récupéré ce mois
        </div>
        <div
          style={{
            fontFamily: 'var(--font-cormorant), serif',
            fontSize: 'clamp(1.5rem, 5vw, 2rem)',
            lineHeight: 1,
            marginBottom: '10px',
          }}
        >
          +{revLow.toLocaleString('fr-FR')}–{revHigh.toLocaleString('fr-FR')} EUR
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.6rem', opacity: 0.5 }}>Mois 1 / 3</div>
          <div style={{ width: '80px', height: '4px', borderRadius: '2px', backgroundColor: 'rgba(250,248,242,0.12)' }}>
            <div style={{ width: '33%', height: '100%', borderRadius: '2px', backgroundColor: 'rgba(250,248,242,0.5)' }} />
          </div>
        </div>
      </motion.div>

      <DashboardScannerPanel
        recentValidations={recentValidations}
        validatedLabel={`${recentValidations[0]?.name ?? 'Client'} · ${business.visitWord} ${recentValidations[0]?.visits ?? 1}`}
        visitWord={business.visitWord}
      />
      <motion.div
        {...fade(3)}
        style={{
          backgroundColor: '#FFFDF8',
          borderRadius: '14px',
          padding: '16px 18px',
          marginBottom: '10px',
          border: '1px solid rgba(21,55,43,0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <MetricIcon label="AC" />
          <span style={{ fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#15372B' }}>
            Activité en cours
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            {
              icon: <MetricIcon label="RT" />,
              text: `+${returnsWeek} clients revenus cette semaine`,
            },
            {
              icon: <MetricIcon label="ON" />,
              text: `+${activationsToday} activations déclenchées aujourd'hui`,
            },
            {
              icon: <MetricIcon label="DM" tint="#4A90E2" bg="rgba(74,144,226,0.08)" />,
              text: `${nearDiamond} client${nearDiamond > 1 ? 's' : ''} proche${nearDiamond > 1 ? 's' : ''} du Diamond`,
            },
            ...(dominoInvites > 0
              ? [
                  {
                    icon: <MetricIcon label="DO" tint="#4A90E2" bg="rgba(74,144,226,0.08)" />,
                    text: `${dominoInvites} invitation${dominoInvites > 1 ? 's' : ''} Domino en cours`,
                  },
                ]
              : []),
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {item.icon}
              <span style={{ fontSize: '0.75rem', color: '#3B4A42' }}>{item.text}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        {...fade(4)}
        style={{
          borderRadius: '14px',
          padding: '20px',
          marginBottom: '10px',
          background: 'linear-gradient(145deg, rgba(163,135,103,0.08) 0%, rgba(163,135,103,0.02) 100%)',
          border: '1px solid rgba(163,135,103,0.18)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <MetricIcon label="RS" tint="#C7A976" bg="rgba(199,169,118,0.1)" />
          <span style={{ fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#C7A976' }}>
            Récompense saison
          </span>
          <span
            style={{
              fontSize: '0.5rem',
              marginLeft: 'auto',
              padding: '2px 8px',
              borderRadius: '8px',
              backgroundColor: 'rgba(199,169,118,0.1)',
              color: '#C7A976',
              letterSpacing: '0.04em',
            }}
          >
            1 gagnant
          </span>
        </div>

        <div
          style={{
            fontFamily: 'var(--font-cormorant), serif',
            fontSize: '1.05rem',
            color: '#15372B',
            lineHeight: 1.3,
            marginBottom: '12px',
          }}
        >
          {business.seasonReward}
        </div>

        <div
          style={{
            padding: '12px 14px',
            borderRadius: '10px',
            backgroundColor: 'rgba(163,135,103,0.06)',
            border: '1px solid rgba(163,135,103,0.1)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div>
              <div style={{ fontSize: '0.55rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#8A9389', marginBottom: '2px' }}>
                Clients engagés
              </div>
              <div style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: '1.2rem', color: '#15372B' }}>
                {active}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.55rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#8A9389', marginBottom: '2px' }}>
                Proches du sommet
              </div>
              <div style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: '1.2rem', color: '#C7A976' }}>
                {nearSommet}
              </div>
            </div>
          </div>
          <div style={{ height: '4px', borderRadius: '2px', backgroundColor: 'rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((active / (clients.length || 1)) * 100, 100)}%` }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              style={{ height: '100%', borderRadius: '2px', backgroundColor: '#C7A976' }}
            />
          </div>
        </div>

        <div style={{ fontSize: '0.65rem', color: '#8A9389', marginTop: '10px', lineHeight: 1.5, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <MetricIcon label="DM" tint="#4A90E2" bg="rgba(74,144,226,0.08)" />
          <span>{business.diamondMeaning}</span>
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
        <motion.div {...fade(5)} style={{ backgroundColor: '#FFFDF8', borderRadius: '14px', padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <MetricIcon label="CL" />
            <span style={{ fontSize: '0.55rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#8A9389' }}>
              Clients actifs
            </span>
          </div>
          <div style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: '1.4rem', color: '#15372B', lineHeight: 1 }}>
            {active}
          </div>
          <div style={{ fontSize: '0.6rem', color: '#8A9389', marginTop: '3px' }}>en parcours</div>
        </motion.div>

        <motion.div {...fade(6)} style={{ backgroundColor: '#FFFDF8', borderRadius: '14px', padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <MetricIcon label="RT" />
            <span style={{ fontSize: '0.55rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#8A9389' }}>
              Retours
            </span>
          </div>
          <div style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: '1.4rem', color: '#15372B', lineHeight: 1 }}>
            {returnsWeek}
          </div>
          <div style={{ fontSize: '0.6rem', color: '#8A9389', marginTop: '3px' }}>cette semaine</div>
        </motion.div>
      </div>

      <motion.div {...fade(7)} style={{ backgroundColor: '#FFFDF8', borderRadius: '14px', padding: '16px 18px', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <MetricIcon label="MI" />
          <span style={{ fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A9389' }}>
            Missions actives
          </span>
          <span
            style={{
              fontSize: '0.5rem',
              marginLeft: 'auto',
              padding: '2px 8px',
              borderRadius: '8px',
              backgroundColor: 'rgba(21,55,43,0.08)',
              color: '#15372B',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
            }}
          >
            CA génère du cash
          </span>
        </div>
        {business.missionTemplates.map((m, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '9px 0',
              borderBottom: i < business.missionTemplates.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none',
            }}
          >
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '7px',
                backgroundColor: 'rgba(21,55,43,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#15372B',
                fontSize: '12px',
              }}
            >
              {m.icon === 'calendar' && 'CA'}
              {m.icon === 'clock' && 'HR'}
              {m.icon === 'cake' && 'BD'}
              {m.icon === 'users' && 'DO'}
              {m.icon === 'heart' && 'DU'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.75rem', color: '#3B4A42' }}>{m.label}</div>
              <div style={{ fontSize: '0.6rem', color: '#8A9389' }}>{m.detail}</div>
            </div>
          </div>
        ))}
      </motion.div>

      <motion.div {...fade(8)} style={{ backgroundColor: '#FFFDF8', borderRadius: '14px', padding: '16px 18px', marginBottom: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MetricIcon label="BG" tint="#C7A976" bg="rgba(199,169,118,0.1)" />
            <span style={{ fontSize: '0.6rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#8A9389' }}>
              Budget
            </span>
          </div>
          <span style={{ fontSize: '0.7rem', color: '#C7A976' }}>
            {budgetUsed} / {budgetTotal} EUR
          </span>
        </div>
        <div style={{ height: '5px', borderRadius: '3px', backgroundColor: 'rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(budgetUsed / budgetTotal) * 100}%` }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            style={{ height: '100%', borderRadius: '3px', backgroundColor: '#C7A976' }}
          />
        </div>
        <div style={{ fontSize: '0.6rem', color: '#8A9389', marginTop: '6px' }}>
          Arrêt automatique à 100%. Pas de dépassement possible.
        </div>
      </motion.div>

      <motion.div
        {...fade(9)}
        style={{
          borderRadius: '14px',
          padding: '14px 18px',
          backgroundColor: 'rgba(21,55,43,0.06)',
          border: '1px solid rgba(21,55,43,0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <MetricIcon label="PJ" />
          <span style={{ fontSize: '0.6rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#15372B' }}>
            Si activité maintenue
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div>
            <span style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: '1.1rem', color: '#15372B' }}>
              ~{Math.round((revLow + revHigh) / 2).toLocaleString('fr-FR')} EUR / mois
            </span>
          </div>
          <span style={{ fontSize: '0.65rem', color: '#15372B', opacity: 0.7 }}>
            {(Math.round(((revLow + revHigh) / 2) * 2.5 / 100) / 10).toFixed(1)}k EUR sur la saison
          </span>
        </div>
      </motion.div>
    </div>
  )
}