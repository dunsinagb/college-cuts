import { Router, type IRouter } from "express";
import { supabase } from "../lib/supabase";
import { MAJOR_SOC_MAP, getGrowthRate, BLS_2024_EMPLOYMENT } from "../lib/bls-crosswalk";
import { logger } from "../lib/logger";
import { readScorecardCache, writeScorecardCache } from "../lib/cache-persist";

const router: IRouter = Router();

/* ────────────────────────────────────────────────────────────────
   Bridge: MAJOR_SOC_MAP key → field category ID
   Using the canonical major→SOC crosswalk as the classification
   bridge between program cuts and labor-market impact data.
   ──────────────────────────────────────────────────────────────── */
const MAJOR_TO_FIELD: Record<string, string> = {
  "computer science":     "computer-science",
  "information technology": "computer-science",
  "data science":         "data-science",
  "statistics":           "data-science",
  "mathematics":          "data-science",
  "nursing":              "nursing",
  "healthcare":           "nursing",
  "medicine":             "healthcare-admin",
  "public health":        "healthcare-admin",
  "physical therapy":     "physical-therapy",
  "occupational therapy": "physical-therapy",
  "biology":              "biology-life-sciences",
  "chemistry":            "biology-life-sciences",
  "physics":              "biology-life-sciences",
  "engineering":          "engineering",
  "mechanical engineering": "engineering",
  "civil engineering":    "engineering",
  "electrical engineering": "engineering",
  "architecture":         "engineering",
  "business administration": "business",
  "business":             "business",
  "economics":            "finance-accounting",
  "finance":              "finance-accounting",
  "accounting":           "finance-accounting",
  "psychology":           "mental-health",
  "social work":          "mental-health",
  "education":            "education",
  "english":              "arts-humanities",
  "communications":       "arts-humanities",
  "journalism":           "arts-humanities",
  "art":                  "arts-humanities",
  "graphic design":       "arts-humanities",
  "music":                "arts-humanities",
  "theater":              "arts-humanities",
  "film":                 "arts-humanities",
  "history":              "social-sciences",
  "political science":    "social-sciences",
  "philosophy":           "social-sciences",
  "sociology":            "social-sciences",
  "anthropology":         "social-sciences",
  "social science":       "social-sciences",
  "law":                  "criminal-justice",
  "criminal justice":     "criminal-justice",
  "environmental science": "environmental-science",
};

/* ── Display properties for each field category ── */
interface FieldDisplay {
  id: string;
  label: string;
  /** Primary SOC code — drives getGrowthRate() and employment base lookup */
  primarySoc: string;
  /** Average graduates produced per cut program per year (BLS/IPEDS typical) */
  avgGradsPerProgram: number;
}

const FIELD_DISPLAY: FieldDisplay[] = [
  { id: "nursing",             label: "Nursing",                       primarySoc: "29-1141", avgGradsPerProgram: 40 },
  { id: "computer-science",   label: "Computer Science & IT",          primarySoc: "15-1251", avgGradsPerProgram: 85 },
  { id: "data-science",       label: "Data Science & Analytics",       primarySoc: "15-2051", avgGradsPerProgram: 45 },
  { id: "healthcare-admin",   label: "Healthcare Administration",      primarySoc: "29-1071", avgGradsPerProgram: 50 },
  { id: "physical-therapy",   label: "Physical & Occupational Therapy",primarySoc: "29-1123", avgGradsPerProgram: 30 },
  { id: "biology-life-sciences", label: "Biology & Life Sciences",     primarySoc: "19-1042", avgGradsPerProgram: 45 },
  { id: "engineering",        label: "Engineering",                    primarySoc: "17-2141", avgGradsPerProgram: 70 },
  { id: "business",           label: "Business & Management",          primarySoc: "11-1021", avgGradsPerProgram: 90 },
  { id: "finance-accounting", label: "Finance & Accounting",           primarySoc: "13-2011", avgGradsPerProgram: 65 },
  { id: "mental-health",      label: "Mental Health & Counseling",     primarySoc: "21-1014", avgGradsPerProgram: 35 },
  { id: "education",          label: "Education & Teaching",           primarySoc: "25-2021", avgGradsPerProgram: 50 },
  { id: "arts-humanities",    label: "Arts & Humanities",              primarySoc: "27-3043", avgGradsPerProgram: 30 },
  { id: "social-sciences",    label: "Social Sciences",                primarySoc: "19-3041", avgGradsPerProgram: 35 },
  { id: "criminal-justice",   label: "Criminal Justice & Law",         primarySoc: "33-3051", avgGradsPerProgram: 40 },
  { id: "environmental-science", label: "Environmental Science",       primarySoc: "19-2041", avgGradsPerProgram: 35 },
];

/* ── All MAJOR_SOC_MAP keys sorted longest-first for greedy substring matching ── */
export const SORTED_MAJOR_KEYS = Object.keys(MAJOR_SOC_MAP).sort((a, b) => b.length - a.length);
export { MAJOR_TO_FIELD };

/**
 * Given a cut's program_name (and optional notes), return the field category ID
 * by checking the canonical MAJOR_SOC_MAP keys in order (longest first to avoid
 * "art" matching inside "martial arts" etc.).
 */
function classifyCut(programName: string | null, notes: string | null): string | null {
  const text = `${programName ?? ""} ${notes ?? ""}`.toLowerCase();
  for (const key of SORTED_MAJOR_KEYS) {
    if (text.includes(key)) {
      return MAJOR_TO_FIELD[key] ?? null;
    }
  }
  return null;
}

/* ── In-memory scorecard cache (5-min TTL, pre-warmed at startup) ── */
const CACHE_TTL_MS = 5 * 60 * 1000;

/** Seeded immediately from disk so cold-start requests never hit Supabase first. */
let scorecardCache: { data: ScorecardRow[]; timestamp: number } | null = readScorecardCache();

export interface ScorecardRow {
  id: string;
  label: string;
  programsCut: number;
  growthPct: number;
  employmentBase: number;
  gapScore: number;
  gapRisk: "Low" | "Moderate" | "High" | "Critical";
  estimatedAnnualGradLoss: number;
  primarySoc: string;
  shareText: string;
}

function computeGapRisk(score: number, maxScore: number): "Low" | "Moderate" | "High" | "Critical" {
  if (maxScore === 0 || score === 0) return "Low";
  const pct = score / maxScore;
  if (pct >= 0.75) return "Critical";
  if (pct >= 0.50) return "High";
  if (pct >= 0.25) return "Moderate";
  return "Low";
}

async function buildScorecard(): Promise<ScorecardRow[]> {
  const { data: cuts, error } = await supabase
    .from("v_latest_cuts")
    .select("program_name, notes")
    .gte("announcement_date", "2024-01-01");

  if (error) throw new Error(error.message);

  /* Count cuts per field using MAJOR_SOC_MAP as the bridge */
  const cutCounts: Record<string, number> = {};
  for (const cut of (cuts ?? []) as { program_name: string | null; notes: string | null }[]) {
    const fieldId = classifyCut(cut.program_name, cut.notes);
    if (fieldId) {
      cutCounts[fieldId] = (cutCounts[fieldId] ?? 0) + 1;
    }
  }

  const rows: ScorecardRow[] = FIELD_DISPLAY.map((field) => {
    const programsCut = cutCounts[field.id] ?? 0;

    /* Growth rate and employment base come from shared BLS crosswalk */
    const growthPct = getGrowthRate(field.primarySoc);
    const employmentBase = BLS_2024_EMPLOYMENT[field.primarySoc] ?? 500000;

    /* Gap score: cuts × (growth% / 100) × log10(employment) */
    const gapScore = programsCut > 0
      ? Math.round(programsCut * (growthPct / 100) * Math.log10(employmentBase) * 100) / 100
      : 0;

    const estimatedAnnualGradLoss = programsCut * field.avgGradsPerProgram;

    const shareText = programsCut > 0
      ? `${programsCut} ${field.label.toLowerCase()} programs cut or suspended since 2024. At ~${field.avgGradsPerProgram} graduates per program, that's an estimated ~${estimatedAnnualGradLoss.toLocaleString()} fewer graduates entering the pipeline annually, against +${growthPct}% projected job demand growth. ${employmentBase.toLocaleString()} workers currently employed nationwide. college-cuts.com/job-outlook?major=${field.id}`
      : `${field.label}: +${growthPct}% projected job demand growth. ${employmentBase.toLocaleString()} workers currently employed nationwide. college-cuts.com/job-outlook?major=${field.id}`;

    return {
      id: field.id,
      label: field.label,
      programsCut,
      growthPct,
      employmentBase,
      gapScore,
      gapRisk: "Low" as const,
      estimatedAnnualGradLoss,
      primarySoc: field.primarySoc,
      shareText,
    };
  });

  /* Normalize and assign risk tiers */
  const maxScore = Math.max(...rows.map((r) => r.gapScore), 1);
  rows.forEach((r) => {
    r.gapRisk = computeGapRisk(r.gapScore, maxScore);
  });

  rows.sort((a, b) => b.gapScore - a.gapScore);
  return rows;
}

export async function getScorecard(): Promise<ScorecardRow[]> {
  const now = Date.now();
  if (scorecardCache && now - scorecardCache.timestamp < CACHE_TTL_MS) {
    return scorecardCache.data;
  }
  try {
    const scorecard = await buildScorecard();
    scorecardCache = { data: scorecard, timestamp: now };
    return scorecard;
  } catch (err) {
    if (scorecardCache) {
      logger.warn({ err }, "[skills-gap] Supabase unavailable — returning stale cache");
      return scorecardCache.data;
    }
    throw err;
  }
}

/**
 * Rebuild the scorecard cache immediately. Throws on Supabase/build failure.
 * Returns the new cachedAt timestamp.
 */
async function refreshScorecardCache(): Promise<number> {
  const scorecard = await buildScorecard();
  const timestamp = Date.now();
  const entry = { data: scorecard, timestamp };
  scorecardCache = entry;
  writeScorecardCache(entry);
  logger.info(`[skills-gap] Cache refreshed — ${scorecard.length} rows`);
  return timestamp;
}

/**
 * Pre-warm the scorecard cache. Safe to call at startup and on a background
 * interval — errors are caught and logged so they never crash the server.
 */
export async function warmScorecardCache(): Promise<void> {
  try {
    await refreshScorecardCache();
  } catch (err) {
    logger.error({ err }, "[skills-gap] Background warm failed");
  }
}

/* GET /api/skills-gap — full ranked scorecard */
router.get("/skills-gap", async (_req, res): Promise<void> => {
  try {
    const now = Date.now();
    const wasInCache = !!(scorecardCache && now - scorecardCache.timestamp < CACHE_TTL_MS);
    const scorecard = await getScorecard();
    const cachedAt = scorecardCache?.timestamp ?? null;
    res.json({ scorecard, cached: wasInCache, cachedAt });
  } catch (err) {
    console.error("[skills-gap] Error:", err);
    res.status(500).json({ error: "Failed to build skills gap scorecard" });
  }
});

/* GET /api/skills-gap/cache-status — cache freshness metadata */
router.get("/skills-gap/cache-status", (_req, res): void => {
  if (!scorecardCache) {
    res.json({ cachedAt: null, ageSeconds: null, rowCount: 0 });
    return;
  }
  const ageSeconds = Math.floor((Date.now() - scorecardCache.timestamp) / 1000);
  res.json({
    cachedAt: scorecardCache.timestamp,
    ageSeconds,
    rowCount: scorecardCache.data.length,
  });
});

/* POST /api/skills-gap/refresh — admin-only immediate cache refresh */
router.post("/skills-gap/refresh", async (req, res): Promise<void> => {
  const adminKey = process.env.ADMIN_API_KEY;
  const rawHeader = req.headers["x-admin-key"];
  const provided = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;
  if (!adminKey || provided !== adminKey) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const cachedAt = await refreshScorecardCache();
    res.json({ cachedAt });
  } catch (err) {
    logger.error({ err }, "[skills-gap] Manual refresh failed");
    res.status(500).json({ error: "Refresh failed" });
  }
});

/* GET /api/skills-gap/by-major/:major
   Maps a major search term to the closest field via MAJOR_SOC_MAP keys,
   then returns the matching scorecard row — used by the Talent Impact panel. */
router.get("/skills-gap/by-major/:major", async (req, res): Promise<void> => {
  const { major } = req.params;
  const majorLower = major.toLowerCase().trim();

  try {
    const scorecard = await getScorecard();

    /* Use the same MAJOR_SOC_MAP key matching as classifyCut() */
    let fieldId: string | null = null;
    for (const key of SORTED_MAJOR_KEYS) {
      if (majorLower.includes(key) || key.includes(majorLower)) {
        fieldId = MAJOR_TO_FIELD[key] ?? null;
        if (fieldId) break;
      }
    }

    const match = fieldId ? (scorecard.find((r) => r.id === fieldId) ?? null) : null;
    res.json({ match });
  } catch (err) {
    console.error("[skills-gap] by-major error:", err);
    res.status(500).json({ error: "Failed to map major" });
  }
});

/* GET /api/skills-gap/:fieldId — single field detail */
router.get("/skills-gap/:fieldId", async (req, res): Promise<void> => {
  const { fieldId } = req.params;
  try {
    const scorecard = await getScorecard();
    const row = scorecard.find((r) => r.id === fieldId);
    if (!row) { res.status(404).json({ error: "Field not found" }); return; }
    res.json(row);
  } catch (err) {
    console.error("[skills-gap] field detail error:", err);
    res.status(500).json({ error: "Failed to fetch field" });
  }
});

export default router;
