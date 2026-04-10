import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Search, TrendingUp, DollarSign, Briefcase, Users, GraduationCap,
  Loader2, AlertCircle, ExternalLink, ChevronUp, ChevronDown, ChevronsUpDown
} from "lucide-react";

/* ─── native select helper ────────────────────────────────────────── */
function NativeSelect({ value, onChange, className = "", children }: {
  value: string; onChange: (v: string) => void; className?: string; children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`h-9 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-sm
        focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 cursor-pointer appearance-none pr-8 ${className}`}
      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}
    >
      {children}
    </select>
  );
}

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

interface Job {
  soc: string;
  title: string;
  median_wage: number | null;
  growth_pct: number | null;
  employment_level: number | null;
  annual_openings: number | null;
  entry_education: string | null;
  unemployment_rate: number | null;
}

type SortField = keyof Pick<Job, "title" | "median_wage" | "employment_level" | "annual_openings" | "growth_pct">;
type SortDir = "asc" | "desc" | null;

const POPULAR_MAJORS = [
  "Computer Science", "Nursing", "Business Administration", "Psychology",
  "Education", "Biology", "Engineering", "English", "Art", "History",
  "Political Science", "Economics", "Social Work", "Communications", "Chemistry"
];

function fmt(n: number | null, prefix = "", suffix = "") {
  if (n == null) return "N/A";
  return `${prefix}${n.toLocaleString()}${suffix}`;
}

function SortIcon({ field, sortField, sortDir }: { field: SortField; sortField: SortField | null; sortDir: SortDir }) {
  if (sortField !== field) return <ChevronsUpDown className="inline h-3 w-3 ml-1 text-muted-foreground" />;
  return sortDir === "asc"
    ? <ChevronUp className="inline h-3 w-3 ml-1" />
    : <ChevronDown className="inline h-3 w-3 ml-1" />;
}

export default function JobOutlookPage() {
  const [majorInput, setMajorInput] = useState("Computer Science");
  const [searchMajor, setSearchMajor] = useState("Computer Science");
  const [educationFilter, setEducationFilter] = useState("all");
  const [salaryFilter, setSalaryFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);

  const { data, isLoading, isError } = useQuery<{ jobs: Job[] }>({
    queryKey: ["job-outlook", searchMajor],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/api/job-outlook?major=${encodeURIComponent(searchMajor)}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: searchMajor.length >= 2,
  });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (majorInput.trim().length >= 2) setSearchMajor(majorInput.trim());
  }

  function toggleSort(field: SortField) {
    if (sortField !== field) { setSortField(field); setSortDir("desc"); return; }
    if (sortDir === "desc") { setSortDir("asc"); return; }
    setSortField(null); setSortDir(null);
  }

  const jobs = data?.jobs ?? [];

  const filtered = jobs.filter((j) => {
    if (educationFilter !== "all" && j.entry_education !== educationFilter) return false;
    if (salaryFilter !== "all" && j.median_wage != null) {
      const w = j.median_wage;
      if (salaryFilter === "low" && w >= 60000) return false;
      if (salaryFilter === "medium" && (w < 60000 || w >= 100000)) return false;
      if (salaryFilter === "high" && w < 100000) return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (!sortField || !sortDir) return 0;
    const av = a[sortField] ?? -Infinity;
    const bv = b[sortField] ?? -Infinity;
    if (typeof av === "string" && typeof bv === "string") {
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    }
    return sortDir === "asc" ? Number(av) - Number(bv) : Number(bv) - Number(av);
  });

  const educationLevels = [...new Set(jobs.map(j => j.entry_education).filter(Boolean))] as string[];

  return (
    <div className="min-h-screen bg-[#f0f4f9]">
      {/* Navy header */}
      <div style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2a4e7c 60%, #1a3352 100%)" }}>
        <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="space-y-2 mb-8">
            <h1 className="text-4xl font-extrabold tracking-tight text-white">Job Outlook</h1>
            <p className="text-lg text-blue-200 max-w-2xl">
              Search any academic major to see what career paths open up — and what happens to job prospects when those programs get cut.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-5">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
              <Input
                placeholder="Search by major (e.g. Computer Science, Nursing, Art)"
                value={majorInput}
                onChange={(e) => setMajorInput(e.target.value)}
                className="pl-9 h-12 bg-white/20 border-white/30 text-white placeholder:text-white/50 focus:bg-white/30"
              />
            </div>
            <Button type="submit" className="h-12 px-8 bg-amber-500 hover:bg-amber-400 text-white border-0 font-semibold" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
            </Button>
          </form>
          <div className="mt-4 flex flex-wrap gap-2">
            {POPULAR_MAJORS.map((m) => (
              <button
                key={m}
                onClick={() => { setMajorInput(m); setSearchMajor(m); }}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  searchMajor === m
                    ? "bg-amber-500 text-white border-amber-500"
                    : "bg-white/10 text-blue-100 border-white/20 hover:bg-white/20 hover:text-white"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">

      {isError && (
        <div className="flex items-center gap-2 text-destructive bg-red-50 rounded-lg px-4 py-3">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">Failed to load job data. The service may not be configured yet.</span>
        </div>
      )}

      {sorted.length > 0 && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <Briefcase className="h-8 w-8 text-primary/60" />
                <div>
                  <p className="text-sm text-muted-foreground">Careers Found</p>
                  <p className="text-2xl font-bold text-primary">{sorted.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-green-500/60" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg Median Wage</p>
                  <p className="text-2xl font-bold text-primary">
                    {sorted.filter(j => j.median_wage).length > 0
                      ? `$${Math.round(sorted.filter(j => j.median_wage).reduce((s, j) => s + j.median_wage!, 0) / sorted.filter(j => j.median_wage).length / 1000)}k`
                      : "N/A"}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-500/60" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Jobs</p>
                  <p className="text-2xl font-bold text-primary">
                    {sorted.reduce((s, j) => s + (j.employment_level ?? 0), 0).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-orange-500/60" />
                <div>
                  <p className="text-sm text-muted-foreground">Annual Openings</p>
                  <p className="text-2xl font-bold text-primary">
                    {sorted.reduce((s, j) => s + (j.annual_openings ?? 0), 0).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-md">
            <CardHeader className="pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl">Career Pathways for <span className="text-primary">{searchMajor}</span></CardTitle>
                <CardDescription>BLS occupational data for related careers</CardDescription>
              </div>
              <div className="flex gap-2">
                <NativeSelect value={educationFilter} onChange={setEducationFilter} className="w-44">
                  <option value="all">All Education</option>
                  {educationLevels.map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </NativeSelect>
                <NativeSelect value={salaryFilter} onChange={setSalaryFilter} className="w-36">
                  <option value="all">All Salaries</option>
                  <option value="low">Under $60k</option>
                  <option value="medium">$60k–$100k</option>
                  <option value="high">$100k+</option>
                </NativeSelect>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="cursor-pointer hover:text-primary pl-6" onClick={() => toggleSort("title")}>
                      Job Title <SortIcon field="title" sortField={sortField} sortDir={sortDir} />
                    </TableHead>
                    <TableHead className="cursor-pointer hover:text-primary" onClick={() => toggleSort("median_wage")}>
                      Median Wage <SortIcon field="median_wage" sortField={sortField} sortDir={sortDir} />
                    </TableHead>
                    <TableHead className="cursor-pointer hover:text-primary" onClick={() => toggleSort("employment_level")}>
                      Employment <SortIcon field="employment_level" sortField={sortField} sortDir={sortDir} />
                    </TableHead>
                    <TableHead className="cursor-pointer hover:text-primary" onClick={() => toggleSort("annual_openings")}>
                      Annual Openings <SortIcon field="annual_openings" sortField={sortField} sortDir={sortDir} />
                    </TableHead>
                    <TableHead>Education</TableHead>
                    <TableHead>Growth</TableHead>
                    <TableHead className="pr-6">SOC</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sorted.map((job) => (
                    <TableRow key={job.soc} className="hover:bg-muted/20">
                      <TableCell className="font-medium pl-6">
                        <a
                          href={`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(job.title)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 hover:text-[#0077b5] transition-colors group"
                        >
                          {job.title}
                          <svg className="h-3.5 w-3.5 text-[#0077b5] opacity-70 group-hover:opacity-100 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                        </a>
                      </TableCell>
                      <TableCell className="font-semibold text-green-700">
                        {job.median_wage ? `$${job.median_wage.toLocaleString()}` : "N/A"}
                      </TableCell>
                      <TableCell>{fmt(job.employment_level)}</TableCell>
                      <TableCell>{fmt(job.annual_openings)}</TableCell>
                      <TableCell>
                        {job.entry_education ? (
                          <Badge variant="outline" className="text-xs whitespace-nowrap">
                            <GraduationCap className="h-3 w-3 mr-1" />
                            {job.entry_education}
                          </Badge>
                        ) : "N/A"}
                      </TableCell>
                      <TableCell>
                        {job.growth_pct != null ? (
                          <span className={`font-medium ${job.growth_pct >= 10 ? "text-green-600" : job.growth_pct >= 0 ? "text-blue-600" : "text-red-600"}`}>
                            {job.growth_pct > 0 ? "+" : ""}{job.growth_pct}%
                          </span>
                        ) : "N/A"}
                      </TableCell>
                      <TableCell className="pr-6">
                        <a
                          href={`https://www.bls.gov/oes/current/oes${job.soc.replace("-", "")}.htm`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                        >
                          {job.soc} <ExternalLink className="h-3 w-3" />
                        </a>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {!isLoading && sorted.length === 0 && searchMajor && !isError && (
        <div className="text-center py-16 text-muted-foreground">
          <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No careers found for "{searchMajor}"</p>
          <p className="text-sm mt-1">Try a different major or check that the database is configured.</p>
        </div>
      )}
      </div>
    </div>
  );
}
