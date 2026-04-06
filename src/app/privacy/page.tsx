function LegalShell({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string
  title: string
  children: React.ReactNode
}) {
  return (
    <main className="bg-[#F7F3EA] px-4 py-16 text-[#18271F] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-[1.8rem] border border-[#E3DDD0] bg-[#FFFEFA] p-6 sm:p-8 lg:p-10">
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#6D776F]">{eyebrow}</p>
        <h1 className="mt-3 font-serif text-4xl text-[#173328] sm:text-5xl">{title}</h1>
        <div className="mt-8 space-y-8 text-sm leading-7 text-[#556159]">{children}</div>
      </div>
    </main>
  )
}

export default function PrivacyPage() {
  return (
    <LegalShell eyebrow="Cadre public" title="Confidentialite">
      <section>
        <h2 className="font-serif text-2xl text-[#173328]">Principe</h2>
        <p className="mt-3">Cardin traite les donnees necessaires au fonctionnement de la saison, a l'activation des cartes et au suivi marchand.</p>
      </section>
      <section>
        <h2 className="font-serif text-2xl text-[#173328]">Donnees traitees</h2>
        <p className="mt-3">Selon le parcours active, Cardin peut traiter des identifiants de carte, des evenements de visite, des informations de progression, des journaux d'activation et des donnees techniques de service.</p>
      </section>
      <section>
        <h2 className="font-serif text-2xl text-[#173328]">Usage</h2>
        <p className="mt-3">Ces donnees servent a faire fonctionner la carte, mesurer la recurrence, suivre le domino, piloter la saison et ameliorer les versions suivantes du systeme.</p>
      </section>
      <section>
        <h2 className="font-serif text-2xl text-[#173328]">Cadre</h2>
        <p className="mt-3">Cardin avance actuellement lieu par lieu. Les demandes liees a la confidentialite, a l'acces ou a la suppression des donnees sont traitees dans le cadre de chaque activation.</p>
      </section>
    </LegalShell>
  )
}
