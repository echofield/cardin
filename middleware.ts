import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

const protectedApiPrefixes = ["/api/leads", "/api/card", "/api/merchant"]

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl || !supabasePublishableKey) {
    return response
  }

  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value
      },
      set(name: string, value: string, options: Record<string, unknown>) {
        request.cookies.set(name, value)
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        })
        response.cookies.set({ name, value, ...(options as object) })
      },
      remove(name: string, options: Record<string, unknown>) {
        request.cookies.set(name, "")
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        })
        response.cookies.set({ name, value: "", ...(options as object), maxAge: 0 })
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isMerchantRoute = pathname.startsWith("/merchant/")
  const isProtectedApi = protectedApiPrefixes.some((prefix) => pathname.startsWith(prefix))

  if ((isMerchantRoute || isProtectedApi) && !user) {
    if (isProtectedApi) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 })
    }

    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = "/login"
    loginUrl.searchParams.set("next", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isMerchantRoute && user) {
    const merchantIdInPath = pathname.split("/")[2]

    if (merchantIdInPath && merchantIdInPath !== user.id) {
      const safeUrl = request.nextUrl.clone()
      safeUrl.pathname = `/merchant/${user.id}`
      safeUrl.search = ""
      return NextResponse.redirect(safeUrl)
    }
  }

  return response
}

export const config = {
  matcher: ["/merchant/:path*", "/api/leads", "/api/card/:path*", "/api/merchant/:path*"],
}

