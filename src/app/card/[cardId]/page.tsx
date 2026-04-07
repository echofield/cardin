import { CardPhoneView } from "@/components/card/CardPhoneView"

export default function CardPage({
  params,
  searchParams,
}: {
  params: { cardId: string }
  searchParams?: { demo?: string }
}) {
  const demo = searchParams?.demo === "1"
  return <CardPhoneView cardId={params.cardId} demo={demo} />
}
