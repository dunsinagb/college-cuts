import type { Metadata, Viewport } from "next"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { Footer } from "@/components/Footer"
import { Header } from "@/components/Header"
import { PerformanceOptimizer } from "@/components/PerformanceOptimizer"
import { OfflineIndicator } from "@/components/OfflineIndicator"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.college-cuts.com'

export const metadata: Metadata = {
  title: "CollegeCuts Tracker - Monitor University Program Actions & Closures",
  description: "Tracking program actions and closures in higher education",
  keywords: [
    'higher education',
    'program actions',
    'university closures',
    'academic tracking',
    'college cuts tracker',
    'university program actions',
    'higher education closures',
    'academic program suspension',
    'department closure tracking',
    'institutional changes database',
    'track program actions',
    'monitor university closures',
    'find affected programs',
    'check institutional changes',
    'search academic actions',
    'view education closures',
    'college actions by state',
    'university closures map',
    'regional education actions',
    'state-by-state program actions',
    'local college closures',
    'students affected by actions',
    'faculty job losses',
    'academic department actions',
    'university budget actions',
    'higher education crisis',
    'college program elimination',
    'university closures 2024',
    'university closures 2025',
    'academic program actions database',
    'higher education tracking tool',
    'college program suspension tracker',
    'university department closure map',
    'affected students database',
    'faculty layoffs tracker',
    'academic actions by institution',
  ],
  authors: [{ name: 'CollegeCuts Team' }],
  robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  manifest: '/manifest.json',
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: 'CollegeCuts Tracker - Monitor University Program Actions & Closures',
    description: 'Tracking program actions and closures in higher education',
    url: siteUrl,
    siteName: 'CollegeCuts',
    images: [
      {
        url: `${siteUrl}/og-image.svg`,
        width: 1200,
        height: 630,
        alt: 'CollegeCuts Tracker - University Program Actions Database'
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CollegeCuts Tracker - Monitor University Program Actions & Closures',
    description: 'Tracking program actions and closures in higher education',
    images: [`${siteUrl}/og-image.svg`],
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
    canonical: siteUrl
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
        <meta property="og:url" content={siteUrl} />
        <meta property="og:site_name" content="CollegeCuts Tracker" />
        <meta property="og:locale" content="en_US" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="CollegeCuts Tracker - Monitor University Program Cuts & Closures" />
        <meta name="twitter:description" content="Comprehensive database tracking college cuts, university program closures, and academic department suspensions across the United States." />
        <meta name="twitter:image" content="/og-image.png" />
        <link rel="canonical" href={siteUrl} />
        <meta name="category" content="education" />
        <meta name="classification" content="Educational Database" />
        <meta name="referrer" content="origin-when-cross-origin" />
        
        {/* Structured Data for Search Engines */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "CollegeCuts Tracker",
              "url": siteUrl,
              "logo": `${siteUrl}/icons/icon-192x192.svg`,
              "description": "Comprehensive database tracking college program cuts, university closures, department suspensions, and faculty layoffs across the United States.",
              "foundingDate": "2024",
              "sameAs": [
                "https://github.com/dunsinagb/college-cuts",
                "https://linkedin.com/in/dunsinagb"
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "url": `${siteUrl}/submit-tip`
              }
            })
          }}
        />
        
        {/* FAQ Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "What is CollegeCuts Tracker?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "CollegeCuts Tracker is a comprehensive database that monitors and tracks college program cuts, university closures, department suspensions, and faculty layoffs across the United States. It provides real-time data on higher education budget cuts, enrollment declines, and institutional changes affecting students and faculty."
                  }
                },
                {
                  "@type": "Question", 
                  "name": "How many universities have had program cuts in 2024-2025?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Our database tracks program cuts, closures, and academic actions across hundreds of institutions nationwide. The data is continuously updated as new information becomes available from public sources."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Which states are most affected by college cuts?",
                  "acceptedAnswer": {
                    "@type": "Answer", 
                    "text": "College cuts and closures are affecting institutions across all states, with varying degrees of impact. Our analytics dashboard shows state-by-state breakdowns of program actions, closures, and institutional changes."
                  }
                }
              ]
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
        
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-09JJ1DBK6G"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);} 
              gtag('js', new Date());
              gtag('config', 'G-09JJ1DBK6G');
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
          <main id="main-content" className="flex-1 w-full max-w-[var(--max-width)] mx-auto pt-20" role="main">
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
