import { Router, type IRouter } from "express";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const router: IRouter = Router();

const PRODUCTION_URL = "https://college-cuts.com";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

// Never allow localhost in redirect URLs — replace with the real domain
function sanitizeRedirectTo(redirectTo?: string): string {
  const fallback = `${PRODUCTION_URL}/auth/callback`;
  if (!redirectTo) return fallback;
  try {
    const url = new URL(redirectTo);
    if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
      const replitDomain = process.env.REPLIT_DEV_DOMAIN;
      const base = replitDomain ? `https://${replitDomain}` : PRODUCTION_URL;
      return `${base}${url.pathname}${url.search}`;
    }
  } catch {}
  return redirectTo;
}

function emailLayout(bodyHtml: string): string {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html>
  <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
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
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #f3f4f6;text-align:center;">
              <span style="color:#9ca3af;font-size:11px;">© ${year} CollegeCuts · <a href="${PRODUCTION_URL}" style="color:#9ca3af;">college-cuts.com</a></span>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

function linkEmailBody(heading: string, intro: string, buttonLabel: string, actionUrl: string, footnote: string): string {
  return `
    <h2 style="margin:0 0 12px;color:#1e3a5f;font-size:20px;font-weight:700;">${heading}</h2>
    <p style="margin:0 0 24px;color:#4b5563;font-size:15px;line-height:1.6;">${intro}</p>
    <div style="text-align:center;margin:0 0 28px;">
      <a href="${actionUrl}" style="display:inline-block;background:#1e3a5f;color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 32px;border-radius:10px;">
        ${buttonLabel}
      </a>
    </div>
    <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.6;">
      ${footnote}
    </p>`;
}

// POST /api/auth/magic-link
router.post("/auth/magic-link", async (req, res): Promise<void> => {
  const { email, redirectTo } = req.body as { email?: string; redirectTo?: string };

  if (!email || !email.includes("@")) {
    res.status(400).json({ error: "Valid email is required" });
    return;
  }

  const cleanEmail = email.trim().toLowerCase();
  const safeRedirect = sanitizeRedirectTo(redirectTo);
  const supabase = getSupabaseAdmin();

  try {
    const { data, error } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: cleanEmail,
      options: { redirectTo: safeRedirect },
    });

    if (error || !data?.properties?.action_link) {
      const errMsg = error?.message?.toLowerCase() || "";
      if (errMsg.includes("rate limit") || errMsg.includes("too many")) {
        res.status(429).json({ error: "Too many sign-in requests. Please wait a few minutes before trying again." });
      } else {
        console.error("generateLink error:", error?.message);
        res.status(500).json({ error: "Could not generate sign-in link. Please try again." });
      }
      return;
    }

    const actionUrl = data.properties.action_link;
    const resend = getResend();

    const { error: emailError } = await resend.emails.send({
      from: "CollegeCuts <hello@college-cuts.com>",
      to: cleanEmail,
      subject: "Your CollegeCuts sign-in link",
      html: emailLayout(linkEmailBody(
        "Your sign-in link",
        "Click the button below to sign in to your CollegeCuts account. This link expires in 1 hour and can only be used once.",
        "Sign in to CollegeCuts →",
        actionUrl,
        `If you didn't request this, you can safely ignore this email. Your account remains secure.`,
      )),
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

// POST /api/auth/signup
// Creates the user account and sends a branded confirmation email via Resend
router.post("/auth/signup", async (req, res): Promise<void> => {
  const { email, password, redirectTo } = req.body as {
    email?: string;
    password?: string;
    redirectTo?: string;
  };

  if (!email || !email.includes("@")) {
    res.status(400).json({ error: "Valid email is required" });
    return;
  }
  if (!password || password.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters" });
    return;
  }

  const cleanEmail = email.trim().toLowerCase();
  const safeRedirect = sanitizeRedirectTo(redirectTo);
  const supabase = getSupabaseAdmin();

  try {
    // Try to create a new user with email confirmation
    const { data, error } = await supabase.auth.admin.generateLink({
      type: "signup",
      email: cleanEmail,
      password,
      options: { redirectTo: safeRedirect },
    });

    if (error) {
      const errMsg = error.message.toLowerCase();

      // User already exists — send a magic link instead so they can just sign in
      if (errMsg.includes("already registered") || errMsg.includes("already exists") || errMsg.includes("duplicate")) {
        const { data: mlData, error: mlError } = await supabase.auth.admin.generateLink({
          type: "magiclink",
          email: cleanEmail,
          options: { redirectTo: safeRedirect },
        });

        if (mlError || !mlData?.properties?.action_link) {
          res.status(409).json({ alreadyExists: true });
          return;
        }

        const actionUrl = mlData.properties.action_link;
        const resend = getResend();

        await resend.emails.send({
          from: "CollegeCuts <hello@college-cuts.com>",
          to: cleanEmail,
          subject: "Sign in to CollegeCuts",
          html: emailLayout(linkEmailBody(
            "You already have an account",
            "An account for this email already exists. Click below to sign in instantly — no password needed.",
            "Sign in to CollegeCuts →",
            actionUrl,
            `If you didn't request this, you can safely ignore this email.`,
          )),
        });

        res.json({ ok: true, alreadyExists: true });
        return;
      }

      res.status(400).json({ error: error.message });
      return;
    }

    if (!data?.properties?.action_link) {
      res.status(500).json({ error: "Could not create account. Please try again." });
      return;
    }

    const actionUrl = data.properties.action_link;

    // Add to subscribers table
    try {
      await fetch(`http://localhost:${process.env.PORT || 8080}/api/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });
    } catch {}

    // Send branded confirmation email via Resend
    const resend = getResend();
    const { error: emailError } = await resend.emails.send({
      from: "CollegeCuts <hello@college-cuts.com>",
      to: cleanEmail,
      subject: "Confirm your CollegeCuts account",
      html: emailLayout(linkEmailBody(
        "Welcome to CollegeCuts",
        "Click the button below to confirm your email and activate your account. Your access to the full higher education database will be ready immediately.",
        "Confirm my account →",
        actionUrl,
        `This link expires in 24 hours and can only be used once.<br />If you didn't create an account, you can safely ignore this email.`,
      )),
    });

    if (emailError) {
      console.error("Resend signup email error:", JSON.stringify(emailError));
      res.status(500).json({ error: "Account created but confirmation email failed. Please use the sign-in link option to access your account." });
      return;
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Unexpected error during signup. Please try again." });
  }
});

export default router;
