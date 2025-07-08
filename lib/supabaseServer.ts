import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

/**
 * Server-side Supabase client for API routes
 */
export function createServerSupabaseClient(): SupabaseClient<Database> | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl) {
    console.warn("⚠️ Supabase URL not found on server")
    return null
  }

  // Prefer service role key for admin operations, fallback to anon key
  const supabaseKey = supabaseServiceKey || supabaseAnon

  if (!supabaseKey) {
    console.warn("⚠️ No Supabase key found on server")
    return null
  }

  try {
    console.log("✅ Creating server-side Supabase client")
    return createClient<Database>(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
    })
  } catch (error) {
    console.error("❌ Failed to create server-side Supabase client:", error)
    return null
  }
}

// Export a singleton instance for API routes
let serverSupabaseClient: SupabaseClient<Database> | null = null

export function getServerSupabaseClient(): SupabaseClient<Database> | null {
  if (!serverSupabaseClient) {
    serverSupabaseClient = createServerSupabaseClient()
  }
  return serverSupabaseClient
} 