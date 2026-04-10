import { Router, type IRouter } from "express";
import { supabase } from "../lib/supabase";

const router: IRouter = Router();

const SITE_URL = (process.env.SITE_URL || "https://college-cuts.replit.app").replace(/\/$/, "");

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatRfc822(dateStr: string | null): string {
  if (!dateStr) return new Date().toUTCString();
  return new Date(dateStr).toUTCString();
}

router.get("/rss", async (req, res): Promise<void> => {
  const { state, institution, type } = req.query as Record<string, string | undefined>;

  // Normalize type to snake_case enum value (accept both "Staff Layoff" and "staff_layoff")
  const normalizedType = type
    ? type.trim().toLowerCase().replace(/[\s-]+/g, "_")
    : undefined;

  let query = supabase
    .from("v_latest_cuts")
    .select("id, institution, program_name, cut_type, announcement_date, state, source_url, notes")
    .gte("announcement_date", "2024-01-01")
    .order("announcement_date", { ascending: false })
    .limit(50);

  if (state)          query = query.eq("state", state.toUpperCase());
  if (normalizedType) query = query.eq("cut_type", normalizedType);
  if (institution)    query = query.ilike("institution", `%${institution}%`);

  const { data, error } = await query;

  if (error) {
    console.error("[RSS] Supabase error:", error.message);
    res.status(500).send("Internal server error");
    return;
  }

  const rows = (data ?? []) as {
    id: string;
    institution: string;
    program_name: string | null;
    cut_type: string;
    announcement_date: string | null;
    state: string;
    source_url: string | null;
    notes: string | null;
  }[];

  const humanType = normalizedType
    ? normalizedType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : undefined;

  const filterParts: string[] = [];
  if (state)       filterParts.push(`State: ${state.toUpperCase()}`);
  if (institution) filterParts.push(`Institution: ${institution}`);
  if (humanType)   filterParts.push(`Type: ${humanType}`);
  const filterDesc = filterParts.length ? ` — filtered by ${filterParts.join(", ")}` : "";

  const rawParams = new URLSearchParams();
  if (state) rawParams.set("state", state);
  if (type) rawParams.set("type", type);
  if (institution) rawParams.set("institution", institution);
  const rawQs = rawParams.toString() ? `?${rawParams.toString()}` : "";
  const selfUrl = `${SITE_URL}/api/rss${rawQs}`;

  const items = rows.map((row) => {
    const link = `${SITE_URL}/cuts/${row.id}`;
    const title = row.program_name
      ? `${escapeXml(row.institution)} — ${escapeXml(row.program_name)}`
      : escapeXml(row.institution);
    const cutTypeLabel = escapeXml(
      row.cut_type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    );
    const description = [
      `<strong>${cutTypeLabel}</strong>`,
      `State: ${escapeXml(row.state)}`,
      row.announcement_date ? `Date: ${row.announcement_date}` : null,
      row.notes ? `Notes: ${escapeXml(row.notes.slice(0, 200))}${row.notes.length > 200 ? "…" : ""}` : null,
    ]
      .filter(Boolean)
      .join(" | ");

    return `    <item>
      <title>${title}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <description>${description}</description>
      <pubDate>${formatRfc822(row.announcement_date)}</pubDate>
      <category>${cutTypeLabel}</category>
      <source url="${escapeXml(`${SITE_URL}/api/rss`)}">CollegeCuts</source>
    </item>`;
  }).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>CollegeCuts — Higher Education Actions${filterDesc ? escapeXml(filterDesc) : ""}</title>
    <link>${escapeXml(SITE_URL)}</link>
    <description>Tracking program cuts, department suspensions, institution closures, and faculty layoffs across US colleges and universities since 2024.${filterDesc ? escapeXml(filterDesc) : ""}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(selfUrl)}" rel="self" type="application/rss+xml"/>
    <image>
      <url>${escapeXml(SITE_URL)}/favicon.svg</url>
      <title>CollegeCuts</title>
      <link>${escapeXml(SITE_URL)}</link>
    </image>
${items}
  </channel>
</rss>`;

  res.setHeader("Content-Type", "application/rss+xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=900");
  res.send(xml);
});

export default router;
