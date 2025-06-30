"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wifi, WifiOff, RefreshCw, CheckCircle } from "lucide-react"

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(true)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  useEffect(() => {
    const checkOnlineStatus = () => {
      const online = navigator.onLine
      setIsOnline(online)
      setLastChecked(new Date())
    }

    // Check initial status
    checkOnlineStatus()

    // Listen for online/offline events
    window.addEventListener("online", checkOnlineStatus)
    window.addEventListener("offline", checkOnlineStatus)

    return () => {
      window.removeEventListener("online", checkOnlineStatus)
      window.removeEventListener("offline", checkOnlineStatus)
    }
  }, [])

  const handleRefresh = () => {
    window.location.reload()
  }

  const handleRetry = () => {
    setLastChecked(new Date())
    // Simulate a connection check
    setTimeout(() => {
      setIsOnline(navigator.onLine)
    }, 1000)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            {isOnline ? (
              <CheckCircle className="h-16 w-16 text-green-600" />
            ) : (
              <WifiOff className="h-16 w-16 text-red-600" />
            )}
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {isOnline ? "You&apos;re Back Online!" : "You&apos;re Offline"}
          </h1>
          <p className="text-muted-foreground">
            {isOnline
              ? "Your internet connection has been restored."
              : "Please check your internet connection and try again."}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isOnline ? <Wifi className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />}
              Connection Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Internet Connection</span>
              <span className={`px-2 py-1 rounded text-sm ${isOnline ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                {isOnline ? "Online" : "Offline"}
              </span>
            </div>

            {lastChecked && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Last Checked</span>
                <span className="text-sm text-muted-foreground">
                  {lastChecked.toLocaleTimeString()}
                </span>
              </div>
            )}

            <div className="flex gap-3">
              <Button onClick={handleRetry} className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" />
                Check Connection
              </Button>
              <Button onClick={handleRefresh} variant="outline" className="flex-1">
                Refresh Page
              </Button>
            </div>
          </CardContent>
        </Card>

        {!isOnline && (
          <Card>
            <CardHeader>
              <CardTitle>Troubleshooting Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  Check your Wi-Fi or mobile data connection
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  Try restarting your router or modem
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  Disable any VPN or proxy services
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  Check if other websites are accessible
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  Contact your internet service provider if the problem persists
                </li>
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 