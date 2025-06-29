"use client"

import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { CutsTrend } from "@/components/analytics/CutsTrend"
import { ControlBreakdown } from "@/components/analytics/ControlBreakdown"
import { StateChoropleth } from "@/components/analytics/StateChoropleth"
import { CutTypeDonut } from "@/components/analytics/CutTypeDonut"

function AnalyticsPageContent() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Comprehensive insights into program cuts across higher education institutions. 
            Explore trends, patterns, and regional impacts with real-time data.
          </p>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Suspense fallback={<Skeleton className="h-80 w-full" />}>
            <CutsTrend />
          </Suspense>
          
          <Suspense fallback={<Skeleton className="h-80 w-full" />}>
            <ControlBreakdown />
          </Suspense>
          
          <Suspense fallback={<Skeleton className="h-80 w-full" />}>
            <StateChoropleth />
          </Suspense>
          
          <Suspense fallback={<Skeleton className="h-80 w-full" />}>
            <CutTypeDonut />
          </Suspense>
        </div>
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
            <div className="text-center space-y-4">
              <Skeleton className="h-10 w-96 mx-auto" />
              <Skeleton className="h-6 w-[500px] mx-auto" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-80 w-full" />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <AnalyticsPageContent />
    </Suspense>
  )
} 