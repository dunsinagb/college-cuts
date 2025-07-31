"use client"

import dynamic from "next/dynamic"
import { Suspense, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useCutsAnalytics } from "@/lib/useCutsAnalytics"

const CutsTrend = dynamic(() => import("@/components/analytics/CutsTrend").then(mod => ({ default: mod.CutsTrend })), { ssr: false, loading: () => <Skeleton className="h-80 w-full" /> })
const ControlBreakdown = dynamic(() => import("@/components/analytics/ControlBreakdown").then(mod => ({ default: mod.ControlBreakdown })), { ssr: false, loading: () => <Skeleton className="h-80 w-full" /> })
const StateChoropleth = dynamic(() => import("@/components/analytics/StateChoropleth").then(mod => ({ default: mod.StateChoropleth })), { ssr: false, loading: () => <Skeleton className="h-80 w-full" /> })
const CutTypeDonut = dynamic(() => import("@/components/analytics/CutTypeDonut").then(mod => ({ default: mod.CutTypeDonut })), { ssr: false, loading: () => <Skeleton className="h-80 w-full" /> })
const PrimaryReasonChart = dynamic(() => import("@/components/analytics/PrimaryReasonChart").then(mod => ({ default: mod.PrimaryReasonChart })), { ssr: false, loading: () => <Skeleton className="h-80 w-full" /> })

function AnalyticsPageContent() {
  const { manualRefresh, isLoading } = useCutsAnalytics()
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const handleRefresh = async () => {
    manualRefresh()
    setLastRefresh(new Date())
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Hero Section */}
        <section className="text-center space-y-4" aria-labelledby="analytics-title">
          <h1 id="analytics-title" className="text-4xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Comprehensive insights into institutional actions across higher education institutions. 
            Explore trends, patterns, and regional impacts with real-time data.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button 
              onClick={handleRefresh} 
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
            <span className="text-sm text-muted-foreground">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </span>
          </div>
        </section>

        {/* Analytics Grid */}
        <section aria-labelledby="analytics-grid-title">
          <h2 id="analytics-grid-title" className="sr-only">Analytics Visualizations</h2>
          <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto" role="region" aria-label="Analytics charts and visualizations">
            <div role="region" aria-label="Actions trend over time">
              <CutsTrend />
            </div>
            <div role="region" aria-label="Actions by institution control type">
              <ControlBreakdown />
            </div>
            <div role="region" aria-label="Actions by state map">
              <StateChoropleth />
            </div>
            <div role="region" aria-label="Actions by type distribution">
              <CutTypeDonut />
            </div>
            <div role="region" aria-label="Primary reasons for actions">
              <PrimaryReasonChart />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            <section className="text-center space-y-4" aria-labelledby="loading-title">
              <h1 id="loading-title" className="sr-only">Loading Analytics Dashboard</h1>
              <Skeleton className="h-10 w-96 mx-auto" aria-label="Loading page title" />
              <Skeleton className="h-6 w-[500px] mx-auto" aria-label="Loading page description" />
            </section>
            <section aria-labelledby="loading-charts-title">
              <h2 id="loading-charts-title" className="sr-only">Loading Analytics Charts</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" role="region" aria-label="Loading analytics visualizations">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-80 w-full" aria-label={`Loading chart ${i + 1}`} />
                ))}
              </div>
            </section>
          </div>
        </div>
      }
    >
      <AnalyticsPageContent />
    </Suspense>
  )
} 