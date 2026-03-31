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

  if (!serviceRole) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY")
  }

  return serviceRole
}
