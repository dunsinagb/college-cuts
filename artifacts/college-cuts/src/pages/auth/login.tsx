import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet-async";
import { GraduationCap, Loader2, Eye, EyeOff, ArrowRight, Mail, Check, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase-client";
import { useAuth } from "@/lib/auth-context";

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

export default function Login() {
  const [, navigate] = useLocation();
  const { user, role, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  // Magic link state
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [magicSent, setMagicSent] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const redirect = params.get("redirect") || "";

  useEffect(() => {
    if (!loading && user) {
      if (redirect) { navigate(redirect); return; }
      if (role === "employer") navigate("/intelligence/dashboard");
      else navigate("/cuts");
    }
  }, [user, role, loading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("email not confirmed")) {
        setError("Your email isn't confirmed yet. Check your inbox for the confirmation email we sent when you signed up, then click the link to activate your account.");
      } else if (msg.includes("invalid login credentials") || msg.includes("invalid credentials")) {
        setError("Incorrect email or password. If you subscribed before accounts were added, use \"Email link (no password)\" above.");
      } else {
        setError(error.message);
      }
      setSubmitting(false);
    }
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}${BASE_URL}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) { setError("Enter a valid email first"); return; }
    setError("");
    setMagicLoading(true);

    const redirectTo = `${window.location.origin}${BASE_URL}/auth/callback${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`;

    try {
      const res = await fetch(`${BASE_URL}/api/auth/magic-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), redirectTo }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 429) {
          setError("Too many requests. Please wait a few minutes before trying again.");
        } else {
          setError(data?.error || "Could not send sign-in link. Please try again.");
        }
      } else {
        setMagicSent(true);
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    }
    setMagicLoading(false);
  }

  return (
    <>
      <Helmet>
        <title>Sign In | CollegeCuts</title>
      </Helmet>
      <div className="min-h-screen bg-[#f0f4f9] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-7 w-7 text-[#1e3a5f]" />
                <span className="font-extrabold text-xl text-[#1e3a5f]">CollegeCuts</span>
              </div>
            </div>
            <h1 className="text-2xl font-extrabold text-[#1e3a5f]">Welcome back</h1>
            <p className="text-gray-500 text-sm mt-1">Sign in to your account to continue</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-5">

            {/* Google sign-in */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors disabled:opacity-60"
            >
              {googleLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              Continue with Google
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
              <div className="relative flex justify-center text-xs text-gray-400 bg-white px-3">or sign in with email</div>
            </div>

            {/* Tab switcher */}
            <div className="flex rounded-lg bg-gray-100 p-1 gap-1">
              <button
                type="button"
                onClick={() => { setMode("password"); setError(""); setMagicSent(false); }}
                className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-colors ${mode === "password" ? "bg-white text-[#1e3a5f] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                Password
              </button>
              <button
                type="button"
                onClick={() => { setMode("magic"); setError(""); }}
                className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-colors ${mode === "magic" ? "bg-white text-[#1e3a5f] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                Email link (no password)
              </button>
            </div>

            {mode === "password" ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-10 text-sm outline-none focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
                )}

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#1e3a5f] hover:bg-[#2a4e7c] text-white font-bold py-2.5 h-auto"
                >
                  {submitting
                    ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Signing in…</>
                    : <>Sign In <ArrowRight className="ml-2 h-4 w-4" /></>}
                </Button>

                <p className="text-center text-xs text-gray-400">
                  Subscribed before accounts were added?{" "}
                  <button type="button" onClick={() => { setMode("magic"); setError(""); }} className="text-amber-600 font-semibold hover:underline">
                    Use email link instead →
                  </button>
                </p>
              </form>
            ) : magicSent ? (
              <div className="text-center space-y-3 py-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 mx-auto">
                  <Check className="h-7 w-7 text-green-600" />
                </div>
                <p className="font-bold text-[#1e3a5f]">Check your inbox</p>
                <p className="text-sm text-gray-500">
                  We sent a sign-in link to <strong>{email}</strong>. Click it and you'll be signed in automatically, no password needed.
                </p>
                <button
                  type="button"
                  onClick={() => { setMagicSent(false); setMagicLoading(false); }}
                  className="text-xs text-gray-400 hover:text-gray-600 underline"
                >
                  Resend or use a different email
                </button>
              </div>
            ) : (
              <form onSubmit={handleMagicLink} className="space-y-4">
                <p className="text-sm text-gray-600 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
                  <strong>Already subscribed?</strong> Enter your email and we'll send you a one-click sign-in link. No password needed. Works for existing subscribers too.
                </p>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f]"
                  />
                </div>

                {error && (
                  <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
                )}

                <Button
                  type="submit"
                  disabled={magicLoading}
                  className="w-full bg-[#1e3a5f] hover:bg-[#2a4e7c] text-white font-bold py-2.5 h-auto"
                >
                  {magicLoading
                    ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending link…</>
                    : <><Mail className="h-4 w-4 mr-2" />Send Sign-in Link</>}
                </Button>
              </form>
            )}

            <div className="pt-2 border-t border-gray-100 space-y-3 text-center">
              <p className="text-sm text-gray-500">
                Don't have an account?{" "}
                <a href="/auth/signup" className="font-semibold text-[#1e3a5f] hover:underline">
                  Create one free
                </a>
              </p>
            </div>

            <div className="pt-3 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400 mb-1.5">For organizations &amp; HR teams</p>
              <a
                href="/intelligence/onboarding"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600 hover:text-amber-700 hover:underline"
              >
                <Building2 className="h-3.5 w-3.5" />
                Set up your Pipeline Risk Dashboard →
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
