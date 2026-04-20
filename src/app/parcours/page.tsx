import { redirect } from "next/navigation"

export default function ParcoursPage() {
  redirect("/parcours/lecture?fresh=1")
}
