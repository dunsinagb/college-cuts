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
  Line
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
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
      {/* Hero */}
      <section className="space-y-6">
        <div className="max-w-3xl space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-primary">
            Tracking the human cost of higher education cuts.
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            A civic data project monitoring program closures, department suspensions, and faculty layoffs across US colleges and universities.
          </p>
          {!subscribed && (
            <Button asChild size="lg" className="mt-2">
              <Link href="/subscribe">Unlock Full Database Access</Link>
            </Button>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Actions Logged" value={summary?.totalCuts} icon={<AlertTriangle className="h-4 w-4 text-destructive" />} isLoading={isLoadingSummary} />
          <StatCard title="Students Affected (Est.)" value={summary?.totalStudentsAffected} icon={<GraduationCap className="h-4 w-4 text-primary" />} isLoading={isLoadingSummary} />
          <StatCard title="Faculty Affected (Est.)" value={summary?.totalFacultyAffected} icon={<Users className="h-4 w-4 text-primary" />} isLoading={isLoadingSummary} />
          <StatCard title="States Affected" value={summary?.totalStatesAffected} icon={<MapPin className="h-4 w-4 text-primary" />} isLoading={isLoadingSummary} />
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">Timeline of Actions</h2>
            <Card>
              <CardContent className="p-6 h-[350px]">
                {isLoadingTrend ? (
                  <Skeleton className="h-full w-full" />
                ) : monthlyTrend && monthlyTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyTrend} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
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
                      <Line type="monotone" dataKey="count" stroke="hsl(var(--destructive))" strokeWidth={3} dot={{ fill: "hsl(var(--destructive))", strokeWidth: 2, r: 4 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">No data available</div>
                )}
              </CardContent>
            </Card>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">Actions by Type</h2>
            <Card>
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
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={22} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">No data available</div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Premium teaser for non-subscribers */}
          {!subscribed && (
            <section className="relative rounded-xl overflow-hidden border border-border">
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-lg font-bold text-foreground">Full Access Required</p>
                  <p className="text-sm text-muted-foreground max-w-xs">Enter your email to unlock Analytics, Job Outlook, and the complete database.</p>
                </div>
                <Button asChild size="sm">
                  <Link href="/subscribe">Unlock Free Access</Link>
                </Button>
              </div>
              <div className="p-6 space-y-4 opacity-30 pointer-events-none select-none">
                <h2 className="text-2xl font-bold">Year-over-Year Comparison</h2>
                <div className="h-[220px] bg-muted/40 rounded-lg flex items-end justify-around px-8 pb-4 gap-2">
                  {[3, 6, 4, 8, 5, 11, 9, 12, 7, 10, 8, 6].map((h, i) => (
                    <div key={i} className="flex gap-0.5 items-end">
                      <div className="w-4 bg-blue-400 rounded-t" style={{ height: `${h * 8}px` }} />
                      <div className="w-4 bg-orange-400 rounded-t" style={{ height: `${(h + 2) * 8}px` }} />
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
              <h2 className="text-xl font-bold tracking-tight">Recent Logged Actions</h2>
              <Button asChild variant="ghost" size="sm" className="h-8 px-2 text-primary">
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
                      <Card className={`transition-all hover:border-primary/50 hover:shadow-md ${isLocked ? "relative overflow-hidden" : ""}`}>
                        {isLocked && (
                          <div className="absolute inset-0 z-10 bg-background/70 backdrop-blur-[2px] flex items-center justify-center gap-1.5">
                            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground font-medium">Subscribe to unlock</span>
                          </div>
                        )}
                        <CardContent className="p-4 space-y-3">
                          <div>
                            <div className="flex justify-between items-start mb-1 gap-2">
                              <h3 className="font-semibold text-base leading-tight group-hover:text-primary transition-colors">
                                {cut.institution}
                              </h3>
                              <span className="text-xs font-medium text-muted-foreground whitespace-nowrap bg-muted px-2 py-0.5 rounded">
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

          {/* Premium features CTA for non-subscribers */}
          {!subscribed ? (
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-primary">Unlock Premium Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm text-muted-foreground">
                  {[
                    { icon: <BarChart3 className="h-4 w-4 text-primary" />, label: "Full analytics dashboard" },
                    { icon: <GraduationCap className="h-4 w-4 text-primary" />, label: "Complete 40+ entry database" },
                    { icon: <Briefcase className="h-4 w-4 text-primary" />, label: "Job outlook by major" },
                    { icon: <MapPin className="h-4 w-4 text-primary" />, label: "State-level breakdowns" },
                  ].map(({ icon, label }) => (
                    <div key={label} className="flex items-center gap-2">
                      {icon}
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
                <Button asChild className="w-full mt-2" size="sm">
                  <Link href="/subscribe">Get Free Access</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-4 flex flex-wrap gap-2">
                <h2 className="text-sm font-semibold w-full mb-1">Quick Filters</h2>
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
  );
}

function StatCard({ title, value, icon, isLoading }: { title: string; value?: number; icon: React.ReactNode; isLoading: boolean }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <div className="text-3xl font-bold">
            {value !== undefined ? value.toLocaleString() : "-"}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
