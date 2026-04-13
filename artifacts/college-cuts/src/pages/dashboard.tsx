import { useState, useMemo } from "react";
import { Link } from "wouter";
import { format, parseISO } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import {
  useGetStatsSummary,
  useGetStatsByType,
  useGetRecentCuts
} from "@workspace/api-client-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CutTypeBadge } from "@/components/shared/Badges";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart
} from "recharts";
import { ArrowRight, AlertTriangle, GraduationCap, MapPin, Lock, BarChart3, Briefcase, RefreshCw, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";


function isSubscribed() {
  return localStorage.getItem("cc_subscribed") === "1";
}

export default function Dashboard() {
  const { data: summary, isLoading: isLoadingSummary } = useGetStatsSummary();
  const { data: monthlyTrend, isLoading: isLoadingTrend } = useQuery<{ month: string; count: number; states: number }[]>({
    queryKey: ["stats/monthly-trend"],
    queryFn: async () => {
      const r = await fetch(`${BASE_URL}/api/stats/monthly-trend`);
      if (!r.ok) throw new Error("Failed");
      return r.json();
    },
  });
  const { data: statsByType, isLoading: isLoadingType } = useGetStatsByType();
  const { data: recentCuts, isLoading: isLoadingRecent } = useGetRecentCuts();
  const subscribed = isSubscribed();

  // Derive available years from monthlyTrend (earliest → latest)
  const availableYears = useMemo(() => {
    if (!monthlyTrend) return [String(new Date().getFullYear())];
    const yrs = [...new Set(monthlyTrend.map(d => d.month.slice(0, 4)))].sort();
    return yrs.length > 0 ? yrs : [String(new Date().getFullYear())];
  }, [monthlyTrend]);

  const [selectedYear, setSelectedYear] = useState<string>(String(new Date().getFullYear()));

  const { data: yearlySummary, isLoading: isLoadingYearly } = useQuery<{
    year: string; actions: number; institutions: number; states: number;
    studentsAffected: number; facultyAffected: number;
  }>({
    queryKey: ["stats/yearly-summary", selectedYear],
    queryFn: async () => {
      const r = await fetch(`${BASE_URL}/api/stats/yearly-summary?year=${selectedYear}`);
      if (!r.ok) throw new Error("Failed");
      return r.json();
    },
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Dataset",
        "name": "CollegeCuts Higher Education Actions Database",
        "description": "A comprehensive dataset tracking program closures, department suspensions, campus closures, teach-outs, and faculty layoffs at US colleges and universities since 2024.",
        "url": "https://college-cuts.com/",
        "keywords": [
          "college closures", "university program cuts", "higher education layoffs",
          "department suspensions", "campus closures", "teach-out", "higher education data",
          "US college data", "faculty layoffs", "program suspension"
        ],
        "creator": {
          "@type": "Organization",
          "name": "CollegeCuts",
          "url": "https://college-cuts.com/"
        },
        "temporalCoverage": "2024/..",
        "spatialCoverage": "United States",
        "license": "https://creativecommons.org/licenses/by/4.0/"
      },
      {
        "@type": "WebSite",
        "name": "CollegeCuts",
        "url": "https://college-cuts.com/",
        "description": "Tracking the human cost of higher education cuts across the United States.",
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://college-cuts.com/cuts?q={search_term_string}"
          },
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "Organization",
        "name": "CollegeCuts",
        "url": "https://college-cuts.com/",
        "description": "A civic data project documenting the contraction of US higher education.",
        "contactPoint": {
          "@type": "ContactPoint",
          "email": "hello@college-cuts.com",
          "contactType": "editorial"
        }
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>CollegeCuts | US College Program Cuts, Closures & Layoffs Tracker</title>
        <meta name="description" content="Track program closures, department suspensions, campus closures, and faculty layoffs across US colleges and universities. Civic data updated monthly since 2024." />
        <link rel="canonical" href="https://college-cuts.com/" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
    <div className="min-h-screen bg-[#f0f4f9]">
      {/* Hero Banner */}
      <div
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2a4e7c 60%, #1a3352 100%)" }}
      >
        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, #f59e0b 1px, transparent 1px),
              radial-gradient(circle at 80% 20%, #f59e0b 1px, transparent 1px)`,
            backgroundSize: "60px 60px"
          }}
        />
        <div className="relative container mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 rounded-full px-3 py-1">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-amber-300 text-xs font-semibold tracking-wide">Tracking actions since 2024</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-white leading-tight">
              Tracking the human cost of<br />
              <span className="text-amber-400">higher education cuts.</span>
            </h1>
            <p className="text-lg text-blue-200 leading-relaxed max-w-2xl">
              A civic data project monitoring program closures, department suspensions, and faculty layoffs across US colleges and universities.
            </p>
            {/* ── Yearly insight bar — layoffs.fyi style ── */}
            <div className="pt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
              {isLoadingYearly ? (
                <div className="h-8 w-72 bg-white/10 animate-pulse rounded" />
              ) : (
                <>
                  <span className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-black text-amber-400 tabular-nums">
                      {yearlySummary?.actions?.toLocaleString() ?? "—"}
                    </span>
                    <span className="text-sm text-blue-200">actions recorded</span>
                  </span>
                  <span className="text-blue-400/50 text-lg font-light">·</span>
                  <span className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-black text-amber-400 tabular-nums">
                      {yearlySummary?.institutions?.toLocaleString() ?? "—"}
                    </span>
                    <span className="text-sm text-blue-200">institutions affected</span>
                  </span>
                  <span className="text-blue-400/50 text-lg font-light">·</span>
                  <span className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-black text-amber-400 tabular-nums">
                      {yearlySummary?.states ?? "—"}
                    </span>
                    <span className="text-sm text-blue-200">states</span>
                  </span>
                  <span className="text-blue-400/50 text-lg font-light">·</span>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="bg-white/10 hover:bg-white/15 border border-white/25 rounded-lg text-white text-sm font-semibold px-3 py-1.5 cursor-pointer outline-none transition-colors appearance-none pr-7 relative"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23cbd5e1' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center" }}
                  >
                    {availableYears.map(y => (
                      <option key={y} value={y} className="bg-[#1e3a5f] text-white">In {y}</option>
                    ))}
                  </select>
                </>
              )}
            </div>
            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 text-xs text-blue-300/70">
                <RefreshCw className="h-3 w-3 text-amber-400/70" />
                Updated monthly · prior month&apos;s data published each cycle
              </span>
            </div>
            {!subscribed && (
              <Button
                asChild
                size="lg"
                className="mt-2 bg-amber-500 hover:bg-amber-400 text-white border-0 font-bold shadow-lg shadow-amber-900/30"
              >
                <Link href="/subscribe">Unlock Full Database Access →</Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Talent Marketplace Banner */}
      <div className="bg-white border-b border-amber-100">
        <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-500 shadow-md">
              <Briefcase className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-lg font-extrabold text-[#1e3a5f]">Displaced Academic Workers — Talent Pool</h2>
                <span className="text-[10px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wide">Free</span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed max-w-2xl">
                Affected by higher education cuts? Add yourself to our talent pool and get discovered by employers actively recruiting from academia — researchers, faculty, administrators, and staff.
              </p>
              <div className="flex flex-wrap gap-3 mt-4">
                <Link
                  href="/talent"
                  className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                  <Users className="h-4 w-4" />
                  I was affected — join the pool
                </Link>
                <Link
                  href="/cuts"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1e3a5f] hover:text-amber-600 px-4 py-2 rounded-lg border border-[#1e3a5f]/20 hover:border-amber-400 transition-colors"
                >
                  Browse affected institutions <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="hidden lg:flex items-center gap-8 shrink-0 text-center">
              <div>
                <div className="text-2xl font-black text-amber-500">30s</div>
                <div className="text-xs text-gray-400 mt-0.5">to register</div>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div>
                <div className="text-2xl font-black text-[#1e3a5f]">Free</div>
                <div className="text-xs text-gray-400 mt-0.5">always</div>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div>
                <div className="text-2xl font-black text-[#1e3a5f]">Direct</div>
                <div className="text-xs text-gray-400 mt-0.5">employer contact</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Actions"
            value={summary?.totalCuts}
            subtitle="higher education actions recorded since 2024"
            icon={<AlertTriangle className="h-5 w-5" />}
            iconBg="bg-[#9b1c2e]"
            isLoading={isLoadingSummary}
          />
          <StatCard
            title="Students Affected"
            value={summary?.totalStudentsAffected}
            subtitle="estimated students impacted"
            icon={<GraduationCap className="h-5 w-5" />}
            iconBg="bg-[#d97706]"
            isLoading={isLoadingSummary}
          />
          <StatCard
            title="Faculty / Staff Affected"
            value={summary?.totalFacultyAffected}
            subtitle="estimated faculty & staff impacted"
            icon={<Users className="h-5 w-5" />}
            iconBg="bg-[#0f766e]"
            isLoading={isLoadingSummary}
          />
          <StatCard
            title="States Affected"
            value={summary?.totalStatesAffected}
            subtitle="states with higher ed actions since 2024"
            icon={<MapPin className="h-5 w-5" />}
            iconBg="bg-[#1d4ed8]"
            isLoading={isLoadingSummary}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-10">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <section className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight text-[#1e3a5f]">Timeline of Actions</h2>
              <Card className="shadow-sm border-0">
                <CardContent className="p-6 h-[350px]">
                  {isLoadingTrend ? (
                    <Skeleton className="h-full w-full" />
                  ) : monthlyTrend && monthlyTrend.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlyTrend.filter(d => !d.month.startsWith("2023"))} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorCuts" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#1e3a5f" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="#1e3a5f" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis
                          dataKey="month"
                          tickFormatter={(val) => format(parseISO(val + "-01"), "MMM yyyy")}
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={11}
                          tickLine={false}
                          axisLine={false}
                          dy={10}
                          minTickGap={55}
                        />
                        <YAxis
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          dx={-10}
                        />
                        <RechartsTooltip
                          contentStyle={{ backgroundColor: "hsl(var(--popover))", borderColor: "hsl(var(--border))", borderRadius: "8px" }}
                          labelFormatter={(val) => format(parseISO(val + "-01"), "MMMM yyyy")}
                        />
                        <Area
                          type="monotone"
                          dataKey="count"
                          stroke="#1e3a5f"
                          strokeWidth={3}
                          fill="url(#colorCuts)"
                          dot={{ fill: "#1e3a5f", strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, strokeWidth: 0, fill: "#f59e0b" }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">No data available</div>
                  )}
                </CardContent>
              </Card>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight text-[#1e3a5f]">Actions by Type</h2>
              <Card className="shadow-sm border-0">
                <CardContent className="p-6 h-[320px]">
                  {isLoadingType ? (
                    <Skeleton className="h-full w-full" />
                  ) : statsByType && statsByType.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={statsByType} layout="vertical" margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
                        <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis
                          type="category"
                          dataKey="cutType"
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          width={112}
                          tickFormatter={(val) => val.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
                        />
                        <RechartsTooltip
                          contentStyle={{ backgroundColor: "hsl(var(--popover))", borderColor: "hsl(var(--border))", borderRadius: "8px" }}
                          labelFormatter={(val) => String(val).replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
                        />
                        <Bar dataKey="count" fill="#1e3a5f" radius={[0, 4, 4, 0]} barSize={22} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">No data available</div>
                  )}
                </CardContent>
              </Card>
            </section>

          </div>

          {/* Sidebar */}
          <div className="space-y-8 min-w-0 overflow-hidden">
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight text-[#1e3a5f]">Recent Logged Actions</h2>
                <Button asChild variant="ghost" size="sm" className="h-8 px-2 text-[#1e3a5f]">
                  <Link href={subscribed ? "/cuts" : "/subscribe?redirect=/cuts"}>
                    View all <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="space-y-3">
                {isLoadingRecent ? (
                  Array(5).fill(0).map((_, i) => (
                    <Card key={i}><CardContent className="p-4"><Skeleton className="h-16 w-full" /></CardContent></Card>
                  ))
                ) : recentCuts && recentCuts.length > 0 ? (
                  recentCuts.slice(0, 5).map((cut, idx) => {
                    const isLocked = !subscribed && idx >= 2;
                    return (
                      <Link
                        key={cut.id}
                        href={subscribed ? `/cuts/${cut.id}` : `/subscribe?redirect=/cuts/${cut.id}`}
                        className="block group"
                      >
                        <Card className={`transition-all hover:border-[#1e3a5f]/40 hover:shadow-md border-0 shadow-sm bg-white ${isLocked ? "relative overflow-hidden" : ""}`}>
                          {isLocked && (
                            <div className="absolute inset-0 z-10 bg-white/70 backdrop-blur-[2px] flex items-center justify-center gap-1.5">
                              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground font-medium">Subscribe to unlock</span>
                            </div>
                          )}
                          <CardContent className="p-4 space-y-3">
                            <div>
                              <div className="flex justify-between items-start mb-1 gap-2">
                                <h3 className="font-semibold text-base leading-tight group-hover:text-[#1e3a5f] transition-colors">
                                  {cut.institution}
                                </h3>
                                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-mono">
                                  {cut.state}
                                </span>
                              </div>
                              {cut.programName && (
                                <p className="text-sm text-muted-foreground line-clamp-1">{cut.programName}</p>
                              )}
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <CutTypeBadge cutType={cut.cutType} className="text-[10px] px-1.5 py-0 h-5" />
                              <span className="text-xs text-muted-foreground">
                                {cut.announcementDate ? format(parseISO(cut.announcementDate), "MMM d, yyyy") : "—"}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center text-muted-foreground text-sm">
                      No recent cuts logged.
                    </CardContent>
                  </Card>
                )}
              </div>
            </section>

            {!subscribed ? (
              <div
                className="rounded-xl p-5 space-y-4 text-white shadow-md"
                style={{ background: "linear-gradient(135deg, #1e3a5f, #2a4e7c)" }}
              >
                <h3 className="text-base font-bold text-white">Unlock Premium Features</h3>
                <div className="space-y-2.5 text-sm text-blue-100">
                  {[
                    { icon: <BarChart3 className="h-4 w-4 text-amber-400" />, label: "Full analytics dashboard" },
                    { icon: <GraduationCap className="h-4 w-4 text-amber-400" />, label: "Complete 210+ entry database" },
                    { icon: <Briefcase className="h-4 w-4 text-amber-400" />, label: "Job outlook by major" },
                    { icon: <MapPin className="h-4 w-4 text-amber-400" />, label: "State-level breakdowns" },
                  ].map(({ icon, label }) => (
                    <div key={label} className="flex items-center gap-2">
                      {icon}
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
                <Button
                  asChild
                  className="w-full bg-amber-500 hover:bg-amber-400 text-white border-0 font-semibold"
                  size="sm"
                >
                  <Link href="/subscribe">Get Free Access</Link>
                </Button>
              </div>
            ) : (
              <Card className="border-0 shadow-sm bg-white">
                <CardContent className="p-4 flex flex-wrap gap-2">
                  <h2 className="text-sm font-semibold w-full mb-1 text-[#1e3a5f]">Quick Filters</h2>
                  <Button asChild variant="secondary" size="sm" className="rounded-full">
                    <Link href="/cuts?status=confirmed">Confirmed Actions</Link>
                  </Button>
                  <Button asChild variant="secondary" size="sm" className="rounded-full">
                    <Link href="/cuts?cutType=institution_closure">Institution Closures</Link>
                  </Button>
                  <Button asChild variant="secondary" size="sm" className="rounded-full">
                    <Link href="/cuts?cutType=program_suspension">Program Suspensions</Link>
                  </Button>
                  <Button asChild variant="secondary" size="sm" className="rounded-full">
                    <Link href="/cuts?control=Public">Public Institutions</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

function StatCard({
  title, value, rawValue, subtitle, icon, iconBg, isLoading
}: {
  title: string;
  value?: number;
  rawValue?: string;
  subtitle?: string;
  icon: React.ReactNode;
  iconBg: string;
  isLoading: boolean;
}) {
  const displayValue = rawValue !== undefined
    ? rawValue
    : value !== undefined
      ? value.toLocaleString()
      : "—";

  return (
    <Card className="border-0 shadow-md bg-white">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBg} text-white shadow-sm mt-0.5`}>
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide leading-tight">{title}</p>
            {isLoading ? (
              <Skeleton className="h-7 w-24 mt-1.5" />
            ) : (
              <div className={`font-extrabold text-[#1e3a5f] leading-tight mt-0.5 ${rawValue ? "text-xl" : "text-2xl"}`}>
                {displayValue}
              </div>
            )}
            {subtitle && !isLoading && (
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{subtitle}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
