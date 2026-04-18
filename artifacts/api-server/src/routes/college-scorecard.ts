import { Router } from "express";
import type { Request, Response } from "express";

const router = Router();

const API_KEY = process.env.COLLEGE_SCORECARD_API_KEY ?? "";
const BASE    = "https://api.data.gov/ed/collegescorecard/v1/schools";

const FIELDS = [
  "id",
  "school.name",
  "school.city",
  "school.state",
  "school.school_url",
  "school.ownership",
  "latest.student.size",
  "latest.completion.rate_suppressed.overall",
  "latest.earnings.6_yrs_after_entry.median",
  "latest.cost.avg_net_price.overall",
].join(",");

const CONTROL_LABEL: Record<number, string> = {
  1: "Public",
  2: "Private Nonprofit",
  3: "Private For-Profit",
};

/* Simple in-process cache — keyed by normalised institution name */
const cache = new Map<string, { data: unknown; ts: number }>();
const TTL_MS = 24 * 60 * 60 * 1000; // 24 h (scorecard data rarely changes)

router.get("/college-scorecard", async (req: Request, res: Response): Promise<void> => {
  const rawName = (req.query.name as string | undefined)?.trim();
  if (!rawName) { res.status(400).json({ error: "name query param required" }); return; }
  if (!API_KEY) { res.status(503).json({ error: "College Scorecard API key not configured" }); return; }

  /* College Scorecard API doesn't handle commas or parentheses well — strip them */
  const name = rawName.replace(/[,()]/g, " ").replace(/\s+/g, " ").trim();

  const key = rawName.toLowerCase();
  const cached = cache.get(key);
  if (cached && Date.now() - cached.ts < TTL_MS) {
    res.json(cached.data);
    return;
  }

  try {
    const url = `${BASE}?school.name=${encodeURIComponent(name)}&api_key=${API_KEY}&fields=${FIELDS}&per_page=1`;
    const resp = await fetch(url);
    if (!resp.ok) { res.status(502).json({ error: "Upstream error from College Scorecard" }); return; }

    const json = await resp.json() as { results?: Record<string, unknown>[] };
    const raw = json.results?.[0];
    if (!raw) { res.status(404).json({ error: "Institution not found" }); return; }

    const ownership = raw["school.ownership"] as number | null;
    const gradRate  = raw["latest.completion.rate_suppressed.overall"] as number | null;
    const earnings  = raw["latest.earnings.6_yrs_after_entry.median"] as number | null;
    const netPrice  = raw["latest.cost.avg_net_price.overall"] as number | null;
    const size      = raw["latest.student.size"] as number | null;
    const siteRaw   = raw["school.school_url"] as string | null;
    const website   = siteRaw
      ? (siteRaw.startsWith("http") ? siteRaw : `https://${siteRaw}`)
      : null;

    const data = {
      id:           raw["id"],
      name:         raw["school.name"],
      city:         raw["school.city"],
      state:        raw["school.state"],
      website,
      control:      ownership != null ? (CONTROL_LABEL[ownership] ?? "Unknown") : null,
      enrollment:   size,
      gradRate:     gradRate != null ? Math.round(gradRate * 100) : null,
      medianEarnings6yr: earnings,
      avgNetPrice:  netPrice,
    };

    cache.set(key, { data, ts: Date.now() });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch College Scorecard data" });
  }
});

export default router;
