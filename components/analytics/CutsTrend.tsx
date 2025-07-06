"use client"

import { Bar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { useCutsAnalytics } from "@/lib/useCutsAnalytics"
import { Skeleton } from "@/components/ui/skeleton"

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
const YEARS = [2024, 2025]

export function CutsTrend() {
  const { data, isLoading } = useCutsAnalytics()

  if (isLoading) {
    return (
      <div className="rounded-lg bg-white dark:bg-gray-900 p-4 shadow-sm">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  // Prepare data for grouped bar chart
  // Find all months with data for either year
  const allMonthsWithData: string[] = Array.from(
    new Set(
      (data.cutsByMonthYear as { month: string; year: number; cuts: number }[])
        .filter((item) => YEARS.includes(item.year))
        .map((item) => item.month as string)
    )
  ).filter((month: string) => MONTHS.includes(month))

  // Sort months in calendar order
  allMonthsWithData.sort((a: string, b: string) => MONTHS.indexOf(a) - MONTHS.indexOf(b))

  // For each year, get the cuts for each month (0 if none)
  const datasets = YEARS.map((year, idx) => ({
    label: String(year),
    data: allMonthsWithData.map((month: string) => {
      const found = (data.cutsByMonthYear as { month: string; year: number; cuts: number }[]).find((item) => item.year === year && item.month === month)
      return found ? found.cuts : 0
    }),
    backgroundColor: idx === 0 ? "#60a5fa" : "#f59e42", // blue for 2024, orange for 2025
    borderRadius: 4,
    barPercentage: 0.7,
    categoryPercentage: 0.6,
  }))

  const chartData = {
    labels: allMonthsWithData,
    datasets,
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "white",
        bodyColor: "white",
        borderColor: "rgb(59, 130, 246)",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(156, 163, 175, 0.2)",
        },
        ticks: {
          color: "rgb(107, 114, 128)",
          maxRotation: 45,
        },
        stacked: false,
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(156, 163, 175, 0.2)",
        },
        ticks: {
          color: "rgb(107, 114, 128)",
          stepSize: 1,
        },
        stacked: false,
      },
    },
    interaction: {
      intersect: false,
      mode: "index" as const,
    },
  }

  return (
    <div 
      className="rounded-lg bg-white dark:bg-gray-900 p-4 shadow-sm"
      aria-label="Program cuts trend over time"
    >
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Cuts Over Time (2024 vs 2025)
      </h3>
      <div className="h-64">
        <Bar data={chartData} options={options} />
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
        Monthly trend of program cuts across all institutions, grouped by year
      </p>
    </div>
  )
} 