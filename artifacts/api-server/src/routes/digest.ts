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
  const testTo = req.query.to as string | undefined;
  const emails = testTo ? [testTo] : (subs ?? []).map((s: any) => s.email);

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
      <p style="margin:0 0 6px;color:#9ca3af;font-size:12px">You're receiving this because you subscribed at <a href="${SITE_URL}" style="color:#d97706">${SITE_URL.replace("https://","")}</a>.</p>
      <p style="margin:0;font-size:11px;color:#d1d5db"><a href="${SITE_URL}/subscribe" style="color:#9ca3af;text-decoration:underline">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>`;

  const resend = new Resend(resendKey);
  let sent = 0;
  const errors: string[] = [];

  for (const email of emails) {
    try {
      const unsubscribeUrl = `${SITE_URL}/subscribe`;
      await resend.emails.send({
        from: "CollegeCuts <hello@college-cuts.com>",
        to: [email],
        subject: `CollegeCuts ${periodLabel} Recap — ${rows.length} higher-ed action${rows.length !== 1 ? "s" : ""} tracked`,
        html,
        headers: {
          "List-Unsubscribe": `<${unsubscribeUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          "Precedence": "bulk",
        },
      });
      sent++;
    } catch (err: any) {
      errors.push(`${email}: ${err.message}`);
    }
  }

  res.json({ ok: true, sent, total: emails.length, cuts: rows.length, errors: errors.length ? errors : undefined });
});

router.post("/admin/send-weekly-digest", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) { res.status(500).json({ error: "Resend not configured" }); return; }

  const since90 = new Date(Date.now() - 90 * 86400000).toISOString().slice(0, 10);

  let isFallback = false;
  let { data: cuts, error: cutsErr } = await supabase
    .from("v_latest_cuts")
    .select("id, institution, program_name, state, cut_type, announcement_date, status, source_url")
    .gte("announcement_date", since90)
    .order("announcement_date", { ascending: false });

  if (cutsErr) { res.status(500).json({ error: cutsErr.message }); return; }

  if (!cuts || cuts.length === 0) {
    isFallback = true;
    const { data: fallback, error: fbErr } = await supabase
      .from("v_latest_cuts")
      .select("id, institution, program_name, state, cut_type, announcement_date, status, source_url")
      .order("created_at", { ascending: false })
      .limit(15);
    if (fbErr) { res.status(500).json({ error: fbErr.message }); return; }
    cuts = fallback ?? [];
  }

  const { data: subs, error: subsErr } = await supabase
    .from("subscribers")
    .select("email");

  if (subsErr) { res.status(500).json({ error: subsErr.message }); return; }

  const rows = cuts ?? [];
  const testTo = req.query.to as string | undefined;
  const emails = testTo ? [testTo] : (subs ?? []).map((s: any) => s.email);

  if (!rows.length) { res.json({ ok: true, sent: 0, reason: "No actions in database" }); return; }
  if (!emails.length) { res.json({ ok: true, sent: 0, reason: "No subscribers" }); return; }

  type Cut = { id: string; institution: string; program_name: string | null; state: string; cut_type: string; announcement_date: string | null; status: string; source_url: string | null };

  const buckets: Array<{ label: string; typeKeys: string[]; urlKey: string; rows: Cut[] }> = [
    { label: "Staff Layoffs", typeKeys: ["staff_layoff"], urlKey: "staff_layoff", rows: [] },
    { label: "Program Suspensions & Teach-Outs", typeKeys: ["program_suspension", "teach_out"], urlKey: "program_suspension", rows: [] },
    { label: "Department & Campus Closures", typeKeys: ["department_closure", "campus_closure"], urlKey: "department_closure", rows: [] },
    { label: "Institution Closures", typeKeys: ["institution_closure"], urlKey: "institution_closure", rows: [] },
  ];

  for (const cut of rows as Cut[]) {
    for (const bucket of buckets) {
      if (bucket.typeKeys.includes(cut.cut_type)) {
        bucket.rows.push(cut);
        break;
      }
    }
  }

  const activeBuckets = buckets.filter(b => b.rows.length > 0);

  function fmtDate(d: string | null): string {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  function renderSection(bucket: { label: string; typeKeys: string[]; urlKey: string; rows: Cut[] }): string {
    const shown = bucket.rows.slice(0, 5);
    const total = bucket.rows.length;
    const filteredUrl = bucket.typeKeys.length === 1
      ? `${SITE_URL}/cuts?cutType=${bucket.urlKey}`
      : `${SITE_URL}/cuts`;
    const rowsHtml = shown.map(c => {
      const programLine = c.program_name
        ? `<br/><span style="font-size:12px;color:#9ca3af">${c.program_name}</span>`
        : "";
      return `
        <tr>
          <td style="padding:11px 8px;border-bottom:1px solid #e5e7eb;vertical-align:top">
            <a href="${SITE_URL}/cuts/${c.id}" style="color:#1e3a5f;font-weight:600;text-decoration:none;font-size:14px">${c.institution}</a>
            ${programLine}
            <br/><span style="font-size:12px;color:#6b7280">${c.state}</span>
          </td>
          <td style="padding:11px 8px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:13px;vertical-align:top;white-space:nowrap">${fmtDate(c.announcement_date)}</td>
          <td style="padding:11px 8px;border-bottom:1px solid #e5e7eb;vertical-align:top;text-align:right">
            <a href="${SITE_URL}/cuts/${c.id}" style="color:#d97706;font-size:12px;text-decoration:none;white-space:nowrap;font-weight:600">View →</a>
          </td>
        </tr>`;
    }).join("");

    const seeAllLabel = total > 5
      ? `See all ${total} ${bucket.label.toLowerCase()} on CollegeCuts →`
      : `See all ${bucket.label.toLowerCase()} on CollegeCuts →`;

    return `
      <div style="margin-bottom:32px">
        <div style="display:flex;align-items:center;margin-bottom:12px">
          <span style="display:inline-block;width:4px;height:18px;background:#d97706;border-radius:2px;margin-right:10px;vertical-align:middle"></span>
          <span style="font-size:13px;font-weight:800;color:#1e3a5f;text-transform:uppercase;letter-spacing:.08em;vertical-align:middle">${bucket.label}</span>
        </div>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #e5e7eb;border-radius:6px;overflow:hidden">
          <tbody>${rowsHtml}</tbody>
        </table>
        <div style="margin-top:8px;text-align:right">
          <a href="${filteredUrl}" style="font-size:12px;color:#6b7280;text-decoration:none">${seeAllLabel}</a>
        </div>
      </div>`;
  }

  const sectionsHtml = activeBuckets.map(renderSection).join("");

  const topTwo = [...activeBuckets]
    .sort((a, b) => b.rows.length - a.rows.length)
    .slice(0, 2);

  function shortLabel(label: string): string {
    const map: Record<string, string> = {
      "Staff Layoffs": "layoffs",
      "Program Suspensions & Teach-Outs": "program suspensions",
      "Department & Campus Closures": "closures",
      "Institution Closures": "institution closures",
    };
    return map[label] ?? label.toLowerCase();
  }

  const subjectParts = topTwo.map(b => `${b.rows.length} ${shortLabel(b.label)}`);
  const subjectLine = isFallback
    ? `CollegeCuts: ${subjectParts.join(", ")} — most recent on record`
    : `CollegeCuts Weekly: ${subjectParts.join(", ")} tracked`;

  const periodNote = isFallback
    ? "No new actions have been added recently. Here are the most recent cuts on record."
    : "The most recent program cuts, layoffs, and closures tracked in the past 90 days. Click any record for full details and sources.";

  const weekLabel = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const talentCtaHtml = `
    <div style="margin:32px 0;padding:20px 24px;background:#fffbeb;border:1px solid #fde68a;border-radius:8px">
      <div style="font-size:13px;font-weight:800;color:#92400e;text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px">Talent Pool</div>
      <p style="margin:0 0 14px;color:#374151;font-size:14px;line-height:1.65">
        Affected by a cut? The <strong>CollegeCuts Talent Pool</strong> is a free, searchable directory of displaced faculty, staff, and administrators open to new opportunities. Employers browse it directly.
      </p>
      <a href="${SITE_URL}/talent" style="display:inline-block;background:#d97706;color:#fff;padding:10px 22px;border-radius:6px;font-weight:700;text-decoration:none;font-size:13px">Join the Talent Pool — Free →</a>
    </div>`;

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
            <div style="color:#fbbf24;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:4px">Weekly Update</div>
            <div style="color:#fff;font-size:22px;font-weight:800;margin:0">CollegeCuts Tracker</div>
          </td>
        </tr>
      </table>
    </div>
    <div style="padding:28px 32px 8px">
      <h2 style="color:#1e3a5f;margin:0 0 6px;font-size:20px">Higher Ed Intelligence — ${weekLabel}</h2>
      <p style="color:#6b7280;margin:0 0 28px;font-size:14px;line-height:1.6">${periodNote}</p>
      ${sectionsHtml}
      ${talentCtaHtml}
    </div>
    <div style="padding:20px 32px;background:#f8fafc;border-top:1px solid #e5e7eb;text-align:center">
      <p style="margin:0 0 6px;color:#9ca3af;font-size:12px">You're receiving this because you subscribed at <a href="${SITE_URL}" style="color:#d97706">${SITE_URL.replace("https://","")}</a>.</p>
      <p style="margin:0;font-size:11px;color:#d1d5db"><a href="${SITE_URL}/subscribe" style="color:#9ca3af;text-decoration:underline">Unsubscribe</a></p>
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
        subject: subjectLine,
        html,
        headers: {
          "List-Unsubscribe": `<${SITE_URL}/subscribe>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          "Precedence": "bulk",
        },
      });
      sent++;
    } catch (err: any) {
      errors.push(`${email}: ${err.message}`);
    }
  }

  res.json({ ok: true, sent, total: emails.length, cuts: rows.length, errors: errors.length ? errors : undefined });
});

router.post("/admin/broadcast-talent-pool", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) { res.status(500).json({ error: "Resend not configured" }); return; }

  const { data: subs, error: subsErr } = await supabase
    .from("subscribers")
    .select("email");

  if (subsErr) { res.status(500).json({ error: subsErr.message }); return; }

  const testTo = req.query.to as string | undefined;
  const emails = testTo ? [testTo] : (subs ?? []).map((s: any) => s.email);

  if (!emails.length) { res.json({ ok: true, sent: 0, reason: "No subscribers" }); return; }

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f4f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08)">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1e3a5f,#2a4e7c);padding:28px 32px">
      <table cellpadding="0" cellspacing="0" border="0" style="width:100%">
        <tr>
          <td style="vertical-align:middle;width:56px">
            <img src="${SITE_URL}/favicon-512.png" alt="CollegeCuts" width="44" height="44"
                 style="display:block;border-radius:8px;border:0" />
          </td>
          <td style="vertical-align:middle;padding-left:14px">
            <div style="color:#fbbf24;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:3px">New Feature</div>
            <div style="color:#fff;font-size:20px;font-weight:800">CollegeCuts</div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Body -->
    <div style="padding:32px 32px 24px">
      <h2 style="color:#1e3a5f;margin:0 0 12px;font-size:22px;font-weight:800;line-height:1.3">
        Were you affected by higher ed cuts?<br/>There's now a talent pool for you.
      </h2>
      <p style="color:#374151;line-height:1.75;margin:0 0 20px;font-size:15px">
        You subscribed to CollegeCuts to track program closures and layoffs across US colleges.
        We've now built something directly for the people caught in those numbers.
      </p>
      <p style="color:#374151;line-height:1.75;margin:0 0 24px;font-size:15px">
        The <strong style="color:#1e3a5f">CollegeCuts Talent Pool</strong> is a free, searchable directory
        of displaced academic workers — researchers, administrators, faculty, and staff
        who've been affected by cuts and are open to new opportunities.
        Employers are already browsing it.
      </p>

      <!-- Feature tiles -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;border-collapse:separate;border-spacing:0 10px">
        <tr>
          <td style="padding:14px 16px;background:#f0f4f9;border-radius:8px;width:47%;vertical-align:top">
            <div style="color:#d97706;font-size:18px;margin-bottom:4px">⚡</div>
            <div style="color:#1e3a5f;font-weight:700;font-size:14px;margin-bottom:3px">30 seconds to register</div>
            <div style="color:#6b7280;font-size:13px;line-height:1.5">Name, role, institution, and skills — that's it to get listed.</div>
          </td>
          <td style="width:12px"></td>
          <td style="padding:14px 16px;background:#f0f4f9;border-radius:8px;width:47%;vertical-align:top">
            <div style="color:#d97706;font-size:18px;margin-bottom:4px">🔍</div>
            <div style="color:#1e3a5f;font-weight:700;font-size:14px;margin-bottom:3px">Employers find you</div>
            <div style="color:#6b7280;font-size:13px;line-height:1.5">Companies actively hiring from academia browse the pool directly.</div>
          </td>
        </tr>
        <tr><td colspan="3" style="height:10px"></td></tr>
        <tr>
          <td style="padding:14px 16px;background:#f0f4f9;border-radius:8px;vertical-align:top">
            <div style="color:#d97706;font-size:18px;margin-bottom:4px">💼</div>
            <div style="color:#1e3a5f;font-weight:700;font-size:14px;margin-bottom:3px">Always free</div>
            <div style="color:#6b7280;font-size:13px;line-height:1.5">No fees, no middlemen. This is a civic resource, not a job board.</div>
          </td>
          <td style="width:12px"></td>
          <td style="padding:14px 16px;background:#f0f4f9;border-radius:8px;vertical-align:top">
            <div style="color:#d97706;font-size:18px;margin-bottom:4px">🎓</div>
            <div style="color:#1e3a5f;font-weight:700;font-size:14px;margin-bottom:3px">For all roles</div>
            <div style="color:#6b7280;font-size:13px;line-height:1.5">Faculty, staff, administrators, researchers — anyone affected by higher ed cuts.</div>
          </td>
        </tr>
      </table>

      <!-- CTA -->
      <div style="text-align:center;margin-bottom:28px">
        <a href="${SITE_URL}/talent"
           style="display:inline-block;background:#d97706;color:#fff;padding:15px 36px;border-radius:8px;font-weight:800;text-decoration:none;font-size:16px;letter-spacing:.3px">
          Join the Talent Pool — Free →
        </a>
        <p style="color:#9ca3af;font-size:12px;margin:12px 0 0">Takes about 30 seconds. No account required.</p>
      </div>

      <p style="color:#6b7280;font-size:14px;line-height:1.7;margin:0;border-top:1px solid #e5e7eb;padding-top:20px">
        You can also browse the full higher education cuts database at
        <a href="${SITE_URL}/cuts" style="color:#1e3a5f;font-weight:600;text-decoration:none">college-cuts.com/cuts</a>
        — 235+ program cuts, closures, and layoffs tracked across all 50 states.
      </p>
    </div>

    <!-- Footer -->
    <div style="padding:18px 32px;background:#f8fafc;border-top:1px solid #e5e7eb;text-align:center">
      <p style="margin:0 0 4px;color:#9ca3af;font-size:12px">
        You're receiving this because you subscribed at
        <a href="${SITE_URL}" style="color:#d97706">${SITE_URL.replace("https://","")}</a>.
      </p>
      <p style="margin:0;font-size:11px;color:#d1d5db">
        <a href="${SITE_URL}/subscribe" style="color:#9ca3af;text-decoration:underline">Unsubscribe</a>
      </p>
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
        subject: "New: Join the CollegeCuts Talent Pool — free, takes 30 seconds",
        html,
        headers: {
          "List-Unsubscribe": `<${SITE_URL}/subscribe>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          "Precedence": "bulk",
        },
      });
      sent++;
    } catch (err: any) {
      errors.push(`${email}: ${err.message}`);
    }
  }

  res.json({ ok: true, sent, total: emails.length, errors: errors.length ? errors : undefined });
});

export default router;
