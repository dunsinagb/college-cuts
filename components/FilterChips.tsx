"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function FilterChips() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const state = searchParams.get("state")
  const control = searchParams.get("control")

  const removeFilter = (filterType: "state" | "control") => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete(filterType)

    const newUrl = params.toString() ? `/cuts?${params.toString()}` : "/cuts"
    router.push(newUrl)
  }

  if (!state && !control) return null

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {state && (
        <Badge variant="secondary" className="flex items-center gap-2 px-3 py-1">
          <span>State: {state}</span>
          <button
            onClick={() => removeFilter("state")}
            className="hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}
      {control && (
        <Badge variant="secondary" className="flex items-center gap-2 px-3 py-1">
          <span>Control: {control}</span>
          <button
            onClick={() => removeFilter("control")}
            className="hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}
    </div>
  )
}
