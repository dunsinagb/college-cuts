import { useState } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { Link } from "wouter";

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";
const GEO_URL = `${BASE_URL}/us-states.json`;

const STATE_CENTROIDS: Record<string, [number, number]> = {
  AL: [-86.79, 32.80],  AK: [-153.37, 64.20], AZ: [-111.43, 34.29], AR: [-92.44, 34.90],
  CA: [-119.68, 36.78], CO: [-105.55, 39.07],  CT: [-72.65, 41.60],  DE: [-75.50, 38.99],
  FL: [-81.52, 27.76],  GA: [-83.44, 32.64],   HI: [-156.33, 20.25], ID: [-114.48, 44.45],
  IL: [-89.20, 40.35],  IN: [-86.27, 40.27],   IA: [-93.10, 41.88],  KS: [-98.38, 38.53],
  KY: [-84.87, 37.67],  LA: [-91.96, 30.98],   ME: [-68.99, 45.25],  MD: [-76.69, 39.05],
  MA: [-71.53, 42.41],  MI: [-85.60, 44.31],   MN: [-93.90, 46.39],  MS: [-89.68, 32.74],
  MO: [-92.29, 38.46],  MT: [-109.64, 46.88],  NE: [-99.90, 41.49],  NV: [-116.42, 38.80],
  NH: [-71.57, 43.19],  NJ: [-74.41, 40.06],   NM: [-106.11, 34.52], NY: [-75.00, 43.00],
  NC: [-79.39, 35.54],  ND: [-100.47, 47.55],  OH: [-82.91, 40.37],  OK: [-97.52, 35.47],
  OR: [-120.55, 44.00], PA: [-77.83, 40.90],   RI: [-71.48, 41.70],  SC: [-80.94, 33.84],
  SD: [-99.44, 44.44],  TN: [-86.69, 35.86],   TX: [-99.33, 31.97],  UT: [-111.09, 39.33],
  VT: [-72.71, 44.05],  VA: [-78.66, 37.43],   WA: [-120.50, 47.75], WV: [-80.45, 38.60],
  WI: [-89.51, 44.27],  WY: [-107.55, 43.08],  DC: [-77.04, 38.91],
};

function seededRand(seed: number): number {
  const x = Math.sin(seed + 1) * 43758.5453123;
  return x - Math.floor(x);
}

function jitter(id: string | number, idx: 0 | 1): number {
  const n = typeof id === "string" ? [...id].reduce((a, c) => a + c.charCodeAt(0), 0) : id;
  const range = 1.4;
  return (seededRand(n * (idx + 1)) - 0.5) * range * 2;
}

interface DotPoint {
  id: string | number;
  state: string;
  control: string;
  institution: string;
  date?: string;
}

interface TooltipState {
  x: number;
  y: number;
  id: string | number;
  institution: string;
  state: string;
  control: string;
}

interface Props {
  data: DotPoint[];
}

const CONTROL_COLOR: Record<string, string> = {
  "Public":              "#60a5fa",
  "Private non-profit":  "#fbbf24",
  "Private for-profit":  "#f97316",
  "Unknown":             "#94a3b8",
};

const CONTROL_LABEL: Record<string, string> = {
  "Public":              "Public",
  "Private non-profit":  "Private non-profit",
  "Private for-profit":  "Private for-profit",
  "Unknown":             "Unknown",
};

function dotColor(control: string): string {
  return CONTROL_COLOR[control] ?? "#94a3b8";
}

export function DotMap({ data }: Props) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const dots = data
    .filter((d) => STATE_CENTROIDS[d.state])
    .map((d) => {
      const [lon, lat] = STATE_CENTROIDS[d.state];
      return {
        ...d,
        coords: [lon + jitter(d.id, 0), lat + jitter(d.id, 1)] as [number, number],
        color: dotColor(d.control),
      };
    });

  return (
    <div className="relative w-full">
      <ComposableMap
        projection="geoAlbersUsa"
        className="w-full"
        style={{ maxHeight: 420, background: "#0d1f33" }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#162b42"
                stroke="#1e3a5f"
                strokeWidth={0.8}
                style={{
                  default: { outline: "none" },
                  hover:   { outline: "none" },
                  pressed: { outline: "none" },
                }}
              />
            ))
          }
        </Geographies>

        {dots.map((d) => (
          <Marker
            key={d.id}
            coordinates={d.coords}
            onMouseEnter={(e: any) => {
              const svg = (e.target as SVGElement).closest("svg");
              const rect = svg?.getBoundingClientRect();
              if (!rect) return;
              setTooltip({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
                id: d.id,
                institution: d.institution,
                state: d.state,
                control: d.control,
              });
            }}
            onMouseLeave={() => setTooltip(null)}
            style={{ cursor: "pointer" }}
          >
            <circle
              r={5}
              fill={d.color}
              fillOpacity={0.85}
              stroke="#0d1f33"
              strokeWidth={0.8}
            />
          </Marker>
        ))}
      </ComposableMap>

      {tooltip && (
        <div
          className="pointer-events-none absolute z-20 rounded-lg bg-[#0d1f33] border border-[#2d4a6b] px-3 py-2 text-white shadow-lg text-xs max-w-[220px]"
          style={{
            left: tooltip.x + 12,
            top: tooltip.y - 10,
          }}
        >
          <p className="font-semibold text-sm leading-tight">{tooltip.institution}</p>
          <p className="text-slate-400 mt-0.5">{tooltip.state} · {tooltip.control}</p>
          <Link
            href={`${BASE_URL}/cuts/${tooltip.id}`}
            className="mt-1 block text-amber-400 hover:underline"
          >
            View record →
          </Link>
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-slate-400 px-1">
        {Object.entries(CONTROL_COLOR).filter(([k]) => k !== "Unknown").map(([control, color]) => (
          <span key={control} className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
            {CONTROL_LABEL[control]}
          </span>
        ))}
      </div>
    </div>
  );
}
