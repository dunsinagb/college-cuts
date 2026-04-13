import { useState } from "react";
import { Link, useLocation } from "wouter";
import { GraduationCap, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/",               label: "Dashboard",   highlight: false },
    { href: "/cuts",           label: "All Actions", highlight: false },
    { href: "/analytics",      label: "Analytics",   highlight: false },
    { href: "/news",           label: "News",        highlight: false },
    { href: "/job-outlook",    label: "Job Outlook", highlight: false },
    { href: "/about",          label: "About",       highlight: false },
    { href: "/intelligence",   label: "Intelligence",highlight: true  },
  ];

  return (
    <header className="sticky top-0 z-50 w-full shadow-md" style={{ background: "#1e3a5f" }}>
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo + desktop nav */}
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <GraduationCap className="h-6 w-6 text-amber-400" />
            <span className="font-bold text-xl tracking-tight text-white">
              CollegeCuts
            </span>
          </Link>
          <nav className="hidden gap-6 md:flex">
            {links.map((link) => (
              link.highlight ? (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-bold transition-colors px-2.5 py-1 rounded-full border ${
                    location.startsWith("/intelligence")
                      ? "bg-amber-400 text-white border-amber-400"
                      : "border-amber-400/60 text-amber-300 hover:bg-amber-400/10 hover:text-amber-200"
                  }`}
                >
                  {link.label}
                </Link>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    location === link.href
                      ? "text-amber-400"
                      : "text-blue-200 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              )
            ))}
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <Button
            asChild
            size="sm"
            className="hidden sm:flex bg-amber-500 hover:bg-amber-400 text-white border-0 font-semibold"
          >
            <Link href="/submit-tip">Submit a Tip</Link>
          </Button>

          {/* Hamburger — mobile only */}
          <button
            className="md:hidden flex items-center justify-center rounded-md p-2 text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile slide-down menu */}
      {open && (
        <div className="md:hidden border-t border-white/10" style={{ background: "#1a3352" }}>
          <nav className="flex flex-col px-4 py-3 gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                  link.highlight
                    ? location.startsWith("/intelligence")
                      ? "bg-amber-400 text-white"
                      : "border border-amber-400/50 text-amber-300 hover:bg-amber-400/10"
                    : location === link.href
                      ? "bg-white/10 text-amber-400"
                      : "text-blue-100 hover:bg-white/10 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 pt-2 border-t border-white/10">
              <Link
                href="/submit-tip"
                onClick={() => setOpen(false)}
                className="block w-full rounded-md bg-amber-500 hover:bg-amber-400 px-3 py-2.5 text-center text-sm font-semibold text-white transition-colors"
              >
                Submit a Tip
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
