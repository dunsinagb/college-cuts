import { Router, type IRouter } from "express";
import { createClient } from "@supabase/supabase-js";
import { ROLE_CATEGORIES, getRolesByIds, mapProgramToRoles } from "../lib/skills-taxonomy";

const router: IRouter = Router();

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return createClient(url, key);
}

type RiskLevel = "low" | "medium" | "high" | "critical";

function computeRiskLevel(cutCount: number): RiskLevel {
  if (cutCount === 0) return "low";
  if (cutCount <= 2) return "medium";
  if (cutCount <= 5) return "high";
  return "critical";
}

function estimatePipelineImpact(cutCount: number): number {
  return cutCount * 45;
}

router.get("/intelligence/roles", (_req, res): void => {
  res.json(
    ROLE_CATEGORIES.map((r) => ({
      id: r.id,
      name: r.name,
      sector: r.sector,
      corporateTitles: r.corporateTitles.slice(0, 3),
    }))
  );
});

router.post("/intelligence/risks", async (req, res): Promise<void> => {
  try {
    const { roleIds, states } = req.body as { roleIds: string[]; states?: string[] };

    if (!Array.isArray(roleIds) || roleIds.length === 0) {
      res.status(400).json({ error: "roleIds array is required" });
      return;
    }

    const supabase = getSupabase();
    const cutsSince = new Date();
    cutsSince.setMonth(cutsSince.getMonth() - 12);

    let query = supabase
      .from("cuts")
      .select("id, institution, program_name, state, cut_type, announcement_date, students_affected, faculty_affected, source_url, source_publication, notes, status")
      .neq("status", "reversed")
      .gte("announcement_date", cutsSince.toISOString().slice(0, 10));

    if (states && states.length > 0) {
      query = query.in("state", states);
    }

    const { data: cuts, error } = await query;
    if (error) throw error;

    const roles = getRolesByIds(roleIds);
    const results = roles.map((role) => {
      const matchingCuts = (cuts ?? []).filter((cut) => {
        const matched = mapProgramToRoles(cut.program_name ?? "", cut.notes ?? "");
        return matched.some((r) => r.id === role.id);
      });

      const stateBreakdown: Record<string, number> = {};
      for (const cut of matchingCuts) {
        stateBreakdown[cut.state] = (stateBreakdown[cut.state] ?? 0) + 1;
      }

      const topStates = Object.entries(stateBreakdown)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([state, count]) => ({ state, count }));

      const cutCount = matchingCuts.length;
      const riskLevel = computeRiskLevel(cutCount);
      const estimatedImpact = estimatePipelineImpact(cutCount);
      const recentCuts = matchingCuts.slice(0, 5).map((c) => ({
        id: c.id,
        institution: c.institution,
        program: c.program_name,
        state: c.state,
        cutType: c.cut_type,
        date: c.announcement_date,
        facultyAffected: c.faculty_affected,
        sourceUrl: c.source_url,
        sourcePublication: c.source_publication,
      }));

      return {
        roleId: role.id,
        roleName: role.name,
        sector: role.sector,
        corporateTitles: role.corporateTitles,
        onetCodes: role.onetCodes,
        cutCount,
        riskLevel,
        estimatedImpact,
        topStates,
        recentCuts,
      };
    });

    results.sort((a, b) => {
      const order = { critical: 0, high: 1, medium: 2, low: 3 };
      return order[a.riskLevel] - order[b.riskLevel];
    });

    res.json({ results, generatedAt: new Date().toISOString(), dataWindow: "12 months", geography: states && states.length > 0 ? states : "National" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/intelligence/recent-disruptions", async (req, res): Promise<void> => {
  try {
    const supabase = getSupabase();
    const cutsSince = new Date();
    cutsSince.setDate(cutsSince.getDate() - 30);

    const { data: cuts, error } = await supabase
      .from("cuts")
      .select("id, institution, program_name, state, cut_type, announcement_date, faculty_affected, source_url, source_publication, notes")
      .neq("status", "reversed")
      .gte("announcement_date", cutsSince.toISOString().slice(0, 10))
      .order("announcement_date", { ascending: false })
      .limit(20);

    if (error) throw error;

    const enriched = (cuts ?? []).map((cut) => {
      const roles = mapProgramToRoles(cut.program_name ?? "", cut.notes ?? "");
      return {
        id: cut.id,
        institution: cut.institution,
        program: cut.program_name,
        state: cut.state,
        cutType: cut.cut_type,
        date: cut.announcement_date,
        facultyAffected: cut.faculty_affected,
        sourceUrl: cut.source_url,
        sourcePublication: cut.source_publication,
        mappedRoles: roles.map((r) => ({ id: r.id, name: r.name, corporateTitles: r.corporateTitles.slice(0, 2) })),
      };
    });

    res.json(enriched);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/intelligence/employer", async (req, res): Promise<void> => {
  try {
    const body = req.body as Record<string, any>;

    if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      res.status(400).json({ error: "Valid email is required" }); return;
    }
    if (!body.company?.trim()) { res.status(400).json({ error: "Company name is required" }); return; }
    if (!body.industry) { res.status(400).json({ error: "Industry is required" }); return; }

    const supabase = getSupabase();
    const email = body.email.trim().toLowerCase();

    const record = {
      email,
      company: body.company.trim(),
      industry: body.industry,
      size: body.size || null,
      states: Array.isArray(body.states) ? body.states : [],
      role_ids: Array.isArray(body.roleIds) ? body.roleIds : [],
      alert_frequency: body.alertFrequency || "realtime",
      risk_threshold: body.riskThreshold || "medium",
      tier: body.tier || "free",
      updated_at: new Date().toISOString(),
    };

    const { data: existing } = await supabase
      .from("employer_profiles")
      .select("id")
      .eq("email", email)
      .limit(1);

    if (existing && existing.length > 0) {
      const { error } = await supabase
        .from("employer_profiles")
        .update(record)
        .eq("email", email);
      if (error) throw error;
      res.json({ ok: true, action: "updated" });
    } else {
      const { error } = await supabase
        .from("employer_profiles")
        .insert(record);
      if (error) throw error;
      res.json({ ok: true, action: "created" });
    }
  } catch (err: any) {
    console.error("[intelligence] employer save error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get("/intelligence/employer/:email", async (req, res): Promise<void> => {
  try {
    const email = decodeURIComponent(req.params.email).toLowerCase();
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("employer_profiles")
      .select("*")
      .eq("email", email)
      .limit(1)
      .single();

    if (error && error.code === "PGRST116") {
      res.status(404).json({ error: "Profile not found" }); return;
    }
    if (error) throw error;

    res.json({
      email: data.email,
      company: data.company,
      industry: data.industry,
      size: data.size,
      states: data.states,
      roleIds: data.role_ids,
      alertFrequency: data.alert_frequency,
      riskThreshold: data.risk_threshold,
      tier: data.tier,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
