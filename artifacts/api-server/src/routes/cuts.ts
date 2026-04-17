import { Router, type IRouter } from "express";
import { supabase } from "../lib/supabase";
import { ListCutsQueryParams, GetCutParams } from "@workspace/api-zod";

const router: IRouter = Router();

/* ── field mapping from Supabase snake_case to our API camelCase ── */
type SupabaseCut = {
  id: string;
  institution: string;
  program_name: string | null;
  cut_type: string;
  announcement_date: string;
  effective_term: string | null;
  students_affected: number | null;
  faculty_affected: number | null;
  state: string;
  control: string | null;
  status: string;
  notes: string | null;
  source_url: string | null;
  source_publication: string | null;
  cip_code: string | null;
  created_at: string;
  updated_at: string;
};

const ATHLETICS_KEYWORDS = [
  "athletic", "varsity", "football", "basketball", "baseball", "softball",
  "wrestling", "swimming", "diving", "track and field", "track & field",
  "volleyball", "soccer", "lacrosse", "tennis", "golf", "gymnastics",
  "cross country", "rowing", "crew", "athletic department", "ncaa",
  "sports program", "coaching staff",
];

function deriveCategory(programName: string | null, notes: string | null): string {
  const text = ((programName ?? "") + " " + (notes ?? "")).toLowerCase();
  if (ATHLETICS_KEYWORDS.some((kw) => text.includes(kw))) return "Athletics";
  return "Academic";
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

function formatCut(cut: SupabaseCut) {
  return {
    id: cut.id,
    institution: cut.institution,
    programName: cut.program_name,
    state: cut.state,
    control: cut.control,
    cutType: cut.cut_type,
    announcementDate: cut.announcement_date,
    effectiveTerm: cut.effective_term,
    studentsAffected: cut.students_affected,
    facultyAffected: cut.faculty_affected,
    notes: cut.notes,
    primaryReason: extractPrimaryReason(cut.notes),
    sourceUrl: cut.source_url,
    sourcePublication: cut.source_publication,
    cipCode: cut.cip_code,
    category: deriveCategory(cut.program_name, cut.notes),
    status: cut.status,
    createdAt: cut.created_at,
    updatedAt: cut.updated_at,
  };
}

router.get("/cuts", async (req, res): Promise<void> => {
  const parsed = ListCutsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { state, cutType, status, control, search, page = 1, limit = 25 } = parsed.data;
  const offset = (page - 1) * limit;

  let query = supabase
    .from("v_latest_cuts")
    .select("*", { count: "exact" })
    .order("announcement_date", { ascending: false })
    .range(offset, offset + limit - 1);

  query = query.gte("announcement_date", "2024-01-01");
  if (state)    query = query.eq("state", state);
  if (cutType)  query = query.eq("cut_type", cutType);
  if (status)   query = query.eq("status", status);
  if (control)  query = query.eq("control", control);
  if (search) {
    query = query.or(
      `institution.ilike.%${search}%,program_name.ilike.%${search}%`
    );
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("Supabase cuts error:", error);
    res.status(500).json({ error: error.message });
    return;
  }

  const total = count ?? 0;

  res.json({
    data: (data as SupabaseCut[]).map(formatCut),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
});

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[''`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

router.get("/institution/:slug", async (req, res): Promise<void> => {
  const { slug } = req.params;

  const { data, error } = await supabase
    .from("v_latest_cuts")
    .select("*")
    .order("announcement_date", { ascending: false });

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  const allCuts = (data ?? []) as SupabaseCut[];
  const matched = allCuts.find(c => slugify(c.institution) === slug);

  if (!matched) {
    res.status(404).json({ error: "Institution not found" });
    return;
  }

  const institutionName = matched.institution;
  const institutionCuts = allCuts.filter(c => c.institution === institutionName);

  const stats = {
    actions:          institutionCuts.length,
    studentsAffected: institutionCuts.reduce((s, c) => s + (c.students_affected ?? 0), 0),
    facultyAffected:  institutionCuts.reduce((s, c) => s + (c.faculty_affected  ?? 0), 0),
    state:            matched.state,
  };

  res.json({
    institution: institutionName,
    slug,
    stats,
    cuts: institutionCuts.map(formatCut),
  });
});

router.get("/cuts/:id", async (req, res): Promise<void> => {
  const params = GetCutParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const { data, error } = await supabase
    .from("v_latest_cuts")
    .select("*")
    .eq("id", params.data.id)
    .single();

  if (error || !data) {
    res.status(404).json({ error: "Cut not found" });
    return;
  }

  res.json(formatCut(data as SupabaseCut));
});

export default router;
