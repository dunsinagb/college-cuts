"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps"
import { useCutsAggregates } from "@/lib/useCutsAggregates"
import { Skeleton } from "@/components/ui/skeleton"

// Simplified US states data for demo
const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json"

const stateAbbreviations: Record<string, string> = {
  Alabama: "AL",
  Alaska: "AK",
  Arizona: "AZ",
  Arkansas: "AR",
  California: "CA",
  Colorado: "CO",
  Connecticut: "CT",
  Delaware: "DE",
  Florida: "FL",
  Georgia: "GA",
  Hawaii: "HI",
  Idaho: "ID",
  Illinois: "IL",
  Indiana: "IN",
  Iowa: "IA",
  Kansas: "KS",
  Kentucky: "KY",
  Louisiana: "LA",
  Maine: "ME",
  Maryland: "MD",
  Massachusetts: "MA",
  Michigan: "MI",
  Minnesota: "MN",
  Mississippi: "MS",
  Missouri: "MO",
  Montana: "MT",
  Nebraska: "NE",
  Nevada: "NV",
  "New Hampshire": "NH",
  "New Jersey": "NJ",
  "New Mexico": "NM",
  "New York": "NY",
  "North Carolina": "NC",
  "North Dakota": "ND",
  Ohio: "OH",
  Oklahoma: "OK",
  Oregon: "OR",
  Pennsylvania: "PA",
  "Rhode Island": "RI",
  "South Carolina": "SC",
  "South Dakota": "SD",
  Tennessee: "TN",
  Texas: "TX",
  Utah: "UT",
  Vermont: "VT",
  Virginia: "VA",
  Washington: "WA",
  "West Virginia": "WV",
  Wisconsin: "WI",
  Wyoming: "WY",
}

export function StateMap() {
  const { data, isLoading } = useCutsAggregates()
  const router = useRouter()
  const [tooltip, setTooltip] = useState<{ content: string; x: number; y: number } | null>(null)

  if (isLoading) {
    return (
      <div className="rounded-lg shadow-sm bg-white dark:bg-gray-900 p-4">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  // Create a map of state codes to cut counts
  const stateCutCounts = data.stateBreakdown.reduce(
    (acc, item) => {
      acc[item.state] = item.cuts
      return acc
    },
    {} as Record<string, number>,
  )

  const maxCuts = Math.max(...data.stateBreakdown.map((item) => item.cuts))

  const getStateColor = (stateName: string) => {
    const stateCode = stateAbbreviations[stateName]
    const cuts = stateCutCounts[stateCode] || 0

    if (cuts === 0) return "#f8fafc" // slate-50

    const intensity = cuts / maxCuts
    if (intensity > 0.8) return "#1e40af" // blue-800
    if (intensity > 0.6) return "#2563eb" // blue-600
    if (intensity > 0.4) return "#3b82f6" // blue-500
    if (intensity > 0.2) return "#60a5fa" // blue-400
    return "#93c5fd" // blue-300
  }

  const handleMouseEnter = (geo: any, event: React.MouseEvent) => {
    const stateName = geo.properties.NAME
    const stateCode = stateAbbreviations[stateName]
    const cuts = stateCutCounts[stateCode] || 0

    setTooltip({
      content: `${stateName} – ${cuts} cuts`,
      x: event.clientX,
      y: event.clientY,
    })
  }

  const handleMouseLeave = () => {
    setTooltip(null)
  }

  const handleClick = (geo: any) => {
    const stateName = geo.properties.NAME
    const stateCode = stateAbbreviations[stateName]
    if (stateCode) {
      router.push(`/cuts?state=${stateCode}`)
    }
  }

  return (
    <div className="rounded-lg shadow-sm bg-white dark:bg-gray-900 p-4 relative">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Cuts by State</h3>
      <div className="w-full max-w-2xl mx-auto">
        <ComposableMap projection="geoAlbersUsa" className="w-full h-96">
          <ZoomableGroup>
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={getStateColor(geo.properties.NAME)}
                    stroke="#e5e7eb"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none" },
                      hover: {
                        outline: "none",
                        fill: "#1d4ed8", // blue-700
                        cursor: "pointer",
                      },
                      pressed: { outline: "none" },
                    }}
                    onMouseEnter={(event) => handleMouseEnter(geo, event)}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => handleClick(geo)}
                  />
                ))
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {tooltip && (
        <div
          className="absolute z-10 bg-gray-900 text-white px-2 py-1 rounded text-sm pointer-events-none"
          style={{
            left: tooltip.x - 50,
            top: tooltip.y - 30,
          }}
        >
          {tooltip.content}
        </div>
      )}

      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 prose">
        Click on states to filter by location. Darker colors indicate more cuts.
      </p>
    </div>
  )
}
