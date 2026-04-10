import { Router, type IRouter } from "express";
import { db, tipsTable } from "@workspace/db";
import { SubmitTipBody } from "@workspace/api-zod";
import { Resend } from "resend";

const router: IRouter = Router();

router.post("/tips", async (req, res): Promise<void> => {
  const parsed = SubmitTipBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [tip] = await db
    .insert(tipsTable)
    .values({
      institution: parsed.data.institution,
      programName: parsed.data.programName ?? null,
      state: parsed.data.state,
      cutType: parsed.data.cutType,
      announcementDate: parsed.data.announcementDate ?? null,
      sourceUrl: parsed.data.sourceUrl ?? null,
      description: parsed.data.description,
      submitterEmail: parsed.data.submitterEmail ?? null,
      status: "pending",
    })
    .returning();

  if (tip.submitterEmail && process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "CollegeCuts <onboarding@resend.dev>",
        to: [tip.submitterEmail],
        subject: "We received your tip — thank you!",
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
            <h2 style="color:#0f2a4a;margin-bottom:8px">Thanks for your tip!</h2>
            <p style="color:#374151;line-height:1.6">We received your report about <strong>${tip.institution}</strong>${tip.programName ? ` (${tip.programName})` : ""}. Our team will review it and add it to the database if confirmed.</p>
            <p style="color:#374151;line-height:1.6">Tips like yours help keep this database accurate and comprehensive. We appreciate your contribution to tracking the human cost of higher education cuts.</p>
            <p style="color:#6b7280;font-size:14px;margin-top:24px">— The CollegeCuts Team</p>
          </div>
        `,
      });
    } catch (err) {
      console.error("Failed to send tip confirmation email:", err);
    }
  }

  res.status(201).json({
    id: tip.id,
    institution: tip.institution,
    programName: tip.programName,
    state: tip.state,
    cutType: tip.cutType,
    announcementDate: tip.announcementDate,
    sourceUrl: tip.sourceUrl,
    description: tip.description,
    submitterEmail: tip.submitterEmail,
    status: tip.status,
    createdAt: tip.createdAt.toISOString(),
  });
});

export default router;
