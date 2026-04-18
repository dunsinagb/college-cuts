import { Link } from "wouter";
import { GraduationCap, Rss, Linkedin } from "lucide-react";

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

export function Footer() {
  return (
    <footer style={{ background: "#0f1e35" }}>
      <div className="container mx-auto max-w-7xl px-4 pt-12 pb-8 sm:px-6 lg:px-8">

        <div className="grid gap-10 md:grid-cols-4 mb-10">
          {/* Brand column */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <GraduationCap className="h-5 w-5 text-amber-400 shrink-0" />
              <span className="font-bold text-lg tracking-tight">
                <span className="text-white">College</span>
                <span style={{ color: "#fbbf24" }}>Cuts</span>
              </span>
            </Link>
            <p className="text-sm text-blue-200/60 leading-relaxed max-w-[220px]">
              The definitive record of program cuts, closures, and layoffs at US colleges and universities. Independent, sourced, and free to use.
            </p>
          </div>

          {/* Navigate */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-blue-400/60 mb-4">Navigate</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/" className="text-blue-200/70 hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link href="/cuts" className="text-blue-200/70 hover:text-white transition-colors">All Actions</Link></li>
              <li><Link href="/analytics" className="text-blue-200/70 hover:text-white transition-colors">Analytics</Link></li>
              <li><Link href="/news" className="text-blue-200/70 hover:text-white transition-colors">News</Link></li>
              <li><Link href="/job-outlook" className="text-blue-200/70 hover:text-white transition-colors">Job Outlook</Link></li>
              <li><Link href="/about" className="text-blue-200/70 hover:text-white transition-colors">About</Link></li>
            </ul>
          </div>

          {/* Tools */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-blue-400/60 mb-4">Tools</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/talent" className="text-blue-200/70 hover:text-white transition-colors">Talent Pool</Link></li>
              <li><Link href="/submit-tip" className="text-blue-200/70 hover:text-white transition-colors">Submit a Tip</Link></li>
              <li><Link href="/about#methodology" className="text-blue-200/70 hover:text-white transition-colors">Methodology</Link></li>
              <li>
                <span
                  className="text-blue-200/70 hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1.5"
                  title="Copy RSS feed URL"
                  onClick={() => {
                    const url = `${window.location.origin}${BASE_URL}/api/rss`;
                    navigator.clipboard.writeText(url).then(() => {
                      alert(`RSS feed URL copied!\n\n${url}\n\nPaste this URL into your RSS reader app.`);
                    }).catch(() => {
                      alert(`RSS feed URL:\n\n${url}`);
                    });
                  }}
                >
                  <Rss className="h-3.5 w-3.5 text-orange-400/70" />
                  RSS Feed
                </span>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-blue-400/60 mb-4">Connect</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href="https://www.linkedin.com/company/college-cuts"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-blue-200/70 hover:text-white transition-colors"
                >
                  <Linkedin className="h-3.5 w-3.5 text-[#0077b5]" />
                  LinkedIn
                </a>
              </li>
              <li>
                <a
                  href="https://www.buymeacoffee.com/dunsinagb"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#FFDD00] hover:bg-yellow-300 transition-colors px-3 py-1 text-xs font-bold text-black"
                >
                  <span>☕</span>
                  <span>Buy me a coffee</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:hello@college-cuts.com"
                  className="text-blue-200/70 hover:text-white transition-colors"
                >
                  hello@college-cuts.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-blue-300/40">
          <span>
            &copy; 2025&ndash;{new Date().getFullYear()} CollegeCuts. Dataset licensed{" "}
            <a
              href="https://creativecommons.org/licenses/by-nc/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-200/70 transition-colors underline underline-offset-2"
            >
              CC BY-NC 4.0
            </a>
            .
          </span>
          <span>
            Created by{" "}
            <a
              href="https://twitter.com/Dunsinagb"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-300/60 hover:text-white transition-colors font-medium"
            >
              Olu A (@Dunsinagb)
            </a>
          </span>
        </div>

      </div>
    </footer>
  );
}
