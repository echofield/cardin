import { MerchantDashboard } from "@/components/merchant/MerchantDashboard"

export default function MerchantPage({
  params,
  searchParams,
}: {
  params: { merchantId: string }
  searchParams?: { demo?: string }
}) {
  const demo = searchParams?.demo === "1"
  return <MerchantDashboard demo={demo} merchantId={params.merchantId} />
}
