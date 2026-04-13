import { Router, type IRouter } from "express";
import { supabase } from "../lib/supabase";

const router: IRouter = Router();

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

    const { data: existing } = await supabase
      .from("talent_profiles")
      .select("id")
      .eq("email", email)
      .limit(1);

    if (existing && existing.length > 0) {
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

    const { error } = await supabase.from("talent_profiles").insert({
      name: body.name.trim(),
      email,
      institution: body.institution.trim(),
      institution_slug,
      department: body.department?.trim() || null,
      role_title: body.role_title.trim(),
      degree_level: body.degree_level || null,
      years_experience: body.years_experience ? Number(body.years_experience) : null,
      specializations,
      open_to,
      state: body.state || null,
      linkedin_url: body.linkedin_url?.trim() || null,
      bio: body.bio?.trim() || null,
      visible: body.visible !== false,
    });

    if (error) {
      console.error("[talent] insert error:", error.message);
      res.status(500).json({ error: "Failed to save profile. Please try again." });
      return;
    }

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

    let query = supabase
      .from("talent_profiles")
      .select("id, name, institution, institution_slug, department, role_title, degree_level, years_experience, specializations, open_to, state, linkedin_url, bio, created_at")
      .eq("visible", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (state) query = query.eq("state", String(state));
    if (institution_slug) query = query.eq("institution_slug", String(institution_slug));

    const { data, error } = await query;
    if (error) throw error;

    res.json(data ?? []);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/talent/stats", async (_req, res): Promise<void> => {
  try {
    const { count, error } = await supabase
      .from("talent_profiles")
      .select("*", { count: "exact", head: true })
      .eq("visible", true);

    if (error) throw error;
    res.json({ count: count ?? 0 });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
