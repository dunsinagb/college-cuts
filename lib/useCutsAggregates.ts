"use client"

import useSWR from "swr"
import { supabase } from "./supabaseClient"

interface ControlBreakdown {
  control: string
  cuts: number
}

interface StateBreakdown {
  state: string
  cuts: number
}

interface MonthlyTrend {
  month: string
  cuts: number
}

interface CutsAggregates {
  controlBreakdown: ControlBreakdown[]
  stateBreakdown: StateBreakdown[]
  monthlyTrend: MonthlyTrend[]
}

const fetcher = async (): Promise<CutsAggregates> => {
  // Mock data for demo - replace with real queries when institutions table exists
  const mockControlBreakdown: ControlBreakdown[] = [
    { control: "Public", cuts: 145 },
    { control: "Private non-profit", cuts: 78 },
    { control: "Private for-profit", cuts: 24 },
  ]

  const mockStateBreakdown: StateBreakdown[] = [
    { state: "CA", cuts: 32 },
    { state: "TX", cuts: 28 },
    { state: "NY", cuts: 24 },
    { state: "FL", cuts: 19 },
    { state: "IL", cuts: 16 },
    { state: "PA", cuts: 14 },
    { state: "OH", cuts: 12 },
    { state: "MI", cuts: 11 },
    { state: "GA", cuts: 9 },
    { state: "NC", cuts: 8 },
  ]

  const mockMonthlyTrend: MonthlyTrend[] = [
    { month: "2024-01", cuts: 8 },
    { month: "2024-02", cuts: 12 },
    { month: "2024-03", cuts: 15 },
    { month: "2024-04", cuts: 18 },
    { month: "2024-05", cuts: 22 },
    { month: "2024-06", cuts: 19 },
    { month: "2024-07", cuts: 25 },
    { month: "2024-08", cuts: 28 },
    { month: "2024-09", cuts: 31 },
    { month: "2024-10", cuts: 24 },
    { month: "2024-11", cuts: 27 },
    { month: "2024-12", cuts: 18 },
  ]

  try {
    // Try to fetch real data first
    const client = supabase()
    if (!client) {
      throw new Error("Supabase client not initialized")
    }
    
    const { data: cuts } = await client.from("v_latest_cuts").select("state, announcement_date")

    if (cuts && cuts.length > 0) {
      // Process real data for state breakdown
      const stateCount = cuts.reduce((acc: Record<string, number>, cut) => {
        acc[cut.state] = (acc[cut.state] || 0) + 1
        return acc
      }, {})

      const realStateBreakdown = Object.entries(stateCount)
        .map(([state, cuts]) => ({ state, cuts: cuts as number }))
        .sort((a, b) => b.cuts - a.cuts)

      // Process real data for monthly trend
      const monthlyCount = cuts.reduce((acc: Record<string, number>, cut) => {
        const month = cut.announcement_date.substring(0, 7) // YYYY-MM
        acc[month] = (acc[month] || 0) + 1
        return acc
      }, {})

      const realMonthlyTrend = Object.entries(monthlyCount)
        .map(([month, cuts]) => ({ month, cuts: cuts as number }))
        .sort((a, b) => a.month.localeCompare(b.month))

      return {
        controlBreakdown: mockControlBreakdown, // Keep mock until institutions table exists
        stateBreakdown: realStateBreakdown,
        monthlyTrend: realMonthlyTrend,
      }
    }
  } catch (error) {
    console.error("Error fetching aggregates:", error)
  }

  // Fallback to mock data
  return {
    controlBreakdown: mockControlBreakdown,
    stateBreakdown: mockStateBreakdown,
    monthlyTrend: mockMonthlyTrend,
  }
}

export function useCutsAggregates() {
  const { data, error, isLoading } = useSWR<CutsAggregates>("cuts-aggregates", fetcher, {
    refreshInterval: 60000, // Revalidate every 60 seconds
    revalidateOnFocus: false,
  })

  return {
    data: data || { controlBreakdown: [], stateBreakdown: [], monthlyTrend: [] },
    error,
    isLoading,
  }
}
