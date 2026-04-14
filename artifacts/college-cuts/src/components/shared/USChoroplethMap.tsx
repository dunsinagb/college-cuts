import { useState, useRef, useCallback, MouseEvent as ReactMouseEvent, useEffect } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import { Link } from "wouter";

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";
const GEO_URL = `${BASE_URL}/us-states.json`;

const STATE_NAME_TO_ABBR: Record<string, string> = {
  Alabama: "AL", Alaska: "AK", Arizona: "AZ", Arkansas: "AR", California: "CA",
  Colorado: "CO", Connecticut: "CT", Delaware: "DE", Florida: "FL", Georgia: "GA",
  Hawaii: "HI", Idaho: "ID", Illinois: "IL", Indiana: "IN", Iowa: "IA",
  Kansas: "KS", Kentucky: "KY", Louisiana: "LA", Maine: "ME", Maryland: "MD",
  Massachusetts: "MA", Michigan: "MI", Minnesota: "MN", Mississippi: "MS",
  Missouri: "MO", Montana: "MT", Nebraska: "NE", Nevada: "NV", "New Hampshire": "NH",
  "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY", "North Carolina": "NC",
  "North Dakota": "ND", Ohio: "OH", Oklahoma: "OK", Oregon: "OR", Pennsylvania: "PA",
  "Rhode Island": "RI", "South Carolina": "SC", "South Dakota": "SD", Tennessee: "TN",
  Texas: "TX", Utah: "UT", Vermont: "VT", Virginia: "VA", Washington: "WA",
  "West Virginia": "WV", Wisconsin: "WI", Wyoming: "WY",
  "District of Columbia": "DC",
};

interface StateData {
  state: string;
  count: number;
  studentsAffected?: number;
}

interface TooltipState {
  x: number;
  y: number;
  abbr: string;
  name: string;
  count: number;
}

interface Props {
  data: StateData[];
}

export function USChoroplethMap({ data }: Props) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(800);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    setContainerWidth(el.clientWidth);
    const ro = new ResizeObserver(() => setContainerWidth(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const countByAbbr = Object.fromEntries(data.map((d) => [d.state, d.count]));
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  const colorScale = scaleLinear<string>()
    .domain([0, maxCount])
    .range(["#dce8f5", "#1e3a5f"]);

  const mostAffected = data.length > 0
    ? data.reduce((best, cur) => (cur.count > best.count ? cur : best), data[0])
    : null;

  const legendStops = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    value: Math.round(t * maxCount),
    color: colorScale(t * maxCount),
  }));

  const scheduleHide = useCallback(() => {
    hideTimerRef.current = setTimeout(() => setTooltip(null), 180);
  }, []);

  const cancelHide = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  return (
    <div className="space-y-3">
      {mostAffected && (
        <p className="text-sm text-muted-foreground">
          Most affected:{" "}
          <Link
            href={`${BASE_URL}/cuts?state=${mostAffected.state}`}
            className="font-semibold text-[#1e3a5f] hover:underline"
          >
            {mostAffected.state}
          </Link>{" "}
          — {mostAffected.count.toLocaleString()} recorded actions
        </p>
      )}

      <div className="relative w-full" ref={containerRef}>
        <ComposableMap
          projection="geoAlbersUsa"
          className="w-full"
          style={{ maxHeight: 480 }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const stateName: string = geo.properties.name ?? "";
                const abbr = STATE_NAME_TO_ABBR[stateName] ?? "";
                const count = countByAbbr[abbr] ?? 0;
                const fill = count > 0 ? colorScale(count) : "#e5e7eb";

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fill}
                    stroke="#ffffff"
                    strokeWidth={0.6}
                    style={{
                      default: { outline: "none" },
                      hover: { outline: "none", opacity: 0.8, cursor: abbr ? "pointer" : "default" },
                      pressed: { outline: "none" },
                    }}
                    onMouseMove={(e: ReactMouseEvent<SVGPathElement>) => {
                      if (!abbr) return;
                      cancelHide();
                      const rect = e.currentTarget
                        .closest("svg")
                        ?.getBoundingClientRect();
                      if (!rect) return;
                      setTooltip({
                        x: e.clientX - rect.left,
                        y: e.clientY - rect.top,
                        abbr,
                        name: stateName,
                        count,
                      });
                    }}
                    onMouseLeave={() => scheduleHide()}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>

        {tooltip && (
          <div
            className="absolute z-20 rounded-lg bg-[#1e3a5f] px-3 py-2 text-white shadow-lg text-sm"
            style={{
              left: tooltip.x + 12,
              top: tooltip.y - 10,
              transform: tooltip.x > containerWidth * 0.6 ? "translateX(-110%)" : undefined,
              pointerEvents: "auto",
            }}
            onMouseEnter={cancelHide}
            onMouseLeave={() => setTooltip(null)}
          >
            <p className="font-semibold">
              {tooltip.name}{" "}
              <span className="font-normal text-slate-300">({tooltip.abbr})</span>
            </p>
            <p className="text-amber-300 text-xs">
              {tooltip.count > 0
                ? `${tooltip.count} recorded action${tooltip.count !== 1 ? "s" : ""}`
                : "No cuts recorded yet"}
            </p>
            <Link
              href={`${BASE_URL}/cuts?state=${tooltip.abbr}`}
              className="mt-1 block text-xs text-slate-200 underline hover:text-white"
            >
              View cuts in {tooltip.abbr} →
            </Link>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>Fewer cuts</span>
        <div className="flex h-3 flex-1 max-w-[200px] rounded overflow-hidden">
          {legendStops.map((s, i) => (
            <div
              key={i}
              className="flex-1 h-full"
              style={{ background: s.color }}
              title={`${s.value} actions`}
            />
          ))}
        </div>
        <span>More cuts</span>
        <span className="ml-2 text-[#9ca3af]">· Gray = no data</span>
      </div>
    </div>
  );
}
