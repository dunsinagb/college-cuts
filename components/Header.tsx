"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, GraduationCap, TrendingUp, AlertTriangle, Info, Send } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { href: "/", label: "Dashboard", icon: TrendingUp },
    { href: "/cuts", label: "All Cuts", icon: AlertTriangle },
    { href: "/about", label: "About", icon: Info },
    { href: "/submit-tip", label: "Submit Tip", icon: Send },
  ]

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(href)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="flex justify-center items-center w-full py-4">
        <div className="flex items-center justify-between w-full max-w-4xl">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 rounded-lg blur-sm opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <GraduationCap className="h-8 w-8 relative z-10 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl gradient-text">CollegeCuts</span>
                <span className="text-xs text-muted-foreground -mt-1">Tracker</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 group ${
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <Icon className={`h-4 w-4 transition-transform ${active ? "scale-110" : "group-hover:scale-110"}`} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-background/95 backdrop-blur-md">
          <nav className="py-4 space-y-2 max-w-4xl mx-auto">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "hover:bg-accent hover:text-accent-foreground"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon className={`h-4 w-4 transition-transform ${active ? "scale-110" : "group-hover:scale-110"}`} />
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
