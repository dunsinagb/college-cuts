import { useQuery } from "@tanstack/react-query";
import { ExternalLink, GraduationCap, Users, DollarSign, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

type ScorecardData = {
  id: number;
  name: string;
  city: string;
  state: string;
  website: string | null;
  control: string | null;
  enrollment: number | null;
  gradRate: number | null;
  medianEarnings6yr: number | null;
  avgNetPrice: number | null;
};

function fmt(n: number) {
  return n.toLocaleString("en-US");
}

function fmtUSD(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export function InstitutionInfoCard({ institutionName }: { institutionName: string }) {
  const { data, isLoading, isError } = useQuery<ScorecardData>({
    queryKey: ["college-scorecard", institutionName],
    queryFn: async () => {
      const r = await fetch(`${BASE_URL}/api/college-scorecard?name=${encodeURIComponent(institutionName)}`);
      if (!r.ok) throw new Error("Not found");
      return r.json();
    },
    retry: false,
    staleTime: 1000 * 60 * 60 * 24,
  });

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
        <Skeleton className="h-4 w-40" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
        </div>
      </div>
    );
  }

  if (isError || !data) return null;

  const stats = [
    {
      icon: <Users className="h-4 w-4 text-[#1e3a5f]" />,
      label: "Enrollment",
      value: data.enrollment != null ? fmt(data.enrollment) + " students" : null,
    },
    {
      icon: <GraduationCap className="h-4 w-4 text-green-600" />,
      label: "Grad Rate",
      value: data.gradRate != null ? `${data.gradRate}%` : null,
    },
    {
      icon: <TrendingUp className="h-4 w-4 text-amber-600" />,
      label: "Median Earnings (6yr)",
      value: data.medianEarnings6yr != null ? fmtUSD(data.medianEarnings6yr) : null,
    },
    {
      icon: <DollarSign className="h-4 w-4 text-rose-500" />,
      label: "Avg Net Price",
      value: data.avgNetPrice != null ? fmtUSD(data.avgNetPrice) + "/yr" : null,
    },
  ].filter(s => s.value != null);

  return (
    <div className="rounded-xl border bg-slate-50 p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
            Institution Data — College Scorecard
          </p>
          <p className="text-sm font-semibold text-[#1e3a5f] leading-snug">{data.name}</p>
          <p className="text-xs text-muted-foreground">
            {data.city}, {data.state}{data.control ? ` · ${data.control}` : ""}
          </p>
        </div>
        {data.website && (
          <a
            href={data.website}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-1 text-xs text-[#1e3a5f] hover:text-amber-600 font-medium transition-colors"
          >
            Visit site <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      {stats.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {stats.map(s => (
            <div key={s.label} className="rounded-lg bg-white border px-3 py-2.5 space-y-1">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                {s.icon}
                <span className="text-[10px] font-semibold uppercase tracking-wide">{s.label}</span>
              </div>
              <p className="text-sm font-bold text-foreground">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <p className="text-[10px] text-muted-foreground leading-snug">
        Source: US Dept. of Education College Scorecard. Figures reflect latest available data.
      </p>
    </div>
  );
}
