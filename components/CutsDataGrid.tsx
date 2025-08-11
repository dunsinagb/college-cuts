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

// Category colors for the new categorization system
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
  if (!notes) return "Budget Deficit" // Default for null notes
  
  const notesLower = notes.toLowerCase()
  
  // Budget and financial issues (highest priority - most common)
  if (notesLower.includes("budget deficit") || notesLower.includes("budget gap") || 
      notesLower.includes("budget shortfall") || notesLower.includes("deficit") ||
      notesLower.includes("financial deficit") || notesLower.includes("operating deficit") ||
      notesLower.includes("budget constraints") || notesLower.includes("budget cuts") ||
      notesLower.includes("revenue gap") || notesLower.includes("financial instability") ||
      notesLower.includes("financial collapse") || notesLower.includes("financial challenges") ||
      notesLower.includes("financial fragility") || notesLower.includes("financial irregularities")) {
    return "Budget Deficit"
  }
  
  // Federal funding cuts
  if (notesLower.includes("federal funding") || notesLower.includes("federal cuts") ||
      notesLower.includes("federal budget") || notesLower.includes("federal grants") ||
      notesLower.includes("usaid") || notesLower.includes("federal funding freeze") ||
      notesLower.includes("federal funding threats") || notesLower.includes("federal budget cuts") ||
      notesLower.includes("federal funding elimination")) {
    return "Federal Funding Cuts"
  }
  
  // State mandates and requirements
  if (notesLower.includes("state mandate") || notesLower.includes("state requirement") ||
      notesLower.includes("state funding") || notesLower.includes("state-mandated") ||
      notesLower.includes("graduation thresholds") || notesLower.includes("low-productivity") ||
      notesLower.includes("state-mandated graduation") || notesLower.includes("degree program thresholds") ||
      notesLower.includes("indiana state mandate") || notesLower.includes("ohio sb1") ||
      notesLower.includes("hb 265")) {
    return "State Mandates"
  }
  
  // Enrollment decline
  if (notesLower.includes("enrollment decline") || notesLower.includes("declining enrollment") ||
      notesLower.includes("low enrollment") || notesLower.includes("enrollment drop") ||
      notesLower.includes("student enrollment") || notesLower.includes("admission decline") ||
      notesLower.includes("student numbers") || notesLower.includes("enrollment numbers") ||
      notesLower.includes("student population") || notesLower.includes("enrollment trends")) {
    return "Enrollment Decline"
  }
  
  // Strategic restructuring
  if (notesLower.includes("strategic restructuring") || notesLower.includes("strategic plan") ||
      notesLower.includes("strategic realignment") || notesLower.includes("strategic initiative") ||
      notesLower.includes("restructuring") || notesLower.includes("reorganization") ||
      notesLower.includes("realignment") || notesLower.includes("strategic review") ||
      notesLower.includes("strategic assessment") || notesLower.includes("strategic changes")) {
    return "Strategic Restructuring"
  }
  
  // Financial mismanagement
  if (notesLower.includes("financial mismanagement") || notesLower.includes("mismanagement") ||
      notesLower.includes("financial irregularities") || notesLower.includes("financial scandal") ||
      notesLower.includes("financial fraud") || notesLower.includes("financial misconduct") ||
      notesLower.includes("financial impropriety") || notesLower.includes("financial wrongdoing")) {
    return "Financial Mismanagement"
  }
  
  // Political pressure
  if (notesLower.includes("political pressure") || notesLower.includes("political") ||
      notesLower.includes("legislative pressure") || notesLower.includes("government pressure") ||
      notesLower.includes("political influence") || notesLower.includes("political climate") ||
      notesLower.includes("political environment") || notesLower.includes("political factors")) {
    return "Political Pressure"
  }
  
  // Operational costs
  if (notesLower.includes("operational costs") || notesLower.includes("operating costs") ||
      notesLower.includes("operational expenses") || notesLower.includes("operating expenses") ||
      notesLower.includes("cost structure") || notesLower.includes("cost management") ||
      notesLower.includes("operational efficiency") || notesLower.includes("cost reduction") ||
      notesLower.includes("operational savings") || notesLower.includes("cost optimization")) {
    return "Operational Costs"
  }
  
  // Accreditation issues
  if (notesLower.includes("accreditation") || notesLower.includes("accredited") ||
      notesLower.includes("accreditation issues") || notesLower.includes("accreditation problems") ||
      notesLower.includes("accreditation status") || notesLower.includes("accreditation review") ||
      notesLower.includes("accreditation standards") || notesLower.includes("accreditation requirements")) {
    return "Accreditation Issues"
  }
  
  // Default to Budget Deficit if no specific category matches
  return "Budget Deficit"
}

function determinePersonnelType(cut: any): string {
  if (!cut.faculty_affected || cut.faculty_affected === 0) {
    return "—"
  }
  
  const notes = (cut.notes || "").toLowerCase()
  const programName = (cut.program_name || "").toLowerCase()
  const cutType = cut.cut_type.toLowerCase()
  
  // Keywords that indicate Faculty
  const facultyKeywords = [
    "faculty", "professor", "professors", "teaching", "academic", "instructor", "instructors",
    "lecturer", "lecturers", "adjunct", "adjuncts", "tenure", "tenured", "assistant professor",
    "associate professor", "full professor", "department chair", "department chairs",
    "academic staff", "teaching staff", "research faculty", "clinical faculty"
  ]
  
  // Keywords that indicate Staff
  const staffKeywords = [
    "staff", "administrative", "administration", "administrator", "administrators",
    "non-instructional", "non-instructional staff", "support staff", "support personnel",
    "administrative staff", "professional staff", "classified staff", "unclassified staff",
    "office staff", "clerical", "clerical staff", "maintenance", "maintenance staff",
    "custodial", "custodial staff", "security", "security staff", "it staff", "technology staff"
  ]
  
  // Check for faculty keywords
  const hasFacultyKeywords = facultyKeywords.some(keyword => 
    notes.includes(keyword) || programName.includes(keyword)
  )
  
  // Check for staff keywords
  const hasStaffKeywords = staffKeywords.some(keyword => 
    notes.includes(keyword) || programName.includes(keyword)
  )
  
  // Special cases based on action type
  if (cutType === "staff_layoff") {
    return "Staff"
  }
  
  // Determine based on keywords
    if (hasFacultyKeywords && !hasStaffKeywords) {
      return "Faculty"
    } else if (hasStaffKeywords && !hasFacultyKeywords) {
      return "Staff"
  } else if (hasFacultyKeywords && hasStaffKeywords) {
    return "Faculty & Staff"
    } else {
    return "Personnel"
  }
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
    status: "confirmed",
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
    status: "provisional",
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
  categories: string[]
  statuses: string[]
}

export function CutsDataGrid() {
  const [cuts, setCuts] = useState<Cut[]>([])
  const [filteredCuts, setFilteredCuts] = useState<Cut[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [stateFilter, setStateFilter] = useState("all")
  const [cutTypeFilter, setCutTypeFilter] = useState("all")
  const [institutionFilter, setInstitutionFilter] = useState("all")
  const [controlFilter, setControlFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    states: [],
    institutions: [],
    programs: [],
    effectiveTerms: [],
    sourcePublications: [],
    controls: [],
    categories: [],
    statuses: []
  })

  useEffect(() => {
    async function fetchCuts() {
      try {
    if (!isSupabaseConfigured) {
          console.warn("Supabase not configured, using mock data")
          setCuts(mockCuts)
          setFilteredCuts(mockCuts)
      setLoading(false)
      return
    }

      const client = supabase()
      if (!client) {
          console.warn("Supabase client not available")
        return
      }

        console.log("🔍 Fetching cuts data...")
      const { data, error } = await client
        .from("v_latest_cuts")
        .select("*")
        .order("announcement_date", { ascending: false })

      if (error) {
          console.error("Error fetching cuts:", error)
        return
      }

        console.log(`✅ Fetched ${data?.length || 0} cuts`)
      setCuts(data || [])
        setFilteredCuts(data || [])
        
        // Generate filter options
        if (data && data.length > 0) {
          const states = Array.from(new Set(data.map(cut => cut.state).filter(Boolean))).sort()
          const institutions = Array.from(new Set(data.map(cut => cut.institution).filter(Boolean))).sort()
          const programs = Array.from(new Set(data.map(cut => cut.program_name).filter(Boolean))).sort()
          const effectiveTerms = Array.from(new Set(data.map(cut => cut.effective_term).filter(Boolean))).sort()
          const sourcePublications = Array.from(new Set(data.map(cut => cut.source_publication).filter(Boolean))).sort()
          const controls = Array.from(new Set(data.map(cut => cut.control).filter(Boolean))).sort()
          const categories = Array.from(new Set(data.map(cut => categorizeCut(cut.notes)))).sort()
          const statuses = Array.from(new Set(data.map(cut => cut.status).filter(Boolean))).sort()

          setFilterOptions({
            states,
            institutions,
            programs,
            effectiveTerms,
            sourcePublications,
            controls,
            categories,
            statuses
          })
        }
    } catch (err) {
      console.error("Error:", err)
      } finally {
      setLoading(false)
    }
  }

    fetchCuts()

    // Subscribe to realtime updates
    const client = supabase()
    if (client) {
      const channel = client
        .channel("public:v_latest_cuts")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "v_latest_cuts" }, (payload: any) => {
        // Refetch data when new cuts are added
        fetchCuts()
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

    // Status filter
    if (statusFilter !== "all") {
      const beforeStatus = filtered.length
      filtered = filtered.filter((cut) => cut.status === statusFilter)
      console.log(`🔍 Status filter (${statusFilter}): ${beforeStatus} → ${filtered.length}`)
    }

    setFilteredCuts(filtered)
    console.log(`✅ Final filtered results: ${filtered.length} cuts`)
  }

  useEffect(() => {
    applyFilters()
  }, [cuts, searchTerm, stateFilter, cutTypeFilter, institutionFilter, controlFilter, statusFilter])

  function clearFilters() {
    setSearchTerm("")
    setStateFilter("all")
    setCutTypeFilter("all")
    setInstitutionFilter("all")
    setControlFilter("all")
    setStatusFilter("all")
  }

  function exportToCSV() {
    if (filteredCuts.length === 0) {
      alert("No data to export")
      return
    }

      const headers = [
        "Date",
        "Institution",
      "Program",
        "State",
        "Action Type",
      "Status",
        "Primary Reason",
      "Students Affected",
      "Faculty/Staff Affected",
      "Control",
      "Effective Term",
      "Notes",
      "Source URL",
      "Source Publication"
      ]

      const csvContent = [
        headers.join(","),
      ...filteredCuts.map(cut => [
        new Date(cut.announcement_date).toLocaleDateString(),
        `"${cut.institution}"`,
        `"${cut.program_name || ""}"`,
        cut.state,
        cut.cut_type.replace("_", " "),
        cut.status || "Unknown",
        `"${categorizeCut(cut.notes)}"`,
        cut.students_affected || "",
        cut.faculty_affected || "",
        `"${cut.control || ""}"`,
        `"${cut.effective_term || ""}"`,
        `"${(cut.notes || "").replace(/"/g, '""')}"`,
        `"${cut.source_url || ""}"`,
        `"${cut.source_publication || ""}"`
      ].join(","))
      ].join("\n")

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `college-cuts-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-[300px]" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-[100px]" />
            <Skeleton className="h-10 w-[100px]" />
            </div>
        </div>
        <div className="space-y-2">
          {[...Array(10)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (!isSupabaseConfigured) {
  return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
          <AlertDescription>
          Database not configured. Showing sample data only.
          </AlertDescription>
        </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search institutions, programs, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-[300px]"
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
                >
            <Filter className="w-4 h-4" />
            Filters
                </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportToCSV}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
          </div>
              </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Clear All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">State</label>
                <Select value={stateFilter} onValueChange={setStateFilter}>
                  <SelectTrigger>
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

              <div>
                <label className="text-sm font-medium mb-2 block">Action Type</label>
                <Select value={cutTypeFilter} onValueChange={setCutTypeFilter}>
                  <SelectTrigger>
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

              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="provisional">Provisional</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="proposed">Proposed</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
            </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Institution</label>
                <Select value={institutionFilter} onValueChange={setInstitutionFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Institutions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Institutions</SelectItem>
                    {filterOptions.institutions.map((institution) => (
                      <SelectItem key={institution} value={institution}>
                        {institution}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Control</label>
                <Select value={controlFilter} onValueChange={setControlFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Controls" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Controls</SelectItem>
                    {filterOptions.controls.map((control) => (
                      <SelectItem key={control} value={control}>
                        {control}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              </div>
          </CardContent>
        </Card>
      )}

      {/* Results Summary */}
      <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Showing {filteredCuts.length} of {cuts.length} total actions
          </span>
              </div>
        <div className="text-sm text-muted-foreground">
          {cuts.filter((cut) => cut.announcement_date.startsWith("2024")).length} from 2024
            </div>
          </div>

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
                  <th className="h-12 px-4 text-center align-middle font-medium">Action Type</th>
                  <th className="h-12 px-4 text-center align-middle font-medium">Status</th>
                  <th className="h-12 px-4 text-center align-middle font-medium">Primary Reason</th>
                  <th className="h-12 px-4 text-center align-middle font-medium">Students</th>
                  <th className="h-12 px-4 text-center align-middle font-medium">Faculty/Staff</th>
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
                      {cut.status ? (
                        <Badge className={statusColors[cut.status as keyof typeof statusColors]}>
                          {statusDisplayNames[cut.status as keyof typeof statusDisplayNames]}
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800 border-gray-200">Unknown</Badge>
                      )}
                    </td>
                    <td className="p-4 text-center align-middle">
                      <Badge className={categoryColors[categorizeCut(cut.notes) as keyof typeof categoryColors]}>
                        {categorizeCut(cut.notes)}
                      </Badge>
                    </td>
                    <td className="p-4 text-center align-middle">
                      {cut.students_affected ? cut.students_affected.toLocaleString() : "—"}
                    </td>
                    <td className="p-4 text-center align-middle">
                      {cut.faculty_affected ? (
                        <span>
                          {cut.faculty_affected.toLocaleString()}
                          <br />
                          <span className="text-xs text-muted-foreground">
                            {determinePersonnelType(cut)}
                          </span>
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="p-4 text-center align-middle">
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
        </CardContent>
      </Card>

      {filteredCuts.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No cuts found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search terms or filters to find what you're looking for.
          </p>
          <Button variant="outline" onClick={clearFilters}>
                Clear All Filters
              </Button>
        </div>
      )}
    </div>
  )
}
