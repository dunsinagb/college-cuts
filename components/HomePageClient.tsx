"use client"

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  GraduationCap, 
  Building2, 
  Users, 
  MapPin, 
  TrendingUp, 
  Clock, 
  RefreshCw, 
  Activity,
  Mail,
  CheckCircle,
  AlertCircle,
  ArrowRight
} from 'lucide-react'
import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabaseClient"
import { EnhancedKpiCard } from "@/components/EnhancedKpiCard"
import type { Cut } from "@/types/supabase"

interface KpiData {
  totalActions: number
  institutionsImpacted: number
  statesAffected: number
  mostImpactedState: string
  lastUpdated: string
}

const cutTypeColors = {
  program_suspension: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200",
  teach_out: "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200",
  department_closure: "bg-red-100 text-red-800 border-red-200 hover:bg-red-200",
  campus_closure: "bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-200",
  institution_closure: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200",
  staff_layoff: "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200",
}

// Mock data as fallback only
const mockKpiData: KpiData = {
  totalActions: 96,
  institutionsImpacted: 90,
  statesAffected: 25,
  mostImpactedState: "CA",
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
    control: "Public",
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
    control: "Public",
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
    control: "Public",
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
    control: "Private",
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
    control: "Public",
    created_at: "2024-02-20T14:00:00Z",
    updated_at: "2024-02-20T14:00:00Z",
  },
]

export function HomePageClient() {
  const [kpiData, setKpiData] = useState<KpiData | null>(null)
  const [latestCuts, setLatestCuts] = useState<Cut[]>([])
  const [loading, setLoading] = useState(true)
  const [cutsLoading, setCutsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  
  // Subscription state
  const [email, setEmail] = useState('')
  const [subscribing, setSubscribing] = useState(false)
  const [subscriptionMessage, setSubscriptionMessage] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)

  useEffect(() => {
    setMounted(true)
    console.log("🔍 HomePage mounted, checking Supabase configuration...")
    console.log("🔍 isSupabaseConfigured:", isSupabaseConfigured)
    console.log("🔍 supabase client:", !!getSupabaseClient())
    
    // Check subscription status
    const checkSubscription = () => {
      const cookies = document.cookie.split(';')
      const ccSubCookie = cookies.find(cookie => cookie.trim().startsWith('cc_sub='))
      const isSubscribed = ccSubCookie?.includes('1') || false
      
      console.log('🔍 Client-side subscription check:', {
        cookies: document.cookie,
        ccSubCookie: ccSubCookie,
        isSubscribed: isSubscribed
      })
      
      setIsSubscribed(isSubscribed)
    }
    checkSubscription()
  }, [])

  useEffect(() => {
    if (mounted) {
      console.log("🔍 HomePage mounted, initializing data...")
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
          const client = getSupabaseClient()
          if (isSupabaseConfigured && client) {
            client.removeAllChannels()
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
      const client = getSupabaseClient()
      if (isSupabaseConfigured && client) {
        setupRealtimeSubscription()
      }
    } catch (err) {
      console.error("Error initializing data:", err)
    }
  }

  /** Set up real-time subscription for live updates */
  function setupRealtimeSubscription() {
    const client = getSupabaseClient()
    if (!isSupabaseConfigured || !client) return

    try {
      console.log("🔴 Setting up real-time subscription...")

      client
        .channel("dashboard-updates")
        .on(
          "postgres_changes",
          {
            event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
            schema: "public",
            table: "v_latest_cuts", // Using the correct view name
          },
          (payload: any) => {
            console.log("🔴 Real-time update received:", payload)
            // Refresh data when changes occur
            refreshData()
          }
        )
        .subscribe()

      console.log("✅ Real-time subscription established")
    } catch (err) {
      console.error("❌ Error setting up real-time subscription:", err)
    }
  }

  /** Refresh all data */
  async function refreshData() {
    if (refreshing) return

    setRefreshing(true)
    try {
      await Promise.all([fetchKpiData(), fetchLatestCuts()])
      setLastRefresh(new Date())
    } catch (err) {
      console.error("Error refreshing data:", err)
      // setError(err instanceof Error ? err.message : "Failed to refresh data") // Removed unused variable
    } finally {
      setRefreshing(false)
    }
  }

  /** Fetch KPI data from Supabase */
  async function fetchKpiData() {
    console.log("🔍 fetchKpiData called")
    console.log("🔍 isSupabaseConfigured:", isSupabaseConfigured)
    
    const client = getSupabaseClient()
    console.log("🔍 supabase client:", !!client)
    
    if (!isSupabaseConfigured || !client) {
      console.log("⚠️ Supabase not configured, using mock data")
      setKpiData(mockKpiData)
      setLoading(false)
      return
    }

    try {
      console.log("📊 Fetching KPI data from Supabase...")

      // Fetch total actions count
      const { count: totalActions, error: actionsError } = await client
        .from("v_latest_cuts")
        .select("*", { count: "exact", head: true })

      if (actionsError) {
        console.error("Error fetching total actions:", actionsError)
        throw actionsError
      }

      console.log("✅ Total actions fetched:", totalActions)

      // Fetch unique institutions count
      const { data: institutions, error: institutionsError } = await client
        .from("v_latest_cuts")
        .select("institution")
        .not("institution", "is", null)

      if (institutionsError) {
        console.error("Error fetching institutions:", institutionsError)
        throw institutionsError
      }

      const uniqueInstitutions = new Set(institutions.map((i) => i.institution)).size
      console.log("✅ Unique institutions:", uniqueInstitutions)

      // Fetch unique states count
      const { data: stateData, error: stateError } = await client
        .from("v_latest_cuts")
        .select("state")
        .not("state", "is", null)

      if (stateError) {
        console.error("Error fetching state data:", stateError)
        throw stateError
      }

      const uniqueStates = new Set(stateData.map((s) => s.state)).size
      console.log("✅ Unique states:", uniqueStates)

      // Count occurrences of each state to find most impacted
      const stateCounts = stateData.reduce((acc: Record<string, number>, item: { state: string }) => {
        acc[item.state] = (acc[item.state] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const mostImpactedState = Object.entries(stateCounts).reduce((a, b) => (stateCounts[a[0]] > stateCounts[b[0]] ? a : b))[0]
      console.log("✅ Most impacted state:", mostImpactedState)

      const kpiData: KpiData = {
        totalActions: totalActions || 0,
        institutionsImpacted: uniqueInstitutions,
        statesAffected: uniqueStates,
        mostImpactedState,
        lastUpdated: new Date().toISOString(),
      }

      console.log("✅ KPI data fetched successfully:", kpiData)
      setKpiData(kpiData)
    } catch (err) {
      console.error("❌ Error fetching KPI data:", err)
      // Fallback to mock data
      setKpiData(mockKpiData)
    } finally {
      setLoading(false)
    }
  }

  /** Fetch latest cuts from Supabase */
  async function fetchLatestCuts() {
    const client = getSupabaseClient()
    if (!isSupabaseConfigured || !client) {
      console.log("⚠️ Supabase not configured, using mock data")
      setLatestCuts(mockLatestCuts)
      setCutsLoading(false)
      return
    }

    try {
      console.log("Fetching latest cuts from Supabase...")

      const { data, error } = await client
        .from("v_latest_cuts")
        .select("*")
        .order("announcement_date", { ascending: false })
        .limit(5)

      if (error) {
        console.error("Error fetching latest cuts:", error)
        throw error
      }

      console.log("✅ Latest cuts fetched successfully:", data?.length || 0, "cuts")
      setLatestCuts(data || [])
    } catch (err) {
      console.error("Error fetching latest cuts:", err)
      // setError(err instanceof Error ? err.message : "Failed to fetch latest cuts") // Removed unused variable
      // Fallback to mock data
      setLatestCuts(mockLatestCuts)
    } finally {
      setCutsLoading(false)
    }
  }

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault()
    setSubscribing(true)
    setSubscriptionMessage('')

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      if (response.ok) {
        setSubscriptionMessage('Success! You now have full access.')
        setIsSubscribed(true)
        setEmail('')
        
        // Manual fallback: Set cookie on client side as well
        document.cookie = 'cc_sub=1; path=/; max-age=31536000; samesite=lax'
        
        // Debug: Check if cookie was set
        setTimeout(() => {
          const cookies = document.cookie.split(';')
          const ccSubCookie = cookies.find(cookie => cookie.trim().startsWith('cc_sub='))
          console.log('🍪 After subscription success:', {
            cookies: document.cookie,
            ccSubCookie: ccSubCookie,
            isSubscribed: ccSubCookie?.includes('1') || false
          })
        }, 100)
        
        // Smooth transition: show success message briefly, then fade out subscription gate
        setTimeout(() => {
          setSubscriptionMessage('')
          // Trigger a custom event to notify other components of subscription change
          window.dispatchEvent(new CustomEvent('subscriptionChanged', { detail: { subscribed: true } }))
        }, 2000)
      } else {
        const data = await response.json()
        setSubscriptionMessage(data.error || 'Please enter a valid email')
      }
    } catch (error) {
      setSubscriptionMessage('Something went wrong. Please try again.')
    } finally {
      setSubscribing(false)
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="max-w-[var(--max-width)] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <p>Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-[var(--max-width)] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Hero Section */}
        <section className="text-center space-y-8" aria-labelledby="hero-title">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full border border-primary/20">
              <Activity className="h-4 w-4" aria-hidden="true" />
              <span className="text-sm font-medium">Live Dashboard</span>
            </div>

            <h1 id="hero-title" className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
              <span className="gradient-text">CollegeCuts</span>
              <br />
              <span className="text-foreground">Tracker</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
              Comprehensive database tracking college cuts, university program closures, and academic department suspensions across the United States. Monitor institutional changes, find affected programs, and track students and faculty impacted by higher education restructuring and budget cuts.
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 sm:gap-6 text-sm text-muted-foreground flex-wrap px-4" role="status" aria-live="polite">
            <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm px-3 py-2 rounded-full border">
              <Clock className="h-4 w-4" aria-hidden="true" />
              <span>Data updated continuously</span>
            </div>
            <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm px-3 py-2 rounded-full border">
              <TrendingUp className="h-4 w-4" aria-hidden="true" />
              <span>Started covering from 2024</span>
            </div>
            {lastRefresh && (
              <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm px-3 py-2 rounded-full border">
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                <span>Last updated: {lastRefresh.toLocaleTimeString()}</span>
              </div>
            )}
          </div>

          {/* Manual Refresh Button */}
          <div className="flex justify-center">
            <Button
              onClick={refreshData}
              disabled={refreshing}
              variant="outline"
              size="lg"
              className="glass card-hover"
              aria-label={refreshing ? "Refreshing data..." : "Refresh data"}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} aria-hidden="true" />
              {refreshing ? "Refreshing..." : "Refresh Data"}
            </Button>
          </div>
        </section>

        {/* Subscription Gate with smooth transition */}
        {!isSubscribed && (
          <section 
            aria-labelledby="subscription-title"
            className={`transition-all duration-1000 ease-in-out ${
              subscriptionMessage.includes('Success') ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'
            }`}
          >
            <Card className="gradient-border bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
              <CardContent className="p-6 sm:p-8 flex flex-col items-center justify-center gap-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 mb-2">
                  <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 id="subscription-title" className="text-2xl sm:text-3xl font-bold text-center">Unlock Full Access</h2>
                <p className="text-muted-foreground text-base text-center mb-2">Subscribe to access the full database and analytics.</p>
                <form onSubmit={handleSubscribe} className="w-full max-w-md flex gap-2">
                  <Input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 text-base px-4 py-3"
                    disabled={subscribing}
                    aria-label="Email address"
                  />
                  <Button 
                    type="submit" 
                    disabled={subscribing}
                    className="px-6 text-base font-semibold"
                  >
                    {subscribing ? '...' : 'Subscribe'}
                  </Button>
                </form>
                {subscriptionMessage && (
                  <Alert className={`w-full max-w-md transition-all duration-500 ${
                    subscriptionMessage.includes('Success') 
                      ? 'border-green-200 bg-green-50 dark:bg-green-900/20 scale-105' 
                      : 'border-red-200 bg-red-50 dark:bg-red-900/20'
                  }`}>
                    {subscriptionMessage.includes('Success') ? (
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    )}
                    <AlertDescription className={subscriptionMessage.includes('Success') ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}>
                      {subscriptionMessage}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </section>
        )}

        {/* Key Metrics */}
        <div className="container mx-auto px-4 py-4">
          <section aria-labelledby="metrics-title">
            <h2 id="metrics-title" className="sr-only">College Cuts Statistics and Key Performance Indicators</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <EnhancedKpiCard
                title="Total Actions Taken"
                value={kpiData?.totalActions || 0}
                subtitle="program suspensions & closures"
                icon={GraduationCap}
                loading={loading}
              />
              <EnhancedKpiCard
                title="Institutions Impacted"
                value={kpiData?.institutionsImpacted || 0}
                subtitle="colleges & universities"
                icon={Building2}
                loading={loading}
              />
              <EnhancedKpiCard
                title="States Affected"
                value={kpiData?.statesAffected || 0}
                subtitle="geographic spread"
                icon={Activity}
                loading={loading}
              />
              <EnhancedKpiCard
                title="Most Impacted State"
                value={kpiData?.mostImpactedState || ""}
                subtitle="by number of actions"
                icon={MapPin}
                loading={loading}
              />
            </div>
          </section>
        </div>

        {/* Latest 5 Actions */}
        <div className="container mx-auto px-4 py-8">
          <section aria-labelledby="latest-actions-title">
            <div className="text-center sm:text-left">
              <div className="space-y-2">
                <h2 id="latest-actions-title" className="text-2xl sm:text-3xl font-bold tracking-tight">Latest University Program Actions & Closures</h2>
                <p className="text-muted-foreground mb-8">Most recent announcements of academic program suspensions, department closures, and institutional changes</p>
              </div>
            </div>

            <div className="space-y-4" role="list" aria-label="Latest program actions">
              {cutsLoading
                ? Array.from({ length: 5 }).map((_: unknown, i: number) => (
                    <Card key={i} className="card-hover" role="listitem">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-3 flex-1">
                            <div className="flex items-center gap-3 flex-wrap">
                              <Skeleton className="h-6 w-32 sm:w-48" />
                              <Skeleton className="h-6 w-16 sm:w-24" />
                            </div>
                            <Skeleton className="h-4 w-48 sm:w-64" />
                          </div>
                          <Skeleton className="h-5 w-5" />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                : latestCuts.map((cut) => (
                    <Card key={cut.id} className="card-hover group" role="listitem">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3 flex-wrap">
                              <Link
                                href={`/cut/${cut.id}`}
                                className="font-semibold text-base sm:text-lg hover:text-primary transition-colors group-hover:underline"
                              >
                                {cut.institution}
                              </Link>
                              <Badge className={`${cutTypeColors[cut.cut_type]} border transition-colors text-xs`} variant="secondary">
                                {cut.cut_type.replace("_", " ")}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground flex-wrap">
                              {cut.program_name && (
                                <>
                                  <span className="font-medium">{cut.program_name}</span>
                                  <div className="h-1 w-1 bg-muted-foreground rounded-full" aria-hidden="true"></div>
                                </>
                              )}
                              <span>{cut.state}</span>
                              <div className="h-1 w-1 bg-muted-foreground rounded-full" aria-hidden="true"></div>
                              <span>{new Date(cut.announcement_date).toLocaleDateString()}</span>
                              {cut.students_affected && (
                                <>
                                  <div className="h-1 w-1 bg-muted-foreground rounded-full" aria-hidden="true"></div>
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
                                className="text-primary hover:text-primary/80 p-2 hover:bg-primary/10 rounded-lg transition-colors"
                                title="View source"
                                aria-label={`View source for ${cut.institution} announcement`}
                              >
                                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                              </a>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
            </div>

            <div className="text-center mt-6">
              <Button asChild variant="default" size="lg">
                <Link href="/cuts" className="flex items-center gap-2">
                  View All Actions
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </section>
        </div>

        {/* Call to Action */}
        <section aria-labelledby="cta-title">
          <Card className="gradient-border">
            <CardContent className="p-6 sm:p-8 text-center">
              <div className="space-y-4">
                <p className="text-muted-foreground text-base sm:text-lg">
                  Have information about program actions or institutional changes?{" "}
                  <Link href="/submit-tip" className="text-primary hover:text-primary/80 font-medium hover:underline">
                    Let me know if you see anything missing!
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
} 