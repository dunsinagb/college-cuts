import { Router, type IRouter, type Request, type Response } from "express";

const router: IRouter = Router();

const WARN_API_KEY = process.env.WARN_FIREHOSE_API_KEY || "";
const ADMIN_SECRET = process.env.ADMIN_SECRET || "";
const WARN_API_URL = "https://warnfirehose.com/api/records?industry=education&limit=25";

const HIGHER_ED_KEYWORDS = [
  "university", "universities", "college", "community college",
  "institute of technology", "polytechnic", "seminary",
  "school of law", "school of medicine", "graduate school",
  "business school", "divinity school", "arts school",
];

const NAICS_HIGHER_ED = new Set(["6112", "6113"]);

type WarnRecord = {
  id: string;
  company_name: string;
  display_name: string | null;
  city: string;
  county: string | null;
  state: string;
  employees_affected: number;
  notice_date: string;
  effective_date: string | null;
  layoff_type: string | null;
  source_url: string | null;
  naics_code: string | null;
  industry: string;
  latitude: number | null;
  longitude: number | null;
};

type WarnApiResponse = {
  records: WarnRecord[];
  total: number;
  total_employees: number;
  latest_notice: string;
  states_count: number;
  limit: number;
  offset: number;
  tier: string;
};

type CacheEntry = {
  fetchedAt: number;
  raw: WarnRecord[];
  higherEd: WarnRecord[];
  meta: {
    total: number;
    totalEmployees: number;
    latestNotice: string;
    statesCount: number;
  };
};

let cache: CacheEntry | null = null;
const CACHE_TTL_MS = 23 * 60 * 60 * 1000;

function isHigherEd(record: WarnRecord): boolean {
  const name = (record.company_name || record.display_name || "").toLowerCase();
  if (HIGHER_ED_KEYWORDS.some(kw => name.includes(kw))) return true;
  if (record.naics_code) {
    const code = record.naics_code.slice(0, 4);
    if (NAICS_HIGHER_ED.has(code)) return true;
  }
  return false;
}

async function fetchWarnData(): Promise<CacheEntry> {
  if (!WARN_API_KEY) throw new Error("WARN_FIREHOSE_API_KEY not configured");

  const res = await fetch(WARN_API_URL, {
    headers: { "X-API-Key": WARN_API_KEY },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`WARN API error ${res.status}: ${body.slice(0, 200)}`);
  }

  const data: WarnApiResponse = await res.json();
  const higherEd = data.records.filter(isHigherEd);

  return {
    fetchedAt: Date.now(),
    raw: data.records,
    higherEd,
    meta: {
      total: data.total,
      totalEmployees: data.total_employees,
      latestNotice: data.latest_notice,
      statesCount: data.states_count,
    },
  };
}

async function getWarnData(): Promise<CacheEntry> {
  const now = Date.now();
  if (cache && now - cache.fetchedAt < CACHE_TTL_MS) {
    return cache;
  }
  cache = await fetchWarnData();
  return cache;
}

function requireAdmin(req: Request, res: Response): boolean {
  const token =
    (req.headers["x-admin-secret"] as string) ||
    (req.query.secret as string);
  if (!ADMIN_SECRET || token !== ADMIN_SECRET) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  return true;
}

router.get("/admin/warn-leads", async (req: Request, res: Response): Promise<void> => {
  if (!requireAdmin(req, res)) return;

  try {
    const data = await getWarnData();
    const showAll = req.query.all === "1";

    res.json({
      cachedAt: new Date(data.fetchedAt).toISOString(),
      cacheAgeMinutes: Math.floor((Date.now() - data.fetchedAt) / 60000),
      meta: data.meta,
      higherEdCount: data.higherEd.length,
      totalEducationCount: data.raw.length,
      higherEdRecords: data.higherEd.map(r => ({
        id: r.id,
        institution: r.display_name || r.company_name,
        city: r.city,
        state: r.state,
        employeesAffected: r.employees_affected,
        noticeDate: r.notice_date,
        effectiveDate: r.effective_date,
        sourceUrl: r.source_url,
        naicsCode: r.naics_code,
      })),
      ...(showAll && { allEducationRecords: data.raw }),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: msg });
  }
});

router.post("/admin/warn-refresh", async (req: Request, res: Response): Promise<void> => {
  if (!requireAdmin(req, res)) return;

  try {
    cache = null;
    const data = await getWarnData();
    res.json({
      ok: true,
      cachedAt: new Date(data.fetchedAt).toISOString(),
      higherEdCount: data.higherEd.length,
      totalEducationCount: data.raw.length,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: msg });
  }
});

export default router;
