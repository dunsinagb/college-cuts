import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Search, TrendingUp, DollarSign, Briefcase, Users, GraduationCap,
  Loader2, AlertCircle, ExternalLink, ChevronUp, ChevronDown, ChevronsUpDown,
  Share2, Check, AlertTriangle, Zap, Activity, BarChart3, Link2, FileText
} from "lucide-react";
import { SectionAxis } from "@/components/ui/section-axis";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

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
const SITE_ORIGIN = "https://college-cuts.com";

interface Job {
  soc: string;
  title: string;
  median_wage: number | null;
  growth_pct: number | null;
  employment_level: number | null;
  annual_openings: number | null;
  entry_education: string | null;
  unemployment_rate: number | null;
  at_risk_skills?: string[];
}

interface ScorecardRow {
  id: string;
  label: string;
  programsCut: number;
  growthPct: number;
  employmentBase: number;
  gapScore: number;
  gapRisk: "Low" | "Moderate" | "High" | "Critical";
  estimatedAnnualGradLoss: number;
  primarySoc: string;
  shareText: string;
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

const GAP_RISK_CONFIG: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  Critical: {
    label: "Critical",
    className: "bg-red-100 text-red-800 border-red-200",
    icon: <Zap className="h-3 w-3" />,
  },
  High: {
    label: "High",
    className: "bg-orange-100 text-orange-800 border-orange-200",
    icon: <AlertTriangle className="h-3 w-3" />,
  },
  Moderate: {
    label: "Moderate",
    className: "bg-amber-100 text-amber-800 border-amber-200",
    icon: <Activity className="h-3 w-3" />,
  },
  Low: {
    label: "Low",
    className: "bg-green-100 text-green-800 border-green-200",
    icon: <BarChart3 className="h-3 w-3" />,
  },
};

function GapRiskBadge({ risk }: { risk: string }) {
  const config = GAP_RISK_CONFIG[risk] ?? GAP_RISK_CONFIG.Low;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${config.className}`}>
      {config.icon}
      {config.label}
    </span>
  );
}

function ShareButton({ fieldId, label, shareText }: { fieldId: string; label: string; shareText: string }) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedStat, setCopiedStat] = useState(false);
  const [open, setOpen] = useState(false);

  const pageUrl = `${SITE_ORIGIN}/job-outlook?major=${encodeURIComponent(label)}`;
  const socialShareUrl = `${SITE_ORIGIN}/api/og/share?major=${encodeURIComponent(fieldId)}`;
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(socialShareUrl)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(socialShareUrl)}&text=${encodeURIComponent(shareText)}`;

  function handleCopyLink() {
    navigator.clipboard.writeText(pageUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => { setCopiedLink(false); setOpen(false); }, 1800);
    });
  }

  function handleCopyStat() {
    navigator.clipboard.writeText(shareText).then(() => {
      setCopiedStat(true);
      setTimeout(() => { setCopiedStat(false); setOpen(false); }, 1800);
    });
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          title="Share this skills gap card"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded hover:bg-muted"
        >
          <Share2 className="h-3.5 w-3.5" />
          Share
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2 pb-1.5">Share</p>
        <button
          onClick={handleCopyLink}
          className="flex w-full items-center gap-2.5 rounded px-2 py-1.5 text-sm hover:bg-muted transition-colors"
        >
          {copiedLink ? <Check className="h-4 w-4 text-green-600 shrink-0" /> : <Link2 className="h-4 w-4 shrink-0 text-muted-foreground" />}
          {copiedLink ? "Link copied!" : "Copy link"}
        </button>
        <a
          href={linkedInUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setOpen(false)}
          className="flex w-full items-center gap-2.5 rounded px-2 py-1.5 text-sm hover:bg-muted transition-colors"
        >
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="#0A66C2" xmlns="http://www.w3.org/2000/svg">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
          Share on LinkedIn
        </a>
        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setOpen(false)}
          className="flex w-full items-center gap-2.5 rounded px-2 py-1.5 text-sm hover:bg-muted transition-colors"
        >
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          Share on X / Twitter
        </a>
        <div className="border-t my-1" />
        <button
          onClick={handleCopyStat}
          className="flex w-full items-center gap-2.5 rounded px-2 py-1.5 text-sm hover:bg-muted transition-colors"
        >
          {copiedStat ? <Check className="h-4 w-4 text-green-600 shrink-0" /> : <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />}
          {copiedStat ? "Copied!" : "Copy stat as text"}
        </button>
      </PopoverContent>
    </Popover>
  );
}

/* Talent Impact panel — fetches from server-side /api/skills-gap/by-major/:major */
function TalentImpactPanel({ major }: { major: string }) {
  const { data } = useQuery<{ match: ScorecardRow | null }>({
    queryKey: ["skills-gap-by-major", major],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/api/skills-gap/by-major/${encodeURIComponent(major)}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: major.length >= 2,
    staleTime: 10 * 60 * 1000,
  });

  const match = data?.match;
  if (!match || match.programsCut === 0) return null;

  const growthSign = match.growthPct >= 0 ? "+" : "";

  return (
    <Card className="border-l-4 border-l-amber-500 shadow-sm bg-amber-50/50">
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-amber-900 mb-1">Talent Pipeline Impact</p>
            <p className="text-sm text-amber-800 leading-relaxed">
              <strong>{match.programsCut} {match.label.toLowerCase()} programs</strong> have been cut or suspended
              since 2024, against a <strong>{growthSign}{match.growthPct}% projected job demand growth</strong> per BLS data.
            </p>
            {(match.gapRisk === "Critical" || match.gapRisk === "High") && (
              <p className="text-xs text-amber-700 mt-2">
                Gap Risk rated <strong>{match.gapRisk}</strong> based on program cuts versus BLS job demand projections.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function JobOutlookPage() {
  /* Read ?major= URL param on first mount so shared URLs pre-populate the search */
  const urlMajor = (() => {
    try {
      return new URLSearchParams(window.location.search).get("major") ?? "";
    } catch {
      return "";
    }
  })();

  const defaultMajor = urlMajor.trim().length >= 2 ? urlMajor.trim() : "Computer Science";

  const [majorInput, setMajorInput] = useState(defaultMajor);
  const [searchMajor, setSearchMajor] = useState(defaultMajor);
  const [educationFilter, setEducationFilter] = useState("all");
  const [salaryFilter, setSalaryFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);

  /* Sync URL param if it changes externally (e.g. browser back/forward) */
  useEffect(() => {
    if (urlMajor.trim().length >= 2 && urlMajor.trim() !== searchMajor) {
      setMajorInput(urlMajor.trim());
      setSearchMajor(urlMajor.trim());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlMajor]);

  const { data, isLoading, isError } = useQuery<{ jobs: Job[]; onet_status?: string }>({
    queryKey: ["job-outlook", searchMajor],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/api/job-outlook?major=${encodeURIComponent(searchMajor)}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: searchMajor.length >= 2,
  });

  const { data: scorecardData, isLoading: scorecardLoading } = useQuery<{ scorecard: ScorecardRow[]; cachedAt: number | null }>({
    queryKey: ["skills-gap-scorecard"],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/api/skills-gap`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    staleTime: 10 * 60 * 1000,
  });

  /* Look up the fieldId for the current major so we can build the OG image URL */
  const { data: byMajorData } = useQuery<{ match: ScorecardRow | null }>({
    queryKey: ["skills-gap-by-major-og", searchMajor],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/api/skills-gap/by-major/${encodeURIComponent(searchMajor)}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: searchMajor.length >= 2,
    staleTime: 10 * 60 * 1000,
  });

  const ogFieldId = byMajorData?.match?.id ?? null;
  const ogImageUrl = ogFieldId
    ? `${SITE_ORIGIN}/api/og/skills-gap/${ogFieldId}`
    : `${SITE_ORIGIN}/api/og/skills-gap/nursing`;
  const ogTitle = byMajorData?.match
    ? `${byMajorData.match.label} Skills Gap | CollegeCuts`
    : "College Program Cuts vs. Job Demand: Where the Talent Gap Is Widest";
  const ogDescription = byMajorData?.match
    ? `${byMajorData.match.programsCut} programs cut. Job demand growth: +${byMajorData.match.growthPct}%. See the full talent pipeline breakdown.`
    : "Which college majors are being eliminated while employers are desperate to hire? Explore the widening gap between disappearing programs and growing careers — powered by BLS data.";

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
  const onetStatus = data?.onet_status ?? null;
  const scorecard = scorecardData?.scorecard ?? [];

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
    <>
      <Helmet>
        <title>{ogTitle} | CollegeCuts</title>
        <meta name="description" content={ogDescription} />
        <link rel="canonical" href={`${SITE_ORIGIN}/job-outlook${searchMajor !== "Computer Science" ? `?major=${encodeURIComponent(searchMajor)}` : ""}`} />
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="CollegeCuts" />
        <meta property="og:title" content={ogTitle} />
        <meta property="og:description" content={ogDescription} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="628" />
        <meta property="og:url" content={`${SITE_ORIGIN}/job-outlook${searchMajor !== "Computer Science" ? `?major=${encodeURIComponent(searchMajor)}` : ""}`} />
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={ogTitle} />
        <meta name="twitter:description" content={ogDescription} />
        <meta name="twitter:image" content={ogImageUrl} />
      </Helmet>
    <div className="min-h-screen bg-[#f0f4f9]">
      {/* Navy header */}
      <div style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2a4e7c 60%, #1a3352 100%)" }}>
        <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="space-y-2 mb-8">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-widest text-amber-400 bg-amber-400/20 px-2 py-0.5 rounded">Skills Gap Intelligence</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white">Job Outlook</h1>
            <p className="text-lg text-blue-200 max-w-2xl">
              CollegeCuts tracks which programs are being eliminated. BLS tracks where job demand is growing.
              We cross these datasets to show where the talent pipeline is about to break.
            </p>
          </div>

        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">

        {/* ── Skills Gap Scorecard ── */}
        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Skills Gap Scorecard
                </CardTitle>
                <CardDescription className="mt-1">
                  Fields ranked by shortage severity (programs cut × BLS demand growth × employment base). Click "Share" to copy a link, post to LinkedIn or X, or copy a pre-formatted stat.
                </CardDescription>
              </div>
              {scorecardData?.cachedAt != null && (
                <span className="text-xs text-muted-foreground shrink-0 self-start mt-1">
                  Last updated {new Date(scorecardData.cachedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {scorecardLoading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : scorecard.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground text-sm">
                Scorecard data unavailable. Configure Supabase to enable this feature.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="pl-6 w-8 text-center">#</TableHead>
                      <TableHead>Field</TableHead>
                      <TableHead className="text-center">Programs Cut</TableHead>
                      <TableHead className="text-center">Job Growth</TableHead>
                      <TableHead className="text-center">Gap Risk</TableHead>
                      <TableHead className="text-center">Est. Grad Loss/yr</TableHead>
                      <TableHead className="pr-6 text-center">Share</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scorecard.map((row, idx) => (
                      <TableRow
                        key={row.id}
                        className={`hover:bg-muted/20 ${row.gapRisk === "Critical" ? "bg-red-50/40" : row.gapRisk === "High" ? "bg-orange-50/30" : ""}`}
                      >
                        <TableCell className="pl-6 text-center text-sm text-muted-foreground font-mono">{idx + 1}</TableCell>
                        <TableCell className="font-medium">
                          <button
                            onClick={() => { setMajorInput(row.label); setSearchMajor(row.label); }}
                            className="hover:text-primary hover:underline transition-colors text-left"
                          >
                            {row.label}
                          </button>
                        </TableCell>
                        <TableCell className="text-center">
                          {row.programsCut > 0 ? (
                            <span className="font-bold text-red-700">{row.programsCut}</span>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`font-medium ${row.growthPct >= 15 ? "text-green-700" : row.growthPct >= 5 ? "text-blue-700" : "text-muted-foreground"}`}>
                            +{row.growthPct}%
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <GapRiskBadge risk={row.gapRisk} />
                        </TableCell>
                        <TableCell className="text-center text-sm text-muted-foreground">
                          {row.estimatedAnnualGradLoss > 0 ? `~${row.estimatedAnnualGradLoss.toLocaleString()}` : ""}
                        </TableCell>
                        <TableCell className="pr-6 text-center">
                          <ShareButton fieldId={row.id} label={row.label} shareText={row.shareText} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

      {isError && (
        <div className="flex items-center gap-2 text-destructive bg-red-50 rounded-lg px-4 py-3">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">Failed to load job data. The service may not be configured yet.</span>
        </div>
      )}

      {sorted.length > 0 && (
        <>
          <SectionAxis label="§ 01 · CAREER OVERVIEW" />
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

          <SectionAxis label="§ 02 · TALENT IMPACT" />
          {/* Talent Impact Panel — server-resolved via /api/skills-gap/by-major */}
          <TalentImpactPanel major={searchMajor} />
        </>
      )}

      <SectionAxis label="§ 03 · CAREER PATHWAYS" />

      {/* Search form — light themed, always visible */}
      <Card className="shadow-sm border">
        <CardContent className="p-5">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by major (e.g. Computer Science, Nursing, Art)"
                value={majorInput}
                onChange={(e) => setMajorInput(e.target.value)}
                className="pl-9 h-11"
              />
            </div>
            <Button type="submit" className="h-11 px-7 bg-amber-500 hover:bg-amber-400 text-white border-0 font-semibold" disabled={isLoading}>
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
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {sorted.length > 0 && (
        <>
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
                    <TableHead>At-Risk Skills</TableHead>
                    <TableHead className="pr-6">Career Profile</TableHead>
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
                      <TableCell className="max-w-[220px]">
                        {job.at_risk_skills && job.at_risk_skills.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {job.at_risk_skills.map((skill) => (
                              <span
                                key={skill}
                                title="At-risk skill if this program disappears"
                                className="inline-block text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded px-1.5 py-0.5 whitespace-nowrap"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        ) : onetStatus === "pending_approval" ? (
                          <span
                            title="O*NET account is pending approval. Skills will appear once the account is activated."
                            className="inline-block text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded px-1.5 py-0.5 whitespace-nowrap cursor-help"
                          >
                            Skills loading soon
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground"></span>
                        )}
                      </TableCell>
                      <TableCell className="pr-6">
                        {job.soc && job.soc !== "99-9999" ? (
                          <a
                            href={`https://www.onetonline.org/link/summary/${job.soc}.00`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline whitespace-nowrap"
                          >
                            O*NET <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground"></span>
                        )}
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
    </>
  );
}
