import { Router } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

const SITE_URL = (process.env.SITE_URL || "https://college-cuts.com").replace(/\/$/, "");

router.get("/sitemap.xml", async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from("v_latest_cuts")
      .select("id, announcement_date")
      .order("announcement_date", { ascending: false });

    if (error) throw error;

    const rows = data ?? [];

    const urls = rows
      .map((row: { id: string; announcement_date: string | null }) => {
        const lastmod = row.announcement_date
          ? row.announcement_date.slice(0, 10)
          : "";
        return `  <url>
    <loc>${SITE_URL}/cuts/${row.id}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""}
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
      })
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

    res.set("Content-Type", "application/xml");
    res.set("Cache-Control", "public, max-age=3600");
    res.send(xml);
  } catch (err) {
    console.error("[sitemap] Error generating sitemap:", err);
    res.status(500).set("Content-Type", "text/plain").send("Error generating sitemap");
  }
});

export default router;
