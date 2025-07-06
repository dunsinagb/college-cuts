import type { Metadata, Viewport } from "next"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { Footer } from "@/components/Footer"
import { Header } from "@/components/Header"
import { PerformanceOptimizer } from "@/components/PerformanceOptimizer"
import { OfflineIndicator } from "@/components/OfflineIndicator"

export const metadata: Metadata = {
  title: "CollegeCuts Tracker - Monitor University Program Cuts & Closures",
  description: "Comprehensive database tracking college cuts, university program closures, and academic department suspensions across the United States. Find affected programs, students, and faculty by state and institution.",
  generator: 'v0.dev',
  keywords: [
    // Primary Keywords
    'college cuts tracker',
    'university program cuts',
    'higher education closures',
    'academic program suspension',
    'department closure tracking',
    'institutional changes database',
    
    // Action/Intent Keywords
    'track program cuts',
    'monitor university closures',
    'find affected programs',
    'check institutional changes',
    'search academic cuts',
    'view education closures',
    
    // Geographic Keywords
    'college cuts by state',
    'university closures map',
    'regional education cuts',
    'state-by-state program cuts',
    'local college closures',
    
    // Secondary Keywords
    'students affected by cuts',
    'faculty job losses',
    'academic department cuts',
    'university budget cuts',
    'higher education crisis',
    'college program elimination',
    'university restructuring',
    'academic program discontinuation',
    'department consolidation',
    'institutional downsizing',
    
    // Long-tail Keywords
    'college cuts 2024',
    'university closures 2025',
    'academic program cuts database',
    'higher education tracking tool',
    'college program suspension tracker',
    'university department closure map',
    'affected students database',
    'faculty layoffs tracker',
    'academic cuts by institution',
    'higher education changes 2024'
  ],
  authors: [{ name: 'CollegeCuts Team' }],
  robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  manifest: '/manifest.json',
  openGraph: {
    title: 'CollegeCuts Tracker - Monitor University Program Cuts & Closures',
    description: 'Comprehensive database tracking college cuts, university program closures, and academic department suspensions across the United States. Find affected programs, students, and faculty by state and institution.',
    type: 'website',
    url: 'https://collegecuts.com',
    siteName: 'CollegeCuts Tracker',
    locale: 'en_US',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CollegeCuts Tracker - University Program Cuts Database'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CollegeCuts Tracker - Monitor University Program Cuts & Closures',
    description: 'Comprehensive database tracking college cuts, university program closures, and academic department suspensions across the United States.',
    images: ['/og-image.png']
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
  alternates: {
    canonical: 'https://collegecuts.com'
  },
  category: 'education',
  classification: 'Educational Database',
  referrer: 'origin-when-cross-origin'
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
        <title>CollegeCuts Tracker - Monitor University Program Cuts & Closures</title>
        <meta name="description" content="Comprehensive database tracking college cuts, university program closures, and academic department suspensions across the United States. Find affected programs, students, and faculty by state and institution." />
        <meta name="author" content="CollegeCuts Team" />
        <link rel="manifest" href="/manifest.json" crossOrigin="use-credentials" />
        <meta name="generator" content="v0.dev" />
        <meta name="keywords" content="college cuts tracker, university program cuts, higher education closures, academic program suspension, department closure tracking, institutional changes database, track program cuts, monitor university closures, find affected programs, check institutional changes, search academic cuts, view education closures, college cuts by state, university closures map, regional education cuts, state-by-state program cuts, local college closures, students affected by cuts, faculty job losses, academic department cuts, university budget cuts, higher education crisis, college program elimination, university restructuring, academic program discontinuation, department consolidation, institutional downsizing, college cuts 2024, university closures 2025, academic program cuts database, higher education tracking tool, college program suspension tracker, university department closure map, affected students database, faculty layoffs tracker, academic cuts by institution, higher education changes 2024" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="CollegeCuts" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#0f172a" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta property="og:title" content="CollegeCuts Tracker - Monitor University Program Cuts & Closures" />
        <meta property="og:description" content="Comprehensive database tracking college cuts, university program closures, and academic department suspensions across the United States. Find affected programs, students, and faculty by state and institution." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://collegecuts.com" />
        <meta property="og:site_name" content="CollegeCuts Tracker" />
        <meta property="og:locale" content="en_US" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="CollegeCuts Tracker - Monitor University Program Cuts & Closures" />
        <meta name="twitter:description" content="Comprehensive database tracking college cuts, university program closures, and academic department suspensions across the United States." />
        <meta name="twitter:image" content="/og-image.png" />
        <link rel="canonical" href="https://collegecuts.com" />
        <meta name="category" content="education" />
        <meta name="classification" content="Educational Database" />
        <meta name="referrer" content="origin-when-cross-origin" />
        
        {/* Structured Data for Search Engines */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "CollegeCuts Tracker",
              "description": "Comprehensive database tracking college cuts, university program closures, and academic department suspensions across the United States",
              "url": "https://collegecuts.com",
              "applicationCategory": "EducationalApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "author": {
                "@type": "Organization",
                "name": "CollegeCuts Team"
              },
              "keywords": "college cuts tracker, university program cuts, higher education closures, academic program suspension, department closure tracking",
              "audience": {
                "@type": "Audience",
                "audienceType": "Students, Faculty, Researchers, Journalists"
              }
            })
          }}
        />
        
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
          <header role="banner">
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
