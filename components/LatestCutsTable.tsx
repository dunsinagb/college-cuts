"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ExternalLink, Search } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import type { Cut } from "@/types/supabase"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

const cutTypeColors = {
  program_suspension: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200",
  teach_out: "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200",
  department_closure: "bg-red-100 text-red-800 border-red-200 hover:bg-red-200",
  campus_closure: "bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-200",
  institution_closure: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200",
  staff_layoff: "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200",
}

// Status colors for consistent styling
const statusColors = {
  confirmed: "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
  provisional: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200",
  pending: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200",
  proposed: "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200",
  under_review: "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200",
  cancelled: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200",
}

// Status display names
const statusDisplayNames = {
  confirmed: "Confirmed",
  provisional: "Provisional",
  pending: "Pending",
  proposed: "Proposed",
  under_review: "Under Review",
  cancelled: "Cancelled",
}

// Category colors for the categorization system
const categoryColors = {
  "Budget Deficit": "bg-red-50 text-red-700 border-red-200",
  "Enrollment Decline": "bg-blue-50 text-blue-700 border-blue-200", 
  "Federal Funding Cuts": "bg-purple-50 text-purple-700 border-purple-200",
  "State Mandates": "bg-green-50 text-green-700 border-green-200",
  "Financial Mismanagement": "bg-orange-50 text-orange-700 border-orange-200",
  "Strategic Restructuring": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Political Pressure": "bg-pink-50 text-pink-700 border-pink-200",
  "Operational Costs": "bg-yellow-50 text-yellow-700 border-yellow-200",
  "Accreditation Issues": "bg-gray-50 text-gray-700 border-gray-200"
}

// Function to categorize cuts based on notes content
function categorizeCut(notes: string | null): string {
  if (!notes) return "Budget Deficit"
  
  const lowerNotes = notes.toLowerCase()
  
  if (lowerNotes.includes("budget") || lowerNotes.includes("deficit") || lowerNotes.includes("financial") || lowerNotes.includes("cost")) {
    return "Budget Deficit"
  }
  if (lowerNotes.includes("enrollment") || lowerNotes.includes("decline") || lowerNotes.includes("student") || lowerNotes.includes("admission")) {
    return "Enrollment Decline"
  }
  if (lowerNotes.includes("federal") || lowerNotes.includes("funding") || lowerNotes.includes("government") || lowerNotes.includes("grant")) {
    return "Federal Funding Cuts"
  }
  if (lowerNotes.includes("state") || lowerNotes.includes("mandate") || lowerNotes.includes("legislation") || lowerNotes.includes("law")) {
    return "State Mandates"
  }
  if (lowerNotes.includes("strategic") || lowerNotes.includes("restructuring") || lowerNotes.includes("reorganization") || lowerNotes.includes("realignment")) {
    return "Strategic Restructuring"
  }
  if (lowerNotes.includes("accreditation") || lowerNotes.includes("accredited") || lowerNotes.includes("certification")) {
    return "Accreditation Issues"
  }
  if (lowerNotes.includes("mismanagement") || lowerNotes.includes("fraud") || lowerNotes.includes("scandal")) {
    return "Financial Mismanagement"
  }
  if (lowerNotes.includes("performance") || lowerNotes.includes("quality") || lowerNotes.includes("metrics")) {
    return "Program Performance"
  }
  if (lowerNotes.includes("administrative") || lowerNotes.includes("leadership") || lowerNotes.includes("management")) {
    return "Administrative Changes"
  }
  if (lowerNotes.includes("market") || lowerNotes.includes("demand") || lowerNotes.includes("industry")) {
    return "Market Demand"
  }
  if (lowerNotes.includes("regulatory") || lowerNotes.includes("compliance") || lowerNotes.includes("regulation")) {
    return "Regulatory Compliance"
  }
  
  return "Budget Deficit"
}

export function LatestCutsTable() {
  const [cuts, setCuts] = useState<Cut[]>([])
  const [filteredCuts, setFilteredCuts] = useState<Cut[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    async function fetchLatestCuts() {
      try {
        const client = supabase()
        if (!client) {
          console.warn("Supabase client not available")
          return
        }

        const { data, error } = await client
          .from("v_latest_cuts")
          .select("*")
          .order("announcement_date", { ascending: false })
          .limit(5)

        if (error) {
          console.error("Error fetching latest cuts:", error)
          return
        }

        setCuts(data || [])
      } catch (err) {
        console.error("Error:", err)
      }
    }

    fetchLatestCuts()

    // Subscribe to realtime updates
    const client = supabase()
    if (client) {
      const channel = client
        .channel("public:v_latest_cuts")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "v_latest_cuts" }, (payload: any) => {
        // Refetch data when new cuts are added
        fetchLatestCuts()
      })
      .subscribe()

    return () => {
        const currentClient = supabase()
        if (currentClient) {
          currentClient.removeChannel(channel)
        }
      }
    }
  }, [])

  useEffect(() => {
    const filtered = cuts.filter(
      (cut) =>
        cut.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cut.program_name && cut.program_name.toLowerCase().includes(searchTerm.toLowerCase())),
    )
    setFilteredCuts(filtered)
  }, [cuts, searchTerm])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-10 w-[250px]" />
          <Skeleton className="h-10 w-[100px]" />
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search and View All */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search institutions or programs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-[300px]"
            />
          </div>
        </div>
        <Link href="/cuts">
          <Button variant="outline" size="sm">
            View All Actions →
          </Button>
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="h-12 px-4 text-left align-middle font-medium">Date</th>
              <th className="h-12 px-4 text-left align-middle font-medium">Institution</th>
              <th className="h-12 px-4 text-left align-middle font-medium">Program</th>
              <th className="h-12 px-4 text-left align-middle font-medium">State</th>
              <th className="h-12 px-4 text-left align-middle font-medium">Action Type</th>
              <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
              <th className="h-12 px-4 text-left align-middle font-medium">Primary Reason</th>
              <th className="h-12 px-4 text-left align-middle font-medium">Control</th>
              <th className="h-12 px-4 text-left align-middle font-medium">Source</th>
            </tr>
          </thead>
          <tbody>
            {filteredCuts.map((cut, index) => (
              <tr
                key={cut.id}
                className={`border-b transition-colors hover:bg-muted/50 ${index % 2 === 0 ? "bg-background" : "bg-muted/25"}`}
              >
                <td className="p-4 align-middle">
                  <Link href={`/cut/${cut.id}`} className="hover:underline">
                    {new Date(cut.announcement_date).toLocaleDateString()}
                  </Link>
                </td>
                <td className="p-4 align-middle">
                  <Link href={`/cut/${cut.id}`} className="hover:underline font-medium">
                    {cut.institution}
                  </Link>
                </td>
                <td className="p-4 align-middle">
                  <Link href={`/cut/${cut.id}`} className="hover:underline">
                    {cut.program_name || "N/A"}
                  </Link>
                </td>
                <td className="p-4 align-middle">{cut.state}</td>
                <td className="p-4 align-middle">
                  <Badge className={cutTypeColors[cut.cut_type]}>{cut.cut_type.replace("_", " ")}</Badge>
                </td>
                <td className="p-4 align-middle">
                  {cut.status ? (
                    <Badge className={statusColors[cut.status as keyof typeof statusColors]}>
                      {statusDisplayNames[cut.status as keyof typeof statusDisplayNames]}
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-800 border-gray-200">Unknown</Badge>
                  )}
                </td>
                <td className="p-4 align-middle">
                  <Badge className={categoryColors[categorizeCut(cut.notes) as keyof typeof categoryColors]}>
                    {categorizeCut(cut.notes)}
                  </Badge>
                </td>
                <td className="p-4 align-middle">
                  {cut.control || "—"}
                </td>
                <td className="p-4 align-middle">
                  {cut.source_url ? (
                    <a
                      href={cut.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {cut.source_publication || "Source"}
                    </a>
                  ) : (
                    cut.source_publication || "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredCuts.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No cuts found matching your search criteria.
        </div>
      )}
    </div>
  )
}
