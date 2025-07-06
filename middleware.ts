import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/', '/subscribe-gate', '/api/subscribe']

export function middleware(req: NextRequest) {
  const sub = req.cookies.get('cc_sub')?.value === '1'
  const path = req.nextUrl.pathname

  if (sub || PUBLIC_ROUTES.includes(path)) return

  // Allow static assets and API routes
  if (path.startsWith('/_next') || path.startsWith('/static') || path.startsWith('/api/')) return

  const url = req.nextUrl.clone()
  url.pathname = '/subscribe-gate'
  return NextResponse.redirect(url)
}

export const config = { 
  matcher: ['/((?!api|_next|static).*)'] 
} 