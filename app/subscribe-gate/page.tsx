'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle, Mail } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function SubscribeGate() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [redirectTo, setRedirectTo] = useState('/cuts')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Get the intended destination from URL parameters
    const redirect = searchParams.get('redirect')
    if (redirect) {
      setRedirectTo(redirect)
    }
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, redirect: redirectTo })
      })

      if (response.ok) {
        setIsSuccess(true)
        setMessage('Success! Redirecting you to your destination...')
        setTimeout(() => {
          router.push(redirectTo)
        }, 1500)
      } else {
        const data = await response.json()
        setMessage(data.error || 'Please enter a valid email')
      }
    } catch (error) {
      setMessage('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl font-bold">Unlock Full Access</CardTitle>
          <CardDescription className="text-base">
            Subscribe with your email to access comprehensive data on college cuts and closures across the United States.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 text-base"
                disabled={loading}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-medium"
              disabled={loading}
            >
              {loading ? 'Subscribing...' : 'Get Full Access'}
            </Button>
          </form>

          {message && (
            <Alert className={`mt-4 ${isSuccess ? 'border-green-200 bg-green-50 dark:bg-green-900/20' : 'border-red-200 bg-red-50 dark:bg-red-900/20'}`}>
              {isSuccess ? (
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              )}
              <AlertDescription className={isSuccess ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}>
                {message}
              </AlertDescription>
            </Alert>
          )}

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>By subscribing, you'll get access to:</p>
            <ul className="mt-2 space-y-1 text-left">
              <li>• Complete database of college cuts</li>
              <li>• Advanced analytics and trends</li>
              <li>• Detailed program closure data</li>
              <li>• Real-time updates</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 