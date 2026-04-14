import { Router, type IRouter } from "express";
import { supabase } from "../lib/supabase";

const router: IRouter = Router();

type SupabaseCut = {
  id: string;
  institution: string;
  program_name: string | null;
  cut_type: string;
  announcement_date: string;
  students_affected: number | null;
  faculty_affected: number | null;
  state: string;
  control: string | null;
  status: string;
  notes: string | null;
};

async function fetchAllCuts(): Promise<SupabaseCut[]> {
  const { data, error } = await supabase
    .from("v_latest_cuts")
    .select("id,institution,program_name,cut_type,announcement_date,students_affected,faculty_affected,state,control,status,notes")
    .order("announcement_date", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as SupabaseCut[];
}

function extractPrimaryReason(notes: string | null): string | null {
  if (!notes) return null;
  const n = notes.toLowerCase();
  if (n.includes("budget") || n.includes("financial") || n.includes("deficit") || n.includes("fiscal") || n.includes("shortfall") || n.includes("underfund") || n.includes("cost saving") || n.includes("cost reduction") || n.includes("revenue")) return "Budget Deficit";
  if (n.includes("enrollment") || n.includes("low enroll") || n.includes("declining enroll") || n.includes("student demand") || n.includes("declining student")) return "Enrollment Decline";
  if (n.includes("merger") || n.includes("merge") || n.includes("acqui") || n.includes("consolidat")) return "Merger / Consolidation";
  if (n.includes("accredit")) return "Accreditation Issues";
  if (n.includes("compliance") || n.includes("sb1") || n.includes("mandate") || n.includes("regulation") || n.includes("executive order") || n.includes("dei") || n.includes("diversity")) return "Compliance / Policy";
  if (n.includes("restructur") || n.includes("reorganiz") || n.includes("strategic") || n.includes("priorit")) return "Strategic Restructuring";
  if (n.includes("state") && (n.includes("fund") || n.includes("cut") || n.includes("alloc") || n.includes("appropriat"))) return "State Funding Cuts";
  return null;
}

router.get("/stats/summary", async (_req, res): Promise<void> => {
  try {
    const rows = await fetchAllCuts();

    const totalStudents = rows.reduce((s, r) => s + (r.students_affected ?? 0), 0);
    const totalFaculty  = rows.reduce((s, r) => s + (r.faculty_affected  ?? 0), 0);
    const institutions  = new Set(rows.map(r => r.institution));
    const states        = new Set(rows.map(r => r.state));
    const confirmed     = rows.filter(r => r.status === "confirmed").length;
    const ongoing       = rows.filter(r => r.status === "ongoing").length;
    const reversed      = rows.filter(r => r.status === "reversed").length;

    res.json({
      totalCuts:             rows.length,
      totalStudentsAffected: totalStudents,
      totalFacultyAffected:  totalFaculty,
      totalInstitutions:     institutions.size,
      totalStatesAffected:   states.size,
      confirmedCuts:         confirmed,
      ongoingCuts:           ongoing,
      reversedCuts:          reversed,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/stats/by-state", async (_req, res): Promise<void> => {
  try {
    const rows = await fetchAllCuts();
    const map: Record<string, { count: number; studentsAffected: number }> = {};
    for (const r of rows) {
      if (!map[r.state]) map[r.state] = { count: 0, studentsAffected: 0 };
      map[r.state].count++;
      map[r.state].studentsAffected += r.students_affected ?? 0;
    }
    const result = Object.entries(map)
      .sort((a, b) => b[1].count - a[1].count)
      .map(([state, v]) => ({ state, ...v }));
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/stats/by-type", async (_req, res): Promise<void> => {
  try {
    const rows = await fetchAllCuts();
    const map: Record<string, number> = {};
    for (const r of rows) {
      map[r.cut_type] = (map[r.cut_type] ?? 0) + 1;
    }
    const result = Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([cutType, count]) => ({ cutType, count }));
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/stats/monthly-trend", async (_req, res): Promise<void> => {
  try {
    const rows = await fetchAllCuts();
    const countMap: Record<string, number> = {};
    const statesMap: Record<string, Set<string>> = {};
    for (const r of rows) {
      const month = r.announcement_date?.slice(0, 7); // "YYYY-MM"
      if (month) {
        countMap[month] = (countMap[month] ?? 0) + 1;
        if (!statesMap[month]) statesMap[month] = new Set();
        statesMap[month].add(r.state);
      }
    }
    const result = Object.entries(countMap)
      .filter(([month]) => month >= "2024-01")
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count, states: statesMap[month]?.size ?? 0 }));
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/stats/yearly-by-month", async (_req, res): Promise<void> => {
  try {
    const rows = await fetchAllCuts();
    const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const years = new Set<string>();
    const byMonth: Record<string, Record<string, number>> = {};

    for (const r of rows) {
      if (!r.announcement_date) continue;
      const d    = new Date(r.announcement_date);
      const yr   = String(d.getFullYear());
      if (parseInt(yr) < 2024) continue;
      const lbl  = MONTH_LABELS[d.getMonth()];
      years.add(yr);
      if (!byMonth[lbl]) byMonth[lbl] = {};
      byMonth[lbl][yr] = (byMonth[lbl][yr] ?? 0) + 1;
    }

    const sortedYears = [...years].sort();
    const data = MONTH_LABELS.map((label) => {
      const entry: Record<string, string | number> = { month: label };
      for (const yr of sortedYears) entry[yr] = byMonth[label]?.[yr] ?? 0;
      return entry;
    });

    res.json({ years: sortedYears, data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/stats/yearly-by-state", async (_req, res): Promise<void> => {
  try {
    const rows = await fetchAllCuts();
    const years = new Set<string>();
    const totals: Record<string, number> = {};
    const byState: Record<string, Record<string, number>> = {};

    for (const r of rows) {
      if (!r.announcement_date) continue;
      const yr = String(new Date(r.announcement_date).getFullYear());
      if (parseInt(yr) < 2024) continue;
      years.add(yr);
      totals[r.state] = (totals[r.state] ?? 0) + 1;
      if (!byState[r.state]) byState[r.state] = {};
      byState[r.state][yr] = (byState[r.state][yr] ?? 0) + 1;
    }

    const sortedYears = [...years].sort();
    const top10 = Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([state]) => {
        const entry: Record<string, string | number> = { state };
        for (const yr of sortedYears) entry[yr] = byState[state]?.[yr] ?? 0;
        return entry;
      });

    res.json({ years: sortedYears, data: top10 });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/stats/by-control", async (_req, res): Promise<void> => {
  try {
    const rows = await fetchAllCuts();
    const map: Record<string, { count: number; studentsAffected: number; facultyAffected: number }> = {};
    for (const r of rows) {
      const key = r.control ?? "Unknown";
      if (!map[key]) map[key] = { count: 0, studentsAffected: 0, facultyAffected: 0 };
      map[key].count++;
      map[key].studentsAffected += r.students_affected ?? 0;
      map[key].facultyAffected  += r.faculty_affected  ?? 0;
    }
    const result = Object.entries(map)
      .sort((a, b) => b[1].count - a[1].count)
      .map(([control, v]) => ({ control, ...v }));
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/stats/by-status", async (_req, res): Promise<void> => {
  try {
    const rows = await fetchAllCuts();
    const map: Record<string, number> = {};
    for (const r of rows) {
      const key = r.status ?? "unknown";
      map[key] = (map[key] ?? 0) + 1;
    }
    const result = Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([status, count]) => ({ status, count }));
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/stats/by-reason", async (_req, res): Promise<void> => {
  try {
    const rows = await fetchAllCuts();
    const tally: Record<string, number> = {};

    for (const r of rows) {
      const reason = extractPrimaryReason(r.notes);
      if (reason) {
        tally[reason] = (tally[reason] ?? 0) + 1;
      }
    }

    const result = Object.entries(tally)
      .sort((a, b) => b[1] - a[1])
      .map(([reason, count]) => ({ reason, count }));

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/stats/yearly-summary", async (req, res): Promise<void> => {
  try {
    const year = String(req.query.year ?? new Date().getFullYear());
    const rows = await fetchAllCuts();
    const filtered = rows.filter(r => r.announcement_date?.startsWith(year));
    const institutions = new Set(filtered.map(r => r.institution)).size;
    const states       = new Set(filtered.map(r => r.state)).size;
    const actions      = filtered.length;
    const studentsAffected = filtered.reduce((s, r) => s + (r.students_affected ?? 0), 0);
    const facultyAffected  = filtered.reduce((s, r) => s + (r.faculty_affected  ?? 0), 0);
    res.json({ year, actions, institutions, states, studentsAffected, facultyAffected });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/stats/recent", async (_req, res): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from("v_latest_cuts")
      .select("*")
      .order("announcement_date", { ascending: false })
      .limit(10);

    if (error) throw new Error(error.message);

    res.json(
      (data ?? []).map((cut: any) => ({
        id:                cut.id,
        institution:       cut.institution,
        programName:       cut.program_name,
        state:             cut.state,
        control:           cut.control,
        cutType:           cut.cut_type,
        announcementDate:  cut.announcement_date,
        effectiveTerm:     cut.effective_term,
        studentsAffected:  cut.students_affected,
        facultyAffected:   cut.faculty_affected,
        notes:             cut.notes,
        sourceUrl:         cut.source_url,
        sourcePublication: cut.source_publication,
        status:            cut.status,
        createdAt:         cut.created_at,
        updatedAt:         cut.updated_at,
      }))
    );
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/* ── All-time summary (KPIs for All Actions page) ────────────── */
router.get("/stats/ytd", async (_req, res): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from("v_latest_cuts")
      .select("id,institution,students_affected,faculty_affected,state");

    if (error) { res.status(500).json({ error: error.message }); return; }
    const rows = (data ?? []) as { id: string; institution: string; students_affected: number | null; faculty_affected: number | null; state: string }[];

    const students   = rows.reduce((s, r) => s + (r.students_affected ?? 0), 0);
    const faculty    = rows.reduce((s, r) => s + (r.faculty_affected  ?? 0), 0);
    const institutions = new Set(rows.map(r => r.institution)).size;
    const stateCounts: Record<string, number> = {};
    for (const r of rows) stateCounts[r.state] = (stateCounts[r.state] ?? 0) + 1;
    const mostActiveState = Object.entries(stateCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

    res.json({ totalActions: rows.length, totalStudentsAffected: students, totalFacultyAffected: faculty, totalInstitutions: institutions, mostActiveState });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Dot-map data (all-time, colored by institution type) ─────── */
router.get("/stats/dot-map", async (_req, res): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from("v_latest_cuts")
      .select("id,institution,state,control,announcement_date")
      .order("announcement_date", { ascending: false });

    if (error) { res.status(500).json({ error: error.message }); return; }
    const rows = (data ?? []) as { id: string; institution: string; state: string; control: string | null; announcement_date: string }[];

    res.json(rows.map(r => ({ id: r.id, institution: r.institution, state: r.state, control: r.control ?? "Unknown", date: r.announcement_date })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
