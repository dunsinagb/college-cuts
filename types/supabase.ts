export interface Database {
  public: {
    Views: {
      v_latest_cuts: {
        Row: {
          id: string
          institution: string
          program_name: string | null
          state: string
          cut_type: "program_suspension" | "teach_out" | "department_closure" | "campus_closure" | "institution_closure"
          announcement_date: string
          effective_term: string | null
          students_affected: number | null
          faculty_affected: number | null
          control: string | null
          notes: string | null
          source_url: string | null
          source_publication: string | null
          created_at: string
          updated_at: string
        }
      }
    }
  }
}

export type Cut = Database["public"]["Views"]["v_latest_cuts"]["Row"]
