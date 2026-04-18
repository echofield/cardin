"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"

type Particle = {
  x: string
  y: string
  delay: number
  duration: number
}

const DEFAULT_PARTICLES: Particle[] = [
  { x: "8%", y: "18%", delay: 0.1, duration: 9.8 },
  { x: "16%", y: "72%", delay: 1.3, duration: 8.4 },
  { x: "22%", y: "44%", delay: 2.2, duration: 11.1 },
  { x: "29%", y: "14%", delay: 0.8, duration: 10.5 },
  { x: "36%", y: "66%", delay: 3.1, duration: 9.2 },
  { x: "43%", y: "24%", delay: 1.8, duration: 12.2 },
  { x: "58%", y: "36%", delay: 0.4, duration: 10.8 },
  { x: "71%", y: "58%", delay: 1.4, duration: 9.9 },
  { x: "85%", y: "74%", delay: 2.4, duration: 8.6 },
]

export function ParcoursParticles() {
  const rootRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const particles = Array.from(root.querySelectorAll<HTMLElement>("[data-particle]"))
    const animations = particles.map((particle, index) =>
      gsap.to(particle, {
        y: -30 - (index % 5) * 8,
        x: index % 2 === 0 ? 12 : -10,
        opacity: 0.24,
        duration: DEFAULT_PARTICLES[index]?.duration ?? 10,
        delay: DEFAULT_PARTICLES[index]?.delay ?? 0,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      }),
    )

    return () => {
      animations.forEach((animation) => animation.kill())
    }
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-[1] opacity-35" ref={rootRef}>
      {DEFAULT_PARTICLES.map((particle) => (
        <span
          className="absolute h-[2px] w-[2px] rounded-full bg-[#b8956a] opacity-0"
          data-particle
          key={`${particle.x}-${particle.y}`}
          style={{ left: particle.x, top: particle.y }}
        />
      ))}
    </div>
  )
}
