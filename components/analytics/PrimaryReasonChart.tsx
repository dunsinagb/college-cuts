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
import { supabase } from "@/lib/supabaseClient"

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

// Function to categorize cuts based on notes content (same as in CutsDataGrid)
function categorizeCut(notes: string | null): string {
  if (!notes) return "Budget Deficit"
  
  const notesLower = notes.toLowerCase()
  
  // Budget and financial issues (highest priority - most common)
  if (notesLower.includes("budget deficit") || notesLower.includes("budget gap") || 
      notesLower.includes("budget shortfall") || notesLower.includes("deficit") ||
      notesLower.includes("financial deficit") || notesLower.includes("operating deficit") ||
      notesLower.includes("budget constraints") || notesLower.includes("budget cuts") ||
      notesLower.includes("revenue gap") || notesLower.includes("financial instability") ||
      notesLower.includes("financial collapse") || notesLower.includes("financial challenges") ||
      notesLower.includes("financial fragility") || notesLower.includes("financial irregularities")) {
    return "Budget Deficit"
  }
  
  // Federal funding cuts
  if (notesLower.includes("federal funding") || notesLower.includes("federal cuts") ||
      notesLower.includes("federal budget") || notesLower.includes("federal grants") ||
      notesLower.includes("usaid") || notesLower.includes("federal funding freeze") ||
      notesLower.includes("federal funding threats") || notesLower.includes("federal budget cuts") ||
      notesLower.includes("federal funding elimination")) {
    return "Federal Funding Cuts"
  }
  
  // State mandates and requirements
  if (notesLower.includes("state mandate") || notesLower.includes("state requirement") ||
      notesLower.includes("state funding") || notesLower.includes("state-mandated") ||
      notesLower.includes("graduation thresholds") || notesLower.includes("low-productivity") ||
      notesLower.includes("state-mandated graduation") || notesLower.includes("degree program thresholds") ||
      notesLower.includes("indiana state mandate") || notesLower.includes("ohio sb1") ||
      notesLower.includes("hb 265")) {
    return "State Mandates"
  }
  
  // Enrollment issues
  if (notesLower.includes("enrollment decline") || notesLower.includes("declining enrollment") ||
      notesLower.includes("low enrollment") || notesLower.includes("enrollment woes") ||
      notesLower.includes("enrollment shortfall") || notesLower.includes("enrollment down")) {
    return "Enrollment Decline"
  }
  
  // Strategic restructuring
  if (notesLower.includes("strategic") || notesLower.includes("restructuring") ||
      notesLower.includes("realignment") || notesLower.includes("mission alignment") ||
      notesLower.includes("broader restructuring") || notesLower.includes("institution-wide") ||
      notesLower.includes("voluntary buyouts") || notesLower.includes("voluntary retirement") ||
      notesLower.includes("buyouts") || notesLower.includes("retirement incentives")) {
    return "Strategic Restructuring"
  }
  
  // Political pressure
  if (notesLower.includes("political pressure") || notesLower.includes("state lawmakers") ||
      notesLower.includes("national security") || notesLower.includes("antisemitism") ||
      notesLower.includes("chinese communist party") || notesLower.includes("house select committee")) {
    return "Political Pressure"
  }
  
  // Operational costs
  if (notesLower.includes("operational costs") || notesLower.includes("rising costs") ||
      notesLower.includes("cost constraints") || notesLower.includes("cost-saving") ||
      notesLower.includes("operational challenges") || notesLower.includes("operational cuts") ||
      notesLower.includes("facilities") || notesLower.includes("on-campus")) {
    return "Operational Costs"
  }
  
  // Financial mismanagement
  if (notesLower.includes("mismanagement") || notesLower.includes("misuse of funds") ||
      notesLower.includes("endowment mismanagement") || notesLower.includes("gross mismanagement")) {
    return "Financial Mismanagement"
  }
  
  // Accreditation issues
  if (notesLower.includes("accreditation") || notesLower.includes("probation") ||
      notesLower.includes("accreditation surrender")) {
    return "Accreditation Issues"
  }
  
  // Default to Budget Deficit for any remaining cases
  return "Budget Deficit"
}

export function PrimaryReasonChart() {
  const { data, isLoading } = useCutsAnalytics()

  if (isLoading) {
    return (
      <div className="rounded-lg bg-white dark:bg-gray-900 p-4 shadow-sm">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-80 w-full" />
      </div>
    )
  }

  // For now, use mock data structure until we can integrate the categorization
  const mockReasonData = {
    "Budget Deficit": 45,
    "Federal Funding Cuts": 12,
    "State Mandates": 8,
    "Enrollment Decline": 6,
    "Strategic Restructuring": 5,
    "Political Pressure": 3,
    "Operational Costs": 4,
    "Financial Mismanagement": 2,
    "Accreditation Issues": 1
  }

  const sortedReasons = Object.entries(mockReasonData)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8) // Show top 8 reasons

  const chartData = {
    labels: sortedReasons.map(([reason]) => reason),
    datasets: [
      {
        label: "Actions",
        data: sortedReasons.map(([, count]) => count),
        backgroundColor: [
          "#ef4444", // red-500
          "#f59e0b", // amber-500
          "#3b82f6", // blue-500
          "#10b981", // emerald-500
          "#8b5cf6", // violet-500
          "#ec4899", // pink-500
          "#f97316", // orange-500
          "#6b7280", // gray-500
        ],
        borderRadius: 4,
      },
    ],
  }

  const options = {
    indexAxis: "y" as const, // Horizontal bar chart
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
          label: (context: any) => {
            const value = context.parsed.x || context.raw || 0
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
            const percentage = ((value / total) * 100).toFixed(1)
            return `${context.label}: ${value} actions (${percentage}%)`
          },
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
          stepSize: 1,
        },
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          color: "rgb(107, 114, 128)",
          font: {
            size: 12,
          },
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
      aria-label="Primary reasons for institutional actions"
    >
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Primary Reasons for Actions
      </h3>
      <div className="h-80">
        <Bar data={chartData} options={options} />
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
        Distribution of primary reasons driving institutional actions across higher education
      </p>
    </div>
  )
} 