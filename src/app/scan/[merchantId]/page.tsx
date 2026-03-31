import { ScanExperience } from "@/components/scan/ScanExperience"

export default function ScanPage({ params }: { params: { merchantId: string } }) {
  return <ScanExperience merchantId={params.merchantId} />
}
