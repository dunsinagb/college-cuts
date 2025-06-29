import { NextResponse } from "next/server"

export async function GET() {
  const envVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NODE_ENV: process.env.NODE_ENV,
  }

  return NextResponse.json({
    success: true,
    envVars,
    analysis: {
      urlExists: !!envVars.NEXT_PUBLIC_SUPABASE_URL,
      keyExists: !!envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      nodeEnv: envVars.NODE_ENV,
    }
  })
} 