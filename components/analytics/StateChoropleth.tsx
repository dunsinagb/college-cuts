"use client"

import { useCutsAnalytics } from "@/lib/useCutsAnalytics"
import { Skeleton } from "@/components/ui/skeleton"

// Mock US map data since we don't have the actual topojson file
// In a real implementation, you would import the US map data
const mockUSStates = [
  { id: "CA", name: "California" },
  { id: "TX", name: "Texas" },
  { id: "NY", name: "New York" },
  { id: "FL", name: "Florida" },
  { id: "IL", name: "Illinois" },
  { id: "PA", name: "Pennsylvania" },
  { id: "OH", name: "Ohio" },
  { id: "MI", name: "Michigan" },
  { id: "GA", name: "Georgia" },
  { id: "NC", name: "North Carolina" },
]

export function StateChoropleth() {
  const { data, isLoading } = useCutsAnalytics()

  if (isLoading) {
    return (
      <div className="rounded-lg bg-white dark:bg-gray-900 p-4 shadow-sm">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  // Create a map of state data for easy lookup
  const stateDataMap = data.cutsByState.reduce((acc, state) => {
    acc[state.state] = state.cuts
    return acc
  }, {} as Record<string, number>)

  // Find max cuts for color scaling
  const maxCuts = Math.max(...data.cutsByState.map(s => s.cuts), 1)

  const getColor = (cuts: number) => {
    const intensity = cuts / maxCuts
    if (intensity === 0) return "#eff6ff" // blue-50
    if (intensity < 0.2) return "#dbeafe" // blue-100
    if (intensity < 0.4) return "#bfdbfe" // blue-200
    if (intensity < 0.6) return "#93c5fd" // blue-300
    if (intensity < 0.8) return "#60a5fa" // blue-400
    if (intensity < 0.9) return "#3b82f6" // blue-500
    return "#1d4ed8" // blue-700
  }

  return (
    <div 
      className="rounded-lg bg-white dark:bg-gray-900 p-4 shadow-sm"
      aria-label="Program cuts by US state"
    >
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Cuts by State
      </h3>
      
      {/* Mock map visualization - in real implementation, use react-simple-maps */}
      <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <div className="grid grid-cols-5 gap-2 h-full">
          {mockUSStates.map((state) => {
            const cuts = stateDataMap[state.id] || 0
            return (
              <div
                key={state.id}
                className="relative group"
                title={`${state.name}: ${cuts} cuts`}
              >
                <div
                  className="w-full h-full rounded border border-gray-200 dark:border-gray-600 flex items-center justify-center text-xs font-medium"
                  style={{ backgroundColor: getColor(cuts) }}
                >
                  <span className="text-gray-700 dark:text-gray-300">
                    {state.id}
                  </span>
                </div>
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                  {state.name}: {cuts} cuts
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Color legend */}
      <div className="flex items-center justify-center mt-4 space-x-2">
        <span className="text-xs text-gray-600 dark:text-gray-400">Fewer cuts</span>
        <div className="flex space-x-1">
          {[0, 0.2, 0.4, 0.6, 0.8, 1].map((intensity) => (
            <div
              key={intensity}
              className="w-4 h-4 rounded border border-gray-200 dark:border-gray-600"
              style={{ backgroundColor: getColor(intensity * maxCuts) }}
            />
          ))}
        </div>
        <span className="text-xs text-gray-600 dark:text-gray-400">More cuts</span>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
        Geographic distribution of program cuts across US states
      </p>
    </div>
  )
} 