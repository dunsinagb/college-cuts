"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js"
import { Bar } from "react-chartjs-2"
import { Skeleton } from "@/components/ui/skeleton"

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface StateActionData {
  state: string
  actions2024: number
  actions2025: number
  totalActions: number
}

export function StateActionsChart() {
  const [data, setData] = useState<StateActionData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStateData() {
      try {
        const client = supabase()
        if (!client) {
          console.warn("Supabase client not available")
          return
        }

        // Fetch all actions with state and date
        const { data: actions, error } = await client
          .from("v_latest_cuts")
          .select("state, announcement_date")
          .not("state", "is", null)
          .eq("status", "confirmed") // Only confirmed cases

        if (error) {
          console.error("Error fetching state data:", error)
          return
        }

        // Process data to get counts by state and year
        const stateCounts: Record<string, { 2024: number; 2025: number }> = {}
        
        actions?.forEach((action) => {
          const year = new Date(action.announcement_date).getFullYear()
          const state = action.state
          
          if (!stateCounts[state]) {
            stateCounts[state] = { 2024: 0, 2025: 0 }
          }
          
          if (year === 2024 || year === 2025) {
            stateCounts[state][year as keyof typeof stateCounts[typeof state]]++
          }
        })

        // Convert to array and sort by total actions
        const stateData: StateActionData[] = Object.entries(stateCounts)
          .map(([state, counts]) => ({
            state,
            actions2024: counts[2024] || 0,
            actions2025: counts[2025] || 0,
            totalActions: (counts[2024] || 0) + (counts[2025] || 0)
          }))
          .sort((a, b) => b.totalActions - a.totalActions)
          .slice(0, 10) // Top 10 states

        setData(stateData)
      } catch (err) {
        console.error("Error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchStateData()
  }, [])

  const chartData = {
    labels: data.map(item => item.state),
    datasets: [
      {
        label: "2024 Actions",
        data: data.map(item => item.actions2024),
        backgroundColor: "#60a5fa", // Blue - same as CutsTrend
        borderColor: "#60a5fa",
        borderWidth: 1,
        borderRadius: 4,
        barPercentage: 0.7,
        categoryPercentage: 0.6,
      },
      {
        label: "2025 Actions",
        data: data.map(item => item.actions2025),
        backgroundColor: "#f59e42", // Orange - same as CutsTrend
        borderColor: "#f59e42",
        borderWidth: 1,
        borderRadius: 4,
        barPercentage: 0.7,
        categoryPercentage: 0.6,
      },
    ],
  }

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "white",
        bodyColor: "white",
        borderColor: "rgb(59, 130, 246)",
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          title: function(context) {
            return `State: ${context[0].label}`
          },
          label: function(context) {
            const label = context.dataset.label || ""
            const value = context.parsed.y
            return `${label}: ${value} actions`
          },
          afterBody: function(context) {
            const dataIndex = context[0].dataIndex
            const item = data[dataIndex]
            if (item) {
              return [
                `Total Actions: ${item.totalActions}`,
                `2024: ${item.actions2024} | 2025: ${item.actions2025}`
              ]
            }
            return []
          }
        }
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: "State",
          font: {
            size: 12,
            weight: "bold",
          },
        },
        grid: {
          color: "rgba(156, 163, 175, 0.2)",
        },
        ticks: {
          color: "rgb(107, 114, 128)",
          maxRotation: 45,
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: "Number of Actions",
          font: {
            size: 12,
            weight: "bold",
          },
        },
        beginAtZero: true,
        grid: {
          color: "rgba(156, 163, 175, 0.2)",
        },
        ticks: {
          color: "rgb(107, 114, 128)",
          stepSize: 1,
        },
      },
    },
    interaction: {
      mode: "nearest" as const,
      axis: "x" as const,
      intersect: false,
    },
  }

  if (loading) {
    return (
      <div className="rounded-lg bg-white dark:bg-gray-900 p-4 shadow-sm">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-80 w-full" />
      </div>
    )
  }

  return (
    <div 
      className="rounded-lg bg-white dark:bg-gray-900 p-4 shadow-sm"
      aria-label="Top 10 states by program actions"
    >
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Top 10 States by Program Actions (2024-2025)
      </h3>
      <div className="h-80">
        <Bar data={chartData} options={options} />
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
        Showing top 10 states by total program actions from 2024-2025. Blue bars represent 2024 actions, orange bars represent 2025 actions.
      </p>
    </div>
  )
} 