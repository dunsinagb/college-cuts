import { Router, type IRouter } from "express";
import { Pool } from "pg";

const router: IRouter = Router();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function slugify(name: string): string {
  return name.toLowerCase().replace(/'/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

router.post("/talent/register", async (req, res): Promise<void> => {
  try {
    const body = req.body as Record<string, any>;

    if (!body.name?.trim()) { res.status(400).json({ error: "Name is required" }); return; }
    if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      res.status(400).json({ error: "Valid email is required" }); return;
    }
    if (!body.institution?.trim()) { res.status(400).json({ error: "Institution is required" }); return; }
    if (!body.role_title?.trim()) { res.status(400).json({ error: "Role title is required" }); return; }

    const email = body.email.trim().toLowerCase();
    const { rows: existing } = await pool.query(
      "SELECT id FROM talent_profiles WHERE email = $1 LIMIT 1",
      [email]
    );

    if (existing.length > 0) {
      res.json({ ok: true, duplicate: true, message: "A profile with this email already exists." });
      return;
    }

    const specializations = Array.isArray(body.specializations)
      ? body.specializations.filter(Boolean)
      : (typeof body.specializations === "string"
          ? body.specializations.split(",").map((s: string) => s.trim()).filter(Boolean)
          : []);

    const open_to = Array.isArray(body.open_to) ? body.open_to.filter(Boolean) : [];
    const institution_slug = body.institution_slug || slugify(body.institution.trim());

    await pool.query(
      `INSERT INTO talent_profiles
        (name, email, institution, institution_slug, department, role_title,
         degree_level, years_experience, specializations, open_to, state,
         linkedin_url, bio, visible)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
      [
        body.name.trim(),
        email,
        body.institution.trim(),
        institution_slug,
        body.department?.trim() || null,
        body.role_title.trim(),
        body.degree_level || null,
        body.years_experience ? Number(body.years_experience) : null,
        specializations,
        open_to,
        body.state || null,
        body.linkedin_url?.trim() || null,
        body.bio?.trim() || null,
        body.visible !== false,
      ]
    );

    res.json({ ok: true });
  } catch (err: any) {
    console.error("[talent] register error:", err.message);
    res.status(500).json({ error: "Failed to save profile. Please try again." });
  }
});

router.get("/talent", async (req, res): Promise<void> => {
  try {
    const { state, institution_slug, limit: limitParam } = req.query;
    const limit = Math.min(Number(limitParam) || 50, 100);

    let sql = `SELECT id, name, institution, institution_slug, department, role_title,
      degree_level, years_experience, specializations, open_to, state,
      linkedin_url, bio, created_at
      FROM talent_profiles WHERE visible = TRUE`;
    const params: any[] = [];

    if (state) { params.push(state); sql += ` AND state = $${params.length}`; }
    if (institution_slug) { params.push(institution_slug); sql += ` AND institution_slug = $${params.length}`; }

    params.push(limit);
    sql += ` ORDER BY created_at DESC LIMIT $${params.length}`;

    const { rows } = await pool.query(sql, params);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/talent/stats", async (_req, res): Promise<void> => {
  try {
    const { rows } = await pool.query(
      "SELECT COUNT(*) as count FROM talent_profiles WHERE visible = TRUE"
    );
    res.json({ count: Number(rows[0]?.count ?? 0) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
