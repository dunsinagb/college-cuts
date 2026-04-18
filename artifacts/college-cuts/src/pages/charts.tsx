import { useQuery } from "@tanstack/react-query";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, ReferenceLine,
  Legend, Cell,
} from "recharts";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

const TYPE_LABELS: Record<string, string> = {
  program_suspension:  "Program Suspension",
  staff_layoff:        "Staff Layoff",
  department_closure:  "Department Closure",
  institution_closure: "Institution Closure",
  campus_closure:      "Campus Closure",
  teach_out:           "Teach-Out",
};

const AMBER  = "#fbbf24";
const NAVY   = "#1e3a5f";
const BLUE1  = "#2d5d9a";
const BLUE2  = "#3d70b2";
const BLUE3  = "#5585c0";
const BLUE4  = "#7aa4d0";
const BLUE5  = "#9ec2e0";
const BLUE6  = "#bfd5ec";

const TYPE_COLORS: Record<string, string> = {
  "Program Suspension":  AMBER,
  "Staff Layoff":        BLUE1,
  "Department Closure":  BLUE2,
  "Institution Closure": BLUE3,
  "Campus Closure":      BLUE4,
  "Teach-Out":           BLUE5,
};

function Watermark() {
  return (
    <div
      className="absolute bottom-4 right-5 flex items-center gap-1.5"
      style={{ opacity: 0.55 }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z" fill="#fbbf24" />
        <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" fill="#fbbf24" />
      </svg>
      <span style={{ color: "rgba(255,255,255,0.65)", fontSize: 12, fontWeight: 700, letterSpacing: "0.06em" }}>
        college-cuts.com
      </span>
    </div>
  );
}

function CardBadge({ label }: { label: string }) {
  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 mb-3 self-start"
      style={{ background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.3)" }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: AMBER, display: "inline-block" }} />
      <span style={{ color: AMBER, fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase" }}>
        {label}
      </span>
    </div>
  );
}

function ChartCard({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <div
      id={id}
      style={{
        position: "relative",
        background: "#0d1b2e",
        borderRadius: 16,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.09)",
        aspectRatio: "1200/628",
        width: "100%",
        maxWidth: 1200,
        boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "28px 36px 20px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
      </div>
      <Watermark />
    </div>
  );
}

const customTooltip = {
  background: "#1a2e4a",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 8,
  color: "#fff",
  fontSize: 13,
};

function StatBox({ value, label }: { value: string | number; label: string }) {
  return (
    <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 24 }}>
      <div style={{ color: AMBER, fontSize: 44, fontWeight: 900, lineHeight: 1 }}>{value}</div>
      <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, marginTop: 4 }}>{label}</div>
    </div>
  );
}

function CardTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div style={{ flex: 1 }}>
      <h2 style={{ color: "#fff", fontSize: 24, fontWeight: 800, lineHeight: 1.25, margin: 0 }}>{title}</h2>
      <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, margin: "4px 0 0" }}>{subtitle}</p>
    </div>
  );
}

function Chart1() {
  const { data = [], isLoading } = useQuery<{ cutType: string; count: number }[]>({
    queryKey: ["charts/by-type"],
    queryFn: async () => {
      const r = await fetch(`${BASE}/api/stats/by-type`);
      return r.json();
    },
  });
  const { data: summary } = useQuery<{ totalCuts: number }>({
    queryKey: ["charts/summary"],
    queryFn: async () => {
      const r = await fetch(`${BASE}/api/stats/summary`);
      return r.json();
    },
  });

  const chartData = data.map((d, i) => ({
    name: TYPE_LABELS[d.cutType] ?? d.cutType,
    count: d.count,
    color: i === 0 ? AMBER : BLUE2,
  }));

  return (
    <ChartCard id="chart-1">
      <CardBadge label="CollegeCuts Database" />
      <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 8 }}>
        <CardTitle
          title="US Higher Ed Actions by Type"
          subtitle="Every publicly reported cut, closure & layoff · college-cuts.com"
        />
        {summary && <StatBox value={summary.totalCuts} label="total actions tracked" />}
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        {isLoading ? (
          <div style={{ color: "rgba(255,255,255,0.3)", textAlign: "center", paddingTop: 60 }}>Loading…</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 16, right: 56, top: 4, bottom: 4 }}>
              <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.06)" />
              <XAxis
                type="number"
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }}
                axisLine={false} tickLine={false}
              />
              <YAxis
                type="category" dataKey="name" width={160}
                tick={{ fill: "rgba(255,255,255,0.75)", fontSize: 13, fontWeight: 600 }}
                axisLine={false} tickLine={false}
              />
              <Tooltip cursor={{ fill: "rgba(255,255,255,0.04)" }} contentStyle={customTooltip}
                formatter={(val: number) => [val, "Actions"]} />
              <Bar dataKey="count" radius={[0, 6, 6, 0]}
                label={{ position: "right", fill: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 700 }}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </ChartCard>
  );
}

const STATE_NAMES: Record<string, string> = {
  AL:"Alabama",AK:"Alaska",AZ:"Arizona",AR:"Arkansas",CA:"California",CO:"Colorado",CT:"Connecticut",
  DE:"Delaware",FL:"Florida",GA:"Georgia",HI:"Hawaii",ID:"Idaho",IL:"Illinois",IN:"Indiana",IA:"Iowa",
  KS:"Kansas",KY:"Kentucky",LA:"Louisiana",ME:"Maine",MD:"Maryland",MA:"Massachusetts",MI:"Michigan",
  MN:"Minnesota",MS:"Mississippi",MO:"Missouri",MT:"Montana",NE:"Nebraska",NV:"Nevada",NH:"New Hampshire",
  NJ:"New Jersey",NM:"New Mexico",NY:"New York",NC:"North Carolina",ND:"North Dakota",OH:"Ohio",
  OK:"Oklahoma",OR:"Oregon",PA:"Pennsylvania",RI:"Rhode Island",SC:"South Carolina",SD:"South Dakota",
  TN:"Tennessee",TX:"Texas",UT:"Utah",VT:"Vermont",VA:"Virginia",WA:"Washington",WV:"West Virginia",
  WI:"Wisconsin",WY:"Wyoming",DC:"D.C.",
};

function stateBarColor(rank: number, total: number): string {
  const t = rank / Math.max(total - 1, 1);
  const r = Math.round(251 + t * (30  - 251));
  const g = Math.round(191 + t * (58  - 191));
  const b = Math.round(36  + t * (95  - 36));
  return `rgb(${r},${g},${b})`;
}

function Chart2() {
  const { data = [], isLoading } = useQuery<{ state: string; count: number }[]>({
    queryKey: ["charts/by-state"],
    queryFn: async () => {
      const r = await fetch(`${BASE}/api/stats/by-state`);
      return r.json();
    },
  });

  const top10 = data.slice(0, 10);
  const chartData = [...top10].reverse().map((d) => ({
    name: STATE_NAMES[d.state] ?? d.state,
    count: d.count,
  }));

  return (
    <ChartCard id="chart-2">
      <CardBadge label="CollegeCuts Database" />
      <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 8 }}>
        <CardTitle
          title="States with Most Reported Higher Ed Cuts"
          subtitle="Top 10 states by total actions reported · college-cuts.com"
        />
        <StatBox value={data.length} label="states affected" />
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        {isLoading ? (
          <div style={{ color: "rgba(255,255,255,0.3)", textAlign: "center", paddingTop: 60 }}>Loading…</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 16, right: 52, top: 4, bottom: 4 }}>
              <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis
                type="category" dataKey="name" width={140}
                tick={{ fill: "rgba(255,255,255,0.75)", fontSize: 12, fontWeight: 500 }}
                axisLine={false} tickLine={false}
              />
              <Tooltip cursor={{ fill: "rgba(255,255,255,0.04)" }} contentStyle={customTooltip}
                formatter={(val: number) => [val, "Actions"]} />
              <Bar dataKey="count" radius={[0, 6, 6, 0]}
                label={{ position: "right", fill: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 700 }}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={stateBarColor(chartData.length - 1 - i, chartData.length)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </ChartCard>
  );
}

function Chart3() {
  const { data = [], isLoading } = useQuery<{ month: string; count: number }[]>({
    queryKey: ["charts/monthly-trend"],
    queryFn: async () => {
      const r = await fetch(`${BASE}/api/stats/monthly-trend`);
      return r.json();
    },
  });

  const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const fmt = (m: string) => {
    const [yr, mo] = m.split("-");
    return `${MONTH_SHORT[parseInt(mo) - 1]} '${yr.slice(2)}`;
  };

  const chartData = data.map((d) => ({ ...d, label: fmt(d.month) }));
  const refLabel = chartData.find((d) => d.month === "2025-01")?.label;
  const count2025 = data.filter((d) => d.month >= "2025-01").reduce((s, d) => s + d.count, 0);

  return (
    <ChartCard id="chart-3">
      <CardBadge label="Trend Analysis" />
      <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 8 }}>
        <CardTitle
          title="Higher Ed Cuts Are Accelerating"
          subtitle="Monthly actions reported in the CollegeCuts database · college-cuts.com"
        />
        {data.length > 0 && <StatBox value={count2025} label="actions in 2025" />}
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        {isLoading ? (
          <div style={{ color: "rgba(255,255,255,0.3)", textAlign: "center", paddingTop: 60 }}>Loading…</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ left: 0, right: 24, top: 8, bottom: 4 }}>
              <defs>
                <linearGradient id="amberGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={AMBER} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={AMBER} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="label"
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                axisLine={false} tickLine={false}
                interval={1}
              />
              <YAxis
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }}
                axisLine={false} tickLine={false} allowDecimals={false}
              />
              <Tooltip
                contentStyle={customTooltip}
                formatter={(val: number) => [val, "Actions"]}
                labelFormatter={(l) => l}
              />
              {refLabel && (
                <ReferenceLine
                  x={refLabel}
                  stroke="rgba(255,255,255,0.25)"
                  strokeDasharray="4 3"
                  label={{ value: "2025", position: "insideTopRight", fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                />
              )}
              <Area
                type="monotone" dataKey="count"
                stroke={NAVY} strokeWidth={2.5}
                fill="url(#amberGrad)"
                dot={{ fill: NAVY, r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: AMBER, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </ChartCard>
  );
}

const ACTION_TYPES_ORDER = [
  "Program Suspension", "Staff Layoff", "Department Closure",
  "Institution Closure", "Campus Closure", "Teach-Out",
];

function Chart4() {
  const { data = [], isLoading } = useQuery<Record<string, string | number>[]>({
    queryKey: ["charts/by-control-type"],
    queryFn: async () => {
      const r = await fetch(`${BASE}/api/stats/by-control-type`);
      return r.json();
    },
  });
  const { data: byCtrl = [] } = useQuery<{ control: string; count: number }[]>({
    queryKey: ["charts/by-control"],
    queryFn: async () => {
      const r = await fetch(`${BASE}/api/stats/by-control`);
      return r.json();
    },
  });

  const KEEP_CONTROLS = ["Public", "Private non-profit"];
  const filteredData = data.filter((row) => KEEP_CONTROLS.includes(String(row.control)));

  const publicCount = filteredData.find((r) => r.control === "Public")
    ? filteredData.filter((r) => r.control === "Public")
        .reduce((s, r) => s + ACTION_TYPES_ORDER.reduce((a, t) => a + Number(r[t] ?? 0), 0), 0)
    : 0;
  const totalFiltered = filteredData.reduce(
    (s, r) => s + ACTION_TYPES_ORDER.reduce((a, t) => a + Number(r[t] ?? 0), 0), 0
  );
  const publicPct = totalFiltered > 0 ? Math.round((publicCount / totalFiltered) * 100) : 0;

  const presentTypes = ACTION_TYPES_ORDER.filter((t) =>
    filteredData.some((row) => (row[t] ?? 0) > 0)
  );

  return (
    <ChartCard id="chart-4">
      <CardBadge label="Public vs Private" />
      <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 8 }}>
        <CardTitle
          title={`Public Colleges Bear ${publicPct}% of All Actions`}
          subtitle="Action type breakdown by institutional control · college-cuts.com"
        />
        <StatBox value={`${publicPct}%`} label="public institutions" />
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        {isLoading ? (
          <div style={{ color: "rgba(255,255,255,0.3)", textAlign: "center", paddingTop: 60 }}>Loading…</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={filteredData} layout="vertical" margin={{ left: 16, right: 24, top: 4, bottom: 28 }}>
              <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis
                type="category" dataKey="control" width={160}
                tick={{ fill: "rgba(255,255,255,0.8)", fontSize: 14, fontWeight: 700 }}
                axisLine={false} tickLine={false}
              />
              <Tooltip cursor={{ fill: "rgba(255,255,255,0.04)" }} contentStyle={customTooltip} />
              <Legend
                wrapperStyle={{ color: "rgba(255,255,255,0.55)", fontSize: 11, paddingTop: 4 }}
                iconType="square" iconSize={10}
              />
              {presentTypes.map((t, idx) => (
                <Bar
                  key={t} dataKey={t} stackId="a"
                  fill={TYPE_COLORS[t] ?? BLUE3}
                  radius={idx === presentTypes.length - 1 ? [0, 6, 6, 0] : [0, 0, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </ChartCard>
  );
}

export default function ChartsPage() {
  const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const focusCard = params.get("card");

  if (focusCard) {
    const CardMap: Record<string, React.FC> = { "1": Chart1, "2": Chart2, "3": Chart3, "4": Chart4 };
    const FocusedCard = CardMap[focusCard];
    if (FocusedCard) {
      return (
        <div style={{ background: "#060f1c", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ width: "100%", maxWidth: 1200 }}>
            <FocusedCard />
          </div>
        </div>
      );
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#060f1c", padding: "40px 20px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z" fill="#fbbf24" />
              <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" fill="#fbbf24" />
            </svg>
            <span style={{ color: "#fff", fontWeight: 900, fontSize: 22 }}>
              College<span style={{ color: AMBER }}>Cuts</span>
            </span>
          </div>
          <h1 style={{ color: "rgba(255,255,255,0.7)", fontSize: 18, fontWeight: 600, margin: 0 }}>
            LinkedIn Chart Cards
          </h1>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, marginTop: 6 }}>
            Screenshot each card individually — sized for 1200×628 LinkedIn share images
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, paddingBottom: 60 }}>
          <div>
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>
              Chart 01 — Action Type Breakdown
            </div>
            <Chart1 />
          </div>
          <div>
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>
              Chart 02 — Top 10 States
            </div>
            <Chart2 />
          </div>
          <div>
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>
              Chart 03 — Monthly Trend
            </div>
            <Chart3 />
          </div>
          <div>
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>
              Chart 04 — Public vs Private
            </div>
            <Chart4 />
          </div>
        </div>

      </div>
    </div>
  );
}
