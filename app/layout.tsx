import type { Metadata, Viewport } from "next"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { Footer } from "@/components/Footer"
import { Header } from "@/components/Header"
import { PerformanceOptimizer } from "@/components/PerformanceOptimizer"
import { OfflineIndicator } from "@/components/OfflineIndicator"

export const metadata: Metadata = {
  title: "CollegeCuts Tracker",
  description: "Tracking program cuts and closures in higher education",
  generator: 'v0.dev',
  keywords: ['higher education', 'program cuts', 'university closures', 'academic tracking'],
  authors: [{ name: 'CollegeCuts Team' }],
  robots: 'index, follow',
  manifest: '/manifest.json',
  openGraph: {
    title: 'CollegeCuts Tracker',
    description: 'Tracking program cuts and closures in higher education',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CollegeCuts Tracker',
    description: 'Tracking program cuts and closures in higher education',
  },
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'CollegeCuts',
    'mobile-web-app-capable': 'yes',
    'msapplication-TileColor': '#0f172a',
    'msapplication-tap-highlight': 'no',
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.svg", sizes: "32x32", type: "image/svg+xml" },
      { url: "/icons/icon-192x192.svg", sizes: "16x16", type: "image/svg+xml" },
    ],
    apple: "/icons/icon-192x192.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CollegeCuts",
  },
  applicationName: "CollegeCuts",
  formatDetection: {
    telephone: false,
  },
  themeColor: "#0f172a",
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#0f172a',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
        <link rel="icon" type="image/svg+xml" sizes="32x32" href="/icons/icon-192x192.svg" />
        <link rel="icon" type="image/svg+xml" sizes="16x16" href="/icons/icon-192x192.svg" />
        <meta name="application-name" content="CollegeCuts" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="CollegeCuts" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#0f172a" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#0f172a" />
        <title>CollegeCuts Tracker</title>
        <meta name="description" content="Tracking program cuts and closures in higher education" />
        <meta name="author" content="CollegeCuts Team" />
        <link rel="manifest" href="/manifest.json" crossOrigin="use-credentials" />
        <meta name="generator" content="v0.dev" />
        <meta name="keywords" content="higher education,program cuts,university closures,academic tracking" />
        <meta name="robots" content="index, follow" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="CollegeCuts" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#0f172a" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta property="og:title" content="CollegeCuts Tracker" />
        <meta property="og:description" content="Tracking program cuts and closures in higher education" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="CollegeCuts Tracker" />
        <meta name="twitter:description" content="Tracking program cuts and closures in higher education" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.__SUPABASE_CONFIG__ = {
                NEXT_PUBLIC_SUPABASE_URL: "${process.env.NEXT_PUBLIC_SUPABASE_URL}",
                NEXT_PUBLIC_SUPABASE_ANON_KEY: "${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}"
              };
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <PerformanceOptimizer />
        <OfflineIndicator />
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <div className="relative flex min-h-screen flex-col">
          <header className="mx-auto max-w-5xl w-full px-4" role="banner">
            <Header />
          </header>
          <main id="main-content" className="flex-1 w-full max-w-[var(--max-width)] mx-auto" role="main">
            {children}
          </main>
          <footer className="mx-auto max-w-5xl w-full px-4" role="contentinfo">
            <Footer />
          </footer>
        </div>
        <Toaster />
      </body>
    </html>
  )
}
