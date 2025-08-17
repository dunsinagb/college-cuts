import { Metadata } from "next"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, MapPin, Users, GraduationCap, TrendingUp, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"
import { formatFullMonthYear } from "@/lib/utils"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.college-cuts.com'

// State data for SEO
const stateData: Record<string, { name: string; fullName: string; description: string }> = {
  'california': {
    name: 'California',
    fullName: 'California',
    description: 'Track college cuts, university closures, and academic program suspensions in California. Monitor higher education budget cuts and institutional changes affecting students and faculty across CA institutions.'
  },
  'new-york': {
    name: 'New York', 
    fullName: 'New York',
    description: 'Monitor college program cuts, university closures, and faculty layoffs in New York. Track higher education restructuring and academic department eliminations across NY institutions.'
  },
  'texas': {
    name: 'Texas',
    fullName: 'Texas', 
    description: 'Track university program cuts, college closures, and academic actions in Texas. Monitor higher education budget reductions and institutional changes affecting TX students and faculty.'
  },
  'florida': {
    name: 'Florida',
    fullName: 'Florida',
    description: 'Monitor college cuts, university program suspensions, and faculty layoffs in Florida. Track higher education restructuring and academic department closures across FL institutions.'
  },
  'illinois': {
    name: 'Illinois',
    fullName: 'Illinois',
    description: 'Track university program cuts, college closures, and academic actions in Illinois. Monitor higher education budget cuts and institutional changes affecting IL students and faculty.'
  }
}

export async function generateMetadata({ params }: { params: { state: string } }): Promise<Metadata> {
  const state = params.state.toLowerCase()
  const stateInfo = stateData[state]
  
  if (!stateInfo) {
    return {
      title: 'State Not Found - CollegeCuts Tracker',
      description: 'State-specific college cuts and university closures data not available.'
    }
  }

  return {
    title: `${stateInfo.fullName} College Cuts & University Closures 2024-2025 - CollegeCuts Tracker`,
    description: stateInfo.description,
    keywords: [
      `${stateInfo.name.toLowerCase()} college cuts`,
      `${stateInfo.name.toLowerCase()} university closures`,
      `${stateInfo.name.toLowerCase()} higher education cuts`,
      `${stateInfo.name.toLowerCase()} academic program cuts`,
      `${stateInfo.name.toLowerCase()} faculty layoffs`,
      `${stateInfo.name.toLowerCase()} university budget cuts`,
      `${stateInfo.name.toLowerCase()} college program suspension`,
      `${stateInfo.name.toLowerCase()} university restructuring`,
      `${stateInfo.name.toLowerCase()} higher education crisis`,
      `${stateInfo.name.toLowerCase()} academic department cuts`,
      `${stateInfo.name.toLowerCase()} university enrollment decline`,
      `${stateInfo.name.toLowerCase()} college financial crisis`,
      `${stateInfo.name.toLowerCase()} education budget cuts`,
      `${stateInfo.name.toLowerCase()} university program elimination`,
      `${stateInfo.name.toLowerCase()} college institutional changes`
    ],
    openGraph: {
      title: `${stateInfo.fullName} College Cuts & University Closures 2024-2025 - CollegeCuts Tracker`,
      description: stateInfo.description,
      url: `${siteUrl}/state/${state}`,
      siteName: "CollegeCuts",
      images: [
        {
          url: `${siteUrl}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: `${stateInfo.fullName} College Cuts and University Closures`,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${stateInfo.fullName} College Cuts & University Closures 2024-2025 - CollegeCuts Tracker`,
      description: stateInfo.description,
      images: [`${siteUrl}/og-image.jpg`],
    },
    alternates: {
      canonical: `${siteUrl}/state/${state}`,
    },
  }
}

export default function StatePage({ params }: { params: { state: string } }) {
  const state = params.state.toLowerCase()
  const stateInfo = stateData[state]
  
  if (!stateInfo) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <MapPin className="w-6 h-6 text-blue-600" />
            <h1 className="text-4xl font-bold tracking-tight">
              {stateInfo.fullName} College Cuts & University Closures
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-6">
            {stateInfo.description}
          </p>
          <div className="flex justify-center gap-2">
            <Badge variant="secondary" className="text-sm">
              <TrendingUp className="w-3 h-3 mr-1" />
              2024-2025 Data
            </Badge>
            <Badge variant="secondary" className="text-sm">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Real-time Updates
            </Badge>
          </div>
        </div>

        {/* State Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              {stateInfo.fullName} Higher Education Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-2">Program Cuts</div>
                <div className="text-sm text-muted-foreground">Academic program suspensions and eliminations</div>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600 mb-2">Faculty Impact</div>
                <div className="text-sm text-muted-foreground">Job losses and department closures</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-2">Institutional Changes</div>
                <div className="text-sm text-muted-foreground">Restructuring and budget actions</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Types of Cuts Tracked
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="font-medium text-sm">Program Suspensions</div>
                  <div className="text-xs text-muted-foreground">Temporary halts with potential reinstatement</div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="font-medium text-sm">Department Closures</div>
                  <div className="text-xs text-muted-foreground">Complete academic department eliminations</div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="font-medium text-sm">Faculty Layoffs</div>
                  <div className="text-xs text-muted-foreground">Staff reductions and job eliminations</div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="font-medium text-sm">Budget Cuts</div>
                  <div className="text-xs text-muted-foreground">Financial reductions affecting programs</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-green-600" />
                Data Sources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <span className="text-sm">University official announcements</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <span className="text-sm">Local and state news reports</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                  <span className="text-sm">State higher education board communications</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-orange-600 rounded-full mt-2"></div>
                  <span className="text-sm">Faculty senate minutes and internal communications</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2"></div>
                  <span className="text-sm">Community submissions and verified tips</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <MapPin className="w-5 h-5" />
              Help Track {stateInfo.fullName} College Cuts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Have information about program cuts, closures, or institutional changes in {stateInfo.fullName}? 
              Help us maintain comprehensive coverage by submitting verified information.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/submit-tip" 
                className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Submit a Tip →
              </Link>
              <Link 
                href="/cuts" 
                className="inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                View All Cuts →
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t">
          <p className="text-sm text-muted-foreground">
            Data coverage: Started from 2024 • Last updated: {formatFullMonthYear(new Date())}
          </p>
          <div className="mt-4">
            <Link href="/about" className="text-sm text-blue-600 hover:text-blue-700">
              Learn more about our methodology →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 