import { useState, useMemo, useRef, useCallback, useEffect } from "react";
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

  const feedScrollRef = useRef<HTMLDivElement>(null);
  const [feedScrollState, setFeedScrollState] = useState({ atStart: true, atEnd: false, scrollRatio: 0 });

  const handleFeedScroll = useCallback(() => {
    const el = feedScrollRef.current;
    if (!el) return;
    const atStart = el.scrollLeft <= 0;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;
    const maxScroll = el.scrollWidth - el.clientWidth;
    const scrollRatio = maxScroll > 0 ? el.scrollLeft / maxScroll : 0;
    setFeedScrollState({ atStart, atEnd, scrollRatio });
  }, []);

  useEffect(() => {
    handleFeedScroll();
  }, [recentCuts, isLoadingRecent, handleFeedScroll]);

  useEffect(() => {
    const handleResize = () => handleFeedScroll();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleFeedScroll]);

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

  const faqItems = [
    {
      q: "Which colleges are cutting programs in 2025?",
      a: "Dozens of US colleges and universities have cut or suspended academic programs in 2025. CollegeCuts tracks program suspensions, department closures, and campus-wide cuts across all 50 states. Browse the full database to filter by state, institution type, or action type."
    },
    {
      q: "Which universities have had faculty layoffs recently?",
      a: "Faculty layoffs and staff reductions have been recorded at public and private universities across the country, driven by enrollment declines, state funding cuts, and post-pandemic budget pressures. CollegeCuts logs each action with announcement dates, affected program counts, and source links."
    },
    {
      q: "What is a teach-out in higher education?",
      a: "A teach-out is a plan that allows enrolled students to complete their degree after a program is discontinued or a campus closes. It's often the final phase before a program suspension or institution closure becomes permanent."
    },
    {
      q: "How can I find higher education program closures by state?",
      a: "CollegeCuts lets you filter all recorded actions by US state. Each state view shows every institution affected, the type of cut, and the date announced, making it easy to track higher ed budget cuts in your region."
    },
    {
      q: "Are these college and university cuts publicly documented?",
      a: "Yes. Every record in CollegeCuts is sourced from public announcements, accreditor filings, institutional press releases, and news reports. Source links are included on each record for full transparency."
    }
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FAQPage",
        "mainEntity": faqItems.map(({ q, a }) => ({
          "@type": "Question",
          "name": q,
          "acceptedAnswer": { "@type": "Answer", "text": a }
        }))
      },
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
        <title>CollegeCuts | US College Program Cuts & Closures Database</title>
        <meta name="description" content="The free database of US higher education program cuts, department closures, campus shutdowns, and faculty layoffs. Search records across all 50 states. Civic data on college budget cuts, updated monthly since 2024." />
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
        <div className="relative container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-center">

            {/* Left: hero text */}
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 rounded-full px-3 py-1">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-amber-300 text-xs font-semibold tracking-wide">Higher Ed Actions Database · Tracking since 2024</span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-4xl text-white leading-tight">
                The definitive record of<br />
                <span className="text-amber-400">US higher-ed cuts, closures &amp; layoffs.</span>
              </h1>
              <p className="text-lg text-blue-200 leading-relaxed">
                A searchable database of every publicly reported program closure, department merger, and faculty layoff at accredited US colleges — verified, sourced, and updated as reported.
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 bg-white/8 border border-white/15 rounded-full px-3 py-1 text-xs font-medium text-blue-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0"></span>
                  Referenced by journalists &amp; newsrooms
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white/8 border border-white/15 rounded-full px-3 py-1 text-xs font-medium text-blue-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0"></span>
                  Used by researchers &amp; journalists
                </span>
              </div>

              {/* Unique stat — institutions tracked (not shown in KPI strip below) */}
              <div className="pt-2 flex flex-wrap items-center gap-x-5 gap-y-2">
                {isLoadingSummary ? (
                  <div className="h-8 w-52 bg-white/10 animate-pulse rounded" />
                ) : (
                  <span className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-black text-amber-400 tabular-nums">
                      {summary?.totalInstitutions?.toLocaleString() ?? "..."}
                    </span>
                    <span className="text-sm text-blue-200">institutions tracked</span>
                  </span>
                )}
                <span className="text-blue-400/40 text-lg font-light">·</span>
                <span className="inline-flex items-center gap-1.5 text-sm text-blue-200">
                  <RefreshCw className="h-3.5 w-3.5 text-amber-400/70" />
                  Updated as reported
                </span>
                <span className="text-blue-400/40 text-lg font-light">·</span>
                <span className="text-sm text-blue-200">Free public data</span>
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

            {/* Right: live recent actions feed */}
            <div className="hidden lg:flex justify-end">
              <div className="w-full max-w-sm rounded-2xl overflow-hidden border border-white/10" style={{ background: "rgba(13,31,51,0.65)", backdropFilter: "blur(8px)" }}>
                <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Recent Actions</span>
                </div>
                <div className="divide-y divide-white/5">
                  {isLoadingRecent ? (
                    [1,2,3,4,5].map(i => (
                      <div key={i} className="px-5 py-3.5">
                        <div className="h-3.5 bg-white/10 rounded animate-pulse w-3/4 mb-2" />
                        <div className="h-3 bg-white/5 rounded animate-pulse w-1/2" />
                      </div>
                    ))
                  ) : recentCuts?.slice(0, 5).map((cut) => (
                    <div key={cut.id} className="block px-5 py-3.5">
                      <p className="text-sm font-semibold text-white leading-snug truncate">
                        {cut.institution}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-blue-300">{cut.state}</span>
                        {cut.cutType && (
                          <>
                            <span className="text-blue-400/30 text-xs">·</span>
                            <span className="text-xs text-amber-300/70 capitalize">
                              {String(cut.cutType).replace(/_/g, " ")}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-5 py-3.5 border-t border-white/10">
                  <Link
                    href={`${import.meta.env.BASE_URL?.replace(/\/$/, "")}/cuts`}
                    className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    View all records →
                  </Link>
                </div>
              </div>
            </div>

          </div>

          {/* Mobile: compact horizontally-scrollable recent actions feed */}
          <div className="block lg:hidden mt-6">
            <div className="rounded-2xl overflow-hidden border border-white/10" style={{ background: "rgba(13,31,51,0.65)", backdropFilter: "blur(8px)" }}>
              <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Recent Actions</span>
              </div>
              <div className="relative">
                <div
                  ref={feedScrollRef}
                  onScroll={handleFeedScroll}
                  className="flex overflow-x-auto gap-3 px-4 py-3 scrollbar-none"
                >
                {isLoadingRecent ? (
                  [1,2,3].map(i => (
                    <div key={i} className="flex-none w-44 rounded-xl bg-white/5 px-3 py-2.5 space-y-1.5">
                      <div className="h-3 bg-white/10 rounded animate-pulse w-4/5" />
                      <div className="h-2.5 bg-white/5 rounded animate-pulse w-3/5" />
                    </div>
                  ))
                ) : recentCuts && recentCuts.length === 0 ? (
                  <p className="text-xs text-blue-300/60 py-1">No recent actions yet.</p>
                ) : recentCuts?.slice(0, 6).map((cut) => (
                  <div
                    key={cut.id}
                    className="flex-none w-44 rounded-xl bg-white/5 border border-white/5 px-3 py-2.5"
                  >
                    <p className="text-xs font-semibold text-white leading-snug line-clamp-2">{cut.institution}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[11px] text-blue-300">{cut.state}</span>
                      {cut.cutType && (
                        <>
                          <span className="text-blue-400/30 text-[10px]">·</span>
                          <span className="text-[11px] text-amber-300/70 capitalize truncate">{String(cut.cutType).replace(/_/g, " ")}</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                </div>
                <div
                  className="pointer-events-none absolute inset-y-0 left-0 w-12 transition-opacity duration-200"
                  style={{
                    background: "linear-gradient(to left, transparent, rgba(13,31,51,0.85))",
                    opacity: feedScrollState.atStart ? 0 : 1,
                  }}
                />
                <div
                  className="pointer-events-none absolute inset-y-0 right-0 w-12 transition-opacity duration-200"
                  style={{
                    background: "linear-gradient(to right, transparent, rgba(13,31,51,0.85))",
                    opacity: feedScrollState.atEnd ? 0 : 1,
                  }}
                />
              </div>
              {!isLoadingRecent && recentCuts && recentCuts.length > 1 && (() => {
                const cards = recentCuts.slice(0, 6);
                const dotCount = cards.length;
                const activeDot = Math.min(
                  dotCount - 1,
                  Math.max(0, Math.round(feedScrollState.scrollRatio * (dotCount - 1)))
                );
                return (
                  <div className="flex justify-center items-center gap-1.5 py-2">
                    {cards.map((_, i) => (
                      <span
                        key={i}
                        className="block rounded-full transition-all duration-300"
                        style={{
                          width: activeDot === i ? "18px" : "6px",
                          height: "6px",
                          background: activeDot === i
                            ? "rgba(251,191,36,0.9)"
                            : "rgba(255,255,255,0.2)",
                        }}
                      />
                    ))}
                  </div>
                );
              })()}
              <div className="px-4 py-2.5 border-t border-white/10">
                <Link
                  href={`${import.meta.env.BASE_URL?.replace(/\/$/, "")}/cuts`}
                  className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                >
                  View all records →
                </Link>
              </div>
            </div>
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
                <h2 className="text-lg font-extrabold text-[#1e3a5f]">Displaced Academic Workers: Talent Pool</h2>
                <span className="text-[10px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wide">Free</span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed max-w-2xl">
                Affected by higher education cuts? Add yourself to our talent pool and get discovered by employers actively recruiting from academia: researchers, faculty, administrators, and staff.
              </p>
              <div className="flex flex-wrap gap-3 mt-4">
                <Link
                  href="/talent"
                  className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                  <Users className="h-4 w-4" />
                  I was affected. Join the pool.
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

      {/* § 01 SNAPSHOT axis */}
      <div className="container mx-auto max-w-7xl px-4 pt-8 pb-0 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] shrink-0" style={{ color: "#f59e0b" }}>§ 01 · BY THE NUMBERS</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
      </div>

      {/* KPI Strip */}
      <div className="container mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
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

        {/* § 02 BREAKDOWN axis */}
        <div className="flex items-center gap-3 mb-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] shrink-0" style={{ color: "#f59e0b" }}>§ 02 · BREAKDOWN</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

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
                    const isLocked = !subscribed && idx >= 3;
                    return (
                      <Link
                        key={cut.id}
                        href={`/cuts/${cut.id}`}
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
                                {cut.announcementDate ? format(parseISO(cut.announcementDate), "MMM d, yyyy") : ""}
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
                      No recent actions logged.
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
                    { icon: <GraduationCap className="h-4 w-4 text-amber-400" />, label: "Continuously growing database" },
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

        {/* § 03 FAQ axis */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] shrink-0" style={{ color: "#f59e0b" }}>§ 03 · FREQUENTLY ASKED</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* FAQ Section */}
        <div className="mb-8 max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-[#1e3a5f] mb-6 text-center">
            Frequently asked questions about higher education cuts
          </h2>
          <div className="space-y-4">
            {faqItems.map(({ q, a }) => (
              <details key={q} className="group bg-white rounded-xl shadow-sm border-0 px-6 py-4 cursor-pointer">
                <summary className="flex items-center justify-between font-semibold text-[#1e3a5f] text-base list-none gap-3">
                  <span>{q}</span>
                  <span className="text-amber-500 text-xl font-light shrink-0 group-open:rotate-45 transition-transform duration-200">+</span>
                </summary>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
          <p className="text-center mt-6 text-sm text-slate-400">
            More questions? <a href="mailto:hello@college-cuts.com" className="text-[#1e3a5f] hover:underline font-medium">Email us</a> or{" "}
            <Link href="/submit-tip" className="text-[#1e3a5f] hover:underline font-medium">submit a tip</Link>.
          </p>
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
      : "N/A";

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
