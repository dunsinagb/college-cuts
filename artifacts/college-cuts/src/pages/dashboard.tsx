import { Link } from "wouter";
import { format, parseISO } from "date-fns";
import {
  useGetStatsSummary,
  useGetMonthlyTrend,
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
import { ArrowRight, AlertTriangle, Users, GraduationCap, MapPin, Lock, BarChart3, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";

function isSubscribed() {
  return localStorage.getItem("cc_subscribed") === "1";
}

export default function Dashboard() {
  const { data: summary, isLoading: isLoadingSummary } = useGetStatsSummary();
  const { data: monthlyTrend, isLoading: isLoadingTrend } = useGetMonthlyTrend();
  const { data: statsByType, isLoading: isLoadingType } = useGetStatsByType();
  const { data: recentCuts, isLoading: isLoadingRecent } = useGetRecentCuts();

  const subscribed = isSubscribed();

  return (
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
              <span className="text-amber-300 text-xs font-semibold tracking-wide uppercase">Live Database</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-white leading-tight">
              Tracking the human cost of<br />
              <span className="text-amber-400">higher education cuts.</span>
            </h1>
            <p className="text-lg text-blue-200 leading-relaxed max-w-2xl">
              A civic data project monitoring program closures, department suspensions, and faculty layoffs across US colleges and universities.
            </p>
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

      {/* KPI Strip */}
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Actions Logged"
            value={summary?.totalCuts}
            icon={<AlertTriangle className="h-5 w-5" />}
            iconBg="bg-rose-500"
            isLoading={isLoadingSummary}
          />
          <StatCard
            title="Students Affected (Est.)"
            value={summary?.totalStudentsAffected}
            icon={<GraduationCap className="h-5 w-5" />}
            iconBg="bg-amber-500"
            isLoading={isLoadingSummary}
          />
          <StatCard
            title="Faculty Affected (Est.)"
            value={summary?.totalFacultyAffected}
            icon={<Users className="h-5 w-5" />}
            iconBg="bg-blue-500"
            isLoading={isLoadingSummary}
          />
          <StatCard
            title="States Affected"
            value={summary?.totalStatesAffected}
            icon={<MapPin className="h-5 w-5" />}
            iconBg="bg-teal-500"
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
                      <AreaChart data={monthlyTrend} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
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
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          dy={10}
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
                      <BarChart data={statsByType} layout="vertical" margin={{ top: 5, right: 30, left: 110, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
                        <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis
                          type="category"
                          dataKey="cutType"
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
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

            {!subscribed && (
              <section className="relative rounded-xl overflow-hidden border border-border">
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1e3a5f]/10">
                    <Lock className="h-6 w-6 text-[#1e3a5f]" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-lg font-bold text-[#1e3a5f]">Full Access Required</p>
                    <p className="text-sm text-muted-foreground max-w-xs">Enter your email to unlock Analytics, Job Outlook, and the complete database.</p>
                  </div>
                  <Button asChild size="sm" className="bg-amber-500 hover:bg-amber-400 text-white border-0">
                    <Link href="/subscribe">Unlock Free Access</Link>
                  </Button>
                </div>
                <div className="p-6 space-y-4 opacity-30 pointer-events-none select-none">
                  <h2 className="text-2xl font-bold">Year-over-Year Comparison</h2>
                  <div className="h-[220px] bg-muted/40 rounded-lg flex items-end justify-around px-8 pb-4 gap-2">
                    {[3, 6, 4, 8, 5, 11, 9, 12, 7, 10, 8, 6].map((h, i) => (
                      <div key={i} className="flex gap-0.5 items-end">
                        <div className="w-4 bg-blue-400 rounded-t" style={{ height: `${h * 8}px` }} />
                        <div className="w-4 bg-amber-400 rounded-t" style={{ height: `${(h + 2) * 8}px` }} />
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
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
                                {format(parseISO(cut.announcementDate), "MMM d, yyyy")}
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
  );
}

function StatCard({
  title, value, icon, iconBg, isLoading
}: {
  title: string;
  value?: number;
  icon: React.ReactNode;
  iconBg: string;
  isLoading: boolean;
}) {
  return (
    <Card className="border-0 shadow-md bg-white">
      <CardContent className="p-5">
        <div className="flex items-center gap-4">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBg} text-white shadow-sm`}>
            {icon}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide leading-tight">{title}</p>
            {isLoading ? (
              <Skeleton className="h-7 w-20 mt-1" />
            ) : (
              <div className="text-2xl font-extrabold text-[#1e3a5f] leading-tight mt-0.5">
                {value !== undefined ? value.toLocaleString() : "—"}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
