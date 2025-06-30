"use client"

import { useState, useEffect } from "react"
import { testSupabaseConnection, isSupabaseConfigured } from "@/lib/supabaseClient"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, AlertCircle, Copy } from "lucide-react"

export default function DebugPage() {
  const [connectionStatus, setConnectionStatus] = useState<{
    success: boolean
    error?: string
    count?: number
  } | null>(null)
  const [testing, setTesting] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      testConnection()
    }
  }, [mounted])

  async function testConnection() {
    setTesting(true)
    try {
      const result = await testSupabaseConnection()
      setConnectionStatus(result)
    } catch (error) {
      setConnectionStatus({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }
    setTesting(false)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  if (!mounted) {
    return <div>Loading...</div>
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Database Connection Debug</h1>
          <p className="text-muted-foreground mt-2">Detailed Supabase connection diagnostics</p>
        </div>

        {isSupabaseConfigured && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">🎉 Environment Variables Successfully Configured!</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              Your Supabase credentials are properly set up. Test the connection below.
            </p>
          </div>
        )}

        {/* Environment Variables Check */}
        <Card>
          <CardHeader>
            <CardTitle>Environment Variables Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <span className="font-medium">NEXT_PUBLIC_SUPABASE_URL</span>
                  <div className="text-sm text-muted-foreground mt-1">
                    {supabaseUrl ? (
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          {supabaseUrl.substring(0, 40)}...
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(supabaseUrl)}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-red-600">Not found</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {supabaseUrl ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm text-green-600">Found</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-600" />
                      <span className="text-sm text-red-600">Missing</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <span className="font-medium">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
                  <div className="text-sm text-muted-foreground mt-1">
                    {supabaseKey ? (
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          {supabaseKey.substring(0, 20)}...
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(supabaseKey)}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-red-600">Not found</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {supabaseKey ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm text-green-600">Found</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-600" />
                      <span className="text-sm text-red-600">Missing</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <span className="font-medium">Configuration Status</span>
                  <div className="text-sm text-muted-foreground mt-1">Overall Supabase setup validation</div>
                </div>
                <div className="flex items-center gap-2">
                  {isSupabaseConfigured ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm text-green-600">Configured</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-600" />
                      <span className="text-sm text-red-600">Not Configured</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* URL Validation */}
        {supabaseUrl && (
          <Card>
            <CardHeader>
              <CardTitle>URL Validation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Contains &quot;supabase.co&quot;</span>
                <div className="flex items-center gap-2">
                  {supabaseUrl.includes("supabase.co") ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">Valid</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm text-red-600">Invalid</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>Starts with &quot;https://&quot;</span>
                <div className="flex items-center gap-2">
                  {supabaseUrl.startsWith("https://") ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">Valid</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm text-red-600">Invalid</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>Not placeholder URL</span>
                <div className="flex items-center gap-2">
                  {!supabaseUrl.includes("placeholder") ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">Valid</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm text-red-600">Placeholder</span>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Connection Test */}
        <Card>
          <CardHeader>
            <CardTitle>Database Connection Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testConnection} disabled={testing} className="w-full">
              {testing ? "Testing Connection..." : "Test Database Connection"}
            </Button>

            {connectionStatus && (
              <div className="p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  {connectionStatus.success ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-600">Connection Successful</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-600" />
                      <span className="font-medium text-red-600">Connection Failed</span>
                    </>
                  )}
                </div>

                {connectionStatus.success && typeof connectionStatus.count === "number" && (
                  <p className="text-sm text-muted-foreground">
                    Successfully connected! Found {connectionStatus.count} records in the v_latest_cuts table.
                  </p>
                )}

                {connectionStatus.error && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded text-sm">
                    <div className="font-medium text-red-800 mb-1">Error Details:</div>
                    <div className="text-red-700 font-mono text-xs">{connectionStatus.error}</div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Troubleshooting Steps */}
        <Card>
          <CardHeader>
            <CardTitle>Troubleshooting Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium mb-2">If environment variables are missing:</div>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-2">
                    <li>
                      Check your <code className="bg-gray-100 px-1 rounded">.env.local</code> file exists in your
                      project root
                    </li>
                    <li>
                      Verify the variable names are exactly:{" "}
                      <code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
                      <code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
                    </li>
                    <li>Restart your development server after adding environment variables</li>
                    <li>Make sure there are no spaces around the = sign in your .env file</li>
                  </ol>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium mb-2">If connection fails with valid variables:</div>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-2">
                    <li>Verify your Supabase project is active and not paused</li>
                    <li>
                      Check that the <code className="bg-gray-100 px-1 rounded">v_latest_cuts</code> table/view exists
                    </li>
                    <li>Ensure Row Level Security (RLS) allows public read access</li>
                    <li>Test your credentials in the Supabase dashboard</li>
                  </ol>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="font-medium text-blue-900 mb-2">Expected .env.local format:</div>
                <pre className="text-xs font-mono bg-white p-2 rounded border text-blue-800">
                  {`NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-sm text-gray-600">
          <strong>Note:</strong> This shows the current environment variables. Be careful not to expose sensitive data.
        </div>
      </div>
    </div>
  )
}
