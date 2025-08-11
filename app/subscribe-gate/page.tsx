'use client'
import { Suspense } from 'react'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle, Mail } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

function SubscribeGate() {
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
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Unlock Premium Access
          </CardTitle>
          <CardDescription className="text-lg mt-3 text-gray-600 dark:text-gray-300">
            Get exclusive access to the most comprehensive database of higher education program cuts and closures in the United States.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Enter your email address
              </label>
              <Input
                id="email"
                type="email"
                required
                placeholder="your.email@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 text-base border-2 focus:border-blue-500"
                disabled={loading}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
              disabled={loading}
            >
              {loading ? 'Unlocking Access...' : 'Get Full Access Now'}
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

          <div className="mt-8 space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                What You'll Get Access To:
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700 dark:text-gray-300">Complete Database</span>
              </div>
              <div className="flex items-center space-x-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-gray-700 dark:text-gray-300">Advanced Analytics</span>
              </div>
              <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700 dark:text-gray-300">Real-time Updates</span>
              </div>
              <div className="flex items-center space-x-2 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-gray-700 dark:text-gray-300">Detailed Reports</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              Join thousands of researchers, journalists, and policymakers who rely on CollegeCuts for accurate, up-to-date information on higher education changes.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SubscribeGatePage() {
  return (
    <Suspense>
      <SubscribeGate />
    </Suspense>
  )
} 