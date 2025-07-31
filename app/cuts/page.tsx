"use client"

import { Suspense } from "react"
import { CutsDataGrid } from "@/components/CutsDataGrid"
import { Skeleton } from "@/components/ui/skeleton"

function CutsPageContent() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <section className="text-center space-y-4" aria-labelledby="actions-title">
          <h1 id="actions-title" className="text-4xl font-bold tracking-tight">All Program Actions</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Complete database of program actions and institutional changes across higher education. Use the advanced
            filters below to explore the data.
          </p>
        </section>

        {/* Data Grid with Enhanced Filtering */}
        <section aria-labelledby="data-grid-title">
          <h2 id="data-grid-title" className="sr-only">Program Actions Data Table</h2>
          <CutsDataGrid />
        </section>
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
            <section className="text-center space-y-4" aria-labelledby="loading-title">
              <h1 id="loading-title" className="sr-only">Loading Program Actions</h1>
              <Skeleton className="h-10 w-96 mx-auto" aria-label="Loading page title" />
              <Skeleton className="h-6 w-[500px] mx-auto" aria-label="Loading page description" />
            </section>
            <section aria-labelledby="loading-data-title">
              <h2 id="loading-data-title" className="sr-only">Loading Data Table</h2>
              <Skeleton className="h-96" aria-label="Loading data table" />
            </section>
          </div>
        </div>
      }
    >
      <CutsPageContent />
    </Suspense>
  )
}
