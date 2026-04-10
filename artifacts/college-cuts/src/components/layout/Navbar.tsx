import { Link, useLocation } from "wouter";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [location] = useLocation();

  const links = [
    { href: "/", label: "Dashboard" },
    { href: "/cuts", label: "All Actions" },
    { href: "/analytics", label: "Analytics" },
    { href: "/job-outlook", label: "Job Outlook" },
    { href: "/about", label: "About" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full shadow-md" style={{ background: "#1e3a5f" }}>
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-amber-400" />
            <span className="hidden font-bold sm:inline-block text-xl tracking-tight text-white">
              CollegeCuts
            </span>
          </Link>
          <nav className="hidden gap-6 md:flex">
            {links.map((link) => (
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
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {/* Buy Me a Coffee */}
          <a
            href="https://www.buymeacoffee.com/dunsinagb"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#FFDD00] hover:bg-yellow-300 transition-colors px-3 py-1.5 text-sm font-bold text-[#000000]"
          >
            <span>☕</span>
            <span>Buy me a coffee</span>
          </a>
          <Button
            asChild
            size="sm"
            className="hidden sm:flex bg-amber-500 hover:bg-amber-400 text-white border-0 font-semibold"
          >
            <Link href="/submit-tip">Submit a Tip</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
