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

export default function LegalPage() {
  return (
    <LegalShell eyebrow="Cadre public" title="Mentions">
      <section>
        <h2 className="font-serif text-2xl text-[#173328]">Projet</h2>
        <p className="mt-3">Cardin est un système de récurrence pour commerces de proximité, actuellement proposé dans un cadre de déploiement progressif.</p>
      </section>
      <section>
        <h2 className="font-serif text-2xl text-[#173328]">Publication</h2>
        <p className="mt-3">Les informations publiques présentes ici décrivent le produit, la logique de saison, l&apos;activation des cartes et le cadre général du service.</p>
      </section>
      <section>
        <h2 className="font-serif text-2xl text-[#173328]">Contact</h2>
        <p className="mt-3">Les activations et demandes se font actuellement via le parcours d&apos;activation Cardin et les échanges directs liés à chaque lieu.</p>
      </section>
    </LegalShell>
  )
}
