"use client"

import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { useCutsAnalytics } from "@/lib/useCutsAnalytics"
import { Skeleton } from "@/components/ui/skeleton"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

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

  const chartData = {
    labels: data.cutsByMonth.map((item) => {
      const date = new Date(item.month + "-01")
      return date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
    }),
    datasets: [
      {
        label: "Program Cuts",
        data: data.cutsByMonth.map((item) => item.cuts),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "rgb(59, 130, 246)",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  }

  const options = {
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
          title: (context: { label: string }[]) => {
            return context[0].label
          },
          label: (context: { parsed: { y: number } }) => {
            return `${context.parsed.y} cuts`
          },
        },
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
        Cuts Over Time
      </h3>
      <div className="h-64">
        <Line data={chartData} options={options} />
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
        Monthly trend of program cuts across all institutions
      </p>
    </div>
  )
} 