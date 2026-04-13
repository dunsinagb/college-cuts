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

router.post("/admin/send-digest", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) { res.status(500).json({ error: "Resend not configured" }); return; }

  const now = new Date();
  let periodLabel: string;
  let since: string;
  let until: string;

  if (req.query.days) {
    const days = Number(req.query.days);
    since = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
    until = now.toISOString().slice(0, 10);
    periodLabel = `past ${days} days`;
  } else {
    const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastOfPrevMonth = new Date(firstOfThisMonth.getTime() - 1);
    since = firstOfPrevMonth.toISOString().slice(0, 10);
    until = lastOfPrevMonth.toISOString().slice(0, 10);
    periodLabel = firstOfPrevMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }

  const { data: cuts, error: cutsErr } = await supabase
    .from("v_latest_cuts")
    .select("id, institution, program_name, state, cut_type, announcement_date, status, source_url")
    .gte("announcement_date", since)
    .lte("announcement_date", until)
    .order("announcement_date", { ascending: false });

  if (cutsErr) { res.status(500).json({ error: cutsErr.message }); return; }

  const { data: subs, error: subsErr } = await supabase
    .from("subscribers")
    .select("email");

  if (subsErr) { res.status(500).json({ error: subsErr.message }); return; }

  const rows = cuts ?? [];
  const emails = (subs ?? []).map((s: any) => s.email);

  if (!rows.length) { res.json({ ok: true, sent: 0, reason: "No new cuts this period" }); return; }
  if (!emails.length) { res.json({ ok: true, sent: 0, reason: "No subscribers" }); return; }

  const CUT_LABELS: Record<string, string> = {
    staff_layoff: "Staff Layoff", program_suspension: "Program Suspension",
    teach_out: "Teach-Out", department_closure: "Department Closure",
    campus_closure: "Campus Closure", institution_closure: "Institution Closure",
  };

  const rows_html = rows.map((c: any) => {
    const label = CUT_LABELS[c.cut_type] ?? c.cut_type;
    const slug = slugify(c.institution);
    const date = c.announcement_date ? new Date(c.announcement_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";
    return `
      <tr>
        <td style="padding:12px 8px;border-bottom:1px solid #e5e7eb;vertical-align:top">
          <a href="${SITE_URL}/institution/${slug}" style="color:#1e3a5f;font-weight:600;text-decoration:none">${c.institution}</a>
          <br/><span style="font-size:12px;color:#6b7280">${c.state} · ${label}</span>
        </td>
        <td style="padding:12px 8px;border-bottom:1px solid #e5e7eb;color:#374151;font-size:13px;vertical-align:top">${date}</td>
        <td style="padding:12px 8px;border-bottom:1px solid #e5e7eb;vertical-align:top">
          <a href="${SITE_URL}/institution/${slug}" style="color:#d97706;font-size:12px;text-decoration:none">View →</a>
        </td>
      </tr>`;
  }).join("");

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f4f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)">
    <div style="background:#1e3a5f;padding:28px 32px">
      <table cellpadding="0" cellspacing="0" border="0" style="width:100%">
        <tr>
          <td style="vertical-align:middle;width:56px">
            <img src="${SITE_URL}/favicon-512.png" alt="CollegeCuts" width="48" height="48"
                 style="display:block;border-radius:8px;border:0" />
          </td>
          <td style="vertical-align:middle;padding-left:16px">
            <div style="color:#fbbf24;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:4px">Monthly Recap</div>
            <div style="color:#fff;font-size:22px;font-weight:800;margin:0">CollegeCuts Tracker</div>
          </td>
        </tr>
      </table>
    </div>
    <div style="padding:28px 32px">
      <h2 style="color:#1e3a5f;margin:0 0 4px">${rows.length} action${rows.length !== 1 ? "s" : ""} tracked in ${periodLabel}</h2>
      <p style="color:#6b7280;margin:0 0 24px;font-size:14px">Here's every program cut, layoff, and closure added to the CollegeCuts database this month.</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
        <thead>
          <tr style="background:#f8fafc">
            <th style="padding:10px 8px;text-align:left;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.5px;border-bottom:2px solid #e5e7eb">Institution</th>
            <th style="padding:10px 8px;text-align:left;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.5px;border-bottom:2px solid #e5e7eb">Date</th>
            <th style="padding:10px 8px;border-bottom:2px solid #e5e7eb"></th>
          </tr>
        </thead>
        <tbody>${rows_html}</tbody>
      </table>
      <div style="margin-top:28px;text-align:center">
        <a href="${SITE_URL}" style="display:inline-block;background:#1e3a5f;color:#fff;padding:12px 28px;border-radius:6px;font-weight:700;text-decoration:none;font-size:14px">Browse Full Database →</a>
      </div>
    </div>
    <div style="padding:20px 32px;background:#f8fafc;border-top:1px solid #e5e7eb;text-align:center">
      <p style="margin:0;color:#9ca3af;font-size:12px">You're receiving this because you subscribed at <a href="${SITE_URL}" style="color:#d97706">${SITE_URL.replace("https://","")}</a>.</p>
    </div>
  </div>
</body>
</html>`;

  const resend = new Resend(resendKey);
  let sent = 0;
  const errors: string[] = [];

  for (const email of emails) {
    try {
      await resend.emails.send({
        from: "CollegeCuts <hello@college-cuts.com>",
        to: [email],
        subject: `CollegeCuts ${periodLabel} Recap — ${rows.length} higher-ed action${rows.length !== 1 ? "s" : ""} tracked`,
        html,
      });
      sent++;
    } catch (err: any) {
      errors.push(`${email}: ${err.message}`);
    }
  }

  res.json({ ok: true, sent, total: emails.length, cuts: rows.length, errors: errors.length ? errors : undefined });
});

export default router;
