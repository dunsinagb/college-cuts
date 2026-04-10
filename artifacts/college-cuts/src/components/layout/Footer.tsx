import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="border-t bg-muted/20">
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-primary">CollegeCuts</h3>
            <p className="mt-4 text-sm text-muted-foreground">
              A civic-minded data tracker monitoring program cuts, university closures, and faculty layoffs across the United States.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Navigation</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/" className="text-muted-foreground hover:text-primary transition-colors">Dashboard</Link></li>
              <li><Link href="/cuts" className="text-muted-foreground hover:text-primary transition-colors">All Actions</Link></li>
              <li><Link href="/analytics" className="text-muted-foreground hover:text-primary transition-colors">Analytics</Link></li>
              <li><Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">About</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Contribute</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/submit-tip" className="text-muted-foreground hover:text-primary transition-colors">Submit a Tip</Link></li>
              <li><Link href="/about#methodology" className="text-muted-foreground hover:text-primary transition-colors">Methodology</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Credits</h4>
            <p className="mt-4 text-sm text-muted-foreground">
              Created by{" "}
              <a href="https://twitter.com/Dunsinagb" target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
                Olu A (@Dunsinagb)
              </a>
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Data coverage is based on public reporting and user submissions. Not guaranteed to be exhaustive.
            </p>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} CollegeCuts Tracker. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
