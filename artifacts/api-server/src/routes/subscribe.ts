import { Router, type IRouter } from "express";
import { supabase } from "../lib/supabase";
import { Resend } from "resend";

const router: IRouter = Router();

router.post("/subscribe", async (req, res): Promise<void> => {
  const { email } = req.body as { email?: string };

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: "Invalid email address" });
    return;
  }

  // Check if already subscribed
  const { data: existing } = await supabase
    .from("subscribers")
    .select("id")
    .eq("email", email)
    .limit(1);

  const isNew = !existing || existing.length === 0;

  if (isNew) {
    const { error } = await supabase
      .from("subscribers")
      .insert({ email });

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
        subject: "Welcome to CollegeCuts Tracker!",
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
            <h2 style="color:#0f2a4a;margin-bottom:8px">Welcome to CollegeCuts Tracker</h2>
            <p style="color:#374151;line-height:1.6">Thank you for subscribing! You now have full access to the most comprehensive database of college program cuts, closures, and institutional changes in the U.S.</p>
            <ul style="color:#374151;line-height:2">
              <li>Browse every program cut and closure in our database</li>
              <li>Explore year-over-year analytics and trends</li>
              <li>Look up job outlook data for affected programs</li>
            </ul>
            <p style="color:#6b7280;font-size:14px;margin-top:24px">— The CollegeCuts Team</p>
          </div>
        `,
      });
    } catch (err) {
      console.error("Failed to send welcome email:", err);
    }
  }

  res.json({ ok: true });
});

export default router;
