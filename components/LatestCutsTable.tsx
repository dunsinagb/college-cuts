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
import { CUT_TYPE_COLORS } from "@/lib/constants"
import { formatMonthYear } from "@/lib/utils"

const categoryColors = {
  "Budget Deficit": "bg-red-50 text-red-700 border-red-200",
  "Enrollment Decline": "bg-blue-50 text-blue-700 border-blue-200",
  "Federal Funding Cuts": "bg-purple-50 text-purple-700 border-purple-200",
  "State Mandates": "bg-orange-50 text-orange-700 border-orange-200",
  "Strategic Restructuring": "bg-gray-50 text-gray-700 border-gray-200",
  "Accreditation Issues": "bg-yellow-50 text-yellow-700 border-yellow-200",
  "Financial Mismanagement": "bg-pink-50 text-pink-700 border-pink-200",
  "Program Performance": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Administrative Changes": "bg-teal-50 text-teal-700 border-teal-200",
  "Market Demand": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Regulatory Compliance": "bg-amber-50 text-amber-700 border-amber-200",
  "Technology Integration": "bg-cyan-50 text-cyan-700 border-cyan-200",
  "Faculty Shortage": "bg-lime-50 text-lime-700 border-lime-200",
  "Facility Issues": "bg-slate-50 text-slate-700 border-slate-200",
  "Partnership Changes": "bg-violet-50 text-violet-700 border-violet-200",
  "Research Funding": "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
  "Student Demand": "bg-sky-50 text-sky-700 border-sky-200",
  "Operational Efficiency": "bg-stone-50 text-stone-700 border-stone-200",
  "Quality Standards": "bg-zinc-50 text-zinc-700 border-zinc-200",
  "External Pressures": "bg-neutral-50 text-neutral-700 border-neutral-200"
}

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
  if (lowerNotes.includes("technology") || lowerNotes.includes("digital") || lowerNotes.includes("online")) {
    return "Technology Integration"
  }
  if (lowerNotes.includes("faculty") || lowerNotes.includes("professor") || lowerNotes.includes("staffing")) {
    return "Faculty Shortage"
  }
  if (lowerNotes.includes("facility") || lowerNotes.includes("building") || lowerNotes.includes("infrastructure")) {
    return "Facility Issues"
  }
  if (lowerNotes.includes("partnership") || lowerNotes.includes("collaboration") || lowerNotes.includes("alliance")) {
    return "Partnership Changes"
  }
  if (lowerNotes.includes("research") || lowerNotes.includes("funding") || lowerNotes.includes("grant")) {
    return "Research Funding"
  }
  if (lowerNotes.includes("student demand") || lowerNotes.includes("popularity")) {
    return "Student Demand"
  }
  if (lowerNotes.includes("operational") || lowerNotes.includes("efficiency") || lowerNotes.includes("optimization")) {
    return "Operational Efficiency"
  }
  if (lowerNotes.includes("quality") || lowerNotes.includes("standards") || lowerNotes.includes("excellence")) {
    return "Quality Standards"
  }
  if (lowerNotes.includes("external") || lowerNotes.includes("pressure") || lowerNotes.includes("influence")) {
    return "External Pressures"
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
          <Search className="h-4 w-4" />
          <Skeleton className="h-10 flex-1" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4" />
        <Input
          placeholder="Search institutions and programs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
      </div>

      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="h-12 px-4 text-left align-middle font-medium">Date</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Institution</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Program</th>
                <th className="h-12 px-4 text-left align-middle font-medium">State</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Action Type</th>
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
                      {formatMonthYear(cut.announcement_date)}
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
                    <Badge className={CUT_TYPE_COLORS[cut.cut_type]}>{cut.cut_type.replace("_", " ")}</Badge>
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
                    {cut.source_url && (
                      <a
                        href={cut.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-center">
        <Button asChild>
          <Link href="/cuts">View All Actions</Link>
        </Button>
      </div>
    </div>
  )
}
