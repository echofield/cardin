import { IdentitySelector } from "@/components/landing/IdentitySelector"

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-[#F6F5F0] px-5 pb-16 pt-20 text-[#152F25] sm:px-6 sm:pt-28">
      <div className="w-full max-w-lg text-center sm:max-w-xl">
        <h1 className="font-serif text-4xl leading-[1.1] text-[#15372B] sm:text-5xl">Vos clients passent. Cardin les fait revenir.</h1>
        <p className="mx-auto mt-6 max-w-md text-base text-[#5C655E] sm:text-lg">Choisissez votre situation. On vous montre quoi faire.</p>
      </div>

      <div className="mt-14 w-full max-w-lg sm:mt-16 sm:max-w-xl">
        <IdentitySelector />
      </div>
    </main>
  )
}
