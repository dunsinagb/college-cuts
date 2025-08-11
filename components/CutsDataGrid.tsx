"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Filter, X, RefreshCw, Search, ExternalLink, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabaseClient"
import { STATUS_COLORS, CUT_TYPE_COLORS, CATEGORY_COLORS } from "@/lib/constants"
import { formatMonthYear } from "@/lib/utils"

/**
 * CutsDataGrid Component - Status Filtering Methodology
 * 
 * STATUS FILTERING APPROACH:
 * 
 * 1. HARDCODED STATUS OPTIONS:
 *    - The status filter shows all 4 main status categories regardless of database content
 *    - This ensures consistent filtering options even if some statuses have no data
 *    - Statuses: "confirmed", "ongoing", "reversed", "rumor"
 * 
 * 2. NULL VALUE HANDLING:
 *    - NULL values are excluded from the filter dropdown
 *    - They are displayed as "—" in the table with gray styling
 *    - This prevents confusion in the filtering interface
 * 
 * 3. COLOR CONSISTENCY:
 *    - All status badges use the shared STATUS_COLORS from lib/constants.ts
 *    - Colors are semantic and consistent across the entire application
 *    - Each status has a distinct color for easy visual identification
 * 
 * 4. FILTER BEHAVIOR:
 *    - "All Statuses" shows records with any status (including NULL)
 *    - Individual status filters only show records with that specific status
 *    - The filter respects the actual database values (lowercase)
 */

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
  
  // Enrollment issues
  if (notesLower.includes("enrollment decline") || notesLower.includes("declining enrollment") ||
      notesLower.includes("low enrollment") || notesLower.includes("enrollment woes") ||
      notesLower.includes("enrollment shortfall") || notesLower.includes("enrollment down")) {
    return "Enrollment Decline"
  }
  
  // Strategic restructuring
  if (notesLower.includes("strategic") || notesLower.includes("restructuring") ||
      notesLower.includes("realignment") || notesLower.includes("mission alignment") ||
      notesLower.includes("broader restructuring") || notesLower.includes("institution-wide") ||
      notesLower.includes("voluntary buyouts") || notesLower.includes("voluntary retirement") ||
      notesLower.includes("buyouts") || notesLower.includes("retirement incentives")) {
    return "Strategic Restructuring"
  }
  
  // Political pressure
  if (notesLower.includes("political pressure") || notesLower.includes("state lawmakers") ||
      notesLower.includes("national security") || notesLower.includes("antisemitism") ||
      notesLower.includes("chinese communist party") || notesLower.includes("house select committee")) {
    return "Political Pressure"
  }
  
  // Operational costs
  if (notesLower.includes("operational costs") || notesLower.includes("rising costs") ||
      notesLower.includes("cost constraints") || notesLower.includes("cost-saving") ||
      notesLower.includes("operational challenges") || notesLower.includes("operational cuts")) {
    return "Operational Costs"
  }
  
  // Financial mismanagement
  if (notesLower.includes("mismanagement") || notesLower.includes("fraud") ||
      notesLower.includes("scandal") || notesLower.includes("financial irregularities") ||
      notesLower.includes("financial misconduct")) {
    return "Financial Mismanagement"
  }
  
  // Accreditation issues
  if (notesLower.includes("accreditation") || notesLower.includes("accredited") ||
      notesLower.includes("certification") || notesLower.includes("accreditation issues")) {
    return "Accreditation Issues"
  }
  
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
  
  if (cutType === "department_closure" || cutType === "program_suspension") {
    // These typically affect both faculty and staff, but let's check the context
    if (hasFacultyKeywords && !hasStaffKeywords) {
      return "Faculty"
    } else if (hasStaffKeywords && !hasFacultyKeywords) {
      return "Staff"
    } else {
      return "Faculty/Staff"
    }
  }
  
  // If we have specific keywords, use them
  if (hasFacultyKeywords && !hasStaffKeywords) {
    return "Faculty"
  } else if (hasStaffKeywords && !hasFacultyKeywords) {
    return "Staff"
  }
  
  // Default to Faculty/Staff if we can't determine
  return "Faculty/Staff"
}

// Mock data as fallback only
const mockCuts: any[] = [
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
    status: "Active",
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
    status: "Active",
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
  const [cuts, setCuts] = useState<any[]>([])
  const [filteredCuts, setFilteredCuts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    states: [],
    institutions: [],
    programs: [],
    effectiveTerms: [],
    sourcePublications: [],
    controls: [],
    categories: [],
    statuses: [],
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
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [showOnlyWithNumbers, setShowOnlyWithNumbers] = useState<boolean>(false)

  async function fetchData() {
    if (!isSupabaseConfigured) {
      setError("Supabase not configured")
      setLoading(false)
      return
    }

    try {
      const client = getSupabaseClient()
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
      
      // Debug: Log status distribution
      if (data && data.length > 0) {
        const statusCounts = data.reduce((acc: Record<string, number>, cut: any) => {
          const status = cut.status || 'NULL'
          acc[status] = (acc[status] || 0) + 1
          return acc
        }, {})
        console.log("📊 Status distribution in data:", statusCounts)
      }
      
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
    categoryFilter,
    statusFilter,
    showOnlyWithNumbers,
  ])

  async function fetchFilterOptions() {
    const client = getSupabaseClient()
    if (!isSupabaseConfigured || !client) {
      setFilterOptions({
        states: ["CA", "TX", "NY", "FL"],
        institutions: ["Example University", "State College"],
        programs: ["Liberal Arts", "Philosophy"],
        effectiveTerms: ["Fall 2024", "Spring 2025"],
        sourcePublications: ["University Times", "State College News"],
        controls: ["Public", "Private non-profit", "Private for-profit"],
        categories: ["Budget Deficit", "Enrollment Decline", "Federal Funding Cuts", "State Mandates", "Financial Mismanagement", "Strategic Restructuring", "Political Pressure", "Operational Costs", "Accreditation Issues"],
        statuses: ["confirmed", "ongoing", "reversed", "rumor"], // Show all 4 status categories
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
        { data: categoriesData },
        { data: statusesData },
      ] = await Promise.all([
        client.from("v_latest_cuts").select("state").order("state"),
        client.from("v_latest_cuts").select("institution").order("institution"),
        client.from("v_latest_cuts").select("program_name").order("program_name"),
        client.from("v_latest_cuts").select("effective_term").order("effective_term"),
        client.from("v_latest_cuts").select("source_publication").order("source_publication"),
        client.from("v_latest_cuts").select("control").order("control"),
        client.from("v_latest_cuts").select("notes").order("notes"), // Fetch notes for categorization
        client.from("v_latest_cuts").select("status").order("status"),
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
        categories: Array.from(new Set(categoriesData?.map((item: any) => categorizeCut(item.notes)).filter(Boolean) || [])),
        statuses: ["confirmed", "ongoing", "reversed", "rumor"], // Show all 4 status categories
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

    // Category filter
    if (categoryFilter !== "all") {
      const beforeCategory = filtered.length
      filtered = filtered.filter((cut) => categorizeCut(cut.notes) === categoryFilter)
      console.log(`🔍 Category filter (${categoryFilter}): ${beforeCategory} → ${filtered.length}`)
    }

    // Status filter
    if (statusFilter !== "all") {
      const beforeStatus = filtered.length
      filtered = filtered.filter((cut) => cut.status === statusFilter)
      console.log(`🔍 Status filter (${statusFilter}): ${beforeStatus} → ${filtered.length}`)
      console.log(`🔍 Available statuses in filtered data:`, [...new Set(filtered.map(cut => cut.status))])
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
    setCategoryFilter("all")
    setStatusFilter("all")
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
        "Date",
        "Institution",
        "Control",
        "State",
        "Action Type",
        "Primary Reason",
        "Status",
        "Students",
        "Faculty/Staff",
        "Source"
      ]

      const csvContent = [
        headers.join(","),
        ...filteredCuts.map((cut) =>
          [
            // Date (formatted as in table)
            `"${formatMonthYear(cut.announcement_date).replace(/"/g, '""')}"`,
            // Institution
            `"${(cut.institution || '').replace(/"/g, '""')}"`,
            // Control
            `"${(cut.control || '').replace(/"/g, '""')}"`,
            // State
            `"${(cut.state || '').replace(/"/g, '""')}"`,
            // Cut Type
            `"${(cut.cut_type || '').replace(/"/g, '""').replace("_", " ")}"`,
            // Category
            `"${categorizeCut(cut.notes).replace(/"/g, '""')}"`,
            // Status
            `"${(cut.status || '').replace(/"/g, '""')}"`,
            // Students
            `"${cut.students_affected ? cut.students_affected.toLocaleString() : ''}"`,
            // Faculty/Staff
            `"${cut.faculty_affected ? `${cut.faculty_affected.toLocaleString()} (${determinePersonnelType(cut)})` : ''}"`,
            // Source (URL)
            `"${(cut.source_url || '').replace(/"/g, '""')}"`
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
    categoryFilter !== "all" ? categoryFilter : null,
    statusFilter !== "all" ? statusFilter : null,
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
      <div className="space-y-6" aria-label="Loading program actions data">
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
                    Action Type: {cutTypeFilter.replace("_", " ")}
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
                    Faculty/Staff: {facultyAffectedFilter.replace("_", "-")}
                  </Badge>
                )}
                {categoryFilter !== "all" && (
                  <Badge variant="secondary" className="bg-white border-blue-200 text-blue-800 text-xs px-2 py-1">
                    Primary Reason: {categoryFilter}
                  </Badge>
                )}
                {statusFilter !== "all" && (
                  <Badge variant="secondary" className="bg-white border-blue-200 text-blue-800 text-xs px-2 py-1">
                    Status: {statusFilter}
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
            {/* All Dropdown Filters in One Row */}
            <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-9 gap-2">
          {/* Search Filter */}
          <div className="text-center">
                <h3 className="text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">Search</h3>
                <div className="flex items-center gap-1">
                  <Search className="h-3 w-3 text-gray-400" />
              <Input
                    placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-6 text-xs border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

              {/* Date Range Filter */}
              <div className="text-center">
                <h3 className="text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">Date</h3>
                <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
                  <SelectTrigger className="h-6 text-xs border-gray-300 focus:border-blue-500">
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

              {/* State Filter */}
              <div className="text-center">
                <h3 className="text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">State</h3>
                <Select value={stateFilter} onValueChange={setStateFilter}>
                  <SelectTrigger className="h-6 text-xs border-gray-300 focus:border-blue-500">
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

              {/* Institution Filter */}
              <div className="text-center">
                <h3 className="text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">Institution</h3>
                <Select value={institutionFilter} onValueChange={setInstitutionFilter}>
                  <SelectTrigger className="h-6 text-xs border-gray-300 focus:border-blue-500">
                    <SelectValue placeholder="All Institutions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Institutions</SelectItem>
                    {filterOptions.institutions.slice(0, 50).map((institution) => (
                      <SelectItem key={institution} value={institution}>
                        {institution.length > 20 ? `${institution.substring(0, 20)}...` : institution}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Control Filter */}
              <div className="text-center">
                <h3 className="text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">Control</h3>
                <Select value={controlFilter} onValueChange={setControlFilter}>
                  <SelectTrigger className="h-6 text-xs border-gray-300 focus:border-blue-500">
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

              {/* Cut Type Filter */}
              <div className="text-center">
                <h3 className="text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">Action</h3>
                <Select value={cutTypeFilter} onValueChange={setCutTypeFilter}>
                  <SelectTrigger className="h-6 text-xs border-gray-300 focus:border-blue-500">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="program_suspension">
                      <Badge className={CUT_TYPE_COLORS["program_suspension"]}>Program Suspension</Badge>
                    </SelectItem>
                    <SelectItem value="teach_out">
                      <Badge className={CUT_TYPE_COLORS["teach_out"]}>Teach Out</Badge>
                    </SelectItem>
                    <SelectItem value="department_closure">
                      <Badge className={CUT_TYPE_COLORS["department_closure"]}>Department Closure</Badge>
                    </SelectItem>
                    <SelectItem value="campus_closure">
                      <Badge className={CUT_TYPE_COLORS["campus_closure"]}>Campus Closure</Badge>
                    </SelectItem>
                    <SelectItem value="institution_closure">
                      <Badge className={CUT_TYPE_COLORS["institution_closure"]}>Institution Closure</Badge>
                    </SelectItem>
                    <SelectItem value="staff_layoff">
                      <Badge className={CUT_TYPE_COLORS["staff_layoff"]}>Staff Layoff</Badge>
                    </SelectItem>
                  </SelectContent>
                </Select>
            </div>

              {/* Category Filter */}
              <div className="text-center">
                <h3 className="text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">Reason</h3>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="h-6 text-xs border-gray-300 focus:border-blue-500">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {filterOptions.categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        <Badge className={CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]}>{category}</Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="text-center">
                <h3 className="text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">Status</h3>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-6 text-xs border-gray-300 focus:border-blue-500">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {filterOptions.statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        <Badge className={STATUS_COLORS[status as keyof typeof STATUS_COLORS] || "bg-gray-50 text-gray-700 border-gray-200"}>{status}</Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Students Affected Filter */}
              <div className="text-center">
                <h3 className="text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">Students</h3>
                <Select value={studentsAffectedFilter} onValueChange={setStudentsAffectedFilter}>
                  <SelectTrigger className="h-6 text-xs border-gray-300 focus:border-blue-500">
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
                <h3 className="text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">Faculty/Staff</h3>
                <Select value={facultyAffectedFilter} onValueChange={setFacultyAffectedFilter}>
                  <SelectTrigger className="h-6 text-xs border-gray-300 focus:border-blue-500">
                    <SelectValue placeholder="All Ranges" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ranges</SelectItem>
                    <SelectItem value="1_10">1-10 Faculty/Staff</SelectItem>
                    <SelectItem value="11_25">11-25 Faculty/Staff</SelectItem>
                    <SelectItem value="26_50">26-50 Faculty/Staff</SelectItem>
                    <SelectItem value="51_100">51-100 Faculty/Staff</SelectItem>
                    <SelectItem value="101_250">101-250 Faculty/Staff</SelectItem>
                    <SelectItem value="251_500">251-500 Faculty/Staff</SelectItem>
                    <SelectItem value="501_1000">501-1,000 Faculty/Staff</SelectItem>
                    <SelectItem value="1000_plus">1,000+ Faculty/Staff</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Special Filters Row */}
            <div className="flex items-center justify-between gap-4 mt-2">
              {/* Show Only With Numbers Toggle */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showOnlyWithNumbers"
                  checked={showOnlyWithNumbers}
                  onChange={(e) => setShowOnlyWithNumbers(e.target.checked)}
                  className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="showOnlyWithNumbers" className="text-xs font-medium text-gray-700">
                  Show only actions with numerical impact data
                </label>
          </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={showOnly2024}
                  variant="outline"
                  size="sm"
                  className="h-6 text-xs bg-white hover:bg-gray-50 border-gray-300"
                >
                  Show 2024 Only
                </Button>
                <Button
                  onClick={clearAllFilters}
                  variant="outline"
                  size="sm"
                  className="h-6 text-xs bg-white hover:bg-gray-50 border-gray-300"
                >
                  Clear All
                </Button>
              </div>
            </div>
          </div>

          {/* Results Summary and Export Button */}
          <div className="flex items-center justify-between text-sm text-gray-600 pt-3 border-t border-gray-200">
            <div className="bg-gray-50 px-4 py-2 rounded-full border">
              Showing <span className="font-semibold text-gray-900">{filteredCuts.length}</span> of{" "}
              <span className="font-semibold text-gray-900">{cuts.length}</span> total cuts
            </div>
            <Button
              onClick={downloadCSV}
              variant="outline"
              size="sm"
              className="h-8 text-xs bg-white hover:bg-gray-50 border-gray-300 ml-4"
              aria-label={`Export ${filteredCuts.length} cuts to CSV`}
            >
              <Download className="h-3 w-3 mr-1" aria-hidden="true" />
              Export ({filteredCuts.length})
            </Button>
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
                  <th className="h-12 px-4 text-center align-middle font-medium">Action Type</th>
                  <th className="h-12 px-4 text-center align-middle font-medium">Primary Reason</th>
                  <th className="h-12 px-4 text-center align-middle font-medium">Status</th>
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
                        {formatMonthYear(cut.announcement_date)}
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
                      <Badge className={CUT_TYPE_COLORS[cut.cut_type]}>{cut.cut_type.replace("_", " ")}</Badge>
                    </td>
                    <td className="p-4 text-center align-middle">
                      <Badge className={CATEGORY_COLORS[categorizeCut(cut.notes) as keyof typeof CATEGORY_COLORS]}>
                        {categorizeCut(cut.notes)}
                      </Badge>
                    </td>
                    <td className="p-4 text-center align-middle">
                      <Badge className={STATUS_COLORS[cut.status as keyof typeof STATUS_COLORS] || "bg-gray-50 text-gray-700 border-gray-200"}>
                        {cut.status || "—"}
                      </Badge>
                    </td>
                    <td className="p-4 text-center align-middle">
                      {cut.students_affected ? cut.students_affected.toLocaleString() : "—"}
                    </td>
                    <td className="p-4 text-center align-middle">
                      {cut.faculty_affected ? (
                        <div className="flex flex-col items-center">
                          <span className="font-medium">{cut.faculty_affected.toLocaleString()}</span>
                          <span className="text-xs text-muted-foreground">{determinePersonnelType(cut)}</span>
                        </div>
                      ) : "—"}
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
