"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, GraduationCap, TrendingUp, AlertTriangle, Info, Send, BarChart3, Briefcase } from "lucide-react"
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
      setIsSubscribed(ccSubCookie?.includes('1') || false)
    }
    
    checkSubscription()
    
    // Listen for cookie changes
    const interval = setInterval(checkSubscription, 1000)
    
    // Listen for custom subscription change events
    const handleSubscriptionChange = (event: CustomEvent) => {
      if (event.detail?.subscribed) {
        setIsSubscribed(true)
      }
    }
    
    window.addEventListener('subscriptionChanged', handleSubscriptionChange as EventListener)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('subscriptionChanged', handleSubscriptionChange as EventListener)
    }
  }, [])

  const navItems = [
    { href: "/", label: "Dashboard", icon: TrendingUp, public: true },
    { href: "/cuts", label: "All Cuts", icon: AlertTriangle, public: false },
    { href: "/analytics", label: "Analytics", icon: BarChart3, public: false },
    { href: "/job-outlook", label: "Job Outlook", icon: Briefcase, public: false },
    { href: "/about", label: "About", icon: Info, public: true },
    { href: "/submit-tip", label: "Submit Tip", icon: Send, public: false },
  ]

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(href)
  }

  return (
    <header className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 shadow-sm" style={{ position: 'fixed', top: 0 }}>
      <div className="flex items-center justify-between w-full h-20 px-4 md:px-8">
        {/* Logo */}
        <div className="flex items-center space-x-4 min-w-0">
          <Link href="/" className="flex items-center space-x-3 group" aria-label="CollegeCuts Tracker Home">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 rounded-lg blur-sm opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <GraduationCap className="h-8 w-8 relative z-10 text-primary-foreground" aria-hidden="true" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-xl gradient-text truncate">CollegeCuts</span>
              <span className="text-xs text-muted-foreground -mt-1 truncate">Tracker</span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1 ml-auto" role="navigation" aria-label="Main navigation">
          {navItems.map((item) => {
            // Only show item if it's public or user is subscribed
            if (!item.public && !isSubscribed) return null
            
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 group
                  ${active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "hover:bg-accent hover:text-primary"
                  }`}
                aria-current={active ? "page" : undefined}
              >
                <Icon className={`h-4 w-4 transition-transform ${active ? "scale-110" : "group-hover:scale-110"}`} aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden ml-auto"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
        >
          {isMenuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div 
          id="mobile-menu"
          className="md:hidden border-t bg-background/95 backdrop-blur-md"
          role="navigation"
          aria-label="Mobile navigation"
        >
          <nav className="py-4 space-y-2 max-w-4xl mx-auto">
            {navItems.map((item) => {
              // Only show item if it's public or user is subscribed
              if (!item.public && !isSubscribed) return null
              
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-xs font-medium transition-all duration-200 group
                    ${active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "hover:bg-accent hover:text-primary"
                    }`}
                  onClick={() => setIsMenuOpen(false)}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className={`h-4 w-4 transition-transform ${active ? "scale-110" : "group-hover:scale-110"}`} aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      )}
    </header>
  )
}
