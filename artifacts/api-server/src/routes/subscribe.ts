import { Router, type IRouter } from "express";
import { supabase } from "../lib/supabase";
import { Resend } from "resend";
import { isRealEmail } from "../lib/validate-email";

const router: IRouter = Router();
const SITE_URL = (process.env.SITE_URL || "https://college-cuts.com").replace(/\/$/, "");

router.post("/subscribe", async (req, res): Promise<void> => {
  const { email } = req.body as { email?: string };

  const check = isRealEmail(email ?? "");
  if (!check.valid) {
    res.status(400).json({ error: check.reason ?? "Invalid email address" });
    return;
  }

  const { data: existing } = await supabase
    .from("subscribers")
    .select("id")
    .eq("email", email)
    .limit(1);

  const isNew = !existing || existing.length === 0;

  if (isNew) {
    const { error } = await supabase.from("subscribers").insert({ email });
    if (error) {
      console.error("[subscribe] Supabase insert error:", error.message);
      res.status(500).json({ error: "Failed to save subscription." });
      return;
    }
  }

  if (isNew && process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "CollegeCuts <hello@college-cuts.com>",
        to: [email],
        subject: "Welcome to CollegeCuts — Your Access is Ready",
        html: `
          <div style="font-family:sans-serif;max-width:580px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.07)">
            <div style="background:linear-gradient(135deg,#1e3a5f,#2a4e7c);padding:28px 32px">
              <div style="color:#fbbf24;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px">Account Created</div>
              <div style="color:#fff;font-size:22px;font-weight:800">CollegeCuts Tracker</div>
            </div>
            <div style="padding:28px 32px">
              <h2 style="color:#1e3a5f;margin:0 0 10px;font-size:20px">You're in. Welcome.</h2>
              <p style="color:#374151;line-height:1.7;margin:0 0 20px">
                You now have full access to the most comprehensive tracker of higher education program cuts,
                department closures, and faculty layoffs in the United States.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px">
                <tr>
                  <td style="padding:10px 14px;background:#f0f4f9;border-radius:8px;width:50%;vertical-align:top">
                    <div style="color:#1e3a5f;font-weight:700;font-size:14px;margin-bottom:4px">📊 Full Database</div>
                    <div style="color:#6b7280;font-size:13px">Every program cut &amp; closure logged by our team</div>
                  </td>
                  <td style="width:12px"></td>
                  <td style="padding:10px 14px;background:#f0f4f9;border-radius:8px;width:50%;vertical-align:top">
                    <div style="color:#1e3a5f;font-weight:700;font-size:14px;margin-bottom:4px">📈 Analytics</div>
                    <div style="color:#6b7280;font-size:13px">Year-over-year trends &amp; state breakdowns</div>
                  </td>
                </tr>
                <tr><td colspan="3" style="height:10px"></td></tr>
                <tr>
                  <td style="padding:10px 14px;background:#f0f4f9;border-radius:8px;vertical-align:top">
                    <div style="color:#1e3a5f;font-weight:700;font-size:14px;margin-bottom:4px">💼 Job Outlook</div>
                    <div style="color:#6b7280;font-size:13px">BLS employment data for affected fields</div>
                  </td>
                  <td style="width:12px"></td>
                  <td style="padding:10px 14px;background:#f0f4f9;border-radius:8px;vertical-align:top">
                    <div style="color:#1e3a5f;font-weight:700;font-size:14px;margin-bottom:4px">🔔 Alerts</div>
                    <div style="color:#6b7280;font-size:13px">Follow specific institutions for updates</div>
                  </td>
                </tr>
              </table>
              <div style="text-align:center">
                <a href="${SITE_URL}/cuts" style="display:inline-block;background:#1e3a5f;color:#fff;padding:13px 28px;border-radius:8px;font-weight:700;text-decoration:none;font-size:15px">
                  Browse the Database →
                </a>
              </div>
              <p style="color:#9ca3af;font-size:12px;margin-top:24px;text-align:center">
                Sign in at any time at <a href="${SITE_URL}/auth/login" style="color:#d97706">${SITE_URL}/auth/login</a>
              </p>
            </div>
          </div>
        `,
      });
    } catch (err) {
      console.error("[subscribe] welcome email error:", err);
    }
  }

  res.json({ ok: true });
});

router.get("/unsubscribe", async (req, res): Promise<void> => {
  const { email } = req.query as { email?: string };
  if (!email) { res.status(400).json({ error: "email required" }); return; }

  const { error } = await supabase
    .from("subscribers")
    .delete()
    .eq("email", email.toLowerCase());

  if (error) {
    res.status(500).json({ error: "Failed to unsubscribe." });
    return;
  }

  res.json({ ok: true });
});

router.get("/subscriber-check", async (req, res): Promise<void> => {
  const { email } = req.query as { email?: string };
  if (!email) { res.status(400).json({ error: "email required" }); return; }

  const { data } = await supabase
    .from("subscribers")
    .select("id")
    .eq("email", email.toLowerCase())
    .limit(1);

  if (data && data.length > 0) {
    res.json({ subscribed: true });
  } else {
    res.status(404).json({ subscribed: false });
  }
});

export default router;
