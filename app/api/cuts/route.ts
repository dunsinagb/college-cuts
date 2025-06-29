import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Use service role key for server-side operations
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit')
    const offset = searchParams.get('offset')
    const state = searchParams.get('state')
    const cutType = searchParams.get('cutType')
    const institution = searchParams.get('institution')

    let query = supabase
      .from("v_latest_cuts")
      .select("*")
      .order("announcement_date", { ascending: false })

    // Apply filters
    if (state) {
      query = query.eq("state", state)
    }
    if (cutType) {
      query = query.eq("cut_type", cutType)
    }
    if (institution) {
      query = query.ilike("institution", `%${institution}%`)
    }

    // Apply pagination
    if (limit) {
      query = query.limit(parseInt(limit))
    }
    if (offset && limit) {
      query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)
    }

    const { data: cuts, error, count } = await query

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch cuts data" }, { status: 500 })
    }

    return NextResponse.json({
      data: cuts || [],
      count: count || 0,
      success: true
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 