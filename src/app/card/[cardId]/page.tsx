import { CardPhoneView } from "@/components/card/CardPhoneView"

export default function CardPage({ params }: { params: { cardId: string } }) {
  return <CardPhoneView cardId={params.cardId} />
}
