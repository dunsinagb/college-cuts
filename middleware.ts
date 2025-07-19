import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/', '/subscribe-gate', '/api/subscribe', '/about']

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname
  
  // Debug logging
  console.log(`🔍 Middleware: ${path}`)
  
  // Check for subscription cookie
  const ccSubCookie = req.cookies.get('cc_sub')
  const sub = ccSubCookie?.value === '1'
  
  console.log(`🔍 Cookie check: cc_sub=${ccSubCookie?.value}, subscribed=${sub}`)
  
  // Allow access if subscribed or on public routes
  if (sub || PUBLIC_ROUTES.includes(path)) {
    console.log(`✅ Allowing access to ${path}`)
    return
  }

  // Allow static assets and API routes
  if (path.startsWith('/_next') || path.startsWith('/static') || path.startsWith('/api/')) {
    console.log(`✅ Allowing static/API access to ${path}`)
    return
  }

  console.log(`🚫 Redirecting ${path} to subscribe-gate`)
  
  // Redirect to subscribe gate
  const url = req.nextUrl.clone()
  url.pathname = '/subscribe-gate'
  // Preserve the intended destination
  url.searchParams.set('redirect', req.nextUrl.pathname + req.nextUrl.search)
  return NextResponse.redirect(url)
}

export const config = { 
  matcher: ['/((?!api|_next|static).*)'] 
} 