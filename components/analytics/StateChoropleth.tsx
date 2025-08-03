"use client"

import { useCutsAnalytics } from "@/lib/useCutsAnalytics"
import { Skeleton } from "@/components/ui/skeleton"

// Mock US map data since we don't have the actual topojson file
// In a real implementation, you would import the US map data
const mockUSStates = [
  "CA", "TX", "NY", "FL", "IL", "PA", "OH", "GA", "NC", "MI",
  "NJ", "VA", "WA", "AZ", "MA", "TN", "IN", "MO", "MD", "CO",
  "MN", "WI", "AL", "SC", "LA", "KY", "OR", "OK", "CT", "IA",
  "UT", "NV", "AR", "MS", "KS", "NM", "NE", "ID", "WV", "HI",
  "NH", "ME", "RI", "MT", "DE", "SD", "ND", "AK", "VT", "WY"
].map((s: string) => ({
  id: s,
  name: s, // Placeholder, actual names would need a mapping
}))

export function StateChoropleth() {
  const { data, isLoading } = useCutsAnalytics()

  if (isLoading) {
    return (
      <div className="rounded-lg bg-white dark:bg-gray-900 p-4 shadow-sm">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-80 w-full" />
      </div>
    )
  }

  // Create a map of state data for easy lookup
  const stateCounts = data.cutsByState.reduce((acc: any, state: any) => {
    acc[state.state] = state.cuts
    return acc
  }, {})

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
      aria-label="Institutional actions by US state"
    >
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Actions by State
      </h3>
      
      {/* Mock map visualization - in real implementation, use react-simple-maps */}
      <div className="h-80 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <div className="grid grid-cols-5 gap-2 h-full">
          {mockUSStates.map((state) => {
            const cuts = stateCounts[state.id] || 0
            return (
              <div
                key={state.id}
                className="relative group"
                title={`${state.name}: ${cuts} actions`}
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
                  {state.name}: {cuts} actions
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Color legend */}
      <div className="flex items-center justify-center mt-4 space-x-2">
        <span className="text-xs text-gray-600 dark:text-gray-400">Fewer actions</span>
        <div className="flex space-x-1">
          {[0, 0.2, 0.4, 0.6, 0.8, 1].map((intensity) => (
            <div
              key={intensity}
              className="w-4 h-4 rounded border border-gray-200 dark:border-gray-600"
              style={{ backgroundColor: getColor(intensity * maxCuts) }}
            />
          ))}
        </div>
        <span className="text-xs text-gray-600 dark:text-gray-400">More actions</span>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
        Geographic distribution of institutional actions across US states
      </p>
    </div>
  )
} 