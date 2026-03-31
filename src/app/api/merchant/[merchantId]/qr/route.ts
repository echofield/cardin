import QRCode from "qrcode"

import { getMerchantById } from "@/lib/loyalty-storage"

export async function GET(request: Request, { params }: { params: { merchantId: string } }) {
  const merchant = await getMerchantById(params.merchantId)

  if (!merchant) {
    return new Response("Not found", { status: 404 })
  }

  const origin = new URL(request.url).origin
  const scanUrl = `${origin}/scan/${params.merchantId}`

  const imageBuffer = await QRCode.toBuffer(scanUrl, {
    margin: 2,
    width: 920,
    color: {
      dark: "#173A2E",
      light: "#FDFCF8",
    },
  })

  return new Response(new Uint8Array(imageBuffer), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store",
    },
  })
}

