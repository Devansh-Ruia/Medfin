// Middleware is intentionally minimal -- locale routing is handled by generateStaticParams
// because middleware redirects do not work in static export (output: 'export')
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
