import type { Metadata } from "next"

import { DiagnosticPage } from "@/components/diagnostic/DiagnosticPage"

export const metadata: Metadata = {
  title: "Diagnostic Cardin",
  description: "Identifiez le point de fuite de votre retour client, puis laissez Cardin recommander le bon levier avant la simulation.",
}

export default function DiagnosticRoute() {
  return <DiagnosticPage />
}
