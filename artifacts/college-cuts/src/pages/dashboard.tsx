import { Link } from "wouter";
import { format, parseISO } from "date-fns";
import { 
  useGetStatsSummary, 
  useGetMonthlyTrend, 
  useGetStatsByState,
  useGetStatsByType,
  useGetRecentCuts
} from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge, CutTypeBadge } from "@/components/shared/Badges";
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
import { ArrowRight, AlertTriangle, Users, GraduationCap, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { data: summary, isLoading: isLoadingSummary } = useGetStatsSummary();
  const { data: monthlyTrend, isLoading: isLoadingTrend } = useGetMonthlyTrend();
  const { data: statsByState, isLoading: isLoadingState } = useGetStatsByState();
  const { data: statsByType, isLoading: isLoadingType } = useGetStatsByType();
  const { data: recentCuts, isLoading: isLoadingRecent } = useGetRecentCuts();

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
      {/* Hero Section */}
      <section className="space-y-6">
        <div className="max-w-3xl space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-primary">
            Tracking the human cost of higher education cuts.
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            A civic data project monitoring program closures, department suspensions, and faculty layoffs across US colleges and universities.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="Total Actions Logged" 
            value={summary?.totalCuts} 
            icon={<AlertTriangle className="h-4 w-4 text-destructive" />} 
            isLoading={isLoadingSummary} 
          />
          <StatCard 
            title="Students Affected (Est.)" 
            value={summary?.totalStudentsAffected} 
            icon={<GraduationCap className="h-4 w-4 text-primary" />} 
            isLoading={isLoadingSummary} 
          />
          <StatCard 
            title="Faculty Affected (Est.)" 
            value={summary?.totalFacultyAffected} 
            icon={<Users className="h-4 w-4 text-primary" />} 
            isLoading={isLoadingSummary} 
          />
          <StatCard 
            title="States Affected" 
            value={summary?.totalStatesAffected} 
            icon={<MapPin className="h-4 w-4 text-primary" />} 
            isLoading={isLoadingSummary} 
          />
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Monthly Trend Chart */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight">Timeline of Actions</h2>
            </div>
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
                        contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                        labelFormatter={(val) => format(parseISO(val + "-01"), "MMMM yyyy")}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="count" 
                        stroke="hsl(var(--destructive))" 
                        strokeWidth={3}
                        dot={{ fill: 'hsl(var(--destructive))', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Breakdown By Type */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">Actions by Type</h2>
            <Card>
              <CardContent className="p-6 h-[350px]">
                {isLoadingType ? (
                  <Skeleton className="h-full w-full" />
                ) : statsByType && statsByType.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statsByType} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis 
                        type="category" 
                        dataKey="cutType" 
                        stroke="hsl(var(--muted-foreground))" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false}
                        tickFormatter={(val) => val.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
                      />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                        labelFormatter={(val) => String(val).replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
                      />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          
          {/* Recent Activity */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight">Recent Logged Actions</h2>
              <Button asChild variant="ghost" size="sm" className="h-8 px-2 text-primary">
                <Link href="/cuts">
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
                recentCuts.map((cut) => (
                  <Link key={cut.id} href={`/cuts/${cut.id}`} className="block group">
                    <Card className="transition-all hover:border-primary/50 hover:shadow-md">
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
                ))
              ) : (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground text-sm">
                    No recent cuts logged.
                  </CardContent>
                </Card>
              )}
            </div>
          </section>

          {/* Quick Filters */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight">Quick Filters</h2>
            <Card>
              <CardContent className="p-4 flex flex-wrap gap-2">
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
          </section>

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
