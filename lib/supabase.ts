import { createClient, type SupabaseClient } from "@supabase/supabase-js"

/**
 * Use this constant where you previously imported `supabase`.
 * It is `null` when the two required environment variables are missing,
 * preventing the “supabaseUrl is required” crash.
 */
export const supabase: SupabaseClient | null = (() => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return null
  }
  return createClient(supabaseUrl, supabaseAnonKey)
})()

/**
 * New helper that always returns the singleton browser client (or null).
 */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  return supabase
}
