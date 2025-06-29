import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t bg-gray-50/50 backdrop-blur-sm">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">CollegeCuts Tracker</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Real-time monitoring of program cuts and institutional changes across higher education.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live updates</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-medium">Quick Links</h4>
            <div className="space-y-2 text-sm">
              <Link href="/" className="block text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
              <Link href="/cuts" className="block text-muted-foreground hover:text-foreground transition-colors">
                All Cuts
              </Link>
              <Link href="/about" className="block text-muted-foreground hover:text-foreground transition-colors">
                About
              </Link>
              <Link href="/submit-tip" className="block text-muted-foreground hover:text-foreground transition-colors">
                Submit Tip
              </Link>
            </div>
          </div>

          {/* Resources */}
          <div className="space-y-3">
            <h4 className="font-medium">Resources</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <Link href="/about" className="block hover:text-foreground transition-colors">
                Methodology
              </Link>
              <Link href="/cuts" className="block hover:text-foreground transition-colors">
                Data Export
              </Link>
            </div>
          </div>

          {/* Data Info */}
          <div className="space-y-3">
            <h4 className="font-medium">Data Coverage</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>Started from 2024</p>
              <p>Updated continuously</p>
              <p>Public sources verified</p>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-muted-foreground">
            <p>© 2025 CollegeCuts Tracker. Data compiled from public sources.</p>
            <p className="text-xs">Disclaimer: Information may not be complete or current.</p>
          </div>

          {/* Creator Credit */}
          <div className="text-xs text-muted-foreground/70">
            Created by{" "}
            <a
              href="https://twitter.com/Dunsinagb"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-muted-foreground transition-colors"
            >
              Olu A (@Dunsinagb)
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
