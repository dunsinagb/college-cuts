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

router.get("/stats/yearly-by-month", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      year: sql<string>`extract(year from ${cutsTable.announcementDate}::date)::text`,
      month: sql<string>`to_char(${cutsTable.announcementDate}::date, 'MM')`,
      count: count(),
    })
    .from(cutsTable)
    .groupBy(
      sql`extract(year from ${cutsTable.announcementDate}::date)`,
      sql`to_char(${cutsTable.announcementDate}::date, 'MM')`
    )
    .orderBy(
      sql`extract(year from ${cutsTable.announcementDate}::date)`,
      sql`to_char(${cutsTable.announcementDate}::date, 'MM')`
    );

  const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const years = [...new Set(rows.map(r => r.year))].sort();
  const byMonth: Record<string, Record<string, number>> = {};

  for (const r of rows) {
    const label = MONTH_LABELS[parseInt(r.month, 10) - 1];
    if (!byMonth[label]) byMonth[label] = {};
    byMonth[label][r.year] = Number(r.count);
  }

  const result = MONTH_LABELS.map((label) => {
    const entry: Record<string, string | number> = { month: label };
    for (const yr of years) entry[yr] = byMonth[label]?.[yr] ?? 0;
    return entry;
  });

  res.json({ years, data: result });
});

router.get("/stats/yearly-by-state", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      state: cutsTable.state,
      year: sql<string>`extract(year from ${cutsTable.announcementDate}::date)::text`,
      count: count(),
    })
    .from(cutsTable)
    .groupBy(
      cutsTable.state,
      sql`extract(year from ${cutsTable.announcementDate}::date)`
    );

  const years = [...new Set(rows.map(r => r.year))].sort();

  const totals: Record<string, number> = {};
  const byState: Record<string, Record<string, number>> = {};
  for (const r of rows) {
    totals[r.state] = (totals[r.state] ?? 0) + Number(r.count);
    if (!byState[r.state]) byState[r.state] = {};
    byState[r.state][r.year] = Number(r.count);
  }

  const top10 = Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([state]) => {
      const entry: Record<string, string | number> = { state };
      for (const yr of years) entry[yr] = byState[state]?.[yr] ?? 0;
      return entry;
    });

  res.json({ years, data: top10 });
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
