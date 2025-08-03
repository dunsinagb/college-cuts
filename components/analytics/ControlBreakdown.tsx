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

export function ControlBreakdown() {
  const { data, isLoading } = useCutsAnalytics()

  if (isLoading) {
    return (
      <div className="rounded-lg bg-white dark:bg-gray-900 p-4 shadow-sm">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  const chartData = {
    labels: data.cutsByControl.map((item: any) => item.control),
    datasets: [
      {
        label: "Universities",
        data: data.cutsByControl.map((item: any) => item.cuts),
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)", // blue-500
          "rgba(16, 185, 129, 0.8)", // emerald-500
          "rgba(245, 158, 11, 0.8)", // amber-500
        ],
        borderColor: ["rgb(59, 130, 246)", "rgb(16, 185, 129)", "rgb(245, 158, 11)"],
        borderWidth: 1,
      },
    ],
  }

  const options = {
    indexAxis: "y" as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
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
        callbacks: {
          label: (context: { parsed: { x: number } }) => `${context.parsed.x} universities`,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          color: "rgba(156, 163, 175, 0.2)",
        },
        ticks: {
          color: "rgb(107, 114, 128)",
        },
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          color: "rgb(107, 114, 128)",
        },
      },
    },
  }

  return (
    <div 
      className="rounded-lg bg-white dark:bg-gray-900 p-4 shadow-sm"
      aria-label="University counts by institution control type"
    >
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Actions by Control Type
      </h3>
      <div className="h-80">
        <Bar data={chartData} options={options} />
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
        Number of universities by institution control type
      </p>
    </div>
  )
} 