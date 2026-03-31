import { createClient } from "@supabase/supabase-js"

import { getSupabaseEnv, getSupabaseServiceRoleKey } from "./env"

export function createSupabaseServiceClient() {
  const { supabaseUrl } = getSupabaseEnv()
  const serviceRole = getSupabaseServiceRoleKey()

  return createClient(supabaseUrl, serviceRole, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
