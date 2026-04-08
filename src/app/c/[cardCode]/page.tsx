import { CardPhoneView } from "@/components/card/CardPhoneView"

export default function CardCodePage({
  params,
  searchParams,
}: {
  params: { cardCode: string }
  searchParams?: { demo?: string }
}) {
  const demo = searchParams?.demo === "1"
  return <CardPhoneView cardRef={params.cardCode} refType="code" demo={demo} />
}
