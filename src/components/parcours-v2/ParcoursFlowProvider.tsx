"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import {
  DEFAULT_PARCOURS_FLOW_STATE,
  PARCOURS_STORAGE_KEY,
  type ParcoursFlowState,
  type ParcoursQueryState,
  isConfigurationComplete,
  isLectureComplete,
  parseLectureQuery,
  serializeLectureQuery,
} from "@/lib/parcours-v2"

type ParcoursFlowContextValue = {
  state: ParcoursFlowState
  setState: React.Dispatch<React.SetStateAction<ParcoursFlowState>>
  updateQueryState: (patch: Partial<ParcoursQueryState>) => void
  updateState: (patch: Partial<ParcoursFlowState>) => void
  resetFlow: () => void
  lectureComplete: boolean
  configurationComplete: boolean
  lectureQuery: string
}

const ParcoursFlowContext = createContext<ParcoursFlowContextValue | null>(null)

export function ParcoursFlowProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [state, setState] = useState<ParcoursFlowState | null>(null)
  const [rehydrated, setRehydrated] = useState(false)

  useEffect(() => {
    const queryState = parseLectureQuery(searchParams)
    const freshStart = searchParams.get("fresh") === "1"
    let storedState: Partial<ParcoursFlowState> = {}

    if (typeof window !== "undefined") {
      try {
        if (freshStart) {
          window.sessionStorage.removeItem(PARCOURS_STORAGE_KEY)
        } else {
          const raw = window.sessionStorage.getItem(PARCOURS_STORAGE_KEY)
          if (raw) {
            storedState = JSON.parse(raw) as Partial<ParcoursFlowState>
          }
        }
      } catch {
        storedState = {}
      }
    }

    const nextState = {
      ...DEFAULT_PARCOURS_FLOW_STATE,
      ...storedState,
      ...queryState,
    }

    setState(nextState)
    setRehydrated(true)
  }, [searchParams])

  useEffect(() => {
    if (!rehydrated || !state || typeof window === "undefined") return
    window.sessionStorage.setItem(PARCOURS_STORAGE_KEY, JSON.stringify(state))
  }, [rehydrated, state])

  const lectureComplete = state ? isLectureComplete(state) : false
  const configurationComplete = state ? isConfigurationComplete(state) : false
  const lectureQuery = state ? serializeLectureQuery(state) : ""

  useEffect(() => {
    if (!rehydrated || !state) return
    if (pathname.startsWith("/parcours/configuration") && !lectureComplete) {
      router.replace("/parcours/lecture")
      return
    }

    if ((pathname.startsWith("/parcours/impact") || pathname.startsWith("/parcours/offre")) && !configurationComplete) {
      router.replace(lectureComplete ? `/parcours/configuration${lectureQuery ? `?${lectureQuery}` : ""}` : "/parcours/lecture")
    }
  }, [configurationComplete, lectureComplete, lectureQuery, pathname, rehydrated, router, state])

  const value = useMemo<ParcoursFlowContextValue>(
    () => ({
      state: state ?? DEFAULT_PARCOURS_FLOW_STATE,
      setState: (next) => {
        setState((current) => {
          const base = current ?? DEFAULT_PARCOURS_FLOW_STATE
          return typeof next === "function" ? next(base) : next
        })
      },
      updateQueryState: (patch) => setState((current) => ({ ...(current ?? DEFAULT_PARCOURS_FLOW_STATE), ...patch })),
      updateState: (patch) => setState((current) => ({ ...(current ?? DEFAULT_PARCOURS_FLOW_STATE), ...patch })),
      resetFlow: () => setState(DEFAULT_PARCOURS_FLOW_STATE),
      lectureComplete,
      configurationComplete,
      lectureQuery,
    }),
    [configurationComplete, lectureComplete, lectureQuery, state],
  )

  if (!rehydrated || !state) {
    return null
  }

  return <ParcoursFlowContext.Provider value={value}>{children}</ParcoursFlowContext.Provider>
}

export function useParcoursFlow() {
  const context = useContext(ParcoursFlowContext)

  if (!context) {
    throw new Error("useParcoursFlow must be used inside ParcoursFlowProvider")
  }

  return context
}
