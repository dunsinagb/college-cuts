"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ExternalLink, Search, Download, AlertCircle, Filter, X, Database } from "lucide-react"
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient"
import type { Cut } from "@/types/supabase"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const cutTypeColors = {
  program_suspension: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200",
  teach_out: "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200",
  department_closure: "bg-red-100 text-red-800 border-red-200 hover:bg-red-200",
  campus_closure: "bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-200",
  institution_closure: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200",
  staff_layoff: "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200",
}

// Mock data as fallback only
const mockCuts: Cut[] = [
  {
    id: "1",
    institution: "Example University",
    program_name: "Liberal Arts Program",
    state: "CA",
    cut_type: "program_suspension",
    announcement_date: "2024-03-15",
    effective_term: "Fall 2024",
    students_affected: 150,
    faculty_affected: 8,
    control: "Public",
    notes: "Program suspended due to budget constraints",
    source_url: "https://example.com/news",
    source_publication: "University Times",
    created_at: "2024-03-15T10:00:00Z",
    updated_at: "2024-03-15T10:00:00Z",
  },
  {
    id: "2",
    institution: "State College",
    program_name: "Philosophy Department",
    state: "TX",
    cut_type: "department_closure",
    announcement_date: "2024-03-10",
    effective_term: "Spring 2025",
    students_affected: 75,
    faculty_affected: 12,
    control: "Private non-profit",
    notes: "Department closure effective next semester",
    source_url: "https://example.com/announcement",
    source_publication: "State College News",
    created_at: "2024-03-10T09:00:00Z",
    updated_at: "2024-03-10T09:00:00Z",
  },
]

interface FilterOptions {
  states: string[]
  institutions: string[]
  programs: string[]
  effectiveTerms: string[]
  sourcePublications: string[]
  controls: string[]
}

export function CutsDataGrid() {
  const [cuts, setCuts] = useState<Cut[]>([])
  const [filteredCuts, setFilteredCuts] = useState<Cut[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    states: [],
    institutions: [],
    programs: [],
    effectiveTerms: [],
    sourcePublications: [],
    controls: [],
  })

  // Filter states - reduced to 8 filters
  const [searchTerm, setSearchTerm] = useState("")
  const [stateFilter, setStateFilter] = useState<string>("all")
  const [cutTypeFilter, setCutTypeFilter] = useState<string>("all")
  const [institutionFilter, setInstitutionFilter] = useState<string>("all")
  const [controlFilter, setControlFilter] = useState<string>("all")
  const [dateRangeFilter, setDateRangeFilter] = useState<string>("all")
  const [studentsAffectedFilter, setStudentsAffectedFilter] = useState<string>("all")
  const [facultyAffectedFilter, setFacultyAffectedFilter] = useState<string>("all")
  const [showOnlyWithNumbers, setShowOnlyWithNumbers] = useState<boolean>(false)

  async function fetchData() {
    if (!isSupabaseConfigured) {
      setError("Supabase not configured")
      setLoading(false)
      return
    }

    try {
      const client = supabase()
      if (!client) {
        setError("Supabase client not available")
        setLoading(false)
        return
      }

      const { data, error } = await client
        .from("v_latest_cuts")
        .select("*")
        .order("announcement_date", { ascending: false })

      if (error) {
        console.error("Error fetching data:", error)
        setError(error.message)
        setLoading(false)
        return
      }

      setCuts(data || [])
      setLoading(false)
    } catch (err) {
      console.error("Error:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    fetchFilterOptions()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [
    cuts,
    searchTerm,
    stateFilter,
    cutTypeFilter,
    institutionFilter,
    controlFilter,
    dateRangeFilter,
    studentsAffectedFilter,
    facultyAffectedFilter,
    showOnlyWithNumbers,
  ])

  async function fetchFilterOptions() {
    const client = supabase()
    if (!isSupabaseConfigured || !client) {
      setFilterOptions({
        states: ["CA", "TX", "NY", "FL"],
        institutions: ["Example University", "State College"],
        programs: ["Liberal Arts", "Philosophy"],
        effectiveTerms: ["Fall 2024", "Spring 2025"],
        sourcePublications: ["University Times", "State College News"],
        controls: ["Public", "Private non-profit", "Private for-profit"],
      })
      return
    }

    try {
      const [
        { data: statesData },
        { data: institutionsData },
        { data: programsData },
        { data: effectiveTermsData },
        { data: sourcePublicationsData },
        { data: controlsData },
      ] = await Promise.all([
        client.from("v_latest_cuts").select("state").order("state"),
        client.from("v_latest_cuts").select("institution").order("institution"),
        client.from("v_latest_cuts").select("program_name").order("program_name"),
        client.from("v_latest_cuts").select("effective_term").order("effective_term"),
        client.from("v_latest_cuts").select("source_publication").order("source_publication"),
        client.from("v_latest_cuts").select("control").order("control"),
      ])

      setFilterOptions({
        states: Array.from(new Set(statesData?.map((item: any) => item.state).filter(Boolean) || [])),
        institutions: Array.from(new Set(institutionsData?.map((item: any) => item.institution).filter(Boolean) || [])),
        programs: Array.from(new Set(programsData?.map((item: any) => item.program_name).filter(Boolean) || [])),
        effectiveTerms: Array.from(
          new Set(effectiveTermsData?.map((item: any) => item.effective_term).filter(Boolean) || []),
        ),
        sourcePublications: Array.from(
          new Set(sourcePublicationsData?.map((item: any) => item.source_publication).filter(Boolean) || []),
        ),
        controls: Array.from(new Set(controlsData?.map((item: any) => item.control).filter(Boolean) || [])),
      })
    } catch (error) {
      console.error("❌ Error fetching filter options:", error)
    }
  }

  function applyFilters() {
    let filtered = cuts

    console.log("🔍 Starting filter process with", cuts.length, "total cuts")

    // Count 2024 entries before filtering
    const count2024Before = cuts.filter((cut) => cut.announcement_date.startsWith("2024")).length
    console.log("📊 2024 entries before filtering:", count2024Before)

    // Search filter
    if (searchTerm) {
      const beforeSearch = filtered.length
      filtered = filtered.filter(
        (cut) =>
          cut.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (cut.program_name && cut.program_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (cut.notes && cut.notes.toLowerCase().includes(searchTerm.toLowerCase())),
      )
      console.log(`🔍 Search filter: ${beforeSearch} → ${filtered.length}`)
    }

    // State filter
    if (stateFilter !== "all") {
      const beforeState = filtered.length
      filtered = filtered.filter((cut) => cut.state === stateFilter)
      console.log(`🔍 State filter (${stateFilter}): ${beforeState} → ${filtered.length}`)
    }

    // Cut type filter
    if (cutTypeFilter !== "all") {
      const beforeType = filtered.length
      filtered = filtered.filter((cut) => cut.cut_type === cutTypeFilter)
      console.log(`🔍 Cut type filter (${cutTypeFilter}): ${beforeType} → ${filtered.length}`)
    }

    // Institution filter
    if (institutionFilter !== "all") {
      const beforeInstitution = filtered.length
      filtered = filtered.filter((cut) => cut.institution === institutionFilter)
      console.log(`🔍 Institution filter: ${beforeInstitution} → ${filtered.length}`)
    }

    // Control filter
    if (controlFilter !== "all") {
      const beforeControl = filtered.length
      filtered = filtered.filter((cut) => cut.control === controlFilter)
      console.log(`🔍 Control filter (${controlFilter}): ${beforeControl} → ${filtered.length}`)
    }

    // Date range filter - THIS IS KEY FOR 2024 DATA
    if (dateRangeFilter !== "all") {
      const beforeDate = filtered.length
      const now = new Date()
      const cutoffDate = new Date()

      switch (dateRangeFilter) {
        case "last_7_days":
          cutoffDate.setDate(now.getDate() - 7)
          filtered = filtered.filter((cut) => new Date(cut.announcement_date) >= cutoffDate)
          break
        case "last_30_days":
          cutoffDate.setDate(now.getDate() - 30)
          filtered = filtered.filter((cut) => new Date(cut.announcement_date) >= cutoffDate)
          break
        case "last_90_days":
          cutoffDate.setDate(now.getDate() - 90)
          filtered = filtered.filter((cut) => new Date(cut.announcement_date) >= cutoffDate)
          break
        case "last_6_months":
          cutoffDate.setMonth(now.getMonth() - 6)
          filtered = filtered.filter((cut) => new Date(cut.announcement_date) >= cutoffDate)
          break
        case "last_year":
          cutoffDate.setFullYear(now.getFullYear() - 1)
          filtered = filtered.filter((cut) => new Date(cut.announcement_date) >= cutoffDate)
          break
        case "2024":
          filtered = filtered.filter((cut) => cut.announcement_date.startsWith("2024"))
          console.log(`🔍 2024 filter applied: ${beforeDate} → ${filtered.length}`)
          break
        case "2023":
          filtered = filtered.filter((cut) => cut.announcement_date.startsWith("2023"))
          break
        case "2022":
          filtered = filtered.filter((cut) => cut.announcement_date.startsWith("2022"))
          break
      }
      console.log(`🔍 Date range filter (${dateRangeFilter}): ${beforeDate} → ${filtered.length}`)
    }

    // Students affected filter
    if (studentsAffectedFilter !== "all") {
      const beforeStudents = filtered.length
      filtered = filtered.filter((cut) => {
        const students = cut.students_affected || 0
        switch (studentsAffectedFilter) {
          case "1_10":
            return students >= 1 && students <= 10
          case "11_25":
            return students >= 11 && students <= 25
          case "26_50":
            return students >= 26 && students <= 50
          case "51_100":
            return students >= 51 && students <= 100
          case "101_250":
            return students >= 101 && students <= 250
          case "251_500":
            return students >= 251 && students <= 500
          case "501_1000":
            return students >= 501 && students <= 1000
          case "1000_plus":
            return students > 1000
          case "unknown":
            return cut.students_affected === null
          default:
            return true
        }
      })
      console.log(`🔍 Students affected filter: ${beforeStudents} → ${filtered.length}`)
    }

    // Faculty affected filter
    if (facultyAffectedFilter !== "all") {
      const beforeFaculty = filtered.length
      filtered = filtered.filter((cut) => {
        const faculty = cut.faculty_affected || 0
        switch (facultyAffectedFilter) {
          case "1_10":
            return faculty >= 1 && faculty <= 10
          case "11_25":
            return faculty >= 11 && faculty <= 25
          case "26_50":
            return faculty >= 26 && faculty <= 50
          case "51_100":
            return faculty >= 51 && faculty <= 100
          case "101_250":
            return faculty >= 101 && faculty <= 250
          case "251_500":
            return faculty >= 251 && faculty <= 500
          case "501_1000":
            return faculty >= 501 && faculty <= 1000
          case "1000_plus":
            return faculty > 1000
          case "unknown":
            return cut.faculty_affected === null
          default:
            return true
        }
      })
      console.log(`🔍 Faculty affected filter: ${beforeFaculty} → ${filtered.length}`)
    }

    // Show only cuts with numbers filter
    if (showOnlyWithNumbers) {
      const beforeNumbers = filtered.length
      filtered = filtered.filter((cut) => {
        return (cut.students_affected && cut.students_affected > 0) || 
               (cut.faculty_affected && cut.faculty_affected > 0)
      })
      console.log(`🔍 Show only with numbers filter: ${beforeNumbers} → ${filtered.length}`)
    }

    // Count 2024 entries after filtering
    const count2024After = filtered.filter((cut) => cut.announcement_date.startsWith("2024")).length
    console.log("📊 2024 entries after filtering:", count2024After)

    console.log("✅ Final filtered results:", filtered.length, "cuts")
    setFilteredCuts(filtered)
  }

  function clearAllFilters() {
    console.log("🧹 Clearing all filters")
    setSearchTerm("")
    setStateFilter("all")
    setCutTypeFilter("all")
    setInstitutionFilter("all")
    setControlFilter("all")
    setDateRangeFilter("all")
    setStudentsAffectedFilter("all")
    setFacultyAffectedFilter("all")
    setShowOnlyWithNumbers(false)
  }

  function showOnly2024() {
    console.log("📅 Showing only 2024 data")
    clearAllFilters()
    setDateRangeFilter("2024")
  }

  async function downloadCSV() {
    try {
      const headers = [
        "Institution",
        "State",
        "Cut Type",
        "Announcement Date",
        "Effective Term",
        "Students Affected",
        "Faculty Affected",
        "Control",
        "Notes",
        "Source URL",
        "Source Publication",
        "Created At",
        "Updated At",
      ]

      const csvContent = [
        headers.join(","),
        ...filteredCuts.map((cut) =>
          [
            `"${cut.institution.replace(/"/g, '""')}"`,
            cut.state,
            cut.cut_type,
            cut.announcement_date,
            cut.effective_term || "",
            cut.students_affected || "",
            cut.faculty_affected || "",
            cut.control || "",
            cut.notes ? `"${cut.notes.replace(/"/g, '""')}"` : "",
            cut.source_url || "",
            cut.source_publication ? `"${cut.source_publication.replace(/"/g, '""')}"` : "",
            cut.created_at,
            cut.updated_at,
          ].join(","),
        ),
      ].join("\n")

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `college-cuts-filtered-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error downloading CSV:", error)
      alert("Failed to download CSV. Please try again.")
    }
  }

  const activeFiltersCount = [
    searchTerm,
    stateFilter !== "all" ? stateFilter : null,
    cutTypeFilter !== "all" ? cutTypeFilter : null,
    institutionFilter !== "all" ? institutionFilter : null,
    controlFilter !== "all" ? controlFilter : null,
    dateRangeFilter !== "all" ? dateRangeFilter : null,
    studentsAffectedFilter !== "all" ? studentsAffectedFilter : null,
    facultyAffectedFilter !== "all" ? facultyAffectedFilter : null,
    showOnlyWithNumbers ? "with-numbers" : null,
  ].filter(Boolean).length

  // Calculate year breakdown for display
  const yearBreakdown = cuts.reduce<Record<string, number>>((acc, cut) => {
    const year = cut.announcement_date.substring(0, 4)
    acc[year] = (acc[year] || 0) + 1
    return acc
  }, {})

  if (loading) {
    return (
      <div className="space-y-6" aria-label="Loading program cuts data">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" aria-label="Loading filter panel" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-10" aria-label={`Loading filter ${i + 1}`} />
              ))}
            </div>
          </CardContent>
        </Card>
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" aria-label={`Loading data row ${i + 1}`} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert className="bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800" role="alert">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          <AlertDescription>
            Data connection issue: {error}.
            <Button variant="link" className="p-0 h-auto ml-2" onClick={() => {
              setError(null)
              setLoading(true)
              fetchData()
            }}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Professional Filter Panel with Titles and Selected Filters */}
      <Card className="shadow-lg border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Filter className="h-4 w-4" />
              Advanced Filters
            </CardTitle>
              {activeFiltersCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                className="h-7 text-xs bg-white hover:bg-gray-50 border-gray-300"
                >
                <X className="h-3 w-3 mr-1" />
                  Clear All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-3 space-y-4">
          {/* Selected Filters Display */}
          {activeFiltersCount > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                <span className="text-xs font-medium text-blue-900">Active Filters</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {searchTerm && (
                  <Badge variant="secondary" className="bg-white border-blue-200 text-blue-800 text-xs px-2 py-1">
                    Search: "{searchTerm}"
                  </Badge>
                )}
                {stateFilter !== "all" && (
                  <Badge variant="secondary" className="bg-white border-blue-200 text-blue-800 text-xs px-2 py-1">
                    State: {stateFilter}
                  </Badge>
                )}
                {cutTypeFilter !== "all" && (
                  <Badge variant="secondary" className="bg-white border-blue-200 text-blue-800 text-xs px-2 py-1">
                    Type: {cutTypeFilter.replace("_", " ")}
                  </Badge>
                )}
                {institutionFilter !== "all" && (
                  <Badge variant="secondary" className="bg-white border-blue-200 text-blue-800 text-xs px-2 py-1">
                    Institution:{" "}
                    {institutionFilter.length > 20 ? `${institutionFilter.substring(0, 20)}...` : institutionFilter}
                  </Badge>
                )}
                {controlFilter !== "all" && (
                  <Badge variant="secondary" className="bg-white border-blue-200 text-blue-800 text-xs px-2 py-1">
                    Control: {controlFilter}
                  </Badge>
                )}
                {dateRangeFilter !== "all" && (
                  <Badge variant="secondary" className="bg-white border-blue-200 text-blue-800 text-xs px-2 py-1">
                    Date: {dateRangeFilter.replace("_", " ")}
                  </Badge>
                )}
                {studentsAffectedFilter !== "all" && (
                  <Badge variant="secondary" className="bg-white border-blue-200 text-blue-800 text-xs px-2 py-1">
                    Students: {studentsAffectedFilter.replace("_", "-")}
                  </Badge>
                )}
                {facultyAffectedFilter !== "all" && (
                  <Badge variant="secondary" className="bg-white border-blue-200 text-blue-800 text-xs px-2 py-1">
                    Faculty: {facultyAffectedFilter.replace("_", "-")}
                  </Badge>
                )}
                {showOnlyWithNumbers && (
                  <Badge variant="secondary" className="bg-white border-blue-200 text-blue-800 text-xs px-2 py-1">
                    With Numbers Only
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Filter Grid with Titles */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {/* State Filter */}
              <div className="text-center">
                <h3 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">State</h3>
                <Select value={stateFilter} onValueChange={setStateFilter}>
                  <SelectTrigger className="h-8 text-sm border-gray-300 focus:border-blue-500">
                    <SelectValue placeholder="All States" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All States</SelectItem>
                    {filterOptions.states.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Cut Type Filter */}
              <div className="text-center">
                <h3 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Cut Type</h3>
                <Select value={cutTypeFilter} onValueChange={setCutTypeFilter}>
                  <SelectTrigger className="h-8 text-sm border-gray-300 focus:border-blue-500">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="program_suspension">Program Suspension</SelectItem>
                    <SelectItem value="teach_out">Teach Out</SelectItem>
                    <SelectItem value="department_closure">Department Closure</SelectItem>
                    <SelectItem value="campus_closure">Campus Closure</SelectItem>
                    <SelectItem value="institution_closure">Institution Closure</SelectItem>
                    <SelectItem value="staff_layoff">Staff Layoff</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Institution Filter */}
              <div className="text-center">
                <h3 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Institution</h3>
                <Select value={institutionFilter} onValueChange={setInstitutionFilter}>
                  <SelectTrigger className="h-8 text-sm border-gray-300 focus:border-blue-500">
                    <SelectValue placeholder="All Institutions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Institutions</SelectItem>
                    {filterOptions.institutions.slice(0, 50).map((institution) => (
                      <SelectItem key={institution} value={institution}>
                        {institution.length > 25 ? `${institution.substring(0, 25)}...` : institution}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Control Filter */}
              <div className="text-center">
                <h3 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Control</h3>
                <Select value={controlFilter} onValueChange={setControlFilter}>
                  <SelectTrigger className="h-8 text-sm border-gray-300 focus:border-blue-500">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {filterOptions.controls.map((control) => (
                      <SelectItem key={control} value={control}>
                        {control}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
            </div>

              {/* Date Range Filter */}
              <div className="text-center">
                <h3 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Date Range</h3>
                <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
                  <SelectTrigger className="h-8 text-sm border-gray-300 focus:border-blue-500">
                    <SelectValue placeholder="All Time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                    <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                    <SelectItem value="last_90_days">Last 90 Days</SelectItem>
                    <SelectItem value="last_6_months">Last 6 Months</SelectItem>
                    <SelectItem value="last_year">Last Year</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2022">2022</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Students Affected Filter */}
              <div className="text-center">
                <h3 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Students</h3>
                <Select value={studentsAffectedFilter} onValueChange={setStudentsAffectedFilter}>
                  <SelectTrigger className="h-8 text-sm border-gray-300 focus:border-blue-500">
                    <SelectValue placeholder="All Ranges" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ranges</SelectItem>
                    <SelectItem value="1_10">1-10 Students</SelectItem>
                    <SelectItem value="11_25">11-25 Students</SelectItem>
                    <SelectItem value="26_50">26-50 Students</SelectItem>
                    <SelectItem value="51_100">51-100 Students</SelectItem>
                    <SelectItem value="101_250">101-250 Students</SelectItem>
                    <SelectItem value="251_500">251-500 Students</SelectItem>
                    <SelectItem value="501_1000">501-1,000 Students</SelectItem>
                    <SelectItem value="1000_plus">1,000+ Students</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Faculty Affected Filter */}
              <div className="text-center">
                <h3 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Faculty</h3>
                <Select value={facultyAffectedFilter} onValueChange={setFacultyAffectedFilter}>
                  <SelectTrigger className="h-8 text-sm border-gray-300 focus:border-blue-500">
                    <SelectValue placeholder="All Ranges" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ranges</SelectItem>
                    <SelectItem value="1_10">1-10 Faculty</SelectItem>
                    <SelectItem value="11_25">11-25 Faculty</SelectItem>
                    <SelectItem value="26_50">26-50 Faculty</SelectItem>
                    <SelectItem value="51_100">51-100 Faculty</SelectItem>
                    <SelectItem value="101_250">101-250 Faculty</SelectItem>
                    <SelectItem value="251_500">251-500 Faculty</SelectItem>
                    <SelectItem value="501_1000">501-1,000 Faculty</SelectItem>
                    <SelectItem value="1000_plus">1,000+ Faculty</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Search and Toggle Row */}
            <div className="flex items-center justify-between gap-4">
              {/* Search Filter */}
              <div className="flex-1 max-w-md">
                <h3 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Search</h3>
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search institutions, programs, notes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-8 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              {/* Toggle for showing only cuts with numbers */}
              <div className="text-center">
                <h3 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Data Filter</h3>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-xs text-gray-600">Show all cuts</span>
                  <button
                    onClick={() => setShowOnlyWithNumbers(!showOnlyWithNumbers)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      showOnlyWithNumbers ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                    role="switch"
                    aria-checked={showOnlyWithNumbers}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                        showOnlyWithNumbers ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className="text-xs text-gray-600">With numbers only</span>
                </div>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-center text-sm text-gray-600 pt-3 border-t border-gray-200">
            <div className="bg-gray-50 px-4 py-2 rounded-full border">
              Showing <span className="font-semibold text-gray-900">{filteredCuts.length}</span> of{" "}
              <span className="font-semibold text-gray-900">{cuts.length}</span> total cuts
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-12 px-4 text-left align-middle font-medium">Date</th>
                  <th className="h-12 px-4 text-center align-middle font-medium">Institution</th>
                  <th className="h-12 px-4 text-center align-middle font-medium">Control</th>
                  <th className="h-12 px-4 text-center align-middle font-medium">State</th>
                  <th className="h-12 px-4 text-center align-middle font-medium">Cut Type</th>
                  <th className="h-12 px-4 text-center align-middle font-medium">Students</th>
                  <th className="h-12 px-4 text-center align-middle font-medium">Faculty</th>
                  <th className="h-12 px-4 text-center align-middle font-medium">Source</th>
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
                    <td className="whitespace-nowrap text-center">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {cut.institution}
                      </span>
                    </td>
                    <td className="p-4 text-center align-middle">{cut.control || "—"}</td>
                    <td className="p-4 text-center align-middle">{cut.state}</td>
                    <td className="p-4 text-center align-middle">
                      <Badge className={cutTypeColors[cut.cut_type]}>{cut.cut_type.replace("_", " ")}</Badge>
                    </td>
                    <td className="p-4 text-center align-middle">
                      {cut.students_affected ? cut.students_affected.toLocaleString() : "—"}
                    </td>
                    <td className="p-4 text-center align-middle">
                      {cut.faculty_affected ? cut.faculty_affected.toLocaleString() : "—"}
                    </td>
                    <td className="p-4 text-center align-middle">
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
        </CardContent>
      </Card>

      {filteredCuts.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No cuts found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your filters to see more results.</p>
            {activeFiltersCount > 0 && (
              <Button variant="outline" onClick={clearAllFilters}>
                Clear All Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
