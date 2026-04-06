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

export default function TermsPage() {
  return (
    <LegalShell eyebrow="Cadre public" title="Conditions">
      <section>
        <h2 className="font-serif text-2xl text-[#173328]">Activation</h2>
        <p className="mt-3">Cardin est actuellement active saison par saison, lieu par lieu. Chaque activation precise le perimetre, la duree, le nombre de cartes et le sommet choisi.</p>
      </section>
      <section>
        <h2 className="font-serif text-2xl text-[#173328]">Usage</h2>
        <p className="mt-3">Le lieu utilise Cardin pour lancer une saison de recurrence, de propagation et d'attraction via une carte et un espace marchand associe.</p>
      </section>
      <section>
        <h2 className="font-serif text-2xl text-[#173328]">Evolution</h2>
        <p className="mt-3">Le systeme evolue encore. Certaines fonctions sont configurees avec le lieu durant la premiere saison avant de devenir plus autonomes.</p>
      </section>
      <section>
        <h2 className="font-serif text-2xl text-[#173328]">Saison suivante</h2>
        <p className="mt-3">La saison suivante est decidee a partir des resultats, de la traction observee et des regles fixees avec le lieu pour la suite.</p>
      </section>
    </LegalShell>
  )
}
