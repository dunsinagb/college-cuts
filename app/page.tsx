import type { Metadata } from "next"
import { HomePageClient } from "@/components/HomePageClient"

// SEO Metadata for the homepage
export const metadata: Metadata = {
  title: "CollegeCuts - Track Higher Education Program Cuts & Closures",
  description: "Monitor and analyze program cuts, department closures, and institutional changes in higher education across the United States. Real-time data on academic program suspensions and closures.",
  keywords: [
    "college cuts",
    "program cuts",
    "higher education cuts",
    "university closures",
    "academic program suspension",
    "department closure",
    "college budget cuts",
    "education cuts",
    "university program cuts",
    "academic cuts",
    "higher education closures",
    "college program suspension",
    "university department closure",
    "education budget cuts",
    "academic program closure"
  ],
  openGraph: {
    title: "CollegeCuts - Track Higher Education Program Cuts & Closures",
    description: "Monitor and analyze program cuts, department closures, and institutional changes in higher education across the United States.",
    url: "https://collegecuts.com",
    siteName: "CollegeCuts",
    images: [
      {
        url: "https://collegecuts.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "CollegeCuts - Higher Education Program Cuts Tracker",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CollegeCuts - Track Higher Education Program Cuts & Closures",
    description: "Monitor and analyze program cuts, department closures, and institutional changes in higher education across the United States.",
    images: ["https://collegecuts.com/og-image.jpg"],
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
  verification: {
    google: "your-google-verification-code",
  },
}

export default function HomePage() {
  return <HomePageClient />
}
