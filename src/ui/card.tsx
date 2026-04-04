import * as React from "react"

import { cn } from "@/lib/utils"

type CardProps = React.HTMLAttributes<HTMLDivElement>

export function Card({ className, ...props }: CardProps) {
  return <div className={cn("rounded-3xl border border-[#DED9CF] bg-[#FFFDF8] shadow-[0_1px_0_rgba(27,67,50,0.03)]", className)} {...props} />
}
