import Link from "next/link"

import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton"

export default function LoginPage({ searchParams }: { searchParams: { next?: string } }) {
  const next = searchParams.next ?? "/"

  return (
    <main className="min-h-screen bg-[#F8F7F2] px-4 py-12 text-[#173A2E] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-lg rounded-3xl border border-[#D3D9CF] bg-[#FFFEFA] p-8">
        <p className="text-xs uppercase tracking-[0.14em] text-[#5D675F]">Espace marchand</p>
        <h1 className="mt-2 font-serif text-5xl">Connexion</h1>
        <p className="mt-3 text-sm text-[#556159]">Connectez-vous avec Google pour accéder à vos cartes, QR et statistiques.</p>

        <div className="mt-6">
          <GoogleSignInButton label="Continuer avec Google" nextPath={next} />
        </div>

        <Link className="mt-6 inline-block text-sm underline" href="/">
          Retour à la landing
        </Link>
      </div>
    </main>
  )
}
