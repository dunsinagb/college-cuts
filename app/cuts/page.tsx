"use client"

import { Suspense } from "react"
import { CutsDataGrid } from "@/components/CutsDataGrid"
import { Skeleton } from "@/components/ui/skeleton"

function CutsPageContent() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">All Program Cuts</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Complete database of program cuts and institutional changes across higher education. Use the advanced
            filters below to explore the data.
          </p>
        </div>

        {/* Data Grid with Enhanced Filtering */}
        <CutsDataGrid />
      </div>
    </div>
  )
}

export default function CutsPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <Skeleton className="h-10 w-96 mx-auto" />
              <Skeleton className="h-6 w-[500px] mx-auto" />
            </div>
            <Skeleton className="h-96" />
          </div>
        </div>
      }
    >
      <CutsPageContent />
    </Suspense>
  )
}
