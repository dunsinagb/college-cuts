import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { StatusBadge, CutTypeBadge } from "@/components/shared/Badges";
import {
  Search, SlidersHorizontal, ChevronLeft, ChevronRight,
  ExternalLink, Download, Filter, X, Bell, Check,
  AlertTriangle, GraduationCap, Users, MapPin
} from "lucide-react";
import { SectionAxis } from "@/components/ui/section-axis";
import { slugify } from "@/lib/slugify";
import { STATES, CUT_TYPE_LABELS, CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/constants";
import { DotMap } from "@/components/shared/DotMap";

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

/* ─── state code → URL slug ───────────────────────────────── */
const CODE_TO_SLUG: Record<string, string> = {
  AL:"alabama", AK:"alaska", AZ:"arizona", AR:"arkansas", CA:"california",
  CO:"colorado", CT:"connecticut", DE:"delaware", FL:"florida", GA:"georgia",
  HI:"hawaii", ID:"idaho", IL:"illinois", IN:"indiana", IA:"iowa", KS:"kansas",
  KY:"kentucky", LA:"louisiana", ME:"maine", MD:"maryland", MA:"massachusetts",
  MI:"michigan", MN:"minnesota", MS:"mississippi", MO:"missouri", MT:"montana",
  NE:"nebraska", NV:"nevada", NH:"new-hampshire", NJ:"new-jersey",
  NM:"new-mexico", NY:"new-york", NC:"north-carolina", ND:"north-dakota",
  OH:"ohio", OK:"oklahoma", OR:"oregon", PA:"pennsylvania", RI:"rhode-island",
  SC:"south-carolina", SD:"south-dakota", TN:"tennessee", TX:"texas", UT:"utah",
  VT:"vermont", VA:"virginia", WA:"washington", WV:"west-virginia",
  WI:"wisconsin", WY:"wyoming",
};

/* ─── reason badge colours ────────────────────────────────── */
const REASON_STYLES: Record<string, string> = {
  "Budget Deficit":           "bg-red-50   text-red-700   border-red-200",
  "Enrollment Decline":       "bg-amber-50 text-amber-700 border-amber-200",
  "Strategic Restructuring":  "bg-blue-50  text-blue-700  border-blue-200",
  "State Funding Cuts":       "bg-purple-50 text-purple-700 border-purple-200",
  "Compliance / Policy":      "bg-teal-50  text-teal-700  border-teal-200",
  "Merger / Consolidation":   "bg-slate-50 text-slate-700 border-slate-200",
  "Accreditation Issues":     "bg-lime-50  text-lime-700  border-lime-200",
};

function ReasonBadge({ reason }: { reason: string | null }) {
  if (!reason) return <span className="text-muted-foreground text-xs"></span>;
  const style = REASON_STYLES[reason] ?? "bg-gray-50 text-gray-700 border-gray-200";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${style}`}>
      {reason}
    </span>
  );
}

/* ─── native filter select ───────────────────────────────── */
function FilterSelect({
  label, value, onChange, className = "",
  children,
}: {
  label: string; value: string; onChange: (v: string) => void;
  className?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-100 px-0.5">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`h-9 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-sm
          focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1
          cursor-pointer appearance-none pr-8 ${className}`}
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}
      >
        {children}
      </select>
    </div>
  );
}

/* ─── API types ──────────────────────────────────────────── */
interface Cut {
  id: number;
  institution: string;
  programName: string | null;
  state: string;
  control: string | null;
  cutType: string;
  announcementDate: string;
  effectiveTerm: string | null;
  studentsAffected: number | null;
  facultyAffected: number | null;
  notes: string | null;
  primaryReason: string | null;
  sourceUrl: string | null;
  sourcePublication: string | null;
  status: string;
  category: string | null;
}

interface CutsResponse {
  data: Cut[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/* ═══════════════════════════════════════════════════════════ */
export default function CutsList() {
  /* ── read initial values from URL query params (set by dashboard quick filters) ── */
  const initialParams = new URLSearchParams(window.location.search);
  const [search,    setSearch]    = useState(initialParams.get("q") || "");
  const [liveSearch, setLiveSearch] = useState(initialParams.get("q") || "");
  const [state,     setState]     = useState(initialParams.get("state") || "");
  const [cutType,   setCutType]   = useState(initialParams.get("cutType") || "");
  const [status,    setStatus]    = useState(initialParams.get("status") || "");
  const [control,   setControl]   = useState(initialParams.get("control") || "");
  const [reason,    setReason]    = useState(initialParams.get("reason") || "");
  const [category,  setCategory]  = useState(initialParams.get("category") || "");
  const [page,      setPage]      = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  /* ── inline bell alert ── */
  const [activeAlert, setActiveAlert] = useState<number | null>(null);
  const [alertEmail, setAlertEmail]   = useState("");
  const [alertStatus, setAlertStatus] = useState<"idle"|"loading"|"success"|"error">("idle");

  function openAlert(id: number) {
    setActiveAlert(id);
    setAlertEmail("");
    setAlertStatus("idle");
  }

  async function handleAlertSubmit(cut: Cut, e: React.FormEvent) {
    e.preventDefault();
    if (!alertEmail) return;
    setAlertStatus("loading");
    try {
      const r = await fetch(`${BASE_URL}/api/alert-subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: alertEmail,
          institution_slug: slugify(cut.institution),
          institution_name: cut.institution,
          state: cut.state,
        }),
      });
      if (!r.ok) throw new Error("failed");
      setAlertStatus("success");
      setTimeout(() => setActiveAlert(null), 2000);
    } catch {
      setAlertStatus("error");
    }
  }

  /* Debounced search */
  useEffect(() => {
    const t = setTimeout(() => { setSearch(liveSearch); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [liveSearch]);

  /* Reset page on filter change */
  const changeState   = useCallback((v: string) => { setState(v);   setPage(1); }, []);
  const changeCutType = useCallback((v: string) => { setCutType(v); setPage(1); }, []);
  const changeStatus  = useCallback((v: string) => { setStatus(v);  setPage(1); }, []);
  const changeControl = useCallback((v: string) => { setControl(v); setPage(1); }, []);
  const changeReason   = useCallback((v: string) => { setReason(v);   setPage(1); }, []);
  const changeCategory = useCallback((v: string) => { setCategory(v); setPage(1); }, []);

  const activeFilters = [state, cutType, status, control, reason, category, search].filter(Boolean).length;

  function clearAll() {
    setState(""); setCutType(""); setStatus(""); setControl(""); setReason("");
    setCategory(""); setSearch(""); setLiveSearch(""); setPage(1);
  }

  async function handleExport() {
    setIsExporting(true);
    try {
      const q = new URLSearchParams();
      q.set("limit", "1000");
      if (search)  q.set("search",  search);
      if (state)   q.set("state",   state);
      if (cutType) q.set("cutType", cutType);
      if (status)  q.set("status",  status);
      if (control) q.set("control", control);
      const r = await fetch(`${BASE_URL}/api/cuts?${q}`);
      const json = await r.json();
      let rows = json.data ?? [];
      if (reason) rows = rows.filter((c: any) => c.primaryReason === reason);

      const esc = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
      const headers = ["Institution","State","Cut Type","Program/Department","Announcement Date","Effective Term","Students Affected","Faculty/Staff Affected","Primary Reason","Status","Source URL","Notes"];
      const csvRows = [
        headers.join(","),
        ...rows.map((c: any) => [
          esc(c.institution), c.state ?? "", c.cutType ?? "", esc(c.programName),
          c.announcementDate ?? "", c.effectiveTerm ?? "",
          c.studentsAffected ?? "", c.facultyAffected ?? "",
          esc(c.primaryReason), c.status ?? "", esc(c.sourceUrl), esc(c.notes),
        ].join(","))
      ];
      const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `college-cuts-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  }

  const { data: ytd } = useQuery<{
    totalActions: number; totalStudentsAffected: number;
    totalFacultyAffected: number; totalInstitutions: number; mostActiveState: string | null;
  }>({
    queryKey: ["stats/ytd", new Date().getFullYear()],
    queryFn: async () => {
      const year = new Date().getFullYear();
      const r = await fetch(`${BASE_URL}/api/stats/ytd?year=${year}`);
      if (!r.ok) throw new Error("Failed");
      return r.json();
    },
  });

  const { data: dotMapData } = useQuery<{ id: string; state: string; control: string; institution: string; date: string }[]>({
    queryKey: ["stats/dot-map"],
    queryFn: async () => {
      const r = await fetch(`${BASE_URL}/api/stats/dot-map`);
      if (!r.ok) throw new Error("Failed");
      return r.json();
    },
  });

  /* All category values are now handled server-side for accurate pagination.
     Reason filter remains client-side only.                                */
  const serverCategory = category || undefined;

  const { data, isLoading, isFetching } = useQuery<CutsResponse>({
    queryKey: ["cuts", { search, state, cutType, status, control, page, serverCategory }],
    queryFn: async () => {
      const q = new URLSearchParams();
      q.set("page", String(page));
      q.set("limit", "25");
      if (search)          q.set("search",   search);
      if (state)           q.set("state",    state);
      if (cutType)         q.set("cutType",  cutType);
      if (status)          q.set("status",   status);
      if (control)         q.set("control",  control);
      if (serverCategory)  q.set("category", serverCategory);
      const r = await fetch(`${BASE_URL}/api/cuts?${q}`);
      if (!r.ok) throw new Error("Failed");
      return r.json();
    },
  });

  /* client-side: exact Mixed/Athletics distinction + reason filter */
  const filtered = (data?.data ?? []).filter((c) => {
    if (reason   && c.primaryReason !== reason)   return false;
    if (category && c.category      !== category) return false;
    return true;
  });

  const shown = filtered.length;
  /* Athletics/Mixed share a server-side pre-filter, so the exact count comes
     from the client-side distinction. Academic and unfiltered use server total. */
  const total =
    reason || category === "Athletics" || category === "Mixed"
      ? shown
      : (data?.total ?? 0);

  return (
    <>
      <Helmet>
        <title>US College Program Cuts & Closures Database | CollegeCuts</title>
        <meta name="description" content="Search and filter the complete database of US college program cuts, department closures, campus closures, teach-outs, and faculty layoffs across all 50 states. Free civic data, updated monthly since 2024." />
        <link rel="canonical" href="https://college-cuts.com/cuts" />
      </Helmet>
    <div className="min-h-screen bg-[#f0f4f9]">
      <div style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2a4e7c 60%, #1a3352 100%)" }}>
        <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white">All Actions Database</h1>
              <p className="mt-1 text-blue-200">
                Complete, searchable index of reported higher education actions: program cuts, closures, and layoffs.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 shrink-0 mt-1 border-white/30 text-white hover:bg-white/10 bg-transparent"
              onClick={handleExport}
              disabled={isExporting}
            >
              <Download className={`h-3.5 w-3.5 ${isExporting ? "animate-bounce" : ""}`} />
              {isExporting ? "Downloading…" : `Export (${total})`}
            </Button>
          </div>

          {/* ── YTD KPI strip ── */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              {
                label: `Actions in ${new Date().getFullYear()}`,
                value: ytd?.totalActions?.toLocaleString() ?? "N/A",
                icon: <AlertTriangle className="h-4 w-4" />,
                color: "bg-red-500/20 text-red-300",
              },
              {
                label: `Students Affected (${new Date().getFullYear()})`,
                value: ytd?.totalStudentsAffected?.toLocaleString() ?? "N/A",
                icon: <GraduationCap className="h-4 w-4" />,
                color: "bg-amber-500/20 text-amber-300",
              },
              {
                label: `Faculty / Staff (${new Date().getFullYear()})`,
                value: ytd?.totalFacultyAffected?.toLocaleString() ?? "N/A",
                icon: <Users className="h-4 w-4" />,
                color: "bg-teal-500/20 text-teal-300",
              },
              {
                label: `Most Active State (${new Date().getFullYear()})`,
                value: ytd?.mostActiveState ?? "N/A",
                icon: <MapPin className="h-4 w-4" />,
                color: "bg-blue-500/20 text-blue-300",
              },
            ].map((kpi) => (
              <div key={kpi.label} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-4 py-3 flex items-center gap-3">
                <div className={`flex-shrink-0 rounded-lg p-2 ${kpi.color}`}>
                  {kpi.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-bold text-white leading-none truncate">{kpi.value}</p>
                  <p className="text-[11px] text-blue-200 mt-0.5 leading-tight">{kpi.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Dot map ── */}
          {dotMapData && dotMapData.length > 0 && (
            <div className="mt-5 bg-white/5 border border-white/15 rounded-xl overflow-hidden">
              <div className="px-4 pt-3 pb-1 flex items-center justify-between">
                <p className="text-sm font-semibold text-white">Actions Map: All Records</p>
                <p className="text-xs text-blue-300">{dotMapData.length} dots · hover for details</p>
              </div>
              <DotMap data={dotMapData} />
            </div>
          )}

          {/* ── filter bar ── */}
          <div className="mt-5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <SlidersHorizontal className="h-4 w-4" />
              Advanced Filters
              {activeFilters > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">{activeFilters}</Badge>
              )}
            </div>

            {/* row 1 */}
            <div className="flex flex-wrap gap-3 items-end">
              {/* Search */}
              <div className="flex flex-col gap-0.5 flex-1 min-w-[180px] max-w-[260px]">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-100 px-0.5">Search</span>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={liveSearch}
                    onChange={(e) => setLiveSearch(e.target.value)}
                    className="pl-8 h-9 text-sm"
                  />
                </div>
              </div>

              <FilterSelect label="State" value={state} onChange={changeState} className="min-w-[120px]">
                <option value="">All States</option>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </FilterSelect>

              <FilterSelect label="Institution Control" value={control} onChange={changeControl} className="min-w-[160px]">
                <option value="">All Control Types</option>
                <option value="Public">Public</option>
                <option value="Private non-profit">Private non-profit</option>
                <option value="Private for-profit">Private for-profit</option>
              </FilterSelect>

              <FilterSelect label="Action Type" value={cutType} onChange={changeCutType} className="min-w-[180px]">
                <option value="">All Types</option>
                {Object.entries(CUT_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </FilterSelect>

              <FilterSelect label="Primary Reason" value={reason} onChange={changeReason} className="min-w-[180px]">
                <option value="">All Categories</option>
                <option value="Budget Deficit">Budget Deficit</option>
                <option value="Enrollment Decline">Enrollment Decline</option>
                <option value="Strategic Restructuring">Strategic Restructuring</option>
                <option value="State Funding Cuts">State Funding Cuts</option>
                <option value="Compliance / Policy">Compliance / Policy</option>
                <option value="Merger / Consolidation">Merger / Consolidation</option>
                <option value="Accreditation Issues">Accreditation Issues</option>
              </FilterSelect>

              <FilterSelect label="Category" value={category} onChange={changeCategory} className="min-w-[150px]">
                <option value="">All Categories</option>
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </FilterSelect>

              <FilterSelect label="Status" value={status} onChange={changeStatus} className="min-w-[140px]">
                <option value="">All Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="ongoing">Ongoing</option>
                <option value="reversed">Reversed</option>
                <option value="rumor">Rumor</option>
              </FilterSelect>

              {activeFilters > 0 && (
                <div className="flex flex-col justify-end">
                  <Button variant="ghost" size="sm" onClick={clearAll} className="h-9 gap-1.5 text-muted-foreground hover:text-destructive">
                    <X className="h-3.5 w-3.5" /> Clear All
                  </Button>
                </div>
              )}
            </div>

            {/* result count */}
            <div className="text-sm text-blue-200 pt-1 border-t border-white/20">
              {isLoading || isFetching ? (
                <Skeleton className="h-4 w-40 bg-white/20" />
              ) : (
                <span>
                  Showing <span className="font-semibold text-white">{shown}</span> of{" "}
                  <span className="font-semibold text-white">{total}</span> total cuts
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── table ── */}
      <div className="w-full px-4 pt-5 pb-6 sm:px-6">
        <SectionAxis label="§ 01 · DATABASE RECORDS" dark className="mb-3" />
        <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-[#f8f9fc] text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="px-2 py-3 text-center w-8" title="Alert me when new data is added">
                    <Bell className="h-3.5 w-3.5 mx-auto text-muted-foreground" />
                  </th>
                  <th className="px-2 py-3 text-left whitespace-nowrap">Date</th>
                  <th className="px-2 py-3 text-left">Institution</th>
                  <th className="px-2 py-3 text-left whitespace-nowrap">Control</th>
                  <th className="px-2 py-3 text-left">St.</th>
                  <th className="px-2 py-3 text-left whitespace-nowrap">Type</th>
                  <th className="px-2 py-3 text-left whitespace-nowrap">Category</th>
                  <th className="px-2 py-3 text-left whitespace-nowrap">Reason</th>
                  <th className="px-2 py-3 text-left">Status</th>
                  <th className="px-2 py-3 text-right whitespace-nowrap">Students</th>
                  <th className="px-2 py-3 text-right whitespace-nowrap">Faculty / Staff</th>
                  <th className="px-2 py-3 text-left whitespace-nowrap">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {isLoading || isFetching ? (
                  Array(10).fill(0).map((_, i) => (
                    <tr key={i}>
                      {Array(12).fill(0).map((_, j) => (
                        <td key={j} className="px-2 py-3">
                          <Skeleton className="h-4 w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length > 0 ? (
                  filtered.map((cut) => (
                    <tr
                      key={cut.id}
                      className="hover:bg-[#f8f9fc] transition-colors group"
                    >
                      {/* Bell / alert cell */}
                      <td className="px-2 py-3 text-center whitespace-nowrap w-8">
                        {activeAlert === cut.id ? (
                          alertStatus === "success" ? (
                            <div className="flex items-center gap-1 text-green-600 text-xs font-semibold">
                              <Check className="h-3.5 w-3.5" /> Set!
                            </div>
                          ) : (
                            <form
                              onSubmit={(e) => handleAlertSubmit(cut, e)}
                              className="flex items-center gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="email"
                                required
                                autoFocus
                                placeholder="your@email.com"
                                value={alertEmail}
                                onChange={e => setAlertEmail(e.target.value)}
                                className="h-7 w-36 rounded border border-gray-300 px-2 text-xs focus:outline-none focus:border-amber-400"
                              />
                              <button
                                type="submit"
                                disabled={alertStatus === "loading"}
                                className="h-7 px-2 rounded bg-amber-500 hover:bg-amber-400 text-white text-xs font-bold transition-colors disabled:opacity-60"
                              >
                                {alertStatus === "loading" ? "…" : "OK"}
                              </button>
                              <button
                                type="button"
                                onClick={() => setActiveAlert(null)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                              {alertStatus === "error" && (
                                <span className="text-red-500 text-xs">!</span>
                              )}
                            </form>
                          )
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); openAlert(cut.id); }}
                            className="p-1.5 rounded-md text-gray-300 hover:text-amber-500 hover:bg-amber-50 transition-colors"
                            title={`Alert me when new data is added for ${cut.institution}`}
                          >
                            <Bell className="h-4 w-4" />
                          </button>
                        )}
                      </td>

                      <td className="px-2 py-3 whitespace-nowrap text-muted-foreground">
                        {cut.announcementDate ? format(parseISO(cut.announcementDate), "MMM yyyy") : ""}
                      </td>
                      <td className="px-2 py-3 font-medium max-w-[180px]">
                        <Link
                          href={`/cuts/${cut.id}`}
                          className="hover:text-[#1e3a5f] hover:underline underline-offset-2 line-clamp-2 block"
                        >
                          {cut.institution}
                        </Link>
                      </td>
                      <td className="px-2 py-3 whitespace-nowrap text-muted-foreground">
                        {cut.control ?? ""}
                      </td>
                      <td className="px-2 py-3">
                        {CODE_TO_SLUG[cut.state ?? ""] ? (
                          <Link
                            href={`/state/${CODE_TO_SLUG[cut.state!]}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center justify-center w-7 h-5 rounded text-[10px] font-bold bg-[#1e3a5f]/10 text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white transition-colors"
                            title={`View all cuts in ${cut.state}`}
                          >
                            {cut.state}
                          </Link>
                        ) : (
                          <span className="inline-flex items-center justify-center w-7 h-5 rounded text-[10px] font-bold bg-[#1e3a5f]/10 text-[#1e3a5f]">
                            {cut.state}
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-3">
                        <CutTypeBadge cutType={cut.cutType} />
                      </td>
                      <td className="px-2 py-3 whitespace-nowrap">
                        {cut.category ? (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[cut.category] ?? ""}`}>
                            {cut.category}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/40 text-xs"></span>
                        )}
                      </td>
                      <td className="px-2 py-3">
                        <ReasonBadge reason={cut.primaryReason} />
                      </td>
                      <td className="px-2 py-3">
                        <StatusBadge status={cut.status} />
                      </td>
                      <td className="px-2 py-3 text-right tabular-nums">
                        {cut.studentsAffected != null ? (
                          <span className="font-medium">{cut.studentsAffected.toLocaleString()}</span>
                        ) : (
                          <span className="text-muted-foreground"></span>
                        )}
                      </td>
                      <td className="px-2 py-3 text-right tabular-nums">
                        {cut.facultyAffected != null ? (
                          <div className="inline-flex flex-col items-end">
                            <span className="font-medium">{cut.facultyAffected.toLocaleString()}</span>
                            <span className="text-[10px] text-muted-foreground leading-none mt-0.5">
                              {cut.cutType === "staff_layoff" ? "staff" : "faculty"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground"></span>
                        )}
                      </td>
                      <td className="px-2 py-3 max-w-[120px]">
                        {cut.sourceUrl ? (
                          <a
                            href={cut.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-[#1e3a5f] hover:underline underline-offset-2 font-medium"
                          >
                            <span className="truncate block max-w-[100px]">
                              {cut.sourcePublication || "Source"}
                            </span>
                            <ExternalLink className="h-3 w-3 shrink-0 opacity-60" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground/40"></span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={12} className="py-20 text-center text-muted-foreground">
                      <Filter className="h-10 w-10 mx-auto mb-3 opacity-20" />
                      <p className="font-medium">No records found matching your filters.</p>
                      {activeFilters > 0 && (
                        <button onClick={clearAll} className="mt-2 text-sm text-[#1e3a5f] hover:underline">
                          Clear all filters
                        </button>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* hide pagination when total is derived client-side */}
          {data && data.totalPages > 1 && !reason && category !== "Athletics" && category !== "Mixed" && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-[#f8f9fc]">
              <div className="text-sm text-muted-foreground">
                Page <span className="font-medium">{page}</span> of <span className="font-medium">{data.totalPages}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                  className="h-8"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= data.totalPages}
                  className="h-8"
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
