import { Link, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { format, parseISO } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { StatusBadge, CutTypeBadge } from "@/components/shared/Badges";
import { SectionAxis } from "@/components/ui/section-axis";
import { ArrowLeft, Building2, Users, GraduationCap, MapPin, ExternalLink } from "lucide-react";

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

/* ─── slug → state code ────────────────────────────────────────── */
const SLUG_TO_CODE: Record<string, string> = {
  "alabama": "AL", "alaska": "AK", "arizona": "AZ", "arkansas": "AR",
  "california": "CA", "colorado": "CO", "connecticut": "CT", "delaware": "DE",
  "florida": "FL", "georgia": "GA", "hawaii": "HI", "idaho": "ID",
  "illinois": "IL", "indiana": "IN", "iowa": "IA", "kansas": "KS",
  "kentucky": "KY", "louisiana": "LA", "maine": "ME", "maryland": "MD",
  "massachusetts": "MA", "michigan": "MI", "minnesota": "MN",
  "mississippi": "MS", "missouri": "MO", "montana": "MT", "nebraska": "NE",
  "nevada": "NV", "new-hampshire": "NH", "new-jersey": "NJ",
  "new-mexico": "NM", "new-york": "NY", "north-carolina": "NC",
  "north-dakota": "ND", "ohio": "OH", "oklahoma": "OK", "oregon": "OR",
  "pennsylvania": "PA", "rhode-island": "RI", "south-carolina": "SC",
  "south-dakota": "SD", "tennessee": "TN", "texas": "TX", "utah": "UT",
  "vermont": "VT", "virginia": "VA", "washington": "WA",
  "west-virginia": "WV", "wisconsin": "WI", "wyoming": "WY",
};

const CUT_TYPE_LABELS: Record<string, string> = {
  staff_layoff: "Staff Layoff",
  program_suspension: "Program Suspension",
  teach_out: "Teach-Out",
  department_closure: "Department Closure",
  campus_closure: "Campus Closure",
  institution_closure: "Institution Closure",
};

const REASON_STYLES: Record<string, string> = {
  "Budget Deficit":          "bg-red-50   text-red-700   border-red-200",
  "Enrollment Decline":      "bg-amber-50 text-amber-700 border-amber-200",
  "Strategic Restructuring": "bg-blue-50  text-blue-700  border-blue-200",
  "State Funding Cuts":      "bg-purple-50 text-purple-700 border-purple-200",
  "Compliance / Policy":     "bg-teal-50  text-teal-700  border-teal-200",
  "Merger / Consolidation":  "bg-slate-50 text-slate-700 border-slate-200",
  "Accreditation Issues":    "bg-lime-50  text-lime-700  border-lime-200",
};

function slugifyInstitution(name: string) {
  return name.toLowerCase().replace(/[''`]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

type StateCut = {
  id: string;
  institution: string;
  programName: string | null;
  state: string;
  control: string | null;
  cutType: string;
  announcementDate: string | null;
  status: string;
  notes: string | null;
  sourceUrl: string | null;
  studentsAffected: number | null;
  facultyAffected: number | null;
  primaryReason: string | null;
};

type StateData = {
  stateCode: string;
  stateName: string;
  total: number;
  institutions: number;
  studentsAffected: number;
  facultyAffected: number;
  topType: string | null;
  cutTypeCounts: Record<string, number>;
  cuts: StateCut[];
};

export default function StatePage() {
  const params = useParams<{ statename: string }>();
  const slug = params.statename ?? "";
  const stateCode = SLUG_TO_CODE[slug.toLowerCase()];

  const { data, isLoading, error } = useQuery<StateData>({
    queryKey: ["state", stateCode],
    queryFn: async () => {
      const r = await fetch(`${BASE_URL}/api/state/${stateCode}`);
      if (r.status === 404) throw new Error("not_found");
      if (!r.ok) throw new Error("fetch_error");
      return r.json();
    },
    enabled: !!stateCode,
    retry: false,
  });

  if (!stateCode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <MapPin className="h-12 w-12 mx-auto text-muted-foreground/40" />
          <p className="text-lg font-semibold text-foreground">State not found</p>
          <p className="text-muted-foreground text-sm">"{slug}" is not a recognized US state.</p>
          <Link href="/cuts" className="text-primary text-sm underline">Browse all cuts</Link>
        </div>
      </div>
    );
  }

  const stateName = data?.stateName ?? slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  const pageTitle = `${stateName} College Cuts | Higher Education Cuts Tracker | CollegeCuts`;
  const pageDesc = data
    ? `${data.total} documented higher education actions in ${stateName} — program suspensions, layoffs, and closures tracked by CollegeCuts.`
    : `Higher education cuts, program suspensions, and layoffs in ${stateName}, tracked by CollegeCuts.`;

  const sortedTypes = data
    ? Object.entries(data.cutTypeCounts).sort((a, b) => b[1] - a[1])
    : [];
  const maxTypeCount = sortedTypes[0]?.[1] ?? 1;

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <link rel="canonical" href={`https://college-cuts.com/state/${slug}`} />
      </Helmet>

      <div className="min-h-screen bg-[#f0f4f9]">
        {/* Navy hero */}
        <div style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2a4e7c 60%, #1a3352 100%)" }}>
          <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <Link href="/cuts" className="inline-flex items-center gap-1.5 text-blue-300 hover:text-white text-sm mb-6 transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" /> All Cuts
            </Link>

            <div className="space-y-1 mb-8">
              <span className="text-xs font-semibold uppercase tracking-widest text-amber-400 bg-amber-400/20 px-2 py-0.5 rounded">
                State Report
              </span>
              <h1 className="text-4xl font-extrabold tracking-tight text-white mt-2">
                {stateName}
              </h1>
              <p className="text-blue-200 text-lg">
                Higher education program cuts, layoffs, and closures documented by CollegeCuts.
              </p>
            </div>

            {/* KPI bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white/10 rounded-xl p-4 space-y-2">
                    <Skeleton className="h-4 w-24 bg-white/20" />
                    <Skeleton className="h-8 w-16 bg-white/20" />
                  </div>
                ))
              ) : (
                <>
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                    <p className="text-blue-200 text-xs font-medium uppercase tracking-wide">Total Actions</p>
                    <p className="text-3xl font-extrabold text-white mt-1">{data?.total ?? 0}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                    <p className="text-blue-200 text-xs font-medium uppercase tracking-wide">Institutions</p>
                    <p className="text-3xl font-extrabold text-white mt-1">{data?.institutions ?? 0}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                    <p className="text-blue-200 text-xs font-medium uppercase tracking-wide">Students Affected</p>
                    <p className="text-3xl font-extrabold text-white mt-1">
                      {(data?.studentsAffected ?? 0) > 0
                        ? `~${((data?.studentsAffected ?? 0) / 1000).toFixed(1)}k`
                        : "N/A"}
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                    <p className="text-blue-200 text-xs font-medium uppercase tracking-wide">Most Common Type</p>
                    <p className="text-base font-bold text-amber-300 mt-1 leading-tight">
                      {data?.topType ? (CUT_TYPE_LABELS[data.topType] ?? data.topType) : "N/A"}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">

          {/* Breakdown by type */}
          {!isLoading && sortedTypes.length > 0 && (
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-500 mb-4">Breakdown by Action Type</p>
                <div className="space-y-3">
                  {sortedTypes.map(([type, count]) => (
                    <div key={type} className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground w-44 shrink-0 truncate">
                        {CUT_TYPE_LABELS[type] ?? type}
                      </span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="h-2.5 rounded-full bg-[#1e3a5f]"
                          style={{ width: `${(count / maxTypeCount) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-foreground w-6 text-right">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cuts table */}
          <div>
            <SectionAxis label="§ 01 · DATABASE RECORDS" className="mb-3" />

            {error ? (
              <div className="text-center py-16 text-muted-foreground">
                <Building2 className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">No data available for {stateName}</p>
                <p className="text-sm mt-1">This state may not have any recorded cuts yet.</p>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border bg-[#f8f9fc] text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        <th className="px-3 py-3 text-left whitespace-nowrap">Date</th>
                        <th className="px-3 py-3 text-left">Institution</th>
                        <th className="px-3 py-3 text-left whitespace-nowrap">Type</th>
                        <th className="px-3 py-3 text-left">Program / Notes</th>
                        <th className="px-3 py-3 text-left whitespace-nowrap">Root Cause</th>
                        <th className="px-3 py-3 text-left">Status</th>
                        <th className="px-3 py-3 text-left">Source</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {isLoading
                        ? Array.from({ length: 8 }).map((_, i) => (
                            <tr key={i}>
                              {Array.from({ length: 7 }).map((_, j) => (
                                <td key={j} className="px-3 py-3">
                                  <Skeleton className="h-3 w-full" />
                                </td>
                              ))}
                            </tr>
                          ))
                        : (data?.cuts ?? []).map((cut) => (
                            <tr key={cut.id} className="hover:bg-muted/20 transition-colors">
                              <td className="px-3 py-3 whitespace-nowrap text-muted-foreground font-mono">
                                {cut.announcementDate
                                  ? format(parseISO(cut.announcementDate), "MMM yyyy")
                                  : "—"}
                              </td>
                              <td className="px-3 py-3 max-w-[220px]">
                                <Link
                                  href={`/institution/${slugifyInstitution(cut.institution)}`}
                                  className="font-medium text-[#1e3a5f] hover:underline"
                                >
                                  {cut.institution}
                                </Link>
                                {cut.control && (
                                  <span className="ml-1.5 text-[10px] text-muted-foreground">
                                    ({cut.control})
                                  </span>
                                )}
                              </td>
                              <td className="px-3 py-3 whitespace-nowrap">
                                <CutTypeBadge type={cut.cutType} />
                              </td>
                              <td className="px-3 py-3 max-w-[240px] text-muted-foreground truncate">
                                {cut.programName ?? cut.notes?.slice(0, 80) ?? "—"}
                              </td>
                              <td className="px-3 py-3 whitespace-nowrap">
                                {cut.primaryReason ? (
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${REASON_STYLES[cut.primaryReason] ?? "bg-gray-50 text-gray-700 border-gray-200"}`}>
                                    {cut.primaryReason}
                                  </span>
                                ) : <span className="text-muted-foreground">—</span>}
                              </td>
                              <td className="px-3 py-3">
                                <StatusBadge status={cut.status} />
                              </td>
                              <td className="px-3 py-3">
                                {cut.sourceUrl ? (
                                  <a
                                    href={cut.sourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-primary hover:underline"
                                  >
                                    Source <ExternalLink className="h-3 w-3" />
                                  </a>
                                ) : <span className="text-muted-foreground">—</span>}
                              </td>
                            </tr>
                          ))}
                    </tbody>
                  </table>
                </div>

                {!isLoading && (data?.cuts ?? []).length === 0 && (
                  <div className="py-16 text-center text-muted-foreground">
                    <GraduationCap className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p>No cuts recorded for {stateName} yet.</p>
                  </div>
                )}

                {!isLoading && (data?.cuts ?? []).length > 0 && (
                  <div className="px-4 py-3 border-t border-border bg-[#f8f9fc] flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Showing all {data?.total} records for {stateName}
                    </span>
                    <Link
                      href="/cuts"
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      View full database →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Related states CTA */}
          <Card className="shadow-sm bg-[#1e3a5f] border-0">
            <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="text-white space-y-1">
                <p className="font-semibold">Track higher education cuts nationwide</p>
                <p className="text-blue-200 text-sm">CollegeCuts covers all 50 states. Explore the full database or see analytics.</p>
              </div>
              <div className="flex gap-3 shrink-0">
                <Link
                  href="/analytics"
                  className="text-sm px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors"
                >
                  Analytics
                </Link>
                <Link
                  href="/cuts"
                  className="text-sm px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-lg font-semibold transition-colors"
                >
                  All Cuts
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
