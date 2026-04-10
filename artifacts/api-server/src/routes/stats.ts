import { Router, type IRouter } from "express";
import { db, cutsTable } from "@workspace/db";
import { sql, count, sum, desc, eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/stats/summary", async (_req, res): Promise<void> => {
  const [summary] = await db
    .select({
      totalCuts: count(),
      totalStudentsAffected: sum(cutsTable.studentsAffected),
      totalFacultyAffected: sum(cutsTable.facultyAffected),
    })
    .from(cutsTable);

  const institutionCount = await db
    .selectDistinct({ institution: cutsTable.institution })
    .from(cutsTable);

  const stateCount = await db
    .selectDistinct({ state: cutsTable.state })
    .from(cutsTable);

  const confirmedCount = await db
    .select({ count: count() })
    .from(cutsTable)
    .where(eq(cutsTable.status, "confirmed"));

  const ongoingCount = await db
    .select({ count: count() })
    .from(cutsTable)
    .where(eq(cutsTable.status, "ongoing"));

  const reversedCount = await db
    .select({ count: count() })
    .from(cutsTable)
    .where(eq(cutsTable.status, "reversed"));

  res.json({
    totalCuts: Number(summary?.totalCuts ?? 0),
    totalStudentsAffected: Number(summary?.totalStudentsAffected ?? 0),
    totalFacultyAffected: Number(summary?.totalFacultyAffected ?? 0),
    totalInstitutions: institutionCount.length,
    totalStatesAffected: stateCount.length,
    confirmedCuts: Number(confirmedCount[0]?.count ?? 0),
    ongoingCuts: Number(ongoingCount[0]?.count ?? 0),
    reversedCuts: Number(reversedCount[0]?.count ?? 0),
  });
});

router.get("/stats/by-state", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      state: cutsTable.state,
      count: count(),
      studentsAffected: sum(cutsTable.studentsAffected),
    })
    .from(cutsTable)
    .groupBy(cutsTable.state)
    .orderBy(desc(count()));

  res.json(
    rows.map((r) => ({
      state: r.state,
      count: Number(r.count),
      studentsAffected: Number(r.studentsAffected ?? 0),
    }))
  );
});

router.get("/stats/by-type", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      cutType: cutsTable.cutType,
      count: count(),
    })
    .from(cutsTable)
    .groupBy(cutsTable.cutType)
    .orderBy(desc(count()));

  res.json(
    rows.map((r) => ({
      cutType: r.cutType,
      count: Number(r.count),
    }))
  );
});

router.get("/stats/monthly-trend", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      month: sql<string>`to_char(${cutsTable.announcementDate}::date, 'YYYY-MM')`,
      count: count(),
    })
    .from(cutsTable)
    .groupBy(sql`to_char(${cutsTable.announcementDate}::date, 'YYYY-MM')`)
    .orderBy(sql`to_char(${cutsTable.announcementDate}::date, 'YYYY-MM')`);

  res.json(
    rows.map((r) => ({
      month: r.month,
      count: Number(r.count),
    }))
  );
});

router.get("/stats/recent", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(cutsTable)
    .orderBy(desc(cutsTable.announcementDate))
    .limit(10);

  res.json(
    rows.map((cut) => ({
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
    }))
  );
});

export default router;
