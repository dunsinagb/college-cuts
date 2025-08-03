"use client"

import { Doughnut } from "react-chartjs-2"
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js"
import { useCutsAnalytics } from "@/lib/useCutsAnalytics"
import { Skeleton } from "@/components/ui/skeleton"

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
)

export function CutTypeDonut() {
  const { data, isLoading } = useCutsAnalytics()

  if (isLoading) {
    return (
      <div className="rounded-lg bg-white dark:bg-gray-900 p-4 shadow-sm">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-80 w-full" />
      </div>
    )
  }

  const tailwindColors = [
    "rgb(239, 68, 68)", // red-500
    "rgb(245, 158, 11)", // amber-500
    "rgb(59, 130, 246)", // blue-500
    "rgb(16, 185, 129)", // emerald-500
    "rgb(139, 92, 246)", // violet-500
  ]

  const chartData = {
    labels: data.cutsByType.map((item) => 
      item.cut_type.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())
    ),
    datasets: [
      {
        data: data.cutsByType.map((item) => item.cuts),
        backgroundColor: tailwindColors.slice(0, data.cutsByType.length),
        borderColor: tailwindColors.slice(0, data.cutsByType.length).map(color => 
          color.replace("rgb", "rgba").replace(")", ", 0.8)")
        ),
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: "circle",
          color: "rgb(107, 114, 128)",
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "white",
        bodyColor: "white",
        borderColor: "rgb(59, 130, 246)",
        borderWidth: 1,
        callbacks: {
          label: (context: any) => {
            const value = context.parsed || context.raw || 0
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
            const percentage = ((value / total) * 100).toFixed(1)
            return `${context.label}: ${value} actions (${percentage}%)`
          },
        },
      },
    },
    cutout: "60%",
  }

  const totalCuts = data.cutsByType.reduce((sum, item) => sum + item.cuts, 0)

  return (
    <div 
      className="rounded-lg bg-white dark:bg-gray-900 p-4 shadow-sm"
      aria-label="Institutional actions by action type distribution"
    >
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Actions by Type
      </h3>
      
      <div className="relative h-80">
        <Doughnut data={chartData} options={options} />
        
        {/* Center total */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {totalCuts}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Total Actions
            </div>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
        Distribution of different types of institutional actions
      </p>
    </div>
  )
} 