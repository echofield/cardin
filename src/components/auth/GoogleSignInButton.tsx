"use client"

import { createClientSupabaseBrowser } from "@/lib/supabase/client"
import { Button } from "@/ui"

type GoogleSignInButtonProps = {
  nextPath?: string
  label?: string
}

export function GoogleSignInButton({ nextPath = "/landing", label = "Se connecter avec Google" }: GoogleSignInButtonProps) {
  return (
    <Button
      onClick={async () => {
        const supabase = createClientSupabaseBrowser()
        const origin = typeof window !== "undefined" ? window.location.origin : ""
        const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`

        await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo,
          },
        })
      }}
      size="lg"
    >
      {label}
    </Button>
  )
}
