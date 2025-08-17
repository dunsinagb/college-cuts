import type { Metadata } from "next"
import { HomePageClient } from "@/components/HomePageClient"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.college-cuts.com'

// SEO Metadata for the homepage
export const metadata: Metadata = {
  title: "CollegeCuts - Track University Program Cuts, Closures & Academic Actions 2024-2025",
  description: "Comprehensive database tracking college program cuts, university closures, department suspensions, and faculty layoffs across the United States. Real-time data on higher education budget cuts, enrollment declines, and institutional changes affecting students and faculty.",
  keywords: [
    "college cuts",
    "university program cuts",
    "higher education closures",
    "academic program suspension",
    "department closure",
    "faculty layoffs",
    "university budget cuts",
    "college closures 2024",
    "university closures 2025",
    "higher education crisis",
    "academic program elimination",
    "university restructuring",
    "college program discontinuation",
    "department consolidation",
    "institutional downsizing",
    "education budget cuts",
    "university enrollment decline",
    "academic department cuts",
    "college faculty layoffs",
    "university program suspension",
    "higher education tracking",
    "college cuts database",
    "university closures map",
    "academic actions tracker",
    "education program cuts",
    "university department closure",
    "college budget actions",
    "higher education changes",
    "academic program database",
    "university cuts tracker",
    "college program actions",
    "education institutional changes",
    "university faculty reductions",
    "academic department elimination",
    "college enrollment decline",
    "university financial crisis",
    "higher education program cuts",
    "academic department suspension",
    "college institutional changes",
    "university program elimination",
    "education budget reductions",
    "academic program discontinuation",
    "university department cuts",
    "college faculty reductions",
    "higher education restructuring",
    "academic program consolidation",
    "university enrollment drops",
    "college financial crisis",
    "education program elimination",
    "university academic cuts",
    "higher education downsizing",
  ],
  openGraph: {
    title: "CollegeCuts - Track University Program Cuts, Closures & Academic Actions 2024-2025",
    description: "Comprehensive database tracking college program cuts, university closures, department suspensions, and faculty layoffs across the United States. Real-time data on higher education budget cuts and institutional changes.",
    url: siteUrl,
    siteName: "CollegeCuts",
    images: [
      {
        url: `${siteUrl}/og-image.svg`,
        width: 1200,
        height: 630,
        alt: "CollegeCuts - Higher Education Program Cuts and University Closures Tracker",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CollegeCuts - Track University Program Cuts, Closures & Academic Actions 2024-2025",
    description: "Comprehensive database tracking college program cuts, university closures, department suspensions, and faculty layoffs across the United States.",
    images: [`${siteUrl}/og-image.svg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
}

export default function HomePage() {
  return <HomePageClient />
}
