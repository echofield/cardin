import { ScanExperience } from "@/components/scan/ScanExperience"

export default function ScanPage({
  params,
  searchParams,
}: {
  params: { merchantId: string }
  searchParams?: { demo?: string }
}) {
  const demo = searchParams?.demo === "1"
  return <ScanExperience demo={demo} merchantId={params.merchantId} />
}
