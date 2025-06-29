"use client"

import useSWR from "swr"
import { useEffect } from "react"
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

const fetcher = async (): Promise<CutsAnalytics> => {
  try {
    if (!supabase) {
      throw new Error("Supabase client not configured")
    }

    // Since we don't have the exact table structure with institutions join,
    // we'll use the v_latest_cuts view and adapt the queries
    
    // a) cutsByMonth
    const { data: monthData, error: monthError } = await supabase
      .from("v_latest_cuts")
      .select("announcement_date")
    
    if (monthError) throw monthError

    const cutsByMonth = monthData?.reduce((acc: Record<string, number>, cut) => {
      const month = cut.announcement_date.substring(0, 7) // YYYY-MM
      acc[month] = (acc[month] || 0) + 1
      return acc
    }, {}) || {}

    const monthArray = Object.entries(cutsByMonth)
      .map(([month, cuts]) => ({ month, cuts }))
      .sort((a, b) => a.month.localeCompare(b.month))

    // b) cutsByControl (count unique universities by control type)
    const { data: controlData, error: controlError } = await supabase
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
    const { data: stateData, error: stateError } = await supabase
      .from("v_latest_cuts")
      .select("state")
    
    if (stateError) throw stateError

    const stateCount = stateData?.reduce((acc: Record<string, number>, cut) => {
      acc[cut.state] = (acc[cut.state] || 0) + 1
      return acc
    }, {}) || {}

    const cutsByState = Object.entries(stateCount)
      .map(([state, cuts]) => ({ state, cuts }))
      .sort((a, b) => b.cuts - a.cuts)

    // d) cutsByType
    const { data: typeData, error: typeError } = await supabase
      .from("v_latest_cuts")
      .select("cut_type")
    
    if (typeError) throw typeError

    const typeCount = typeData?.reduce((acc: Record<string, number>, cut) => {
      acc[cut.cut_type] = (acc[cut.cut_type] || 0) + 1
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
    }
  } catch (error) {
    console.error("Error fetching analytics data:", error)
    throw error
  }
}

export function useCutsAnalytics() {
  const { data, error, isLoading, mutate } = useSWR<CutsAnalytics>(
    "cuts-analytics",
    fetcher,
    {
      refreshInterval: 60000, // Revalidate every 60 seconds
      revalidateOnFocus: false,
    }
  )

  // Subscribe to realtime updates
  useEffect(() => {
    if (!supabase) return

    const channel = supabase
      .channel("analytics-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "v_latest_cuts" },
        (payload) => {
          // Mutate SWR cache when data changes
          mutate()
        }
      )
      .subscribe()

    return () => {
      if (supabase) {
        supabase.removeChannel(channel)
      }
    }
  }, [mutate])

  return {
    data: data || {
      cutsByMonth: [],
      cutsByControl: [],
      cutsByState: [],
      cutsByType: [],
    },
    error,
    isLoading,
  }
} 