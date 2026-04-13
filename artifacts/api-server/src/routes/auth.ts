import { Router, type IRouter } from "express";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const router: IRouter = Router();

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

router.post("/auth/magic-link", async (req, res): Promise<void> => {
  const { email, redirectTo } = req.body as { email?: string; redirectTo?: string };

  if (!email || !email.includes("@")) {
    res.status(400).json({ error: "Valid email is required" });
    return;
  }

  const cleanEmail = email.trim().toLowerCase();
  const supabase = getSupabaseAdmin();

  try {
    const { data, error } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: cleanEmail,
      options: {
        redirectTo: redirectTo || `${process.env.SITE_URL || "https://college-cuts.com"}/auth/callback`,
      },
    });

    if (error || !data?.properties?.action_link) {
      const errMsg = error?.message?.toLowerCase() || "";
      if (errMsg.includes("rate limit") || errMsg.includes("too many")) {
        res.status(429).json({ error: "Too many sign-in requests. Please wait a few minutes before trying again." });
      } else {
        res.status(500).json({ error: "Could not generate sign-in link. Please try again." });
      }
      return;
    }

    const magicUrl = data.properties.action_link;
    const resend = getResend();

    const { error: emailError } = await resend.emails.send({
      from: "CollegeCuts <hello@college-cuts.com>",
      to: cleanEmail,
      subject: "Your CollegeCuts sign-in link",
      html: `
        <!DOCTYPE html>
        <html>
          <head><meta charset="utf-8" /></head>
          <body style="margin:0;padding:0;background:#f0f4f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f9;padding:40px 20px;">
              <tr><td align="center">
                <table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
                  <tr>
                    <td style="background:#1e3a5f;padding:28px 32px;text-align:center;">
                      <span style="color:#fbbf24;font-size:22px;font-weight:900;letter-spacing:-0.5px;">CollegeCuts</span>
                      <div style="color:#93c5fd;font-size:13px;margin-top:4px;">Higher Education Database</div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:36px 32px;">
                      <h2 style="margin:0 0 12px;color:#1e3a5f;font-size:20px;font-weight:700;">Your sign-in link</h2>
                      <p style="margin:0 0 24px;color:#4b5563;font-size:15px;line-height:1.6;">
                        Click the button below to sign in to your CollegeCuts account. This link expires in 1 hour and can only be used once.
                      </p>
                      <div style="text-align:center;margin:0 0 28px;">
                        <a href="${magicUrl}" style="display:inline-block;background:#1e3a5f;color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 32px;border-radius:10px;">
                          Sign in to CollegeCuts →
                        </a>
                      </div>
                      <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.5;">
                        If you didn't request this, you can safely ignore this email. Your account remains secure.
                        <br /><br />
                        Or copy this URL into your browser:<br />
                        <span style="color:#6b7280;word-break:break-all;">${magicUrl}</span>
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:20px 32px;border-top:1px solid #f3f4f6;text-align:center;">
                      <span style="color:#9ca3af;font-size:11px;">© ${new Date().getFullYear()} CollegeCuts · <a href="https://college-cuts.com" style="color:#9ca3af;">college-cuts.com</a></span>
                    </td>
                  </tr>
                </table>
              </td></tr>
            </table>
          </body>
        </html>
      `,
    });

    if (emailError) {
      console.error("Resend delivery error:", JSON.stringify(emailError));
      res.status(500).json({ error: "Sign-in link generated but email delivery failed. Please try again." });
      return;
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("Magic link error:", err);
    res.status(500).json({ error: "Unexpected error. Please try again." });
  }
});

export default router;
