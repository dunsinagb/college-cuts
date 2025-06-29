"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, CheckCircle, Sparkles } from "lucide-react"

export function NewsletterSignup() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSubmitted(true)
    setIsLoading(false)
    setEmail("")
  }

  if (isSubmitted) {
    return (
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-lg">
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <div className="relative">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
              <Sparkles className="h-4 w-4 text-green-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-green-800">Welcome aboard!</h3>
              <p className="text-green-700">
                You'll receive weekly updates on the latest program cuts and institutional changes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-blue-900">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <div className="text-lg">Stay Informed</div>
            <div className="text-sm font-normal text-blue-700">Join 1,000+ educators and students</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-blue-700">
          Get weekly updates on program cuts, institutional changes, and trend analysis affecting higher education.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-white border-blue-200 focus:border-blue-400"
              required
            />
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 shadow-sm px-6">
              {isLoading ? "..." : "Subscribe"}
            </Button>
          </div>
          <div className="flex items-center justify-between text-xs text-blue-600">
            <span>✓ No spam, unsubscribe anytime</span>
            <span>✓ Weekly digest format</span>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
