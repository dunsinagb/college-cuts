import { Router, type IRouter } from "express";
import { db, tipsTable } from "@workspace/db";
import { SubmitTipBody } from "@workspace/api-zod";
import { Resend } from "resend";

const router: IRouter = Router();

const ADMIN_EMAIL = "agbolaboridunsin@gmail.com";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

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

      const safeInstitution = escapeHtml(tip.institution);
      const safeProgramName = tip.programName ? escapeHtml(tip.programName) : null;
      const safeState = escapeHtml(tip.state);
      const safeCutType = escapeHtml(tip.cutType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()));
      const safeDate = tip.announcementDate ? escapeHtml(tip.announcementDate) : null;
      const safeDescription = escapeHtml(tip.description);
      const safeSubmitterEmail = tip.submitterEmail ? escapeHtml(tip.submitterEmail) : null;
      const safeSourceUrl = tip.sourceUrl ? escapeHtml(tip.sourceUrl) : null;
      const safeId = escapeHtml(String(tip.id));

      const tipDetails = `
        <table style="width:100%;border-collapse:collapse;margin-top:16px;font-size:14px">
          <tr><td style="padding:8px 0;color:#6b7280;width:140px">Institution</td><td style="padding:8px 0;color:#111827;font-weight:600">${safeInstitution}</td></tr>
          ${safeProgramName ? `<tr><td style="padding:8px 0;color:#6b7280">Program</td><td style="padding:8px 0;color:#111827">${safeProgramName}</td></tr>` : ""}
          <tr><td style="padding:8px 0;color:#6b7280">State</td><td style="padding:8px 0;color:#111827">${safeState}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280">Action Type</td><td style="padding:8px 0;color:#111827">${safeCutType}</td></tr>
          ${safeDate ? `<tr><td style="padding:8px 0;color:#6b7280">Date</td><td style="padding:8px 0;color:#111827">${safeDate}</td></tr>` : ""}
          ${safeSourceUrl ? `<tr><td style="padding:8px 0;color:#6b7280">Source</td><td style="padding:8px 0;color:#1d4ed8"><a href="${safeSourceUrl}">${safeSourceUrl}</a></td></tr>` : ""}
          <tr><td style="padding:8px 0;color:#6b7280;vertical-align:top">Description</td><td style="padding:8px 0;color:#111827">${safeDescription}</td></tr>
          ${safeSubmitterEmail ? `<tr><td style="padding:8px 0;color:#6b7280">Submitter</td><td style="padding:8px 0;color:#111827">${safeSubmitterEmail}</td></tr>` : ""}
        </table>
      `;

      const emails: Promise<unknown>[] = [];

      emails.push(
        resend.emails.send({
          from: "CollegeCuts <hello@college-cuts.com>",
          to: [ADMIN_EMAIL],
          subject: `New Tip: ${safeInstitution} (${safeState})`,
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px 24px">
              <h2 style="color:#0f2a4a;margin-bottom:4px">New Tip Submitted</h2>
              <p style="color:#6b7280;margin-top:0">A new tip has been submitted to CollegeCuts and is awaiting review.</p>
              ${tipDetails}
              <p style="color:#6b7280;font-size:13px;margin-top:24px;border-top:1px solid #e5e7eb;padding-top:16px">
                Tip ID: ${safeId} — submitted via collegecuts.com
              </p>
            </div>
          `,
        })
      );

      if (tip.submitterEmail) {
        emails.push(
          resend.emails.send({
            from: "CollegeCuts <hello@college-cuts.com>",
            to: [tip.submitterEmail],
            subject: "We received your tip — thank you!",
            html: `
              <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
                <h2 style="color:#0f2a4a;margin-bottom:8px">Thanks for your tip!</h2>
                <p style="color:#374151;line-height:1.6">We received your report about <strong>${safeInstitution}</strong>${safeProgramName ? ` (${safeProgramName})` : ""}. Our team will review it and add it to the database if confirmed.</p>
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
