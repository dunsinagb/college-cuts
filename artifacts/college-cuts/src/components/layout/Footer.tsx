import { Link } from "wouter";
import { Rss } from "lucide-react";

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

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
              <li>
                <span
                  className="inline-flex items-center gap-1.5 text-muted-foreground cursor-pointer hover:text-primary transition-colors"
                  title="Copy RSS feed URL to paste into your feed reader"
                  onClick={() => {
                    const url = `${window.location.origin}${BASE_URL}/api/rss`;
                    navigator.clipboard.writeText(url).then(() => {
                      alert(`RSS feed URL copied!\n\n${url}\n\nPaste this URL into your RSS reader app (e.g. Feedly, NetNewsWire, Reeder).`);
                    }).catch(() => {
                      alert(`RSS feed URL:\n\n${url}\n\nPaste this URL into your RSS reader app (e.g. Feedly, NetNewsWire, Reeder).`);
                    });
                  }}
                >
                  <Rss className="h-3.5 w-3.5 text-orange-500" />
                  RSS Feed
                </span>
              </li>
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
            <a
              href="https://www.buymeacoffee.com/dunsinagb"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#FFDD00] hover:bg-yellow-300 transition-colors px-3 py-1.5 text-xs font-bold text-black"
            >
              <span>☕</span>
              <span>Buy me a coffee</span>
            </a>
            <p className="mt-3 text-xs text-muted-foreground">
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
