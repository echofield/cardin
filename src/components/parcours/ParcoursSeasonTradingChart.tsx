"use client"

import { motion } from "framer-motion"

import type { ParcoursProjectionResult } from "@/lib/demo-content"

type Props = {
  projection: ParcoursProjectionResult
  seasonMonths: 3 | 6
  reveal: boolean
}

/**
 * TradingView-style: cumulative equity curve (area) + volume-style month candles (incremental revenue).
 */
export function ParcoursSeasonTradingChart({ projection, seasonMonths, reveal }: Props) {
  const w = 320
  const h = 148
  const pad = { t: 6, r: 10, b: 20, l: 10 }
  const cw = w - pad.l - pad.r
  const ch = h - pad.t - pad.b

  const splitY = pad.t + ch * 0.58
  const eqH = splitY - pad.t - 4
  const candleZoneH = pad.t + ch - splitY - 6

  const cum = projection.cumulativeByMonth
  const maxY = Math.max(...cum, 1)

  const linePoints = cum
    .map((v, i) => {
      const x = pad.l + (i / Math.max(1, seasonMonths - 1)) * cw
      const y = splitY - 2 - (v / maxY) * eqH
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(" ")

  const firstX = pad.l
  const lastX = pad.l + cw
  const areaPath = `${linePoints} L ${lastX} ${splitY - 2} L ${firstX} ${splitY - 2} Z`

  const candles = projection.candles
  const maxInc = Math.max(...candles.map((c) => c.high), 1)
  const slot = cw / seasonMonths
  const candleW = Math.min(22, slot - 6)

  return (
    <div className="relative w-full overflow-hidden rounded-xl" style={{ backgroundColor: "var(--cardin-card)", border: "1px solid var(--cardin-border)" }}>
      <div className="flex items-baseline justify-between px-3 pt-3">
        <p style={{ fontSize: "0.6rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--cardin-label)" }}>
          Courbe cumulee + flux mensuel
        </p>
        <span style={{ fontSize: "0.55rem", color: "var(--cardin-label-light)", fontFamily: "monospace" }}>
          max {maxY.toLocaleString("fr-FR")} EUR
        </span>
      </div>
      <svg className="mx-auto block" height={h} viewBox={`0 0 ${w} ${h}`} width="100%" style={{ maxWidth: 380 }}>
        <defs>
          <linearGradient id="parcoursEqFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#003D2C" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#003D2C" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((g) => (
          <line
            key={g}
            stroke="rgba(0,61,44,0.07)"
            strokeWidth={1}
            x1={pad.l}
            x2={pad.l + cw}
            y1={pad.t + eqH * (1 - g)}
            y2={pad.t + eqH * (1 - g)}
          />
        ))}
        <line stroke="rgba(0,61,44,0.12)" strokeWidth={1} x1={pad.l} x2={pad.l + cw} y1={splitY} y2={splitY} />
        <motion.path
          animate={{ opacity: reveal ? 1 : 0 }}
          d={areaPath}
          fill="url(#parcoursEqFill)"
          initial={{ opacity: 0 }}
          transition={{ duration: 0.45 }}
        />
        <motion.path
          animate={{ opacity: reveal ? 1 : 0 }}
          d={linePoints}
          fill="none"
          initial={{ opacity: 0 }}
          stroke="#003D2C"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          transition={{ duration: 0.45 }}
        />
        {candles.map((c, i) => {
          const cx = pad.l + i * slot + slot / 2
          const bullish = c.close >= c.open
          const zTop = splitY + 4
          const zBot = zTop + candleZoneH
          const y = (v: number) => zBot - (v / maxInc) * candleZoneH
          const yHi = y(c.high)
          const yLo = y(c.low)
          const yT = y(Math.max(c.open, c.close))
          const yB = y(Math.min(c.open, c.close))
          const bodyH = Math.max(2, yB - yT)
          return (
            <motion.g
              key={c.month}
              animate={{ opacity: reveal ? 1 : 0 }}
              initial={{ opacity: 0 }}
              transition={{ delay: 0.15 + i * 0.07 }}
            >
              <line
                stroke={bullish ? "rgba(0,61,44,0.5)" : "rgba(128,164,214,0.75)"}
                strokeWidth={1}
                x1={cx}
                x2={cx}
                y1={yHi}
                y2={yLo}
              />
              <rect
                fill={bullish ? "#003D2C" : "#80A4D6"}
                height={bodyH}
                rx={1}
                width={candleW}
                x={cx - candleW / 2}
                y={yT}
              />
            </motion.g>
          )
        })}
        {Array.from({ length: seasonMonths }, (_, i) => (
          <text
            key={`lbl-${i}`}
            fill="var(--cardin-label)"
            fontFamily="ui-monospace, monospace"
            fontSize={9}
            textAnchor="middle"
            x={pad.l + i * slot + slot / 2}
            y={h - 5}
          >
            M{i + 1}
          </text>
        ))}
      </svg>
    </div>
  )
}
