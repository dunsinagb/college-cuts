import { createClient } from "@supabase/supabase-js";

const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!url || !key) {
  console.warn("[supabase] Missing SUPABASE_URL or service key — Supabase queries will fail.");
}

export const supabase = createClient(url, key, {
  auth: { persistSession: false },
});
