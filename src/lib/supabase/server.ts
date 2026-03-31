import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

import { getSupabaseEnv } from "./env"

export function createClientSupabaseServer() {
  const { supabaseUrl, supabasePublishableKey } = getSupabaseEnv()
  const cookieStore = cookies()

  return createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: Record<string, unknown>) {
        cookieStore.set({ name, value, ...(options as object) })
      },
      remove(name: string, options: Record<string, unknown>) {
        cookieStore.set({ name, value: "", ...(options as object), maxAge: 0 })
      },
    },
  })
}
