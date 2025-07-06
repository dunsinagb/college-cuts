import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

/**
 * Server-side Supabase client for API routes
 */
export function createServerSupabaseClient(): SupabaseClient<Database> | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnon) {
    console.warn("⚠️ Supabase environment variables not found on server")
    return null
  }

  try {
    console.log("✅ Creating server-side Supabase client")
    return createClient<Database>(supabaseUrl, supabaseAnon, {
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