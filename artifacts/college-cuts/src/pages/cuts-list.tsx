import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { StatusBadge, CutTypeBadge } from "@/components/shared/Badges";
import {
  Search, SlidersHorizontal, ChevronLeft, ChevronRight,
  ExternalLink, Download, Filter, X
} from "lucide-react";
import { STATES, CUT_TYPE_LABELS } from "@/lib/constants";

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

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
  if (!reason) return <span className="text-muted-foreground text-xs">—</span>;
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
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-0.5">{label}</span>
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
  /* ── local filter state (avoids URL-sync re-render killing dropdowns) ── */
  const [search,    setSearch]    = useState("");
  const [liveSearch, setLiveSearch] = useState("");
  const [state,     setState]     = useState("");
  const [cutType,   setCutType]   = useState("");
  const [status,    setStatus]    = useState("");
  const [control,   setControl]   = useState("");
  const [reason,    setReason]    = useState("");
  const [page,      setPage]      = useState(1);

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
  const changeReason  = useCallback((v: string) => { setReason(v);  setPage(1); }, []);

  const activeFilters = [state, cutType, status, control, reason, search].filter(Boolean).length;

  function clearAll() {
    setState(""); setCutType(""); setStatus(""); setControl(""); setReason("");
    setSearch(""); setLiveSearch(""); setPage(1);
  }

  const { data, isLoading } = useQuery<CutsResponse>({
    queryKey: ["cuts", { search, state, cutType, status, control, page }],
    queryFn: async () => {
      const q = new URLSearchParams();
      q.set("page", String(page));
      q.set("limit", "25");
      if (search)   q.set("search",  search);
      if (state)    q.set("state",   state);
      if (cutType)  q.set("cutType", cutType);
      if (status)   q.set("status",  status);
      if (control)  q.set("control", control);
      const r = await fetch(`${BASE_URL}/api/cuts?${q}`);
      if (!r.ok) throw new Error("Failed");
      return r.json();
    },
    placeholderData: (prev) => prev,
  });

  /* client-side reason filter (no API support yet) */
  const filtered = reason
    ? (data?.data ?? []).filter((c) => c.primaryReason === reason)
    : (data?.data ?? []);

  const shown = filtered.length;
  const total = reason ? shown : (data?.total ?? 0);

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <div className="bg-white border-b border-border">
        <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-[#1e3a5f]">All Actions Database</h1>
              <p className="mt-1 text-muted-foreground">
                Complete, searchable index of reported program cuts, closures, and layoffs.
              </p>
            </div>
            <Button variant="outline" size="sm" className="gap-2 shrink-0 mt-1">
              <Download className="h-3.5 w-3.5" />
              Export ({total})
            </Button>
          </div>

          {/* ── filter bar ── */}
          <div className="mt-5 bg-[#f8f9fc] border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#1e3a5f]">
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
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-0.5">Search</span>
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
            <div className="text-sm text-muted-foreground pt-1 border-t border-border/60">
              {isLoading ? (
                <Skeleton className="h-4 w-40" />
              ) : (
                <span>
                  Showing <span className="font-semibold text-[#1e3a5f]">{shown}</span> of{" "}
                  <span className="font-semibold text-[#1e3a5f]">{total}</span> total cuts
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── table ── */}
      <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-[#f8f9fc] text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="px-4 py-3 text-left whitespace-nowrap">Date</th>
                  <th className="px-4 py-3 text-left">Institution</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Control</th>
                  <th className="px-4 py-3 text-left">State</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Action Type</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Primary Reason</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right whitespace-nowrap">Students</th>
                  <th className="px-4 py-3 text-right whitespace-nowrap">Faculty/Staff</th>
                  <th className="px-4 py-3 text-center">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {isLoading ? (
                  Array(10).fill(0).map((_, i) => (
                    <tr key={i}>
                      {Array(10).fill(0).map((_, j) => (
                        <td key={j} className="px-4 py-3">
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
                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground text-xs">
                        {format(parseISO(cut.announcementDate), "MMM yyyy")}
                      </td>
                      <td className="px-4 py-3 font-medium max-w-[220px]">
                        <Link
                          href={`/cuts/${cut.id}`}
                          className="hover:text-[#1e3a5f] hover:underline underline-offset-2 line-clamp-2 block"
                        >
                          {cut.institution}
                        </Link>
                        {cut.programName && (
                          <span className="text-xs text-muted-foreground block truncate mt-0.5">
                            {cut.programName}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">
                        {cut.control ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center justify-center w-8 h-6 rounded text-xs font-bold bg-[#1e3a5f]/10 text-[#1e3a5f]">
                          {cut.state}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <CutTypeBadge cutType={cut.cutType} />
                      </td>
                      <td className="px-4 py-3">
                        <ReasonBadge reason={cut.primaryReason} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={cut.status} />
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {cut.studentsAffected != null ? (
                          <div>
                            <span className="font-medium">{cut.studentsAffected.toLocaleString()}</span>
                            <span className="text-xs text-muted-foreground block">Students</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {cut.facultyAffected != null ? (
                          <div>
                            <span className="font-medium">{cut.facultyAffected.toLocaleString()}</span>
                            <span className="text-xs text-muted-foreground block">Staff</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {cut.sourceUrl ? (
                          <a
                            href={cut.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center justify-center text-muted-foreground hover:text-[#1e3a5f] transition-colors"
                            title={cut.sourcePublication ?? "Source"}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground/40">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="py-20 text-center text-muted-foreground">
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

          {/* pagination */}
          {data && data.totalPages > 1 && !reason && (
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
  );
}
