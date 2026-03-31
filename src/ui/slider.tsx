import * as React from "react"

import { cn } from "@/lib/utils"

type SliderProps = {
  value: number
  min: number
  max: number
  step?: number
  onChange: (nextValue: number) => void
  className?: string
}

export function Slider({ value, min, max, step = 1, onChange, className }: SliderProps) {
  const progress = ((value - min) / (max - min)) * 100

  return (
    <div className={cn("space-y-2", className)}>
      <input
        className="h-2 w-full cursor-pointer appearance-none rounded-full border border-[#D8DBD2] bg-transparent accent-[#173A2E]"
        max={max}
        min={min}
        onChange={(event) => onChange(Number(event.target.value))}
        step={step}
        style={{
          background: `linear-gradient(to right, #173A2E ${progress}%, #E4E7DF ${progress}%)`,
        }}
        type="range"
        value={value}
      />
    </div>
  )
}
