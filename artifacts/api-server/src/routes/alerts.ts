import { Router } from "express";
import { supabase } from "../lib/supabase";
import { Resend } from "resend";

const router = Router();
const SITE_URL = (process.env.SITE_URL || "https://college-cuts.com").replace(/\/$/, "");
const ADMIN_SECRET = process.env.ADMIN_SECRET || "";

function slugify(name: string): string {
  return name.toLowerCase().replace(/'/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function requireAdmin(req: any, res: any): boolean {
  const auth = req.headers["authorization"] || "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  if (!ADMIN_SECRET || token !== ADMIN_SECRET) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  return true;
}

router.post("/alert-subscribe", async (req, res): Promise<void> => {
  const { email, institution_slug, institution_name, state } = req.body as {
    email?: string; institution_slug?: string; institution_name?: string; state?: string;
  };

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: "Invalid email address" }); return;
  }
  if (!institution_slug) {
    res.status(400).json({ error: "institution_slug required" }); return;
  }

  const { data: existing } = await supabase
    .from("alert_subscriptions")
    .select("id")
    .eq("email", email)
    .eq("institution_slug", institution_slug)
    .limit(1);

  if (existing && existing.length > 0) {
    res.json({ ok: true, already: true }); return;
  }

  const { error } = await supabase
    .from("alert_subscriptions")
    .insert({ email, institution_slug, institution_name, state });

  if (error) {
    console.error("[alerts] insert error:", error.message);
    res.status(500).json({ error: "Failed to save alert subscription." }); return;
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey && institution_name) {
    try {
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: "CollegeCuts <hello@college-cuts.com>",
        to: [email],
        subject: `Alert set: ${institution_name} — CollegeCuts`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#fff">
            <div style="background:#1e3a5f;padding:20px 24px;border-radius:8px 8px 0 0;margin:-24px -24px 24px">
              <div style="color:#fbbf24;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:4px">Alert Confirmed</div>
              <div style="color:#fff;font-size:20px;font-weight:800">CollegeCuts Tracker</div>
            </div>
            <h2 style="color:#1e3a5f;margin:0 0 8px">You're set!</h2>
            <p style="color:#374151;line-height:1.6;margin:0 0 16px">
              We'll email you whenever new data is added for <strong>${institution_name}</strong>.
            </p>
            <a href="${SITE_URL}/institution/${institution_slug}" style="display:inline-block;background:#1e3a5f;color:#fff;padding:10px 22px;border-radius:6px;font-weight:700;text-decoration:none;font-size:14px">
              View Institution Page →
            </a>
            <p style="color:#9ca3af;font-size:12px;margin-top:24px">
              To unsubscribe, reply with "unsubscribe" or visit <a href="${SITE_URL}" style="color:#d97706">college-cuts.com</a>.
            </p>
          </div>`,
      });
    } catch (err) {
      console.error("[alerts] confirmation email error:", err);
    }
  }

  res.json({ ok: true });
});

router.delete("/alert-subscribe", async (req, res): Promise<void> => {
  const { email, institution_slug } = req.body as { email?: string; institution_slug?: string };
  if (!email || !institution_slug) { res.status(400).json({ error: "email and institution_slug required" }); return; }

  const { error } = await supabase
    .from("alert_subscriptions")
    .delete()
    .eq("email", email)
    .eq("institution_slug", institution_slug);

  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json({ ok: true });
});

router.post("/admin/send-alerts", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) { res.status(500).json({ error: "Resend not configured" }); return; }

  const hours = Number(req.query.hours) || 24;
  const since = new Date(Date.now() - hours * 3600000).toISOString();

  const { data: cuts, error: cutsErr } = await supabase
    .from("v_latest_cuts")
    .select("id, institution, program_name, state, cut_type, announcement_date, notes")
    .gte("created_at", since)
    .order("created_at", { ascending: false });

  if (cutsErr) { res.status(500).json({ error: cutsErr.message }); return; }

  const rows = cuts ?? [];
  if (!rows.length) { res.json({ ok: true, sent: 0, reason: "No new cuts" }); return; }

  const { data: subs, error: subsErr } = await supabase
    .from("alert_subscriptions")
    .select("email, institution_slug, institution_name, state");

  if (subsErr) { res.status(500).json({ error: subsErr.message }); return; }

  const CUT_LABELS: Record<string, string> = {
    staff_layoff: "Staff Layoff", program_suspension: "Program Suspension",
    teach_out: "Teach-Out", department_closure: "Department Closure",
    campus_closure: "Campus Closure", institution_closure: "Institution Closure",
  };

  const newSlugs = new Set(rows.map((c: any) => slugify(c.institution)));
  const resend = new Resend(resendKey);
  let sent = 0;

  const byEmail = new Map<string, { institution_slug: string; institution_name: string }[]>();
  for (const sub of subs ?? []) {
    if (!newSlugs.has(sub.institution_slug)) continue;
    if (!byEmail.has(sub.email)) byEmail.set(sub.email, []);
    byEmail.get(sub.email)!.push(sub);
  }

  for (const [email, institutions] of byEmail) {
    const matchingCuts = rows.filter((c: any) =>
      institutions.some(i => i.institution_slug === slugify(c.institution))
    );
    if (!matchingCuts.length) continue;

    const rowsHtml = matchingCuts.map((c: any) => {
      const slug = slugify(c.institution);
      const label = CUT_LABELS[c.cut_type] ?? c.cut_type;
      return `<tr>
        <td style="padding:10px 8px;border-bottom:1px solid #e5e7eb">
          <a href="${SITE_URL}/institution/${slug}" style="color:#1e3a5f;font-weight:600;text-decoration:none">${c.institution}</a>
          <br/><span style="font-size:12px;color:#6b7280">${c.state} · ${label}</span>
        </td>
        <td style="padding:10px 8px;border-bottom:1px solid #e5e7eb">
          <a href="${SITE_URL}/cuts/${c.id}" style="color:#d97706;font-size:12px">View →</a>
        </td>
      </tr>`;
    }).join("");

    const institutionName = institutions[0].institution_name || institutions[0].institution_slug;

    try {
      await resend.emails.send({
        from: "CollegeCuts <hello@college-cuts.com>",
        to: [email],
        subject: `🚨 New data added for ${institutionName} — CollegeCuts Alert`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:32px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)">
            <div style="background:#1e3a5f;padding:24px 32px">
              <div style="color:#fbbf24;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:4px">Institution Alert</div>
              <div style="color:#fff;font-size:20px;font-weight:800">CollegeCuts Tracker</div>
            </div>
            <div style="padding:28px 32px">
              <h2 style="color:#1e3a5f;margin:0 0 8px">New data added</h2>
              <p style="color:#6b7280;margin:0 0 20px;font-size:14px">New cuts were recorded for an institution you're following.</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
                <tbody>${rowsHtml}</tbody>
              </table>
              <div style="margin-top:24px">
                <a href="${SITE_URL}/cuts" style="display:inline-block;background:#1e3a5f;color:#fff;padding:10px 22px;border-radius:6px;font-weight:700;text-decoration:none;font-size:14px">Browse Database →</a>
              </div>
            </div>
            <div style="padding:16px 32px;background:#f8fafc;border-top:1px solid #e5e7eb;text-align:center">
              <p style="margin:0;color:#9ca3af;font-size:12px">You requested this alert at <a href="${SITE_URL}" style="color:#d97706">college-cuts.com</a>.</p>
            </div>
          </div>`,
      });
      sent++;
    } catch (err: any) {
      console.error("[alerts] email error:", err.message);
    }
  }

  res.json({ ok: true, sent, totalSubscribers: byEmail.size, newCuts: rows.length });
});

export default router;
