import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";
const SITE_URL = "https://college-cuts.com";

const CUT_TYPE_LABELS: Record<string, string> = {
  staff_layoff: "Staff Layoff",
  program_suspension: "Program Suspension",
  teach_out: "Teach-Out",
  department_closure: "Department Closure",
  campus_closure: "Campus Closure",
  institution_closure: "Institution Closure",
};

type InstitutionData = {
  institution: string;
  slug: string;
  stats: { actions: number; studentsAffected: number; facultyAffected: number; state: string };
  cuts: Array<{ id: string; cutType: string; announcementDate: string | null; status: string; programName: string | null }>;
};

export default function EmbedWidget() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? "";

  const { data, isLoading, error } = useQuery<InstitutionData>({
    queryKey: ["institution-embed", slug],
    queryFn: async () => {
      const r = await fetch(`${BASE_URL}/api/institution/${encodeURIComponent(slug)}`);
      if (!r.ok) throw new Error("fetch_error");
      return r.json();
    },
    enabled: !!slug,
    retry: false,
  });

  if (isLoading) {
    return (
      <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: "#1e3a5f", padding: "20px", borderRadius: "10px", color: "#fff", minWidth: 280 }}>
        <div style={{ color: "#fbbf24", fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>CollegeCuts Tracker</div>
        <div style={{ color: "#94a3b8", fontSize: 14 }}>Loading…</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: "#1e3a5f", padding: "20px", borderRadius: "10px", color: "#fff", minWidth: 280 }}>
        <div style={{ color: "#fbbf24", fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>CollegeCuts Tracker</div>
        <div style={{ color: "#94a3b8", fontSize: 14 }}>Institution not found</div>
      </div>
    );
  }

  const { institution, stats, cuts } = data;
  const recentCuts = cuts.slice(0, 3);

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: "#1e3a5f", borderRadius: "10px", overflow: "hidden", minWidth: 280, maxWidth: 420 }}>
      <div style={{ padding: "16px 18px 12px" }}>
        <div style={{ color: "#fbbf24", fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>CollegeCuts Tracker</div>
        <div style={{ color: "#fff", fontSize: 18, fontWeight: 800, lineHeight: 1.2, marginBottom: 4 }}>{institution}</div>
        <div style={{ color: "#94a3b8", fontSize: 12, marginBottom: 14 }}>{stats.state}</div>
        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ color: "#fbbf24", fontSize: 26, fontWeight: 900, lineHeight: 1 }}>{stats.actions}</div>
            <div style={{ color: "#94a3b8", fontSize: 10, marginTop: 2 }}>action{stats.actions !== 1 ? "s" : ""}</div>
          </div>
          {stats.studentsAffected > 0 && (
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#fbbf24", fontSize: 26, fontWeight: 900, lineHeight: 1 }}>{stats.studentsAffected.toLocaleString()}</div>
              <div style={{ color: "#94a3b8", fontSize: 10, marginTop: 2 }}>students</div>
            </div>
          )}
          {stats.facultyAffected > 0 && (
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#fbbf24", fontSize: 26, fontWeight: 900, lineHeight: 1 }}>{stats.facultyAffected.toLocaleString()}</div>
              <div style={{ color: "#94a3b8", fontSize: 10, marginTop: 2 }}>faculty/staff</div>
            </div>
          )}
        </div>
      </div>
      {recentCuts.length > 0 && (
        <div style={{ background: "rgba(255,255,255,0.06)", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          {recentCuts.map((cut, i) => (
            <div key={cut.id} style={{ padding: "8px 18px", borderBottom: i < recentCuts.length - 1 ? "1px solid rgba(255,255,255,0.07)" : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ background: "rgba(251,191,36,0.18)", color: "#fbbf24", fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 4, marginRight: 6 }}>
                  {CUT_TYPE_LABELS[cut.cutType] ?? cut.cutType}
                </span>
              </div>
              <a href={`${SITE_URL}/cuts/${cut.id}`} target="_blank" rel="noopener noreferrer" style={{ color: "#94a3b8", fontSize: 11, textDecoration: "none" }}>
                View →
              </a>
            </div>
          ))}
        </div>
      )}
      <div style={{ padding: "10px 18px", background: "rgba(0,0,0,0.2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "#4b6a8a", fontSize: 10 }}>Powered by</span>
        <a href={`${SITE_URL}/institution/${slug}`} target="_blank" rel="noopener noreferrer" style={{ color: "#fbbf24", fontSize: 11, fontWeight: 700, textDecoration: "none" }}>
          college-cuts.com →
        </a>
      </div>
    </div>
  );
}
