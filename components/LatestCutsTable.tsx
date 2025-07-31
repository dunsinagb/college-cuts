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
                <th className="h-12 px-4 text-left align-middle font-medium">Cut Type</th>
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
