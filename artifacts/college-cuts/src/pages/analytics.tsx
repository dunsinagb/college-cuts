import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Sector,
} from "recharts";
import { RefreshCw, TrendingUp, GraduationCap, Users, MapPin, AlertTriangle, BookOpen } from "lucide-react";
import { format } from "date-fns";

/* ─── colours ─────────────────────────────────────────────────── */
// Brand primaries
const NAVY       = "#1e3a5f";
const SLATE      = "#64748b";

// Semantic severity scale (institution → staff, darkest → lightest)
const C_CRIMSON  = "#9b1c2e";   // institution_closure — most severe
const C_SIENNA   = "#b94a1e";   // campus_closure
const C_OCHRE    = "#c27c10";   // department_closure
const C_COBALT   = "#1d4ed8";   // program_suspension
const C_TEAL     = "#0f766e";   // teach_out
const C_VIOLET   = "#6d28d9";   // staff_layoff

// Retained for misc use
const AMBER      = "#d97706";

const YEAR_COLORS: Record<string, string> = {
  "2023": "#94a3b8",   // muted slate — kept for legacy data
  "2024": "#2563eb",   // sapphire blue
  "2025": "#d97706",   // amber (brand accent)
  "2026": "#7c3aed",   // violet
};

const STATE_NAMES: Record<string, string> = {
  AL:"Alabama",AK:"Alaska",AZ:"Arizona",AR:"Arkansas",CA:"California",
  CO:"Colorado",CT:"Connecticut",DE:"Delaware",FL:"Florida",GA:"Georgia",
  HI:"Hawaii",ID:"Idaho",IL:"Illinois",IN:"Indiana",IA:"Iowa",
  KS:"Kansas",KY:"Kentucky",LA:"Louisiana",ME:"Maine",MD:"Maryland",
  MA:"Massachusetts",MI:"Michigan",MN:"Minnesota",MS:"Mississippi",MO:"Missouri",
  MT:"Montana",NE:"Nebraska",NV:"Nevada",NH:"New Hampshire",NJ:"New Jersey",
  NM:"New Mexico",NY:"New York",NC:"North Carolina",ND:"North Dakota",OH:"Ohio",
  OK:"Oklahoma",OR:"Oregon",PA:"Pennsylvania",RI:"Rhode Island",SC:"South Carolina",
  SD:"South Dakota",TN:"Tennessee",TX:"Texas",UT:"Utah",VT:"Vermont",
  VA:"Virginia",WA:"Washington",WV:"West Virginia",WI:"Wisconsin",WY:"Wyoming",
  DC:"Washington D.C.",
};

const TYPE_COLORS: Record<string, string> = {
  institution_closure: C_CRIMSON,
  campus_closure:      C_SIENNA,
  department_closure:  C_OCHRE,
  program_suspension:  C_COBALT,
  teach_out:           C_TEAL,
  staff_layoff:        C_VIOLET,
};

// Control: navy → crimson → amber → violet → slate
const CONTROL_COLORS = [NAVY, C_CRIMSON, AMBER, C_VIOLET, SLATE];

const REASON_COLORS: Record<string, string> = {
  "Budget / Financial Deficit": C_CRIMSON,
  "Enrollment Decline":         C_SIENNA,
  "State Funding Cuts":         C_COBALT,
  "Strategic Restructuring":    C_TEAL,
  "Compliance / Policy":        C_VIOLET,
  "Merger / Consolidation":     SLATE,
  "Accreditation Issues":       C_OCHRE,
};

/* ─── helpers ─────────────────────────────────────────────────── */
const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

function fmt(label: string) {
  return label.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function numFmt(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return String(n);
}

const tooltipStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #dde3ed",
  borderRadius: "8px",
  boxShadow: "0 6px 32px -6px rgba(30,58,95,0.16), 0 2px 8px -2px rgba(0,0,0,0.06)",
  fontSize: 12,
  fontFamily: "inherit",
};

const tooltipLabelStyle = {
  color: NAVY,
  fontWeight: 600,
  marginBottom: 2,
};

/* ─── hooks ───────────────────────────────────────────────────── */
type YearlyMonthResp  = { years: string[]; data: Record<string, string | number>[] };
type YearlyStateResp  = { years: string[]; data: Record<string, string | number>[] };
type ByTypeRow        = { cutType: string; count: number };
type ByStateRow       = { state: string; count: number; studentsAffected: number };
type ByControlRow     = { control: string; count: number; studentsAffected: number; facultyAffected: number };
type ByReasonRow      = { reason: string; count: number };
type SummaryRow       = { totalCuts: number; totalStudentsAffected: number; totalFacultyAffected: number; totalStatesAffected: number; confirmedCuts: number; ongoingCuts: number };

function useAPI<T>(path: string, refreshKey: number) {
  return useQuery<T>({
    queryKey: [path, refreshKey],
    queryFn: async () => {
      const r = await fetch(`${BASE_URL}/api/${path}`);
      if (!r.ok) throw new Error("Failed");
      return r.json();
    },
  });
}

/* ─── custom active pie slice ──────────────────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ActiveShape(props: any) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value, percent } = props;
  return (
    <g>
      <text x={cx} y={cy - 10} dy={0} textAnchor="middle" fill={NAVY} fontSize={20} fontWeight="700">
        {value}
      </text>
      <text x={cx} y={cy + 16} textAnchor="middle" fill={SLATE} fontSize={12}>
        {fmt(payload.control)}
      </text>
      <text x={cx} y={cy + 34} textAnchor="middle" fill={SLATE} fontSize={11}>
        {(percent * 100).toFixed(0)}% of total
      </text>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 6} startAngle={startAngle} endAngle={endAngle} fill={fill} />
      <Sector cx={cx} cy={cy} innerRadius={outerRadius + 10} outerRadius={outerRadius + 14} startAngle={startAngle} endAngle={endAngle} fill={fill} />
    </g>
  );
}

/* ─── loading skeleton ─────────────────────────────────────────── */
function ChartSkeleton({ height = 320 }: { height?: number }) {
  return <Skeleton className="w-full rounded-xl" style={{ height }} />;
}

/* ─── section label ────────────────────────────────────────────── */
function SectionBadge({ label }: { label: string }) {
  return (
    <Badge variant="outline" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground border-border">
      {label}
    </Badge>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
export default function Analytics() {
  const [refreshKey, setRefreshKey]     = useState(0);
  const [lastUpdated, setLastUpdated]   = useState<Date>(new Date());
  const [activePieIdx, setActivePieIdx] = useState(0);
  const [chartMode, setChartMode]       = useState<"bar" | "line">("bar");

  function handleRefresh() {
    setRefreshKey((k) => k + 1);
    setLastUpdated(new Date());
  }

  const { data: summary,     isLoading: loadSummary  } = useAPI<SummaryRow>    ("stats/summary",        refreshKey);
  const { data: monthly,     isLoading: loadMonthly  } = useAPI<YearlyMonthResp>("stats/yearly-by-month", refreshKey);
  const { data: byState,     isLoading: loadState    } = useAPI<YearlyStateResp>("stats/yearly-by-state", refreshKey);
  const { data: allStates,   isLoading: loadAllState } = useAPI<ByStateRow[]>  ("stats/by-state",        refreshKey);
  const { data: byType,      isLoading: loadType     } = useAPI<ByTypeRow[]>   ("stats/by-type",         refreshKey);
  const { data: byControl,   isLoading: loadControl  } = useAPI<ByControlRow[]>("stats/by-control",      refreshKey);
  const { data: byReason,    isLoading: loadReason   } = useAPI<ByReasonRow[]> ("stats/by-reason",       refreshKey);

  const years      = (monthly?.years ?? []).filter(y => parseInt(y) >= 2024);
  const stateYears = (byState?.years ?? []).filter(y => parseInt(y) >= 2024);

  /* ── KPI cards ── */
  const kpis = [
    { label: "Total Actions",     value: summary?.totalCuts,             icon: <AlertTriangle className="h-5 w-5" />, color: "text-[#9b1c2e]"  },
    { label: "Students Affected", value: summary?.totalStudentsAffected, icon: <GraduationCap className="h-5 w-5" />, color: "text-[#d97706]"  },
    { label: "Faculty Affected",  value: summary?.totalFacultyAffected,  icon: <Users         className="h-5 w-5" />, color: "text-[#1d4ed8]"  },
    { label: "States Affected",   value: summary?.totalStatesAffected,   icon: <MapPin        className="h-5 w-5" />, color: "text-[#0f766e]"  },
    { label: "Confirmed Cases",   value: summary?.confirmedCuts,         icon: <BookOpen      className="h-5 w-5" />, color: "text-[#1e3a5f]"  },
    { label: "Ongoing",           value: summary?.ongoingCuts,           icon: <TrendingUp    className="h-5 w-5" />, color: "text-[#6d28d9]"  },
  ];

  return (
    <>
      <Helmet>
        <title>Analytics Dashboard | CollegeCuts — Higher Education Trends</title>
        <meta name="description" content="Explore trends in US higher education cuts: monthly timelines, breakdowns by state, institution type, and cut category. Data-driven analysis of college closures and layoffs." />
        <link rel="canonical" href="https://college-cuts.com/analytics" />
      </Helmet>
    <div className="min-h-screen bg-[#f0f4f9]">
      {/* ── hero header ── */}
      <div style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2a4e7c 60%, #1a3352 100%)" }}>
        <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <SectionBadge label="Live Data Dashboard" />
              <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-white">
                Analytics Overview
              </h1>
              <p className="mt-2 text-blue-200 max-w-xl">
                Comprehensive intelligence on higher education cuts, closures, and workforce impacts across US institutions — updated in real time.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs text-blue-300">
                Updated {format(lastUpdated, "h:mm:ss aa")}
              </span>
              <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2 border-white/30 text-white hover:bg-white/10 bg-transparent">
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh
              </Button>
            </div>
          </div>

          {/* ── KPI strip ── */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {kpis.map((k) => (
              <div key={k.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className={`${k.color} mb-2`}>{k.icon}</div>
                {loadSummary ? (
                  <Skeleton className="h-7 w-16 mb-1 bg-white/20" />
                ) : (
                  <div className="text-2xl font-bold text-white">
                    {k.value !== undefined ? Number(k.value).toLocaleString() : "—"}
                  </div>
                )}
                <div className="text-xs text-blue-200 font-medium mt-0.5">{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">

        {/* ══ CHART 1 — Actions Over Time ══ */}
        <Card className="shadow-sm border-border/60">
          <CardHeader className="pb-2">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <SectionBadge label="Trend" />
                <CardTitle className="mt-2 text-xl font-bold text-[#1e3a5f]">
                  Actions Over Time — {years.join(" vs ")}
                </CardTitle>
                <CardDescription>Monthly volume of institutional actions, year-over-year comparison</CardDescription>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                {/* Year legend */}
                <div className="flex gap-3">
                  {years.map((yr) => (
                    <span key={yr} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: YEAR_COLORS[yr] ?? SLATE }} />
                      {yr}
                    </span>
                  ))}
                </div>
                {/* Bar / Line toggle */}
                <div className="flex rounded-md border border-border overflow-hidden text-xs font-medium">
                  <button
                    onClick={() => setChartMode("bar")}
                    className={`px-3 py-1.5 transition-colors ${chartMode === "bar" ? "bg-[#1e3a5f] text-white" : "bg-white text-muted-foreground hover:bg-muted/50"}`}
                  >
                    Bars
                  </button>
                  <button
                    onClick={() => setChartMode("line")}
                    className={`px-3 py-1.5 transition-colors border-l border-border ${chartMode === "line" ? "bg-[#1e3a5f] text-white" : "bg-white text-muted-foreground hover:bg-muted/50"}`}
                  >
                    Lines
                  </button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {loadMonthly ? <ChartSkeleton height={340} /> : monthly && monthly.data.length > 0 ? (() => {
              const currentYr = years[years.length - 1];
              // Null-out months with no data so gaps are honest
              const cleanData = monthly.data.map((row) => {
                const out: Record<string, string | number | null> = { month: row.month };
                for (const yr of years) {
                  const v = row[yr];
                  out[yr] = (v == null || v === 0) ? null : v;
                }
                return out;
              });

              if (chartMode === "bar") {
                return (
                  <ResponsiveContainer width="100%" height={340}>
                    <BarChart data={cleanData} margin={{ top: 10, right: 24, left: -8, bottom: 0 }} barCategoryGap="28%" barGap={3}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9ecef" />
                      <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickMargin={8} />
                      <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} />
                      <RechartsTooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} cursor={{ fill: "rgba(30,58,95,0.04)" }} />
                      {years.map((yr) => {
                        const isCurrent = yr === currentYr;
                        return (
                          <Bar
                            key={yr}
                            dataKey={yr}
                            name={yr}
                            fill={YEAR_COLORS[yr] ?? SLATE}
                            fillOpacity={isCurrent ? 1 : 0.45}
                            radius={[3, 3, 0, 0]}
                            maxBarSize={28}
                          />
                        );
                      })}
                    </BarChart>
                  </ResponsiveContainer>
                );
              }

              // Line view — uses LineChart so null gaps render cleanly
              return (
                <ResponsiveContainer width="100%" height={340}>
                  <LineChart data={cleanData} margin={{ top: 10, right: 24, left: -8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9ecef" />
                    <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} />
                    <RechartsTooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} />
                    {[...years].sort((a, b) => (a === currentYr ? 1 : b === currentYr ? -1 : 0)).map((yr) => {
                      const isCurrent = yr === currentYr;
                      const color = YEAR_COLORS[yr] ?? SLATE;
                      return (
                        <Line
                          key={yr}
                          type="monotone"
                          dataKey={yr}
                          name={yr}
                          connectNulls={false}
                          stroke={color}
                          strokeWidth={isCurrent ? 2.5 : 1.5}
                          strokeOpacity={isCurrent ? 1 : 0.4}
                          strokeDasharray={isCurrent ? undefined : "5 3"}
                          dot={isCurrent ? { r: 3.5, fill: color, stroke: color, strokeWidth: 0 } : false}
                          activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff", fill: color }}
                        />
                      );
                    })}
                  </LineChart>
                </ResponsiveContainer>
              );
            })() : (
              <div className="h-[340px] flex items-center justify-center text-muted-foreground">No data</div>
            )}
          </CardContent>
        </Card>

        {/* ══ CHART 2 — Top 10 States (YoY) ══ */}
        <Card className="shadow-sm border-border/60">
          <CardHeader className="pb-2">
            <SectionBadge label="Geographic" />
            <CardTitle className="mt-2 text-xl font-bold text-[#1e3a5f]">
              Top 10 States by Program Actions
            </CardTitle>
            <CardDescription>Year-over-year breakdown of institutional actions — states ranked by total volume</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            {loadState ? <ChartSkeleton height={380} /> : byState && byState.data.length > 0 ? (() => {
              const rows = [...byState.data].map(row => ({
                ...row,
                total: stateYears.reduce((s, yr) => s + (Number(row[yr]) || 0), 0),
              })).sort((a, b) => b.total - a.total);
              const maxTotal = rows[0]?.total ?? 1;

              return (
                <div>
                  {/* Legend */}
                  <div className="flex flex-wrap gap-4 mb-4 px-1">
                    {stateYears.map(yr => (
                      <div key={yr} className="flex items-center gap-1.5">
                        <span className="inline-block w-3 h-3 rounded-sm" style={{ background: YEAR_COLORS[yr] ?? SLATE }} />
                        <span className="text-xs font-medium text-muted-foreground">{yr}</span>
                      </div>
                    ))}
                  </div>
                  {/* Column headers */}
                  <div className="flex items-center gap-2 mb-2 px-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    <span className="w-4" />
                    <span className="w-14 sm:w-36">State</span>
                    <span className="flex-1 hidden sm:block">Year breakdown</span>
                    <span className="w-10 sm:w-14 text-right">Total</span>
                  </div>
                  <div className="space-y-2.5">
                    {rows.map((row, i) => (
                      <div key={row.state} className="flex items-center gap-2 px-1 py-1.5 rounded-lg hover:bg-muted/40 transition-colors">
                        {/* Rank */}
                        <span className="w-4 text-right text-xs text-muted-foreground font-mono">{i + 1}</span>
                        {/* State */}
                        <div className="w-14 sm:w-36 flex items-center gap-1.5 min-w-0 shrink-0">
                          <span className="text-xs font-bold text-[#1e3a5f] bg-[#1e3a5f]/10 rounded px-1.5 py-0.5 shrink-0">{row.state}</span>
                          <span className="text-xs text-muted-foreground truncate hidden sm:block">{STATE_NAMES[String(row.state)] ?? ""}</span>
                        </div>
                        {/* Stacked segment bar */}
                        <div className="flex-1 flex flex-col gap-1 min-w-0">
                          <div className="h-5 bg-gray-100 rounded-full overflow-hidden flex">
                            {stateYears.map(yr => {
                              const count = Number(row[yr]) || 0;
                              const pct = (count / maxTotal) * 100;
                              if (pct === 0) return null;
                              return (
                                <div
                                  key={yr}
                                  title={`${yr}: ${count}`}
                                  className="h-full first:rounded-l-full last:rounded-r-full transition-all"
                                  style={{ width: `${pct}%`, background: YEAR_COLORS[yr] ?? SLATE, opacity: 0.85 }}
                                />
                              );
                            })}
                          </div>
                          {/* Per-year chips */}
                          <div className="flex gap-1.5 flex-wrap">
                            {stateYears.map(yr => {
                              const count = Number(row[yr]) || 0;
                              if (count === 0) return null;
                              return (
                                <span
                                  key={yr}
                                  className="text-xs px-1.5 py-0.5 rounded font-medium"
                                  style={{ background: (YEAR_COLORS[yr] ?? SLATE) + "22", color: YEAR_COLORS[yr] ?? SLATE }}
                                >
                                  {yr}: {count}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                        {/* Total */}
                        <span className="w-10 sm:w-14 text-right text-sm font-bold text-[#1e3a5f] tabular-nums">{row.total}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })() : (
              <div className="h-[380px] flex items-center justify-center text-muted-foreground">No data</div>
            )}
          </CardContent>
        </Card>

        {/* ══ ROW: Control Type + Action Type ══ */}
        <div className="grid lg:grid-cols-2 gap-8">

          {/* CHART 3 — Actions by Control Type (Donut) */}
          <Card className="shadow-sm border-border/60">
            <CardHeader className="pb-2">
              <SectionBadge label="Institutional" />
              <CardTitle className="mt-2 text-xl font-bold text-[#1e3a5f]">Actions by Control Type</CardTitle>
              <CardDescription>Public vs. private institution distribution</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              {loadControl ? <ChartSkeleton height={300} /> : byControl && byControl.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        activeIndex={activePieIdx}
                        activeShape={ActiveShape}
                        data={byControl}
                        cx="50%"
                        cy="50%"
                        innerRadius={72}
                        outerRadius={108}
                        dataKey="count"
                        nameKey="control"
                        onMouseEnter={(_, idx) => setActivePieIdx(idx)}
                        stroke="none"
                      >
                        {byControl.map((entry, i) => (
                          <Cell key={entry.control} fill={CONTROL_COLORS[i % CONTROL_COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle}
                        formatter={(val, _name, props) => [
                          `${val} actions (${((props.payload.count / (summary?.totalCuts || 1)) * 100).toFixed(0)}%)`,
                          fmt(props.payload.control),
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mt-1">
                    {byControl.map((row, i) => (
                      <div key={row.control} className="flex items-center gap-1.5 text-sm">
                        <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: CONTROL_COLORS[i % CONTROL_COLORS.length] }} />
                        <span className="font-medium">{fmt(row.control)}</span>
                        <span className="text-muted-foreground">({row.count})</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">No data</div>
              )}
            </CardContent>
          </Card>

          {/* CHART 5 — Actions by Type */}
          <Card className="shadow-sm border-border/60">
            <CardHeader className="pb-2">
              <SectionBadge label="Action Type" />
              <CardTitle className="mt-2 text-xl font-bold text-[#1e3a5f]">Actions by Type</CardTitle>
              <CardDescription>Severity-coded breakdown of all recorded action categories</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {loadType ? <ChartSkeleton height={300} /> : byType && byType.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[...byType].sort((a, b) => b.count - a.count)}
                    layout="vertical"
                    margin={{ top: 4, right: 40, left: 0, bottom: 4 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e9ecef" />
                    <XAxis type="number" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                    <YAxis
                      type="category"
                      dataKey="cutType"
                      stroke="#9ca3af"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      width={112}
                      tickFormatter={fmt}
                    />
                    <RechartsTooltip
                      contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle}
                      labelFormatter={fmt}
                      formatter={(v) => [`${v} actions`, "Count"]}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={20}>
                      {byType.map((entry) => (
                        <Cell key={entry.cutType} fill={TYPE_COLORS[entry.cutType] ?? SLATE} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">No data</div>
              )}
              {/* legend */}
              {byType && byType.length > 0 && (
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
                  {byType.map((row) => (
                    <div key={row.cutType} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="inline-block w-2 h-2 rounded-full" style={{ background: TYPE_COLORS[row.cutType] ?? SLATE }} />
                      {fmt(row.cutType)}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ══ CHART 6 — Primary Reasons ══ */}
        <Card className="shadow-sm border-border/60">
          <CardHeader className="pb-2">
            <SectionBadge label="Root Causes" />
            <CardTitle className="mt-2 text-xl font-bold text-[#1e3a5f]">Primary Reasons for Actions</CardTitle>
            <CardDescription>
              Identified driving factors behind institutional decisions, extracted from verified source reporting
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {loadReason ? <ChartSkeleton height={300} /> : byReason && byReason.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={byReason}
                  layout="vertical"
                  margin={{ top: 4, right: 60, left: 8, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e9ecef" />
                  <XAxis type="number" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="reason"
                    stroke="#9ca3af"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    width={186}
                  />
                  <RechartsTooltip
                    contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle}
                    formatter={(v) => [`${v} cases`, "Occurrences"]}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={22}>
                    {byReason.map((entry) => (
                      <Cell key={entry.reason} fill={REASON_COLORS[entry.reason] ?? SLATE} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">No data</div>
            )}
          </CardContent>
        </Card>

        {/* ══ CHART 4 — Actions by State (all) ══ */}
        <Card className="shadow-sm border-border/60">
          <CardHeader className="pb-2">
            <SectionBadge label="All States" />
            <CardTitle className="mt-2 text-xl font-bold text-[#1e3a5f]">Actions by State</CardTitle>
            <CardDescription>Full state-level ranking — total recorded institutional actions per state</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            {loadAllState ? <ChartSkeleton height={420} /> : allStates && allStates.length > 0 ? (() => {
              const sorted = [...allStates].sort((a, b) => b.count - a.count);
              const max = sorted[0]?.count ?? 1;
              const total = sorted.reduce((s, r) => s + r.count, 0);
              return (
                <div>
                  {/* Column headers */}
                  <div className="flex items-center gap-2 mb-3 px-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    <span className="w-4" />
                    <span className="w-14 sm:w-36">State</span>
                    <span className="flex-1">Share</span>
                    <span className="w-10 sm:w-16 text-right">Actions</span>
                    <span className="hidden sm:block w-28 text-right">Est. Students</span>
                  </div>
                  <div className="space-y-1.5">
                    {sorted.map((row, i) => {
                      const barPct = (row.count / max) * 100;
                      const sharePct = ((row.count / total) * 100).toFixed(1);
                      const intensity = Math.max(0.35, 1 - i * 0.018);
                      return (
                        <div key={row.state} className="flex items-center gap-2 px-1 py-1 rounded-lg hover:bg-muted/40 transition-colors">
                          {/* Rank */}
                          <span className="w-4 text-right text-xs text-muted-foreground font-mono tabular-nums">{i + 1}</span>
                          {/* State */}
                          <div className="w-14 sm:w-36 flex items-center gap-1.5 min-w-0 shrink-0">
                            <span className="text-xs font-bold text-[#1e3a5f] bg-[#1e3a5f]/10 rounded px-1.5 py-0.5 shrink-0">{row.state}</span>
                            <span className="text-xs text-muted-foreground truncate hidden sm:block">{STATE_NAMES[row.state] ?? ""}</span>
                          </div>
                          {/* Bar + share */}
                          <div className="flex-1 flex items-center gap-2 min-w-0">
                            <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{ width: `${barPct}%`, background: `rgba(30,58,95,${intensity})` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground w-9 text-right tabular-nums">{sharePct}%</span>
                          </div>
                          {/* Count */}
                          <span className="w-10 sm:w-16 text-right text-sm font-bold text-[#1e3a5f] tabular-nums">{row.count}</span>
                          {/* Students — desktop only */}
                          <span className="hidden sm:block w-28 text-right text-xs text-muted-foreground tabular-nums">
                            {row.studentsAffected > 0 ? row.studentsAffected.toLocaleString() : "—"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })() : (
              <div className="h-[420px] flex items-center justify-center text-muted-foreground">No data</div>
            )}
          </CardContent>
        </Card>

        {/* ── footnote ── */}
        <p className="text-center text-xs text-muted-foreground pb-6">
          Data sourced from verified institutional announcements, news reports, and public disclosures.
          Last refreshed {format(lastUpdated, "MMMM d, yyyy 'at' h:mm aa")}.
        </p>
      </div>
    </div>
    </>
  );
}
