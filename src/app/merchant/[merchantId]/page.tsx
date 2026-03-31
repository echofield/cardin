import { MerchantDashboard } from "@/components/merchant/MerchantDashboard"

export default function MerchantPage({ params }: { params: { merchantId: string } }) {
  return <MerchantDashboard merchantId={params.merchantId} />
}
