import { Router, type IRouter } from "express";
import { createClient } from "@supabase/supabase-js";
import {
  MAJOR_SOC_MAP,
  BLS_2024_WAGES,
  BLS_2024_EMPLOYMENT,
  getGrowthRate,
  getBLSWage,
  getBLSEmployment,
  findSocsForMajor,
  getPlaceholderEducation,
} from "../lib/bls-crosswalk";

const router: IRouter = Router();

/* ──────────────────────────────────────────────
   BLS Live API — 24h in-memory cache
   Series ID format for OES national data (25 chars):
     OEUN + 0000000(area=national) + 000000(industry=all) + SOC_no_dash(6) + data_type(2)
     data_type 04 = annual mean wage
     data_type 01 = employment (absolute headcount — OES national reports actual workers, not thousands)
   ────────────────────────────────────────────── */
interface BlsLiveEntry {
  wage: number | null;
  employment: number | null;
  fetchedAt: number;
  failed?: boolean;
}
const BLS_LIVE_CACHE: Map<string, BlsLiveEntry> = new Map();
const BLS_CACHE_TTL_MS      = 24 * 60 * 60 * 1000;
const BLS_FAILURE_TTL_MS    =  1 * 60 * 60 * 1000;

function socToBlsId(soc: string, dataType: "04" | "01"): string {
  const socClean = soc.replace("-", "").padEnd(6, "0");
  // OES national series format: OEUN + 0000000(area=national) + 000000(industry=all) + SOC(6) + datatype(2)
  return `OEUN0000000000000${socClean}${dataType}`;
}

async function fetchLiveBls(soc: string, blsKey: string): Promise<{ wage: number | null; employment: number | null }> {
  const cached = BLS_LIVE_CACHE.get(soc);
  if (cached) {
    const ttl = cached.failed ? BLS_FAILURE_TTL_MS : BLS_CACHE_TTL_MS;
    if (Date.now() - cached.fetchedAt < ttl) {
      return { wage: cached.wage, employment: cached.employment };
    }
  }

  const wageSeriesId = socToBlsId(soc, "04");
  const empSeriesId  = socToBlsId(soc, "01");

  try {
    const resp = await fetch("https://api.bls.gov/publicAPI/v2/timeseries/data/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        seriesid: [wageSeriesId, empSeriesId],
        startyear: "2023",
        endyear: "2024",
        registrationkey: blsKey,
      }),
    });

    if (!resp.ok) throw new Error(`BLS API ${resp.status}`);

    const json = await resp.json() as {
      status: string;
      Results?: {
        series: Array<{ seriesID: string; data: Array<{ year: string; value: string }> }>;
      };
    };

    if (json.status !== "REQUEST_SUCCEEDED" || !json.Results) throw new Error("BLS API returned non-success");

    let wage: number | null = null;
    let employment: number | null = null;

    for (const series of json.Results.series) {
      const latestData = series.data?.[0];
      if (!latestData) continue;
      const val = parseFloat(latestData.value);
      if (isNaN(val) || val <= 0) continue;

      if (series.seriesID === wageSeriesId) wage = val;
      if (series.seriesID === empSeriesId)  employment = Math.round(val);
    }

    const noData = wage === null && employment === null;
    if (!noData) {
      console.info(`[BLS live] Fetched live data for SOC ${soc}: wage=${wage}, employment=${employment}`);
    } else {
      console.warn(`[BLS live] No data in series response for SOC ${soc} — using hardcoded fallback (retry in 1h)`);
    }
    BLS_LIVE_CACHE.set(soc, { wage, employment, fetchedAt: Date.now(), failed: noData });
    return { wage, employment };
  } catch (err) {
    console.warn(`[BLS live] API call failed for SOC ${soc} — using hardcoded fallback (retry in 1h):`, err);
    BLS_LIVE_CACHE.set(soc, { wage: null, employment: null, fetchedAt: Date.now(), failed: true });
    return { wage: null, employment: null };
  }
}

/* ──────────────────────────────────────────────
   O*NET Web Services — in-memory cache
   Endpoint: GET /occupations/{soc}.00/skills (api-v2.onetcenter.org)
   Auth: X-API-Key header (ONET_API_KEY)
   Status values:
     "not_configured"   – env var absent
     "pending_approval" – key present but API returns 401
     "active"           – key valid and skills returned successfully
   ────────────────────────────────────────────── */
type OnetStatus = "not_configured" | "pending_approval" | "active";

const ONET_SKILLS_CACHE: Map<string, { skills: string[]; fetchedAt: number; pending?: boolean }> = new Map();
const ONET_CACHE_TTL_MS         = 6 * 60 * 60 * 1000;
const ONET_PENDING_CACHE_TTL_MS = 5 * 60 * 1000;
let onetStatus: OnetStatus = process.env.ONET_API_KEY
  ? "pending_approval"
  : "not_configured";

if (onetStatus !== "not_configured") {
  console.info("[O*NET] API key configured. Awaiting first successful call to confirm activation.");
} else {
  console.warn("[O*NET] ONET_API_KEY not set — at-risk skills disabled.");
}

async function fetchOnetSkills(soc: string): Promise<string[]> {
  const apiKey = process.env.ONET_API_KEY;
  if (!apiKey) return [];

  const cached = ONET_SKILLS_CACHE.get(soc);
  if (cached) {
    const ttl = cached.pending ? ONET_PENDING_CACHE_TTL_MS : ONET_CACHE_TTL_MS;
    if (Date.now() - cached.fetchedAt < ttl) return cached.skills;
  }

  try {
    const socFormatted = `${soc}.00`;
    const url = `https://api-v2.onetcenter.org/online/occupations/${socFormatted}/summary/skills`;

    const resp = await fetch(url, {
      headers: {
        "X-API-Key": apiKey,
        "Accept": "application/json",
      },
    });

    if (resp.status === 401) {
      console.warn(`[O*NET] 401 Unauthorized for SOC ${soc} — API key may be inactive.`);
      onetStatus = "pending_approval";
      ONET_SKILLS_CACHE.set(soc, { skills: [], fetchedAt: Date.now(), pending: true });
      return [];
    }

    if (!resp.ok) throw new Error(`O*NET API ${resp.status}`);

    const json = await resp.json() as {
      element?: Array<{
        name: string;
        score?: { value: number; scale?: { id: string } };
      }>;
    };

    const elements = (json.element ?? [])
      .slice(0, 5)
      .map((e) => e.name)
      .filter(Boolean);

    onetStatus = "active";
    ONET_SKILLS_CACHE.set(soc, { skills: elements, fetchedAt: Date.now() });
    console.info(`[O*NET] Skills fetched for SOC ${soc}: ${elements.join(", ")}`);
    return elements;
  } catch (err) {
    console.warn(`[O*NET] Failed for SOC ${soc}:`, err);
    ONET_SKILLS_CACHE.set(soc, { skills: [], fetchedAt: Date.now() });
    return [];
  }
}

/* ── Re-export MAJOR_SOC_MAP for routes that need it (for compatibility) ── */
export { MAJOR_SOC_MAP };

async function fetchBLSData(soc: string, title: string, blsKey: string) {
  const live = await fetchLiveBls(soc, blsKey);
  const wage       = live.wage       ?? getBLSWage(soc, title);
  const employment = live.employment ?? getBLSEmployment(soc);

  return {
    soc,
    title,
    median_wage: wage,
    growth_pct: getGrowthRate(soc),
    employment_level: employment,
    annual_openings: Math.floor(employment * 0.042),
    entry_education: getPlaceholderEducation(title),
    unemployment_rate: 3.2,
    state_wage_data: null,
  };
}

/* ---------- Supabase path ---------- */
async function getSocsFromSupabase(major: string, supabaseUrl: string, supabaseKey: string) {
  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data: cipCodes } = await supabase
    .from("v_all_majors")
    .select("cip")
    .ilike("cip_title", `%${major}%`);

  if (!cipCodes?.length) return [];

  const cipList = cipCodes.map((c: { cip: string }) => c.cip);
  const { data: socCodes } = await supabase
    .from("cip_soc_xwalk")
    .select("soc, soc_title")
    .in("cip", cipList);

  return (socCodes ?? []) as { soc: string; soc_title: string }[];
}

/* ---------- main job-outlook route ---------- */
router.get("/job-outlook", async (req, res): Promise<void> => {
  const major = (req.query.major as string | undefined)?.trim();
  if (!major || major.length < 2) {
    res.status(400).json({ error: "major query param required (min 2 chars)" });
    return;
  }

  const blsKey = process.env.BLS_API_KEY;
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let socList: { soc: string; title: string }[] = [];

  if (supabaseUrl && supabaseKey) {
    try {
      const rows = await getSocsFromSupabase(major, supabaseUrl, supabaseKey);
      socList = rows.map((r) => ({ soc: r.soc, title: r.soc_title }));
    } catch (err) {
      console.error("Supabase lookup failed, falling back to local crosswalk:", err);
    }
  }

  if (!socList.length) {
    socList = findSocsForMajor(major);
  }

  if (!socList.length) {
    res.json({ jobs: [], source: "local", onet_status: onetStatus });
    return;
  }

  const unique = [...new Map(socList.map((s) => [s.soc, s])).values()].slice(0, 12);

  let baseJobs: Awaited<ReturnType<typeof fetchBLSData>>[];

  if (blsKey) {
    baseJobs = await Promise.all(unique.map((s) => fetchBLSData(s.soc, s.title, blsKey)));
  } else {
    baseJobs = unique.map((s) => ({
      soc: s.soc,
      title: s.title,
      median_wage: getBLSWage(s.soc, s.title),
      growth_pct: getGrowthRate(s.soc),
      employment_level: getBLSEmployment(s.soc),
      annual_openings: Math.floor(getBLSEmployment(s.soc) * 0.042),
      entry_education: getPlaceholderEducation(s.title),
      unemployment_rate: 3.2,
      state_wage_data: null,
    }));
  }

  /* Attach O*NET at-risk skills (parallel fetch; empty if not configured) */
  const jobs = await Promise.all(
    baseJobs.map(async (job) => {
      const atRiskSkills = await fetchOnetSkills(job.soc);
      return { ...job, at_risk_skills: atRiskSkills };
    })
  );

  res.json({ jobs, source: supabaseUrl ? "supabase" : "local", onet_status: onetStatus });
});

export default router;
