import { Router, type IRouter } from "express";
import { eq, ilike, and, sql, desc, count, sum } from "drizzle-orm";
import { db, cutsTable } from "@workspace/db";
import {
  ListCutsQueryParams,
  GetCutParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/cuts", async (req, res): Promise<void> => {
  const parsed = ListCutsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { state, cutType, status, control, search, page = 1, limit = 20 } = parsed.data;
  const offset = (page - 1) * limit;

  const conditions = [];

  if (state) conditions.push(eq(cutsTable.state, state));
  if (cutType) conditions.push(eq(cutsTable.cutType, cutType));
  if (status) conditions.push(eq(cutsTable.status, status));
  if (control) conditions.push(eq(cutsTable.control, control));
  if (search) {
    conditions.push(
      sql`(${cutsTable.institution} ilike ${"%" + search + "%"} OR ${cutsTable.programName} ilike ${"%" + search + "%"})`
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, totalRows] = await Promise.all([
    db.select().from(cutsTable).where(where).orderBy(desc(cutsTable.announcementDate)).limit(limit).offset(offset),
    db.select({ count: count() }).from(cutsTable).where(where),
  ]);

  const total = Number(totalRows[0]?.count ?? 0);

  res.json({
    data: rows.map(formatCut),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
});

router.get("/cuts/:id", async (req, res): Promise<void> => {
  const params = GetCutParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [cut] = await db.select().from(cutsTable).where(eq(cutsTable.id, params.data.id));

  if (!cut) {
    res.status(404).json({ error: "Cut not found" });
    return;
  }

  res.json(formatCut(cut));
});

function formatCut(cut: typeof cutsTable.$inferSelect) {
  return {
    id: cut.id,
    institution: cut.institution,
    programName: cut.programName,
    state: cut.state,
    control: cut.control,
    cutType: cut.cutType,
    announcementDate: cut.announcementDate,
    effectiveTerm: cut.effectiveTerm,
    studentsAffected: cut.studentsAffected,
    facultyAffected: cut.facultyAffected,
    notes: cut.notes,
    sourceUrl: cut.sourceUrl,
    sourcePublication: cut.sourcePublication,
    status: cut.status,
    createdAt: cut.createdAt.toISOString(),
    updatedAt: cut.updatedAt.toISOString(),
  };
}

export default router;
