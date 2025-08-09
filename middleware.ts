import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/', '/subscribe-gate', '/api/subscribe', '/about', '/cuts', '/analytics', '/submit-tip']

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname
  const method = req.method
  const userAgent = req.headers.get('user-agent') || ''
  const host = req.headers.get('host') || ''

  // Canonical host redirect based on NEXT_PUBLIC_SITE_URL
  const envSiteUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (envSiteUrl) {
    try {
      const desiredHost = new URL(envSiteUrl).host
      if (desiredHost && host && host !== desiredHost) {
        const url = req.nextUrl.clone()
        url.host = desiredHost
        url.protocol = 'https'
        return NextResponse.redirect(url, 308)
      }
    } catch {}
  }
  
  // Debug logging
  console.log(`🔍 Middleware: ${path}`)
  
  // Bot detection: allow known crawlers to access content for SEO
  const isBot = /bot|crawl|spider|slurp|bing|duckduck|baidu|yandex|sogou|facebookexternalhit|twitterbot|embedly|quora link preview|whatsapp|telegram|linkedinbot|discordbot/i.test(userAgent)
  if (isBot) {
    console.log(`🤖 Detected bot user-agent, allowing access: ${userAgent}`)
    return
  }
  
  // Check for subscription cookie
  const ccSubCookie = req.cookies.get('cc_sub')
  const sub = ccSubCookie?.value === '1'
  
  console.log(`🔍 Cookie check: cc_sub=${ccSubCookie?.value}, subscribed=${sub}`)
  
  // Make key content public; allow access if subscribed or on public routes
  if (sub || PUBLIC_ROUTES.includes(path) || path.startsWith('/cut')) {
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