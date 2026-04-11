import { MerchantValidatePanel } from "@/components/merchant/MerchantValidatePanel"

export default function MerchantValidatePage({ params }: { params: { merchantId: string } }) {
  return (
    <main className="min-h-screen bg-[#F7F3EA] text-[#18271F]">
      <MerchantValidatePanel merchantId={params.merchantId} />
    </main>
  )
}
