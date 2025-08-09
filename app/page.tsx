import type { Metadata } from "next"
import { HomePageClient } from "@/components/HomePageClient"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://collegecuts.com'

// SEO Metadata for the homepage
export const metadata: Metadata = {
  title: "CollegeCuts - Track Higher Education Program Actions & Closures",
  description: "Monitor and analyze program actions, department closures, and institutional changes in higher education across the United States. Real-time data on academic program suspensions and closures.",
  keywords: [
    "college cuts",
    "program actions",
    "higher education closures",
    "university program actions",
    "academic program suspension",
    "department closure",
    "institutional changes",
    "higher education tracking",
    "college budget actions",
    "education actions",
    "university program actions",
    "academic actions",
    "track program actions",
    "monitor university actions",
    "find affected programs",
    "check institutional changes",
    "search academic actions",
    "view education closures",
    "college actions by state",
    "university closures map",
    "regional education actions",
    "state-by-state program actions",
    "local college closures",
    "students affected by actions",
    "faculty job losses",
    "academic department actions",
    "university budget actions",
    "higher education crisis",
    "college program elimination",
    "university closures 2024",
    "university closures 2025",
    "academic program actions database",
    "higher education tracking tool",
    "college program suspension tracker",
    "university department closure map",
    "affected students database",
    "faculty layoffs tracker",
    "academic actions by institution",
  ],
  openGraph: {
    title: "CollegeCuts - Track Higher Education Program Actions & Closures",
    description: "Monitor and analyze program actions, department closures, and institutional changes in higher education across the United States.",
    url: siteUrl,
    siteName: "CollegeCuts",
    images: [
      {
        url: `${siteUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "CollegeCuts - Higher Education Program Actions Tracker",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CollegeCuts - Track Higher Education Program Actions & Closures",
    description: "Monitor and analyze program actions, department closures, and institutional changes in higher education across the United States.",
    images: [`${siteUrl}/og-image.jpg`],
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
}

export default function HomePage() {
  return <HomePageClient />
}
