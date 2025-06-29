"use client"

import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

/**
 * Get Supabase configuration with fallback methods
 */
const getSupabaseConfig = () => {
  // Method 1: Direct environment variable access
  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  let supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Method 2: Try to get from window.__NEXT_DATA__ if available
  if (typeof window !== "undefined" && window.__NEXT_DATA__?.props?.envVars) {
    if (!supabaseUrl) supabaseUrl = window.__NEXT_DATA__.props.envVars.NEXT_PUBLIC_SUPABASE_URL
    if (!supabaseAnon) supabaseAnon = window.__NEXT_DATA__.props.envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
  }

  // Method 3: Try to get from a global variable if set
  if (typeof window !== "undefined" && (window as any).__SUPABASE_CONFIG__) {
    const config = (window as any).__SUPABASE_CONFIG__
    if (!supabaseUrl) supabaseUrl = config.NEXT_PUBLIC_SUPABASE_URL
    if (!supabaseAnon) supabaseAnon = config.NEXT_PUBLIC_SUPABASE_ANON_KEY
  }

  // Debug logging
  console.log(`🔍 Supabase Environment Check [${new Date().toISOString()}]:`)
  console.log("URL exists:", !!supabaseUrl)
  console.log("Key exists:", !!supabaseAnon)
  if (supabaseUrl) {
    console.log("URL preview:", supabaseUrl.substring(0, 50) + "...")
  }
  if (supabaseAnon) {
    console.log("Key preview:", supabaseAnon.substring(0, 20) + "...")
  }

  return { supabaseUrl, supabaseAnon }
}

// Check if Supabase is properly configured - only on client side
export const isSupabaseConfigured = (() => {
  if (typeof window === "undefined") {
    return false
  }

  const { supabaseUrl, supabaseAnon } = getSupabaseConfig()

  const configured = !!(
    supabaseUrl &&
    supabaseAnon &&
    supabaseUrl !== "https://placeholder.supabase.co" &&
    supabaseAnon !== "placeholder-key" &&
    supabaseUrl.includes("supabase.co") &&
    supabaseUrl.startsWith("https://") &&
    supabaseAnon.length > 20
  )

  console.log("🔧 Supabase configured:", configured)
  return configured
})()

// Create a lazy Supabase client
let supabaseClient: SupabaseClient<Database> | null = null

export function getSupabaseClient(): SupabaseClient<Database> | null {
  if (typeof window === "undefined") {
    return null
  }

  if (supabaseClient) {
    return supabaseClient
  }

  try {
    const { supabaseUrl, supabaseAnon } = getSupabaseConfig()

    if (!supabaseUrl || !supabaseAnon) {
      console.warn("⚠️ Supabase environment variables not found")
      return null
    }

    console.log("✅ Creating Supabase client with valid credentials")
    supabaseClient = createClient<Database>(supabaseUrl, supabaseAnon, {
      auth: {
        persistSession: false,
      },
    })
    return supabaseClient
  } catch (error) {
    console.error("❌ Failed to create Supabase client:", error)
    return null
  }
}

// Export the lazy client for backward compatibility
export const supabase = getSupabaseClient()

// Debug function to check connection
export async function testSupabaseConnection() {
  if (typeof window === "undefined") {
    return {
      success: false,
      error: "Cannot test connection on server side",
    }
  }

  const { supabaseUrl, supabaseAnon } = getSupabaseConfig()

  if (!supabaseUrl || !supabaseAnon) {
    return {
      success: false,
      error: "Environment variables not found. Check .env.local file.",
    }
  }

  if (!isSupabaseConfigured) {
    return {
      success: false,
      error: "Supabase not configured. Check environment variables format.",
    }
  }

  const client = getSupabaseClient()
  if (!client) {
    return {
      success: false,
      error: "Supabase client not initialized.",
    }
  }

  try {
    console.log("🧪 Testing Supabase connection...")

    const { count, error } = await client.from("v_latest_cuts").select("*", { count: "exact", head: true })

    if (error) {
      console.error("❌ Supabase query error:", error)
      return { success: false, error: error.message }
    }

    console.log("✅ Supabase connection successful, total cuts:", count)
    return { success: true, count: count || 0 }
  } catch (err) {
    console.error("❌ Supabase connection failed:", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown connection error",
    }
  }
}
