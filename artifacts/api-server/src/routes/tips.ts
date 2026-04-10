import { Router, type IRouter } from "express";
import { db, tipsTable } from "@workspace/db";
import { SubmitTipBody } from "@workspace/api-zod";
import { Resend } from "resend";

const router: IRouter = Router();

const ADMIN_EMAIL = "agbolaboridunsin@gmail.com";

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

  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);

      const tipDetails = `
        <table style="width:100%;border-collapse:collapse;margin-top:16px;font-size:14px">
          <tr><td style="padding:8px 0;color:#6b7280;width:140px">Institution</td><td style="padding:8px 0;color:#111827;font-weight:600">${tip.institution}</td></tr>
          ${tip.programName ? `<tr><td style="padding:8px 0;color:#6b7280">Program</td><td style="padding:8px 0;color:#111827">${tip.programName}</td></tr>` : ""}
          <tr><td style="padding:8px 0;color:#6b7280">State</td><td style="padding:8px 0;color:#111827">${tip.state}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280">Action Type</td><td style="padding:8px 0;color:#111827">${tip.cutType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</td></tr>
          ${tip.announcementDate ? `<tr><td style="padding:8px 0;color:#6b7280">Date</td><td style="padding:8px 0;color:#111827">${tip.announcementDate}</td></tr>` : ""}
          ${tip.sourceUrl ? `<tr><td style="padding:8px 0;color:#6b7280">Source</td><td style="padding:8px 0;color:#1d4ed8"><a href="${tip.sourceUrl}">${tip.sourceUrl}</a></td></tr>` : ""}
          <tr><td style="padding:8px 0;color:#6b7280;vertical-align:top">Description</td><td style="padding:8px 0;color:#111827">${tip.description}</td></tr>
          ${tip.submitterEmail ? `<tr><td style="padding:8px 0;color:#6b7280">Submitter</td><td style="padding:8px 0;color:#111827">${tip.submitterEmail}</td></tr>` : ""}
        </table>
      `;

      const emails: Promise<unknown>[] = [];

      // Admin notification
      emails.push(
        resend.emails.send({
          from: "CollegeCuts <onboarding@resend.dev>",
          to: [ADMIN_EMAIL],
          subject: `New Tip: ${tip.institution} (${tip.state})`,
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px 24px">
              <h2 style="color:#0f2a4a;margin-bottom:4px">New Tip Submitted</h2>
              <p style="color:#6b7280;margin-top:0">A new tip has been submitted to CollegeCuts and is awaiting review.</p>
              ${tipDetails}
              <p style="color:#6b7280;font-size:13px;margin-top:24px;border-top:1px solid #e5e7eb;padding-top:16px">
                Tip ID: ${tip.id} — submitted via collegecuts.com
              </p>
            </div>
          `,
        })
      );

      // Submitter confirmation (only if they provided email)
      if (tip.submitterEmail) {
        emails.push(
          resend.emails.send({
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
          })
        );
      }

      await Promise.all(emails);
    } catch (err) {
      console.error("Failed to send tip email:", err);
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
