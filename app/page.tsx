"use client"

import { useState, useEffect } from "react"
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient"
import { EnhancedKpiCard } from "@/components/EnhancedKpiCard"
import { NewsletterSignup } from "@/components/NewsletterSignup"
import { GraduationCap, Building2, Users, MapPin, AlertTriangle, TrendingUp, Clock, RefreshCw } from "lucide-react"
import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { Cut } from "@/types/supabase"

interface KpiData {
  totalCuts: number
  institutionsImpacted: number
  studentsAffected: number | null
  mostAffectedState: string
  lastUpdated: string
}

const cutTypeColors = {
  program_suspension: "bg-yellow-100 text-yellow-800 border-yellow-200",
  teach_out: "bg-orange-100 text-orange-800 border-orange-200",
  department_closure: "bg-red-100 text-red-800 border-red-200",
  campus_closure: "bg-rose-100 text-rose-800 border-rose-200",
  institution_closure: "bg-gray-100 text-gray-800 border-gray-200",
}

// Mock data as fallback only
const mockKpiData: KpiData = {
  totalCuts: 247,
  institutionsImpacted: 89,
  studentsAffected: 15420,
  mostAffectedState: "CA",
  lastUpdated: new Date().toISOString(),
}

const mockLatestCuts: Cut[] = [
  {
    id: "1",
    institution: "Example University",
    program_name: "Liberal Arts Program",
    state: "CA",
    cut_type: "program_suspension",
    announcement_date: "2024-03-15",
    effective_term: "Fall 2024",
    students_affected: 150,
    faculty_affected: 8,
    notes: "Program suspended due to budget constraints",
    source_url: "https://example.com/news",
    source_publication: "University Times",
    created_at: "2024-03-15T10:00:00Z",
    updated_at: "2024-03-15T10:00:00Z",
  },
  {
    id: "2",
    institution: "State College",
    program_name: "Philosophy Department",
    state: "TX",
    cut_type: "department_closure",
    announcement_date: "2024-03-10",
    effective_term: "Spring 2025",
    students_affected: 75,
    faculty_affected: 12,
    notes: "Department closure effective next semester",
    source_url: "https://example.com/announcement",
    source_publication: "State College News",
    created_at: "2024-03-10T09:00:00Z",
    updated_at: "2024-03-10T09:00:00Z",
  },
  {
    id: "3",
    institution: "Community College",
    program_name: null,
    state: "NY",
    cut_type: "campus_closure",
    announcement_date: "2024-03-05",
    effective_term: "Summer 2024",
    students_affected: null,
    faculty_affected: 25,
    notes: "Campus closure due to declining enrollment",
    source_url: null,
    source_publication: null,
    created_at: "2024-03-05T08:00:00Z",
    updated_at: "2024-03-05T08:00:00Z",
  },
  {
    id: "4",
    institution: "Technical Institute",
    program_name: "Engineering Technology",
    state: "FL",
    cut_type: "teach_out",
    announcement_date: "2024-02-28",
    effective_term: "Fall 2024",
    students_affected: 200,
    faculty_affected: 15,
    notes: "Teach-out plan in place for current students",
    source_url: "https://example.com/tech-news",
    source_publication: "Tech Education Today",
    created_at: "2024-02-28T11:00:00Z",
    updated_at: "2024-02-28T11:00:00Z",
  },
  {
    id: "5",
    institution: "Regional University",
    program_name: "Art History Program",
    state: "IL",
    cut_type: "program_suspension",
    announcement_date: "2024-02-20",
    effective_term: "Summer 2024",
    students_affected: 45,
    faculty_affected: 3,
    notes: "Program suspended pending review",
    source_url: "https://example.com/university-update",
    source_publication: "Regional News",
    created_at: "2024-02-20T14:00:00Z",
    updated_at: "2024-02-20T14:00:00Z",
  },
]

export default function HomePage() {
  const [kpiData, setKpiData] = useState<KpiData | null>(null)
  const [latestCuts, setLatestCuts] = useState<Cut[]>([])
  const [loading, setLoading] = useState(true)
  const [cutsLoading, setCutsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      // Initialize data fetching with error handling
      initializeData()

      // Set up periodic refresh every 30 seconds
      const interval = setInterval(() => {
        refreshData()
      }, 30000)

      return () => {
        clearInterval(interval)
        // Clean up subscriptions safely
        try {
          if (isSupabaseConfigured && supabase) {
            supabase.removeAllChannels()
          }
        } catch (err) {
          console.warn("Error cleaning up subscriptions:", err)
        }
      }
    }
  }, [mounted])

  /** Initialize data with error handling */
  async function initializeData() {
    try {
      await Promise.all([fetchKpiData(), fetchLatestCuts()])

      // Set up real-time subscriptions after successful data fetch
      if (isSupabaseConfigured && supabase) {
        setupRealtimeSubscription()
      }
    } catch (err) {
      console.error("Error initializing data:", err)
      setError(err instanceof Error ? err.message : "Failed to initialize data")
    }
  }

  /** Set up real-time subscription for live updates */
  function setupRealtimeSubscription() {
    if (!isSupabaseConfigured || !supabase) return

    try {
      console.log("🔴 Setting up real-time subscription...")

      const channel = supabase
        .channel("dashboard-updates")
        .on(
          "postgres_changes",
          {
            event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
            schema: "public",
            table: "program_cuts", // Assuming your main table is called program_cuts
          },
          (payload) => {
            console.log("🔴 Real-time update received:", payload)
            // Refresh data when changes occur
            refreshData()
          },
        )
        .subscribe((status) => {
          console.log("🔴 Subscription status:", status)
        })

      return () => {
        try {
          supabase.removeChannel(channel)
        } catch (err) {
          console.warn("Error removing channel:", err)
        }
      }
    } catch (err) {
      console.warn("Error setting up real-time subscription:", err)
    }
  }

  /** Manual refresh function */
  async function refreshData() {
    if (refreshing) return // Prevent multiple simultaneous refreshes

    setRefreshing(true)
    console.log("🔄 Refreshing dashboard data...")

    try {
      await Promise.all([fetchKpiData(), fetchLatestCuts()])
      setLastRefresh(new Date())
      setError(null) // Clear any previous errors
    } catch (error) {
      console.error("Error refreshing data:", error)
      setError(error instanceof Error ? error.message : "Failed to refresh data")
    } finally {
      setRefreshing(false)
    }
  }

  /** Fetch aggregated KPI numbers with fresh data */
  async function fetchKpiData() {
    try {
      console.log("📊 Fetching fresh KPI data from ALL records...")

      // if Supabase is not configured, skip straight to mock data
      if (!isSupabaseConfigured || !supabase) {
        setKpiData({
          ...mockKpiData,
          lastUpdated: new Date().toISOString(),
        })
        setLoading(false)
        return
      }

      const [
        { count: totalCuts, error: e1 },
        { data: institutions, error: e2 },
        { data: studentsData, error: e3 },
        { data: statesData, error: e4 },
      ] = await Promise.all([
        supabase
          .from("v_latest_cuts")
          .select("id", { count: "exact", head: true }), // count-only, no ordering
        supabase
          .from("v_latest_cuts")
          .select("institution"), // Get ALL institutions
        supabase
          .from("v_latest_cuts")
          .select("students_affected"), // Get ALL student data
        supabase
          .from("v_latest_cuts")
          .select("state"), // Get ALL state data
      ])

      // if any query failed -> mock
      if (e1 || e2 || e3 || e4) {
        console.error("Database query failed:", e1 || e2 || e3 || e4)
        throw e1 || e2 || e3 || e4
      }

      console.log("📊 KPI Data Summary:", {
        totalCuts: totalCuts,
        institutionRecords: institutions?.length,
        studentRecords: studentsData?.length,
        stateRecords: statesData?.length,
      })

      const institutionsImpacted = new Set(institutions!.map((i) => i.institution)).size
      const studentsAffected = studentsData!.reduce((sum, item) => sum + (item.students_affected || 0), 0) || null

      const stateCounts = statesData!.reduce<Record<string, number>>((acc, item) => {
        acc[item.state] = (acc[item.state] || 0) + 1
        return acc
      }, {})

      const mostAffectedState = Object.entries(stateCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || ""

      const freshKpiData = {
        totalCuts: totalCuts || 0,
        institutionsImpacted,
        studentsAffected,
        mostAffectedState,
        lastUpdated: new Date().toISOString(),
      }

      console.log("📊 Fresh KPI data:", freshKpiData)
      setKpiData(freshKpiData)
    } catch (error) {
      console.error("Error fetching KPI data:", error)
      setKpiData({
        ...mockKpiData,
        lastUpdated: new Date().toISOString(),
      }) // graceful fallback
    } finally {
      setLoading(false)
    }
  }

  /** Fetch the 5 most recent cuts with fresh data */
  async function fetchLatestCuts() {
    try {
      console.log("📋 Fetching fresh latest cuts...")

      // instant fallback when Supabase is missing
      if (!isSupabaseConfigured || !supabase) {
        setLatestCuts(mockLatestCuts)
        setCutsLoading(false)
        return
      }

      const { data, error } = await supabase
        .from("v_latest_cuts")
        .select("*")
        .order("announcement_date", { ascending: false }) // Most recent first
        .limit(5)

      if (error) {
        console.error("Error fetching latest cuts:", error)
        throw error
      }

      console.log("📋 Fresh latest cuts:", data?.length || 0, "records")
      console.log("📋 Date range:", data?.[0]?.announcement_date, "to", data?.[data.length - 1]?.announcement_date)
      setLatestCuts(data || [])
    } catch (error) {
      console.error("Error fetching latest cuts:", error)
      setLatestCuts(mockLatestCuts) // graceful fallback
    } finally {
      setCutsLoading(false)
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <div className="text-red-800 font-medium mb-2">Connection Issue</div>
            <div className="text-red-600 text-sm mb-3">{error}</div>
            <Button onClick={refreshData} disabled={refreshing} size="sm" variant="outline">
              Try Again
            </Button>
          </div>
        )}

        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-800 rounded-full text-sm font-medium border border-red-200 shadow-sm">
            <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
            LIVE TRACKING
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent md:text-4xl">
              CollegeCuts Tracker
            </h1>
            <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed text-sm">
              Real-time monitoring of program cuts, department closures, and institutional changes across higher
              education. Keeping students, faculty, and communities informed about the evolving landscape of American
              colleges and universities.
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground flex-wrap">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Data updated continuously</span>
            </div>
            <div className="h-4 w-px bg-border hidden sm:block"></div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span>Started covering from 2024</span>
            </div>
            {lastRefresh && (
              <>
                <div className="h-4 w-px bg-border hidden sm:block"></div>
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  <span>Last updated: {lastRefresh.toLocaleTimeString()}</span>
                </div>
              </>
            )}
          </div>

          {/* Manual Refresh Button */}
          <div className="flex justify-center">
            <Button
              onClick={refreshData}
              disabled={refreshing}
              variant="outline"
              size="sm"
              className="bg-white hover:bg-gray-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Refreshing..." : "Refresh Data"}
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <EnhancedKpiCard
            title="Total Program Cuts"
            value={kpiData?.totalCuts || 0}
            subtitle="confirmed closures & suspensions"
            icon={GraduationCap}
            loading={loading}
            trend="up"
            trendValue="↑ Live updates"
          />
          <EnhancedKpiCard
            title="Institutions Affected"
            value={kpiData?.institutionsImpacted || 0}
            subtitle="colleges & universities"
            icon={Building2}
            loading={loading}
            trend="up"
            trendValue="↑ Real-time"
          />
          <EnhancedKpiCard
            title="Students Impacted"
            value={kpiData?.studentsAffected ? kpiData.studentsAffected.toLocaleString() : ""}
            subtitle="enrollment affected"
            icon={Users}
            loading={loading}
            trend="up"
            trendValue="↑ Dynamic"
          />
          <EnhancedKpiCard
            title="Most Affected State"
            value={kpiData?.mostAffectedState || ""}
            subtitle="by number of cuts"
            icon={MapPin}
            loading={loading}
          />
        </div>

        {/* Newsletter Signup */}
        <div className="max-w-4xl mx-auto">
          <NewsletterSignup />
        </div>

        {/* Latest 5 Cuts */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Latest Program Cuts</h2>
              <p className="text-muted-foreground">Most recent announcements and institutional changes</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-green-50 px-3 py-2 rounded-full border border-green-200">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live updates</span>
            </div>
          </div>

          <div className="space-y-4">
            {cutsLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="p-6 border rounded-xl bg-card shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-6 w-48" />
                          <Skeleton className="h-6 w-24" />
                        </div>
                        <Skeleton className="h-4 w-64" />
                      </div>
                      <Skeleton className="h-5 w-5" />
                    </div>
                  </div>
                ))
              : latestCuts.map((cut, index) => (
                  <div
                    key={cut.id}
                    className="group p-6 border rounded-xl bg-card shadow-sm hover:shadow-md transition-all duration-200 hover:border-primary/20"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          <Link
                            href={`/cut/${cut.id}`}
                            className="font-semibold text-lg hover:text-primary transition-colors group-hover:underline"
                          >
                            {cut.institution}
                          </Link>
                          <Badge className={`${cutTypeColors[cut.cut_type]} border`} variant="secondary">
                            {cut.cut_type.replace("_", " ")}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                          {cut.program_name && (
                            <>
                              <span className="font-medium">{cut.program_name}</span>
                              <div className="h-1 w-1 bg-muted-foreground rounded-full"></div>
                            </>
                          )}
                          <span>{cut.state}</span>
                          <div className="h-1 w-1 bg-muted-foreground rounded-full"></div>
                          <span>{new Date(cut.announcement_date).toLocaleDateString()}</span>
                          {cut.students_affected && (
                            <>
                              <div className="h-1 w-1 bg-muted-foreground rounded-full"></div>
                              <span>{cut.students_affected.toLocaleString()} students affected</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {cut.source_url && (
                          <a
                            href={cut.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View source"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
          </div>

          <div className="text-center">
            <Button asChild variant="outline" size="lg" className="shadow-sm bg-transparent">
              <Link href="/cuts">View All Cuts →</Link>
            </Button>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 text-red-600 font-medium">
              <AlertTriangle className="h-5 w-5" />
              <span>[LIVE] Tracking higher education cuts and institutional changes</span>
            </div>
            <p className="text-muted-foreground">
              Have information about program cuts or institutional changes?{" "}
              <Link href="/submit-tip" className="text-blue-600 hover:text-blue-800 font-medium hover:underline">
                Let me know if you see anything missing!
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
