import { 
  useGetStatsByState,
  useGetStatsByType,
  useGetMonthlyTrend
} from "@workspace/api-client-react";
import { format, parseISO } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
  Cell
} from "recharts";

export default function Analytics() {
  const { data: monthlyTrend, isLoading: isLoadingTrend } = useGetMonthlyTrend();
  const { data: statsByState, isLoading: isLoadingState } = useGetStatsByState();
  const { data: statsByType, isLoading: isLoadingType } = useGetStatsByType();

  const sortedStates = statsByState ? [...statsByState].sort((a, b) => b.count - a.count).slice(0, 15) : [];

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
      <div className="space-y-4 max-w-3xl">
        <h1 className="text-4xl font-extrabold tracking-tight text-primary">Data & Analytics</h1>
        <p className="text-xl text-muted-foreground leading-relaxed">
          Macro trends in higher education retrenchment. The data reveals accelerating closures and structural shifts across the sector.
        </p>
      </div>

      <div className="grid gap-8">
        {/* Timeline */}
        <Card className="shadow-md">
          <CardHeader className="bg-muted/20 border-b pb-6">
            <CardTitle className="text-2xl">Volume of Actions Over Time</CardTitle>
            <CardDescription className="text-base">
              Monthly count of announcements related to closures, teach-outs, and program suspensions.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 h-[450px] pt-8">
            {isLoadingTrend ? (
              <Skeleton className="h-full w-full" />
            ) : monthlyTrend && monthlyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrend} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="month" 
                    tickFormatter={(val) => format(parseISO(val + "-01"), "MMM yyyy")}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={13}
                    tickMargin={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={13}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={12}
                  />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '8px', boxShadow: 'var(--shadow-md)' }}
                    labelFormatter={(val) => format(parseISO(val + "-01"), "MMMM yyyy")}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    name="Actions Logged"
                    stroke="hsl(var(--destructive))" 
                    strokeWidth={4}
                    dot={{ fill: 'hsl(var(--background))', stroke: 'hsl(var(--destructive))', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 8, strokeWidth: 0, fill: 'hsl(var(--destructive))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">No data available</div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Top States */}
          <Card className="shadow-md">
            <CardHeader className="bg-muted/20 border-b pb-6">
              <CardTitle className="text-xl">Most Affected States</CardTitle>
              <CardDescription>
                Top 15 states by volume of institutional actions.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 h-[500px] pt-8">
              {isLoadingState ? (
                <Skeleton className="h-full w-full" />
              ) : sortedStates && sortedStates.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sortedStates} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis 
                      type="category" 
                      dataKey="state" 
                      stroke="hsl(var(--foreground))" 
                      fontWeight={600}
                      fontSize={13} 
                      tickLine={false} 
                      axisLine={false}
                    />
                    <RechartsTooltip 
                      cursor={{fill: 'hsl(var(--muted)/0.5)'}}
                      contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    />
                    <Bar dataKey="count" name="Actions" radius={[0, 4, 4, 0]} barSize={20}>
                      {sortedStates.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index < 3 ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">No data available</div>
              )}
            </CardContent>
          </Card>

          {/* Breakdown by Type */}
          <Card className="shadow-md">
            <CardHeader className="bg-muted/20 border-b pb-6">
              <CardTitle className="text-xl">Distribution by Action Type</CardTitle>
              <CardDescription>
                Relative frequency of different retrenchment strategies.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 h-[500px] pt-8">
              {isLoadingType ? (
                <Skeleton className="h-full w-full" />
              ) : statsByType && statsByType.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statsByType} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="cutType" 
                      tickFormatter={(val) => val.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      angle={-45}
                      textAnchor="end"
                      dy={15}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <RechartsTooltip 
                      cursor={{fill: 'hsl(var(--muted)/0.5)'}}
                      contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      labelFormatter={(val) => String(val).replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
                    />
                    <Bar dataKey="count" name="Count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={60}>
                       {statsByType.map((entry, index) => {
                         const isSevere = entry.cutType === 'institution_closure' || entry.cutType === 'campus_closure';
                         return <Cell key={`cell-${index}`} fill={isSevere ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'} />;
                       })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">No data available</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
