import { formatEuro } from "@/lib/number-format"
import { Card } from "@/ui"

type DemoMerchantBoardProps = {
  businessName: string
  businessType: string
  seasonLabel: string
  seasonRevenue: number
  monthlyRevenue: number
  monthlyReturns: number
  recoveredClients: number
  paybackDays: number
  confidenceLabel: string
  summitLabel: string
  clientName: string
  cardCode: string
}


export function DemoMerchantBoard(props: DemoMerchantBoardProps) {
  return (
    <Card className="overflow-hidden rounded-[1.8rem] border border-[#D8DED4] bg-[#FFFEFA] p-0 shadow-[0_28px_80px_-58px_rgba(24,39,31,0.4)]">
      <div className="border-b border-[#E5E0D4] px-5 py-4 sm:px-6">
        <p className="text-[10px] uppercase tracking-[0.18em] text-[#69736C]">Tableau marchand</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h3 className="font-serif text-3xl text-[#173A2E]">{props.businessName}</h3>
            <p className="mt-1 text-sm text-[#556159]">{props.businessType} - {props.seasonLabel}</p>
          </div>
          <div className="rounded-full border border-[#D7DDD3] bg-[#F6F4ED] px-4 py-2 text-xs uppercase tracking-[0.14em] text-[#173A2E]">
            Sommet {props.summitLabel}
          </div>
        </div>
      </div>

      <div className="grid gap-3 border-b border-[#E5E0D4] px-5 py-5 sm:grid-cols-4 sm:px-6">
        <Metric label="CA saison" value={formatEuro(props.seasonRevenue)} note="derive de la projection" />
        <Metric label="CA / mois" value={formatEuro(props.monthlyRevenue)} note="retour structure" />
        <Metric label="Retours / mois" value={props.monthlyReturns.toString()} note="clients recuperes" />
        <Metric label="Payback" value={`${props.paybackDays} j`} note={props.confidenceLabel} />
      </div>

      <div className="grid gap-5 px-5 py-5 sm:grid-cols-[0.95fr_1.05fr] sm:px-6">
        <div className="rounded-[1.3rem] border border-[#D9DED5] bg-[#FBF9F4] p-4">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#6B756D]">Lecture simple</p>
          <div className="mt-4 space-y-3 text-sm text-[#173A2E]">
            <Row label="Clients recuperes" value={props.recoveredClients.toString()} />
            <Row label="Projection" value={props.confidenceLabel} />
            <Row label="Sommet visible" value="Oui" />
          </div>
        </div>

        <div className="rounded-[1.3rem] border border-[#D9DED5] bg-[#FFFEFA] p-4">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#6B756D]">Carte suivie</p>
          <div className="mt-3 rounded-[1.1rem] border border-[#D8DED4] bg-[#F8FAF6] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-[#173A2E]">{props.clientName}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[#627066]">{props.cardCode}</p>
              </div>
              <span className="rounded-full border border-[#A9C2E5]/40 bg-[#E8F0FB] px-3 py-1 text-[11px] text-[#365E92]">Diamond proche</span>
            </div>
            <div className="mt-4 grid gap-2 text-sm text-[#173A2E]">
              <Row label="Etape" value="6 / 8" />
              <Row label="Invitation active" value="1" />
              <Row label="Prochain signal" value="Revenir cette semaine" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-[1.2rem] border border-[#DEE4D9] bg-[#F8FAF6] p-4">
      <p className="text-[10px] uppercase tracking-[0.16em] text-[#6B756D]">{label}</p>
      <p className="mt-2 font-serif text-3xl text-[#173A2E]">{value}</p>
      <p className="mt-1 text-xs text-[#607066]">{note}</p>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#E1E6DE] pb-2 last:border-b-0 last:pb-0">
      <span className="text-[#556159]">{label}</span>
      <span className="font-medium text-[#173A2E]">{value}</span>
    </div>
  )
}
