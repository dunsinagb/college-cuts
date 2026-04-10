import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  useGetStatsByType,
} from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
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
} from "recharts";
import { RefreshCw } from "lucide-react";
import { format } from "date-fns";

const YEAR_COLORS: Record<string, string> = {
  "2024": "#60a5fa",
  "2025": "#f97316",
  "2026": "#a855f7",
};

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

type YearlyMonthResponse = { years: string[]; data: Record<string, string | number>[] };
type YearlyStateResponse = { years: string[]; data: Record<string, string | number>[] };

function useYearlyByMonth(refreshKey: number) {
  return useQuery<YearlyMonthResponse>({
    queryKey: ["stats/yearly-by-month", refreshKey],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/api/stats/yearly-by-month`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });
}

function useYearlyByState(refreshKey: number) {
  return useQuery<YearlyStateResponse>({
    queryKey: ["stats/yearly-by-state", refreshKey],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/api/stats/yearly-by-state`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });
}

export default function Analytics() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const { data: monthlyData, isLoading: isLoadingMonthly } = useYearlyByMonth(refreshKey);
  const { data: stateData, isLoading: isLoadingState } = useYearlyByState(refreshKey);
  const { data: statsByType, isLoading: isLoadingType } = useGetStatsByType();

  function handleRefresh() {
    setRefreshKey((k) => k + 1);
    setLastUpdated(new Date());
  }

  const years = monthlyData?.years ?? [];
  const stateYears = stateData?.years ?? [];

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tight text-primary">Analytics Dashboard</h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          Comprehensive insights into confirmed institutional actions across higher education
          institutions. Explore trends, patterns, and regional impacts with real-time data from
          verified cases only.
        </p>
        <div className="flex items-center justify-center gap-4 pt-2">
          <Button variant="outline" onClick={handleRefresh} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh Data
          </Button>
          <span className="text-sm text-muted-foreground">
            Last updated: {format(lastUpdated, "h:mm:ss aa")}
          </span>
        </div>
      </div>

      <div className="grid gap-10">
        {/* Actions Over Time — Year Comparison */}
        <Card className="shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold">
              Actions Over Time ({years.join(" vs ")})
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[380px] pb-6">
            {isLoadingMonthly ? (
              <Skeleton className="h-full w-full" />
            ) : monthlyData && monthlyData.data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyData.data}
                  margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                  barCategoryGap="25%"
                  barGap={2}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis
                    dataKey="month"
                    stroke="#9ca3af"
                    fontSize={13}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    fontSize={13}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderColor: "#e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  {years.map((yr) => (
                    <Bar
                      key={yr}
                      dataKey={yr}
                      name={yr}
                      fill={YEAR_COLORS[yr] ?? "#94a3b8"}
                      radius={[2, 2, 0, 0]}
                      maxBarSize={28}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">No data available</div>
            )}
          </CardContent>
          <div className="px-6 pb-5 text-sm text-muted-foreground">
            Monthly trend of institutional actions across all institutions, grouped by year
          </div>
        </Card>

        {/* Top 10 States — Year Comparison */}
        <Card className="shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold">
              Top 10 States by Program Actions ({stateYears.join("-")})
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[420px] pb-6">
            {isLoadingState ? (
              <Skeleton className="h-full w-full" />
            ) : stateData && stateData.data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stateData.data}
                  margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                  barCategoryGap="25%"
                  barGap={2}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis
                    dataKey="state"
                    stroke="#9ca3af"
                    fontSize={13}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    label={{ value: "State", position: "insideBottom", offset: -12, fontSize: 13, fill: "#6b7280" }}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    fontSize={13}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    label={{ value: "Number of Actions", angle: -90, position: "insideLeft", offset: 10, fontSize: 13, fill: "#6b7280" }}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderColor: "#e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    formatter={(value) => `${value} Actions`}
                  />
                  {stateYears.map((yr) => (
                    <Bar
                      key={yr}
                      dataKey={yr}
                      name={yr}
                      fill={YEAR_COLORS[yr] ?? "#94a3b8"}
                      radius={[2, 2, 0, 0]}
                      maxBarSize={28}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">No data available</div>
            )}
          </CardContent>
          <div className="px-6 pb-5 text-sm text-muted-foreground">
            Showing top 10 states by total program actions from {stateYears.join("-")}. {stateYears.map((yr, i) => (
              <span key={yr}>{i > 0 ? ", " : ""}<span style={{ color: YEAR_COLORS[yr] ?? "#94a3b8" }}>■</span> {yr} actions</span>
            ))}.
          </div>
        </Card>

        {/* Distribution by Action Type */}
        <Card className="shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold">Distribution by Action Type</CardTitle>
            <CardDescription>
              Relative frequency of different retrenchment strategies across all years.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[360px] pb-6">
            {isLoadingType ? (
              <Skeleton className="h-full w-full" />
            ) : statsByType && statsByType.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statsByType} margin={{ top: 10, right: 20, left: 0, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis
                    dataKey="cutType"
                    tickFormatter={(val) =>
                      val.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())
                    }
                    stroke="#9ca3af"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    angle={-40}
                    textAnchor="end"
                    dy={15}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    fontSize={13}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderColor: "#e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    labelFormatter={(val) =>
                      String(val)
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (c: string) => c.toUpperCase())
                    }
                  />
                  <Bar dataKey="count" name="Count" radius={[4, 4, 0, 0]} maxBarSize={60}>
                    {statsByType.map((entry, index) => {
                      const isSevere =
                        entry.cutType === "institution_closure" ||
                        entry.cutType === "campus_closure";
                      return (
                        <Cell
                          key={`cell-${index}`}
                          fill={isSevere ? "#ef4444" : "#1e3a5f"}
                        />
                      );
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
  );
}
