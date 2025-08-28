import Link from "next/link"
import { GraduationCap, TrendingUp, AlertTriangle, Info, Send, ExternalLink, Linkedin } from "lucide-react"

// Coffee cup icon component
const CoffeeIcon = () => (
  <svg 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className="h-4 w-4"
  >
    <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
    <line x1="6" y1="1" x2="6" y2="4" />
    <line x1="10" y1="1" x2="10" y2="4" />
    <line x1="14" y1="1" x2="14" y2="4" />
  </svg>
)

export function Footer() {
  const quickLinks = [
    { href: "/", label: "Dashboard", icon: TrendingUp },
    { href: "/cuts", label: "All Actions", icon: AlertTriangle },
    { href: "/about", label: "About", icon: Info },
    { href: "/submit-tip", label: "Submit Tip", icon: Send },
  ]

  return (
    <footer className="border-t bg-background/50 backdrop-blur-sm text-center">
      <div className="py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 rounded-lg blur-sm opacity-75"></div>
                <GraduationCap className="h-6 w-6 relative z-10 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg gradient-text">CollegeCuts</span>
                <span className="text-xs text-muted-foreground -mt-1">Tracker</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-base">Quick Links</h4>
          <div className="space-y-3">
              {quickLinks.map((link) => {
                const Icon = link.icon
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                  >
                    <Icon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    <span>{link.label}</span>
              </Link>
                )
              })}
            </div>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="font-semibold text-base">Resources</h4>
          <div className="space-y-3">
              <Link href="/about" className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group">
                <Info className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span>Methodology</span>
              </Link>
              <Link href="/cuts" className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group">
                <TrendingUp className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span>Data Export</span>
              </Link>
              <a
                href="https://github.com/dunsinagb/college-cuts"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
              >
                <ExternalLink className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span>GitHub</span>
              </a>
              <a
                href="https://www.linkedin.com/company/college-cuts"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
              >
                <Linkedin className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span>LinkedIn</span>
              </a>
            </div>
          </div>

          {/* Data Info */}
          <div className="space-y-4">
            <h4 className="font-semibold text-base">Data Coverage</h4>
          <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                <span>Started from 2024</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span>Updated continuously</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
                <span>Public sources verified</span>
              </div>
              <a
                href="https://buymeacoffee.com/dunsinagb"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
              >
                <CoffeeIcon />
                <span>Buy me a coffee</span>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t mt-12 pt-8 flex flex-col sm:flex-row justify-center items-center gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-muted-foreground text-center">
            <p>© 2025 CollegeCuts Tracker. Data compiled from public sources.</p>
            <p className="text-xs">Disclaimer: Information may not be complete or current.</p>
          </div>

          {/* Creator Credit */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
            <span>Created by</span>
            <a
              href="https://twitter.com/Dunsinagb"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors font-medium"
            >
              Olu A (@Dunsinagb)
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
