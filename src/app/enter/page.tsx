import { redirect } from "next/navigation"

/**
 * QR entrée public : /enter?merchant_id=… → même flux que le scan lieu.
 */
export default function EnterPage({
  searchParams,
}: {
  searchParams: { merchant_id?: string }
}) {
  const id = (searchParams.merchant_id ?? "").trim()
  if (!id) {
    redirect("/landing")
  }
  redirect(`/scan/${encodeURIComponent(id)}`)
}
