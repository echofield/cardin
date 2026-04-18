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
  const [state, setState] = useState<ParcoursFlowState>(DEFAULT_PARCOURS_FLOW_STATE)
  const [rehydrated, setRehydrated] = useState(false)

  useEffect(() => {
    const queryState = parseLectureQuery(searchParams)
    let storedState: Partial<ParcoursFlowState> = {}

    if (typeof window !== "undefined") {
      try {
        const raw = window.sessionStorage.getItem(PARCOURS_STORAGE_KEY)
        if (raw) {
          storedState = JSON.parse(raw) as Partial<ParcoursFlowState>
        }
      } catch {
        storedState = {}
      }
    }

    setState({
      ...DEFAULT_PARCOURS_FLOW_STATE,
      ...storedState,
      ...queryState,
    })
    setRehydrated(true)
  }, [searchParams])

  useEffect(() => {
    if (!rehydrated || typeof window === "undefined") return
    window.sessionStorage.setItem(PARCOURS_STORAGE_KEY, JSON.stringify(state))
  }, [rehydrated, state])

  const lectureComplete = isLectureComplete(state)
  const configurationComplete = isConfigurationComplete(state)
  const lectureQuery = serializeLectureQuery(state)

  useEffect(() => {
    if (!rehydrated) return
    if (pathname.startsWith("/parcours/configuration") && !lectureComplete) {
      router.replace("/parcours/lecture")
      return
    }

    if ((pathname.startsWith("/parcours/impact") || pathname.startsWith("/parcours/offre")) && !configurationComplete) {
      router.replace(lectureComplete ? `/parcours/configuration${lectureQuery ? `?${lectureQuery}` : ""}` : "/parcours/lecture")
    }
  }, [configurationComplete, lectureComplete, lectureQuery, pathname, rehydrated, router])

  const value = useMemo<ParcoursFlowContextValue>(
    () => ({
      state,
      setState,
      updateQueryState: (patch) => setState((current) => ({ ...current, ...patch })),
      updateState: (patch) => setState((current) => ({ ...current, ...patch })),
      resetFlow: () => setState(DEFAULT_PARCOURS_FLOW_STATE),
      lectureComplete,
      configurationComplete,
      lectureQuery,
    }),
    [configurationComplete, lectureComplete, lectureQuery, state],
  )

  return <ParcoursFlowContext.Provider value={value}>{children}</ParcoursFlowContext.Provider>
}

export function useParcoursFlow() {
  const context = useContext(ParcoursFlowContext)

  if (!context) {
    throw new Error("useParcoursFlow must be used inside ParcoursFlowProvider")
  }

  return context
}
