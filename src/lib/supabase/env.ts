export function getSupabaseEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error("Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY")
  }

  return { supabaseUrl, supabasePublishableKey }
}

export function getSupabaseServiceRoleKey() {
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!serviceRole || serviceRole === "SET_THIS_IN_VERCEL") {
    throw new Error("Missing or invalid SUPABASE_SERVICE_ROLE_KEY (found placeholder)")
  }

  return serviceRole
}
