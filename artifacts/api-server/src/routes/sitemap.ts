import { Router } from "express";
import { supabase } from "../lib/supabase";

const router = Router();
const SITE_URL = (process.env.SITE_URL || "https://college-cuts.com").replace(/\/$/, "");

function slugify(name: string): string {
  return name.toLowerCase().replace(/'/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

router.get("/sitemap.xml", async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from("v_latest_cuts")
      .select("id, institution, announcement_date")
      .order("announcement_date", { ascending: false });

    if (error) throw error;
    const rows = data ?? [];

    const seen = new Set<string>();
    const institutionUrls: string[] = [];
    for (const row of rows) {
      const slug = slugify(row.institution);
      if (!seen.has(slug)) {
        seen.add(slug);
        const lastmod = row.announcement_date ? row.announcement_date.slice(0, 10) : "";
        institutionUrls.push(`  <url>
    <loc>${SITE_URL}/institution/${slug}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""}
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`);
      }
    }

    const cutUrls = rows.map((row: any) => {
      const lastmod = row.announcement_date ? row.announcement_date.slice(0, 10) : "";
      return `  <url>
    <loc>${SITE_URL}/cuts/${row.id}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""}
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
    }).join("\n");

    const staticUrls = ["/", "/news", "/intelligence", "/talent", "/subscribe", "/about", "/submit-tip"].map(p => `  <url>
    <loc>${SITE_URL}${p}</loc>
    <changefreq>${p === "/news" || p === "/" ? "daily" : "weekly"}</changefreq>
    <priority>${p === "/" ? "1.0" : p === "/news" || p === "/intelligence" || p === "/talent" ? "0.8" : "0.5"}</priority>
  </url>`).join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}
${institutionUrls.join("\n")}
${cutUrls}
</urlset>`;

    res.set("Content-Type", "application/xml");
    res.set("Cache-Control", "public, max-age=3600");
    res.send(xml);
  } catch (err) {
    console.error("[sitemap] Error:", err);
    res.status(500).set("Content-Type", "text/plain").send("Error generating sitemap");
  }
});

router.get("/news-sitemap.xml", async (_req, res) => {
  try {
    const since48h = new Date(Date.now() - 48 * 3600000).toISOString().slice(0, 10);
    const since14d = new Date(Date.now() - 14 * 24 * 3600000).toISOString().slice(0, 10);

    let { data, error } = await supabase
      .from("v_latest_cuts")
      .select("id, institution, program_name, announcement_date, created_at")
      .gte("announcement_date", since48h)
      .order("announcement_date", { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) {
      const fallback = await supabase
        .from("v_latest_cuts")
        .select("id, institution, program_name, announcement_date, created_at")
        .gte("announcement_date", since14d)
        .order("announcement_date", { ascending: false })
        .limit(20);
      if (fallback.error) throw fallback.error;
      data = fallback.data ?? [];
    }

    const rows = data ?? [];

    const urls = rows.map((row: any) => {
      const pubDate = row.announcement_date
        ? new Date(row.announcement_date).toISOString()
        : new Date().toISOString();
      const title = row.program_name && row.program_name !== row.institution
        ? `${row.institution} — ${row.program_name}`
        : `${row.institution} Program Cuts & Layoffs`;
      return `  <url>
    <loc>${SITE_URL}/institution/${slugify(row.institution)}</loc>
    <news:news>
      <news:publication>
        <news:name>CollegeCuts Tracker</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</news:title>
    </news:news>
  </url>`;
    }).join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls}
</urlset>`;

    res.set("Content-Type", "application/xml");
    res.set("Cache-Control", "public, max-age=900");
    res.send(xml);
  } catch (err) {
    console.error("[news-sitemap] Error:", err);
    res.status(500).set("Content-Type", "text/plain").send("Error generating news sitemap");
  }
});

export default router;
