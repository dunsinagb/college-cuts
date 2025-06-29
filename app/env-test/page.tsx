"use client"

import { useState, useEffect } from "react"

export default function EnvTestPage() {
  const [envVars, setEnvVars] = useState<any>({})
  const [injectedConfig, setInjectedConfig] = useState<any>({})

  useEffect(() => {
    const vars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NODE_ENV: process.env.NODE_ENV,
    }
    
    const injected = (window as any).__SUPABASE_CONFIG__ || {}
    
    console.log("🔍 Environment variables:", vars)
    console.log("🔍 Injected config:", injected)
    
    setEnvVars(vars)
    setInjectedConfig(injected)
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Environment Variables Test</h1>
      
      <div className="space-y-4">
        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Client-side Environment Variables:</h2>
          <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify(envVars, null, 2)}
          </pre>
        </div>
        
        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Injected Configuration:</h2>
          <pre className="text-sm bg-blue-100 p-2 rounded overflow-auto">
            {JSON.stringify(injectedConfig, null, 2)}
          </pre>
        </div>
        
        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Analysis:</h2>
          <ul className="space-y-1 text-sm">
            <li>✅ NEXT_PUBLIC_SUPABASE_URL: {envVars.NEXT_PUBLIC_SUPABASE_URL ? "Found" : "Missing"}</li>
            <li>✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: {envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Found" : "Missing"}</li>
            <li>✅ NODE_ENV: {envVars.NODE_ENV}</li>
            <li>🔧 Injected URL: {injectedConfig.NEXT_PUBLIC_SUPABASE_URL ? "Found" : "Missing"}</li>
            <li>🔧 Injected Key: {injectedConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Found" : "Missing"}</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 