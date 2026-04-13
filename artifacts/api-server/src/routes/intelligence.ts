import { Router, type IRouter } from "express";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
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

      if (process.env.RESEND_API_KEY) {
        try {
          const resend = new Resend(process.env.RESEND_API_KEY);
          await resend.emails.send({
            from: "CollegeCuts Intelligence <hello@college-cuts.com>",
            to: [email],
            subject: `Welcome to CollegeCuts Intelligence, ${body.company.trim()}`,
            html: `
              <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1e293b;">
                <div style="background:#1e3a5f;padding:28px 32px;border-radius:8px 8px 0 0;">
                  <h1 style="margin:0;font-size:22px;color:#fff;">CollegeCuts <span style="color:#fbbf24;">Intelligence</span></h1>
                </div>
                <div style="padding:28px 32px;border:1px solid #e2e8f0;border-top:0;border-radius:0 0 8px 8px;">
                  <p style="margin-top:0;">Hi ${body.company.trim()} team,</p>
                  <p>You're now set up with your <strong>Skills Gap Intelligence</strong> dashboard. Here's a quick summary of your pipeline risk configuration:</p>
                  <table style="width:100%;border-collapse:collapse;font-size:14px;margin:16px 0;">
                    <tr style="background:#f0f4f9;"><td style="padding:8px 12px;font-weight:600;width:40%;">Industry</td><td style="padding:8px 12px;">${body.industry}</td></tr>
                    <tr><td style="padding:8px 12px;font-weight:600;background:#f8fafc;">Company Size</td><td style="padding:8px 12px;background:#f8fafc;">${body.size || "Not specified"}</td></tr>
                    <tr style="background:#f0f4f9;"><td style="padding:8px 12px;font-weight:600;">Roles Tracked</td><td style="padding:8px 12px;">${Array.isArray(body.roleIds) ? body.roleIds.length : 0} role categories</td></tr>
                    <tr><td style="padding:8px 12px;font-weight:600;background:#f8fafc;">Alert Frequency</td><td style="padding:8px 12px;background:#f8fafc;text-transform:capitalize;">${body.alertFrequency || "realtime"}</td></tr>
                    <tr style="background:#f0f4f9;"><td style="padding:8px 12px;font-weight:600;">Min. Risk Level</td><td style="padding:8px 12px;text-transform:capitalize;">${body.riskThreshold || "medium"}</td></tr>
                    <tr><td style="padding:8px 12px;font-weight:600;background:#f8fafc;">Plan</td><td style="padding:8px 12px;background:#f8fafc;"><strong style="color:#d97706;">Freemium</strong> (3 pipeline alerts/mo)</td></tr>
                  </table>
                  <p>Your free account gives you up to 3 pipeline risk alerts per month. Upgrade to <strong>Professional ($299/mo)</strong> for unlimited real-time alerts and detailed program-level analytics.</p>
                  <div style="text-align:center;margin:24px 0;">
                    <a href="https://college-cuts.com/intelligence/dashboard" style="background:#1e3a5f;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:700;">View My Dashboard</a>
                  </div>
                  <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;"/>
                  <p style="font-size:12px;color:#94a3b8;margin:0;">Questions? Reply to this email — we read every message.<br/>CollegeCuts · college-cuts.com</p>
                </div>
              </div>`,
          });
        } catch (emailErr: any) {
          console.warn("[intelligence] welcome email failed:", emailErr.message);
        }
      }

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

router.post("/admin/send-intelligence-alerts", async (req, res): Promise<void> => {
  const secret = req.headers["x-admin-secret"] || req.body?.secret;
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    res.status(401).json({ error: "Unauthorized" }); return;
  }

  try {
    const supabase = getSupabase();

    const cutsSince = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: recentCuts, error: cutsError } = await supabase
      .from("v_latest_cuts")
      .select("id, institution_name, program_name, cut_type, state, created_at")
      .gte("created_at", cutsSince)
      .limit(100);

    if (cutsError) throw cutsError;
    if (!recentCuts || recentCuts.length === 0) {
      res.json({ ok: true, message: "No recent cuts", sent: 0 }); return;
    }

    const { data: employers, error: employerError } = await supabase
      .from("employer_profiles")
      .select("email, company, role_ids, states, alert_frequency, risk_threshold, tier");

    if (employerError) throw employerError;
    if (!employers || employers.length === 0) {
      res.json({ ok: true, message: "No employers", sent: 0 }); return;
    }

    if (!process.env.RESEND_API_KEY) {
      res.json({ ok: true, message: "RESEND_API_KEY not set", sent: 0 }); return;
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    let sent = 0;

    for (const employer of employers) {
      const stateFiltered = employer.states && employer.states.length > 0
        ? recentCuts.filter((c: any) => employer.states.includes(c.state))
        : recentCuts;

      const matchingCuts = stateFiltered.filter((c: any) => {
        const mapped = mapProgramToRoles(c.program_name || "");
        return employer.role_ids && employer.role_ids.some((rid: string) => mapped.includes(rid));
      });

      if (matchingCuts.length === 0) continue;

      const cutsList = matchingCuts.slice(0, 10).map((c: any) => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">${c.institution_name}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">${c.program_name || "—"}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">${c.state}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-transform:capitalize;">${(c.cut_type || "").replace(/_/g, " ")}</td>
        </tr>`).join("");

      const more = matchingCuts.length > 10 ? `<p style="color:#64748b;font-size:13px;">+${matchingCuts.length - 10} more programs affected. <a href="https://college-cuts.com/intelligence/dashboard">View your full dashboard →</a></p>` : "";

      try {
        await resend.emails.send({
          from: "CollegeCuts Intelligence <hello@college-cuts.com>",
          to: [employer.email],
          subject: `⚠️ Pipeline Risk Alert: ${matchingCuts.length} new program cut${matchingCuts.length > 1 ? "s" : ""} match your tracking criteria`,
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1e293b;">
              <div style="background:#1e3a5f;padding:24px 32px;border-radius:8px 8px 0 0;">
                <h1 style="margin:0;font-size:20px;color:#fff;">CollegeCuts <span style="color:#fbbf24;">Intelligence</span></h1>
                <p style="margin:6px 0 0;color:#94a3b8;font-size:14px;">Pipeline Risk Alert for ${employer.company}</p>
              </div>
              <div style="padding:24px 32px;border:1px solid #e2e8f0;border-top:0;border-radius:0 0 8px 8px;">
                <p>We detected <strong>${matchingCuts.length} new program cut${matchingCuts.length > 1 ? "s" : ""}</strong> this week that match your tracked role categories and geography.</p>
                <table style="width:100%;border-collapse:collapse;font-size:13px;margin:16px 0;">
                  <thead>
                    <tr style="background:#f0f4f9;">
                      <th style="padding:8px 12px;text-align:left;font-weight:600;">Institution</th>
                      <th style="padding:8px 12px;text-align:left;font-weight:600;">Program</th>
                      <th style="padding:8px 12px;text-align:left;font-weight:600;">State</th>
                      <th style="padding:8px 12px;text-align:left;font-weight:600;">Type</th>
                    </tr>
                  </thead>
                  <tbody>${cutsList}</tbody>
                </table>
                ${more}
                <div style="text-align:center;margin:24px 0;">
                  <a href="https://college-cuts.com/intelligence/dashboard" style="background:#1e3a5f;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:700;">View Full Analysis →</a>
                </div>
                <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0;"/>
                <p style="font-size:11px;color:#94a3b8;margin:0;">You're receiving this because you set up a CollegeCuts Intelligence account with email ${employer.email}.<br/>
                Upgrade to <strong>Professional ($299/mo)</strong> for unlimited alerts and PDF exports.<br/>CollegeCuts · college-cuts.com</p>
              </div>
            </div>`,
        });
        sent++;
      } catch (emailErr: any) {
        console.warn(`[intelligence-alerts] failed to email ${employer.email}:`, emailErr.message);
      }
    }

    res.json({ ok: true, sent, totalCuts: recentCuts.length, totalEmployers: employers.length });
  } catch (err: any) {
    console.error("[intelligence-alerts] error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
