import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Use service role key for server-side operations
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

export async function GET() {
  try {
    const { data: cuts, error } = await supabase
      .from("v_latest_cuts")
      .select("*")
      .order("announcement_date", { ascending: false })

    if (error) {
      throw error
    }

    // Convert to CSV
    const headers = [
      "ID",
      "Institution",
      "Program Name",
      "State",
      "Cut Type",
      "Announcement Date",
      "Effective Term",
      "Students Affected",
      "Faculty Affected",
      "Notes",
      "Source URL",
      "Source Publication",
      "Created At",
      "Updated At",
    ]

    const csvContent = [
      headers.join(","),
      ...(cuts || []).map((cut) =>
        [
          cut.id,
          `"${cut.institution.replace(/"/g, '""')}"`,
          cut.program_name ? `"${cut.program_name.replace(/"/g, '""')}"` : "",
          cut.state,
          cut.cut_type,
          cut.announcement_date,
          cut.effective_term || "",
          cut.students_affected || "",
          cut.faculty_affected || "",
          cut.notes ? `"${cut.notes.replace(/"/g, '""')}"` : "",
          cut.source_url || "",
          cut.source_publication ? `"${cut.source_publication.replace(/"/g, '""')}"` : "",
          cut.created_at,
          cut.updated_at,
        ].join(","),
      ),
    ].join("\n")

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="college-cuts.csv"',
      },
    })
  } catch (error) {
    console.error("Error exporting CSV:", error)
    return NextResponse.json({ error: "Failed to export CSV" }, { status: 500 })
  }
}
