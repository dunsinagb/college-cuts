"use client"

import { useState } from "react"
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
import { useCutsAggregates } from "@/lib/useCutsAggregates"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

export function CutsTrend() {
  const { data, isLoading } = useCutsAggregates()
  const [timeWindow, setTimeWindow] = useState<"12" | "24" | "all">("12")

  if (isLoading) {
    return (
      <div className="rounded-lg shadow-sm bg-white dark:bg-gray-900 p-4">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  // Filter data based on time window
  const filterData = () => {
    if (timeWindow === "all") return data.monthlyTrend

    const monthsToShow = timeWindow === "12" ? 12 : 24
    return data.monthlyTrend.slice(-monthsToShow)
  }

  const filteredData = filterData()

  const chartData = {
    labels: filteredData.map((item) => {
      const date = new Date(item.month + "-01")
      return date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
    }),
    datasets: [
      {
        label: "Program Cuts",
        data: filteredData.map((item) => item.cuts),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
        pointBackgroundColor: "rgb(59, 130, 246)",
        pointBorderColor: "rgb(59, 130, 246)",
        pointHoverBackgroundColor: "rgb(37, 99, 235)",
        pointHoverBorderColor: "rgb(37, 99, 235)",
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
        callbacks: {
          label: (context: any) => {
            const date = new Date(filteredData[context.dataIndex].month + "-01")
            const monthYear = date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
            return `${monthYear} – ${context.parsed.y} cuts`
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
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(156, 163, 175, 0.2)",
        },
        ticks: {
          color: "rgb(107, 114, 128)",
        },
      },
    },
  }

  return (
    <div className="rounded-lg shadow-sm bg-white dark:bg-gray-900 p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Monthly Trend</h3>
        <Select value={timeWindow} onValueChange={(value: "12" | "24" | "all") => setTimeWindow(value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="12">12 months</SelectItem>
            <SelectItem value="24">24 months</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="h-64">
        <Line data={chartData} options={options} />
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 prose">
        Hover over points to see detailed monthly data
      </p>
    </div>
  )
}
