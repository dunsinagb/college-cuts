"use client"

import { useState, useEffect } from "react"
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabaseClient"

export default function TestSupabasePage() {
  const [status, setStatus] = useState<string>("Loading...")
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function testConnection() {
      try {
        setStatus("Testing connection...")
        
        console.log("🔍 Test page - isSupabaseConfigured:", isSupabaseConfigured)
        const client = getSupabaseClient()
        console.log("🔍 Test page - supabase client:", !!client)
        
        if (!isSupabaseConfigured || !client) {
          setStatus("Supabase not configured")
          setError("Supabase client not available")
          return
        }

        setStatus("Fetching data...")
        
        const { data: testData, error: testError } = await client
          .from("v_latest_cuts")
          .select("id, institution, program_name")
          .limit(3)

        if (testError) {
          setStatus("Error")
          setError(testError.message)
          return
        }

        setStatus("Success!")
        setData(testData)
        console.log("✅ Test data fetched:", testData)
        
      } catch (err) {
        setStatus("Error")
        setError(err instanceof Error ? err.message : "Unknown error")
        console.error("❌ Test error:", err)
      }
    }

    testConnection()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      
      <div className="space-y-4">
        <div className="p-4 border rounded">
          <h2 className="font-semibold">Status: {status}</h2>
        </div>
        
        {error && (
          <div className="p-4 border border-red-200 bg-red-50 rounded">
            <h3 className="font-semibold text-red-800">Error:</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {data && (
          <div className="p-4 border border-green-200 bg-green-50 rounded">
            <h3 className="font-semibold text-green-800">Data:</h3>
            <pre className="text-sm text-green-700 overflow-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
} 