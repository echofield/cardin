import * as React from "react"

import { cn } from "@/lib/utils"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      className={cn(
        "flex h-11 w-full rounded-2xl border border-[#D8DBD2] bg-[#FFFDF8] px-3 py-2 text-sm text-[#132B22] placeholder:text-[#6A726B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#173A2E]",
        className
      )}
      ref={ref}
      type={type}
      {...props}
    />
  )
})

Input.displayName = "Input"

export { Input }
