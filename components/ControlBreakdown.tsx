"use client"

import { useRouter } from "next/navigation"
import { Bar } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"
import { useCutsAggregates } from "@/lib/useCutsAggregates"
import { Skeleton } from "@/components/ui/skeleton"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export function ControlBreakdown() {
  const { data, isLoading } = useCutsAggregates()
  const router = useRouter()

  if (isLoading) {
    return (
      <div className="rounded-lg shadow-sm bg-white dark:bg-gray-900 p-4">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  const chartData = {
    labels: data.controlBreakdown.map((item) => item.control),
    datasets: [
      {
        label: "Program Actions",
        data: data.controlBreakdown.map((item) => item.cuts),
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
        callbacks: {
          label: (context: any) => `${context.parsed.x} cuts`,
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
    onClick: (event: any, elements: any[]) => {
      if (elements.length > 0) {
        const index = elements[0].index
        const control = data.controlBreakdown[index].control
        router.push(`/cuts?control=${encodeURIComponent(control)}`)
      }
    },
  }

  return (
    <div className="rounded-lg shadow-sm bg-white dark:bg-gray-900 p-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Cuts by Institution Type</h3>
      <div className="h-64">
        <Bar data={chartData} options={options} />
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 prose">
        Click on bars to filter by institution control type
      </p>
    </div>
  )
}
