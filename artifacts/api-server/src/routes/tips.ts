import { Router, type IRouter } from "express";
import { db, tipsTable } from "@workspace/db";
import { SubmitTipBody } from "@workspace/api-zod";

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
