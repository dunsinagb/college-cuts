import { useState } from "react";
import { Link, useLocation } from "wouter";
import { GraduationCap, Menu, X, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

export function Navbar() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const { user, role, signOut, loading } = useAuth();

  const links = [
    { href: "/",             label: "Dashboard",    highlight: false, comingSoon: false, matchPrefixes: ["/"] },
    { href: "/cuts",         label: "All Actions",  highlight: false, comingSoon: false, matchPrefixes: ["/cuts", "/institution/", "/cut/"] },
    { href: "/analytics",    label: "Analytics",    highlight: false, comingSoon: false, matchPrefixes: ["/analytics"] },
    { href: "/news",         label: "News",         highlight: false, comingSoon: false, matchPrefixes: ["/news"] },
    { href: "/job-outlook",  label: "Job Outlook",  highlight: false, comingSoon: false, matchPrefixes: ["/job-outlook"] },
    { href: "/about",        label: "About",         highlight: false, comingSoon: false, matchPrefixes: ["/about"] },
  ];

  function isActive(link: typeof links[0]) {
    if (link.comingSoon) return false;
    return link.matchPrefixes.some((prefix) =>
      prefix === "/" ? location === "/" : location.startsWith(prefix)
    );
  }

  const displayName = user?.email?.split("@")[0] ?? "";

  return (
    <header className="sticky top-0 z-50 w-full shadow-md" style={{ background: "#1e3a5f" }}>
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo + desktop nav */}
        <div className="flex items-center gap-6 md:gap-8">
          <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <GraduationCap className="h-6 w-6 text-amber-400" />
            <span className="font-bold text-xl tracking-tight">
              <span className="text-white">College</span><span style={{ color: "#fbbf24" }}>Cuts</span>
            </span>
          </Link>
          <nav className="hidden gap-5 md:flex items-center">
            {links.map((link) => (
              link.comingSoon ? (
                <span
                  key={link.href}
                  className="flex items-center gap-1.5 text-sm font-medium text-blue-300/50 cursor-not-allowed select-none"
                  title="Coming soon"
                >
                  {link.label}
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300/70 px-1.5 py-0.5 rounded-full border border-amber-400/20">
                    Soon
                  </span>
                </span>
              ) : link.highlight ? (
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
                    isActive(link) ? "text-amber-400" : "text-blue-200 hover:text-white"
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
          {/* LIVE indicator — desktop only */}
          <span className="hidden md:inline-flex items-center gap-1.5 text-xs font-medium text-green-400/90 select-none">
            <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
            LIVE
          </span>
          {!loading && (
            user ? (
              <>
                {/* Desktop: user pill + sign out */}
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    href="/profile"
                    className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 rounded-full px-3 py-1.5 transition-colors"
                  >
                    <User className="h-3.5 w-3.5 text-amber-400" />
                    <span className="text-xs font-medium text-white max-w-[120px] truncate">{displayName}</span>
                    {role === "employer" && (
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide">Pro</span>
                    )}
                  </Link>
                  <button
                    onClick={signOut}
                    className="flex items-center gap-1 text-xs text-blue-300 hover:text-white transition-colors px-2 py-1.5 rounded-md hover:bg-white/10"
                    title="Sign out"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span className="hidden lg:block">Sign out</span>
                  </button>
                </div>
                {/* Mobile: profile icon always visible next to hamburger */}
                <Link
                  href="/profile"
                  onClick={() => setOpen(false)}
                  className="sm:hidden flex items-center justify-center rounded-full w-8 h-8 bg-white/10 hover:bg-white/20 transition-colors"
                  title="My account"
                >
                  <User className="h-4 w-4 text-amber-400" />
                </Link>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-blue-200 hover:text-white transition-colors px-2 py-1"
                >
                  Sign in
                </Link>
                <Button
                  asChild
                  size="sm"
                  className="bg-amber-500 hover:bg-amber-400 text-white border-0 font-semibold"
                >
                  <Link href="/auth/signup">Get Access</Link>
                </Button>
              </div>
            )
          )}

          {!user && (
            <Button
              asChild
              size="sm"
              className="hidden sm:flex bg-amber-500 hover:bg-amber-400 text-white border-0 font-semibold"
            >
              <Link href="/submit-tip">Submit a Tip</Link>
            </Button>
          )}

          {/* Hamburger */}
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
              link.comingSoon ? (
                <span
                  key={link.href}
                  className="flex items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium text-blue-300/40 cursor-not-allowed select-none"
                >
                  {link.label}
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300/60 px-1.5 py-0.5 rounded-full border border-amber-400/20">
                    Coming Soon
                  </span>
                </span>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                    link.highlight
                      ? location.startsWith("/intelligence")
                        ? "bg-amber-400 text-white"
                        : "border border-amber-400/50 text-amber-300 hover:bg-amber-400/10"
                      : isActive(link)
                        ? "bg-white/10 text-amber-400"
                        : "text-blue-100 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              )
            ))}
            <div className="mt-2 pt-2 border-t border-white/10 space-y-1">
              {user ? (
                <>
                  <div className="px-3 py-1.5 text-xs text-blue-300 truncate">{user.email}</div>
                  <Link
                    href="/profile"
                    onClick={() => setOpen(false)}
                    className="w-full rounded-md px-3 py-2.5 text-sm text-blue-100 hover:bg-white/10 flex items-center gap-2"
                  >
                    <User className="h-4 w-4" /> My Account
                  </Link>
                  <button
                    onClick={() => { signOut(); setOpen(false); }}
                    className="w-full text-left rounded-md px-3 py-2.5 text-sm text-blue-200 hover:bg-white/10 flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setOpen(false)}
                    className="block w-full rounded-md px-3 py-2.5 text-center text-sm font-semibold text-blue-200 hover:text-white hover:bg-white/10">
                    Sign in
                  </Link>
                  <Link href="/auth/signup" onClick={() => setOpen(false)}
                    className="block w-full rounded-md bg-amber-500 hover:bg-amber-400 px-3 py-2.5 text-center text-sm font-semibold text-white">
                    Get Access Free
                  </Link>
                </>
              )}
              {!user && (
                <Link href="/submit-tip" onClick={() => setOpen(false)}
                  className="block w-full rounded-md bg-white/10 px-3 py-2.5 text-center text-sm font-medium text-white">
                  Submit a Tip
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
