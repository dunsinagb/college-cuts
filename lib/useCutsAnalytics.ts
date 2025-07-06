"use client"

import useSWR from "swr"
import { useEffect, useState } from "react"
import { supabase } from "./supabaseClient"

interface CutsByMonth {
  month: string
  cuts: number
}

interface CutsByControl {
  control: string
  cuts: number
}

interface CutsByState {
  state: string
  cuts: number
}

interface CutsByType {
  cut_type: string
  cuts: number
}

interface CutsAnalytics {
  cutsByMonth: CutsByMonth[]
  cutsByControl: CutsByControl[]
  cutsByState: CutsByState[]
  cutsByType: CutsByType[]
}

const fetcher = async (): Promise<CutsAnalytics & { cutsByMonthYear: { month: string, year: number, cuts: number }[] }> => {
  try {
    const client = supabase()
    if (!client) {
      throw new Error("Supabase client not initialized")
    }

    // Since we don't have the exact table structure with institutions join,
    // we'll use the v_latest_cuts view and adapt the queries
    
    // a) cutsByMonthYear: [{ month: 'Jan', year: 2024, cuts: 2 }, ...]
    const { data: monthData, error: monthError } = await client
      .from("v_latest_cuts")
      .select("announcement_date")
    
    if (monthError) throw monthError

    // Group by month and year
    const monthYearCount: Record<string, number> = (monthData || []).reduce((acc, cut) => {
      if (cut.announcement_date) {
        const date = new Date(cut.announcement_date)
        const year = date.getFullYear()
        const month = date.toLocaleString("en-US", { month: "short" })
        const key = `${year}-${month}`
        acc[key] = (acc[key] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    // Convert to array and sort by year then month
    const cutsByMonthYear = Object.entries(monthYearCount)
      .map(([key, cuts]) => {
        const [year, month] = key.split("-")
        return { month, year: Number(year), cuts }
      })
      .sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year
        // Sort months Jan-Dec
        const monthOrder = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
        return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month)
      })

    // b) cutsByMonth
    const cutsByMonth = monthData?.reduce((acc: Record<string, number>, cut) => {
      if (cut.announcement_date) {
        const month = cut.announcement_date.substring(0, 7) // YYYY-MM
        acc[month] = (acc[month] || 0) + 1
      }
      return acc
    }, {}) || {}

    const monthArray = Object.entries(cutsByMonth)
      .map(([month, cuts]) => ({ month, cuts }))
      .sort((a, b) => a.month.localeCompare(b.month))

    // b) cutsByControl (count unique universities by control type)
    const { data: controlData, error: controlError } = await client
      .from("v_latest_cuts")
      .select("control, institution")
    
    if (controlError) throw controlError

    // Count unique universities by control type
    const controlCount = controlData?.reduce((acc: Record<string, Set<string>>, cut) => {
      if (cut.control) {
        if (!acc[cut.control]) {
          acc[cut.control] = new Set()
        }
        // Count unique institutions by control type
        acc[cut.control].add(cut.institution)
      }
      return acc
    }, {}) || {}

    const cutsByControl = Object.entries(controlCount)
      .map(([control, institutions]) => ({ 
        control, 
        cuts: institutions.size // This represents unique universities, not total cuts
      }))
      .sort((a, b) => b.cuts - a.cuts)

    // c) cutsByState
    const { data: stateData, error: stateError } = await client
      .from("v_latest_cuts")
      .select("state")
    
    if (stateError) throw stateError

    const stateCount = stateData?.reduce((acc: Record<string, number>, cut) => {
      if (cut.state) {
        acc[cut.state] = (acc[cut.state] || 0) + 1
      }
      return acc
    }, {}) || {}

    const cutsByState = Object.entries(stateCount)
      .map(([state, cuts]) => ({ state, cuts }))
      .sort((a, b) => b.cuts - a.cuts)

    // d) cutsByType
    const { data: typeData, error: typeError } = await client
      .from("v_latest_cuts")
      .select("cut_type")
    
    if (typeError) throw typeError

    const typeCount = typeData?.reduce((acc: Record<string, number>, cut) => {
      if (cut.cut_type) {
        acc[cut.cut_type] = (acc[cut.cut_type] || 0) + 1
      }
      return acc
    }, {}) || {}

    const cutsByType = Object.entries(typeCount)
      .map(([cut_type, cuts]) => ({ cut_type, cuts }))
      .sort((a, b) => b.cuts - a.cuts)

    return {
      cutsByMonth: monthArray,
      cutsByControl,
      cutsByState,
      cutsByType,
      cutsByMonthYear,
    }
  } catch (error) {
    console.error("Error fetching analytics data:", error)
    throw error
  }
}

export function useCutsAnalytics() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  
  const { data, error, isLoading, mutate } = useSWR<any>(
    `cuts-analytics-${refreshTrigger}`,
    fetcher,
    {
      refreshInterval: 10000, // Revalidate every 10 seconds instead of 60
      revalidateOnFocus: true, // Revalidate when window gains focus
      revalidateOnReconnect: true, // Revalidate when reconnecting
      dedupingInterval: 5000, // Dedupe requests within 5 seconds
      errorRetryCount: 3,
      errorRetryInterval: 5000,
    }
  )

  // Subscribe to realtime updates
  useEffect(() => {
    const client = supabase()
    if (!client) return

    const channel = client
      .channel("analytics-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "v_latest_cuts" },
        (payload: any) => {
          console.log("Analytics data changed, revalidating...", payload)
          // Mutate SWR cache when data changes
          mutate()
        }
      )
      .subscribe((status) => {
        console.log("Analytics subscription status:", status)
      })

    return () => {
      const currentClient = supabase()
      if (currentClient) {
        currentClient.removeChannel(channel)
      }
    }
  }, [mutate])

  const manualRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return {
    data: data || {
      cutsByMonth: [],
      cutsByControl: [],
      cutsByState: [],
      cutsByType: [],
      cutsByMonthYear: [],
    },
    error,
    isLoading,
    mutate, // Expose mutate function for manual refresh
    manualRefresh, // Expose manual refresh function
  }
} 