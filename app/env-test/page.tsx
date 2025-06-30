"use client"

import { useEffect, useState } from "react"

export default function EnvTestPage() {
  const [envVars, setEnvVars] = useState<Record<string, string | undefined>>({})
  const [clientEnvVars, setClientEnvVars] = useState<Record<string, string | undefined>>({})

  useEffect(() => {
    // Server-side environment variables (these won't be available on client)
    setEnvVars({
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
      RESEND_API_KEY: process.env.RESEND_API_KEY,
    })

    // Client-side environment variables
    setClientEnvVars({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    })
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Environment Variables Test</h1>
          <p className="text-muted-foreground mt-2">Check which environment variables are available</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Server-side Environment Variables */}
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Server-side Environment Variables</h2>
            <div className="space-y-3">
              {Object.entries(envVars).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-mono text-sm">{key}</span>
                  <span className={`text-sm ${value ? "text-green-600" : "text-red-600"}`}>
                    {value ? "✓ Set" : "✗ Not set"}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-4">
              These variables are only available on the server side and won&apos;t be exposed to the client.
            </p>
          </div>

          {/* Client-side Environment Variables */}
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Client-side Environment Variables</h2>
            <div className="space-y-3">
              {Object.entries(clientEnvVars).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-mono text-sm">{key}</span>
                  <span className={`text-sm ${value ? "text-green-600" : "text-red-600"}`}>
                    {value ? "✓ Set" : "✗ Not set"}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-4">
              These variables are available on both server and client (prefixed with NEXT_PUBLIC_).
            </p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Important Notes:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Server-side variables are only available during build time and API routes</li>
            <li>• Client-side variables are embedded in the JavaScript bundle</li>
            <li>• Never expose sensitive keys (like API keys) as client-side variables</li>
            <li>• Use NEXT_PUBLIC_ prefix only for variables that are safe to expose</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 