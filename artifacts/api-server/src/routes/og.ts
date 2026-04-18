import { Router, type IRouter } from "express";
import sharp from "sharp";
import { getScorecard, SORTED_MAJOR_KEYS, MAJOR_TO_FIELD } from "./skills-gap";

const router: IRouter = Router();

const RISK_COLORS: Record<string, { badge: string }> = {
  Critical: { badge: "#dc2626" },
  High:     { badge: "#ea580c" },
  Moderate: { badge: "#d97706" },
  Low:      { badge: "#16a34a" },
};

function escXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString();
}

function buildSvg(row: Awaited<ReturnType<typeof getScorecard>>[number]): string {
  const accent = (RISK_COLORS[row.gapRisk] ?? RISK_COLORS.Low).badge;
  const growthSign = row.growthPct >= 0 ? "+" : "";
  const gradLoss = row.estimatedAnnualGradLoss.toLocaleString();
  const programsText = row.programsCut === 1 ? "1 program" : `${row.programsCut} programs`;
  const badgeText = `${row.gapRisk} Risk`;

  /* Split long label at word boundary */
  const label = row.label;
  let line1 = label;
  let line2 = "";
  if (label.length > 24) {
    const split = label.lastIndexOf(" ", 24);
    if (split > 0) {
      line1 = label.slice(0, split);
      line2 = label.slice(split + 1);
    }
  }
  const twoLines = line2.length > 0;

  /* Y-coordinates adjust when label wraps to two lines */
  const labelY   = twoLines ? 148 : 160;
  const badgeY   = twoLines ? 240 : 210;
  const dividerY = twoLines ? 302 : 270;
  const stat1Y   = twoLines ? 352 : 320;  /* stat label y */
  const val1Y    = twoLines ? 400 : 368;  /* stat value y */
  const stat2Y   = twoLines ? 448 : 416;  /* 2nd stat label y */
  const val2Y    = twoLines ? 496 : 464;  /* 2nd stat value y */

  /* Badge pill geometry */
  const badgePx   = badgeText.length * 11 + 32;  /* approx width */
  const badgeMidX = 70 + badgePx / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="628" viewBox="0 0 1200 628">
  <!-- Dark background -->
  <rect width="1200" height="628" fill="#1a3352"/>

  <!-- White card -->
  <rect x="40" y="40" width="1120" height="548" rx="20" fill="white"/>

  <!-- Accent stripe at top of card -->
  <rect x="40" y="40" width="1120" height="10" rx="10" fill="${accent}"/>

  <!-- Brand label -->
  <text x="70" y="92" font-family="ui-sans-serif, system-ui, sans-serif" font-size="19"
        fill="#6b7280" font-weight="500" letter-spacing="0.4">CollegeCuts · Skills Gap Intelligence</text>

  <!-- Field name -->
  <text x="70" y="${labelY}" font-family="ui-sans-serif, system-ui, sans-serif"
        font-size="58" fill="#111827" font-weight="800" letter-spacing="-1.5">
    ${twoLines
      ? `<tspan x="70" dy="0">${escXml(line1)}</tspan><tspan x="70" dy="64">${escXml(line2)}</tspan>`
      : escXml(line1)
    }
  </text>

  <!-- Risk badge -->
  <rect x="70" y="${badgeY}" width="${badgePx}" height="38" rx="19" fill="${accent}"/>
  <text x="${badgeMidX}" y="${badgeY + 25}" font-family="ui-sans-serif, system-ui, sans-serif"
        font-size="17" fill="white" font-weight="700" text-anchor="middle">${escXml(badgeText)}</text>

  <!-- Divider line -->
  <line x1="70" y1="${dividerY}" x2="1130" y2="${dividerY}" stroke="#e5e7eb" stroke-width="1.5"/>

  <!-- ── Stats: 2-column grid ───────────────────────────── -->

  <!-- Col 1 Left (x=70) -->
  <text x="70" y="${stat1Y}" font-family="ui-sans-serif, system-ui, sans-serif"
        font-size="13" fill="#9ca3af" font-weight="600" letter-spacing="1.2">PROGRAMS CUT</text>
  <text x="70" y="${val1Y}" font-family="ui-sans-serif, system-ui, sans-serif"
        font-size="46" fill="#111827" font-weight="800">${escXml(programsText)}</text>

  <text x="70" y="${stat2Y}" font-family="ui-sans-serif, system-ui, sans-serif"
        font-size="13" fill="#9ca3af" font-weight="600" letter-spacing="1.2">GRAD LOSS / YEAR</text>
  <text x="70" y="${val2Y}" font-family="ui-sans-serif, system-ui, sans-serif"
        font-size="46" fill="#111827" font-weight="800">~${escXml(gradLoss)}</text>

  <!-- Vertical separator -->
  <line x1="610" y1="${dividerY + 20}" x2="610" y2="${val2Y + 8}" stroke="#e5e7eb" stroke-width="1.5"/>

  <!-- Col 2 Right (x=640) -->
  <text x="640" y="${stat1Y}" font-family="ui-sans-serif, system-ui, sans-serif"
        font-size="13" fill="#9ca3af" font-weight="600" letter-spacing="1.2">JOB DEMAND GROWTH</text>
  <text x="640" y="${val1Y}" font-family="ui-sans-serif, system-ui, sans-serif"
        font-size="46" fill="${accent}" font-weight="800">${escXml(growthSign + row.growthPct + "%")}</text>

  <text x="640" y="${stat2Y}" font-family="ui-sans-serif, system-ui, sans-serif"
        font-size="13" fill="#9ca3af" font-weight="600" letter-spacing="1.2">EMPLOYMENT BASE</text>
  <text x="640" y="${val2Y}" font-family="ui-sans-serif, system-ui, sans-serif"
        font-size="46" fill="#111827" font-weight="800">${escXml(formatNum(row.employmentBase))}</text>

  <!-- Footer -->
  <rect x="40" y="528" width="1120" height="60" rx="0" fill="#f9fafb"/>
  <rect x="40" y="527" width="1120" height="1.5" fill="#e5e7eb"/>
  <rect x="40" y="576" width="1120" height="12" rx="6" fill="#f9fafb"/>
  <text x="70" y="563" font-family="ui-sans-serif, system-ui, sans-serif"
        font-size="16" fill="#9ca3af">
    college-cuts.com/job-outlook · BLS projections &amp; CollegeCuts program cut data
  </text>
</svg>`;
}

const SITE_ORIGIN = "https://college-cuts.com";

/** Escape a string for safe use inside an HTML attribute value */
function escAttr(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Look up a scorecard row by field ID or free-form major search term.
 * Resolution order:
 *   1. Direct field-ID match (e.g. "computer-science", "nursing")
 *   2. Free-form MAJOR_SOC_MAP substring matching (e.g. "Nursing", "computer science")
 */
async function resolveMajorRow(major: string): Promise<Awaited<ReturnType<typeof getScorecard>>[number] | null> {
  const scorecard = await getScorecard();

  /* 1. Try direct field-ID lookup (handles hyphenated IDs from ShareButton) */
  const byId = scorecard.find((r) => r.id === major.trim().toLowerCase());
  if (byId) return byId;

  /* 2. Fall back to free-form major-text matching (same logic as by-major route) */
  const majorLower = major.toLowerCase().trim();
  let fieldId: string | null = null;
  for (const key of SORTED_MAJOR_KEYS) {
    if (majorLower.includes(key) || key.includes(majorLower)) {
      fieldId = MAJOR_TO_FIELD[key] ?? null;
      if (fieldId) break;
    }
  }
  return fieldId ? (scorecard.find((r) => r.id === fieldId) ?? null) : null;
}

/**
 * Return the first MAJOR_TO_FIELD key (free-form text) that maps to the given fieldId.
 * Used to build SPA-compatible redirect URLs like /job-outlook?major=computer+science
 * from a hyphenated field ID like "computer-science".
 */
function fieldIdToSearchKey(fieldId: string): string {
  for (const [key, id] of Object.entries(MAJOR_TO_FIELD)) {
    if (id === fieldId) return key;
  }
  return fieldId; /* fallback — direct ID rarely needed */
}

/**
 * Build a minimal HTML page with fully-server-rendered OG/Twitter meta tags.
 * Human visitors are immediately redirected to the SPA; social crawlers (which
 * do not execute JavaScript) read the meta tags they need for link previews.
 */
function buildShareHtml(row: Awaited<ReturnType<typeof getScorecard>>[number], _rawMajor: string): string {
  const imageUrl = `${SITE_ORIGIN}/api/og/skills-gap/${row.id}`;
  /* Build the redirect URL using a known-good search key so the SPA resolves correctly */
  const searchKey = fieldIdToSearchKey(row.id);
  const pageUrl  = `${SITE_ORIGIN}/job-outlook?major=${encodeURIComponent(searchKey)}`;
  const title = `${row.label} Skills Gap | CollegeCuts`;
  const growthFormatted = `${row.growthPct >= 0 ? "+" : ""}${row.growthPct}%`;
  const description = `${row.programsCut} programs cut since 2024. Job demand growth: ${growthFormatted}. ~${row.estimatedAnnualGradLoss.toLocaleString()} fewer grads entering the pipeline annually. Gap Risk: ${row.gapRisk}.`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escAttr(title)}</title>
  <meta name="description" content="${escAttr(description)}" />

  <!-- Open Graph -->
  <meta property="og:type"        content="website" />
  <meta property="og:site_name"   content="CollegeCuts" />
  <meta property="og:title"       content="${escAttr(title)}" />
  <meta property="og:description" content="${escAttr(description)}" />
  <meta property="og:url"         content="${escAttr(pageUrl)}" />
  <meta property="og:image"       content="${escAttr(imageUrl)}" />
  <meta property="og:image:width"  content="1200" />
  <meta property="og:image:height" content="628" />

  <!-- Twitter Card -->
  <meta name="twitter:card"        content="summary_large_image" />
  <meta name="twitter:title"       content="${escAttr(title)}" />
  <meta name="twitter:description" content="${escAttr(description)}" />
  <meta name="twitter:image"       content="${escAttr(imageUrl)}" />

  <!-- Redirect human visitors to the SPA immediately -->
  <meta http-equiv="refresh" content="0; url=${escAttr(pageUrl)}" />
  <script>window.location.replace(${JSON.stringify(pageUrl)});</script>
</head>
<body>
  <p>Redirecting to <a href="${escAttr(pageUrl)}">${escAttr(pageUrl)}</a>&hellip;</p>
</body>
</html>`;
}

/**
 * Known social-media crawler User-Agent substrings.
 * These bots parse raw HTML and do not execute JavaScript.
 */
const CRAWLER_UA_PATTERNS = [
  "facebookexternalhit",
  "facebot",
  "twitterbot",
  "linkedinbot",
  "slackbot",
  "discordbot",
  "whatsapp",
  "telegrambot",
  "pinterest",
  "googlebot",
  "bingbot",
  "applebot",
  "iframely",
  "embedly",
];

export function isSocialCrawler(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  return CRAWLER_UA_PATTERNS.some((p) => ua.includes(p));
}

export { resolveMajorRow, buildShareHtml };

/**
 * GET /api/og/share?major=nursing
 * Returns a server-rendered HTML page with OG/Twitter meta tags.
 * Social crawlers read the tags; human visitors are instantly redirected to the SPA.
 */
router.get("/og/share", async (req, res): Promise<void> => {
  const major = typeof req.query.major === "string" ? req.query.major.trim() : "";
  if (!major) {
    res.redirect(302, `${SITE_ORIGIN}/job-outlook`);
    return;
  }
  try {
    const row = await resolveMajorRow(major);
    if (!row) {
      /* Unknown major — redirect straight to the SPA with the param */
      res.redirect(302, `${SITE_ORIGIN}/job-outlook?major=${encodeURIComponent(major)}`);
      return;
    }
    const html = buildShareHtml(row, major);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=60");
    res.send(html);
  } catch (err) {
    console.error("[og] share page error:", err);
    res.redirect(302, `${SITE_ORIGIN}/job-outlook?major=${encodeURIComponent(major)}`);
  }
});

/* GET /api/og/skills-gap/:fieldId — returns a styled 1200×628 PNG card */
router.get("/og/skills-gap/:fieldId", async (req, res): Promise<void> => {
  const { fieldId } = req.params;
  try {
    const scorecard = await getScorecard();
    const row = scorecard.find((r) => r.id === fieldId);
    if (!row) {
      res.status(404).json({ error: "Field not found" });
      return;
    }

    const svg = buildSvg(row);
    const png = await sharp(Buffer.from(svg)).png().toBuffer();

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=600, stale-while-revalidate=300");
    res.send(png);
  } catch (err) {
    console.error("[og] skills-gap card error:", err);
    res.status(500).json({ error: "Failed to generate OG image" });
  }
});

export default router;
