"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, GraduationCap, TrendingUp, AlertTriangle, Info, Send, BarChart3, Briefcase, Search } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const pathname = usePathname()

  // Check subscription status on mount and listen for changes
  useEffect(() => {
    const checkSubscription = () => {
      const cookies = document.cookie.split(';')
      const ccSubCookie = cookies.find(cookie => cookie.trim().startsWith('cc_sub='))
      setIsSubscribed(ccSubCookie?.includes('=1') || false)
    }

    checkSubscription()

    // Listen for subscription changes
    const handleSubscriptionChange = () => {
      checkSubscription()
    }

    window.addEventListener('subscriptionChanged', handleSubscriptionChange)
    return () => window.removeEventListener('subscriptionChanged', handleSubscriptionChange)
  }, [])

  const navigation = [
    { href: "/", label: "Dashboard", icon: TrendingUp },
    { href: "/cuts", label: "All Cuts", icon: AlertTriangle },
    ...(isSubscribed ? [
      { href: "/job-outlook", label: "Job Outlook", icon: Briefcase },
      { href: "/teach-out", label: "Teach-Out Finder", icon: Search },
    ] : []),
    { href: "/about", label: "About", icon: Info },
    { href: "/submit-tip", label: "Submit Tip", icon: Send },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <GraduationCap className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">CollegeCuts</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 transition-colors hover:text-foreground/80 ${
                  pathname === item.href ? "text-foreground" : "text-foreground/60"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Mobile Menu Button */}
        <div className="flex flex-1 items-center justify-end md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="mr-2"
          >
            {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container py-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors hover:bg-muted rounded-md ${
                    pathname === item.href ? "bg-muted" : ""
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      )}
    </header>
  )
}
