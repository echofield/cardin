import * as React from "react"

import { cn } from "@/lib/utils"

type CardProps = React.HTMLAttributes<HTMLDivElement>

export function Card({ className, ...props }: CardProps) {
  return <div className={cn("rounded-3xl border border-[#D8DBD2] bg-[#FFFDF8]", className)} {...props} />
}
