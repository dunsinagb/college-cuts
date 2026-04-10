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
  if (n.includes("budget") || n.includes("financial") || n.includes("deficit") || n.includes("fiscal")) return "Budget Deficit";
  if (n.includes("enrollment") || n.includes("low enroll") || n.includes("declining enroll")) return "Enrollment Decline";
  if (n.includes("merger") || n.includes("merge") || n.includes("acqui")) return "Merger / Consolidation";
  if (n.includes("accredit")) return "Accreditation Issues";
  if (n.includes("compliance") || n.includes("sb1") || n.includes("mandate") || n.includes("regulation")) return "Compliance / Policy";
  if (n.includes("restructur") || n.includes("reorganiz") || n.includes("strategic")) return "Strategic Restructuring";
  if (n.includes("state") && (n.includes("fund") || n.includes("cut") || n.includes("alloc"))) return "State Funding Cuts";
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
    const map: Record<string, number> = {};
    for (const r of rows) {
      const month = r.announcement_date?.slice(0, 7); // "YYYY-MM"
      if (month) map[month] = (map[month] ?? 0) + 1;
    }
    const result = Object.entries(map)
      .filter(([month]) => month >= "2024-01")
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count }));
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
    const reasons: Record<string, number> = {
      "Budget / Financial Deficit": 0,
      "Enrollment Decline":         0,
      "State Funding Cuts":         0,
      "Strategic Restructuring":    0,
      "Accreditation Issues":       0,
      "Merger / Consolidation":     0,
      "Compliance / Policy":        0,
    };

    for (const r of rows) {
      const n = (r.notes ?? "").toLowerCase();
      if (n.includes("budget") || n.includes("financial") || n.includes("deficit") || n.includes("fiscal"))
        reasons["Budget / Financial Deficit"]++;
      if (n.includes("enrollment") || n.includes("declining enroll") || n.includes("low enroll"))
        reasons["Enrollment Decline"]++;
      if (n.includes("state") && (n.includes("fund") || n.includes("cut") || n.includes("alloc")))
        reasons["State Funding Cuts"]++;
      if (n.includes("restructur") || n.includes("reorganiz") || n.includes("consolid") || n.includes("strategic"))
        reasons["Strategic Restructuring"]++;
      if (n.includes("accredit"))
        reasons["Accreditation Issues"]++;
      if (n.includes("merger") || n.includes("merge") || n.includes("acqui"))
        reasons["Merger / Consolidation"]++;
      if (n.includes("compliance") || n.includes("mandate") || n.includes("sb1") || n.includes("policy") || n.includes("regulation"))
        reasons["Compliance / Policy"]++;
    }

    const result = Object.entries(reasons)
      .filter(([, v]) => v > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([reason, count]) => ({ reason, count }));

    res.json(result);
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

export default router;
