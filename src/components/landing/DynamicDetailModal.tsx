"use client"

import { type DynamicDefinition } from "@/lib/dynamics-library"

type DynamicDetailModalProps = {
  dynamic: DynamicDefinition | null
  onClose: () => void
}

export function DynamicDetailModal({ dynamic, onClose }: DynamicDetailModalProps) {
  if (!dynamic) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog">
      <button
        aria-label="Fermer"
        className="absolute inset-0 bg-[#152F25]/40 backdrop-blur-[2px]"
        onClick={onClose}
        type="button"
      />
      <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-[#D8DBD2] bg-[#FFFEFB] p-6 shadow-2xl sm:rounded-3xl">
        <div className="flex items-start justify-between gap-3">
          <p className="font-serif text-2xl text-[#173A2E]">{dynamic.cardTitle}</p>
          <button className="text-sm text-[#556159] hover:text-[#173A2E]" onClick={onClose} type="button">
            Fermer
          </button>
        </div>

        <div className="mt-5 space-y-4 text-sm text-[#2A3F35]">
          <section>
            <p className="text-xs uppercase tracking-[0.12em] text-[#667068]">Ce que cela déclenche</p>
            <p className="mt-2">{dynamic.ceQueCelaDeclenche}</p>
          </section>
          <section>
            <p className="text-xs uppercase tracking-[0.12em] text-[#667068]">Quand l&apos;utiliser</p>
            <p className="mt-2">{dynamic.quandLUtiliser}</p>
          </section>
          <section>
            <p className="text-xs uppercase tracking-[0.12em] text-[#667068]">Comment cela fonctionne</p>
            <p className="mt-2">{dynamic.commentCelaFonctionne}</p>
          </section>
          <section>
            <p className="text-xs uppercase tracking-[0.12em] text-[#667068]">Ce que cela peut changer</p>
            <p className="mt-2">{dynamic.ceQueCelaPeutChanger}</p>
          </section>
        </div>
      </div>
    </div>
  )
}
