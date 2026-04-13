import { useState } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet-async";
import {
  GraduationCap, Loader2, Eye, EyeOff, ArrowRight,
  Database, BarChart3, TrendingUp, Shield, Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase-client";

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

export default function Signup() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailConfirmNeeded, setEmailConfirmNeeded] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const redirect = params.get("redirect") || "/cuts";

  async function handleGoogleSignUp() {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}${BASE_URL}/auth/callback` },
    });
    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords don't match."); return; }

    setSubmitting(true);
    const cleanEmail = email.trim().toLowerCase();
    const redirectTo = `${window.location.origin}${BASE_URL}/auth/callback${redirect !== "/cuts" ? `?redirect=${encodeURIComponent(redirect)}` : ""}`;

    try {
      const res = await fetch(`${BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password, redirectTo }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Could not create account. Please try again.");
        setSubmitting(false);
        return;
      }

      // Account created (or already existed) — confirmation email sent via Resend
      setEmailConfirmNeeded(true);
      setSubmitting(false);
    } catch {
      setError("Network error. Please check your connection and try again.");
      setSubmitting(false);
    }
  }

  // --- Account created state ---
  if (emailConfirmNeeded) {
    return (
      <div className="min-h-screen bg-[#f0f4f9] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mx-auto">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-extrabold text-[#1e3a5f]">You're in — account ready!</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Your account has been created and is ready to use. We sent a welcome email to{" "}
              <strong className="text-[#1e3a5f]">{email}</strong> with a one-click sign-in button.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed">
              Or sign in right now with your email and password:
            </p>
            <a
              href="/auth/login"
              className="block w-full bg-[#1e3a5f] hover:bg-[#2a4e7c] text-white font-bold py-3 rounded-xl text-sm transition-colors"
            >
              Sign in now →
            </a>
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-800 text-left space-y-1">
              <div className="font-semibold">Can't find the welcome email?</div>
              <div>Check your spam or promotions folder. It's from <em>hello@college-cuts.com</em>.</div>
            </div>
            <button
              className="text-sm text-[#1e3a5f] font-semibold hover:underline"
              onClick={() => { setEmailConfirmNeeded(false); setPassword(""); setConfirm(""); }}
            >
              ← Use a different email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Create Account | CollegeCuts</title>
        <meta name="description" content="Create a free account to access the full CollegeCuts higher education database." />
      </Helmet>
      <div className="min-h-screen bg-[#f0f4f9] flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-7 w-7 text-[#1e3a5f]" />
                <span className="font-extrabold text-xl text-[#1e3a5f]">CollegeCuts</span>
              </div>
            </div>
            <h1 className="text-2xl font-extrabold text-[#1e3a5f]">Create your free account</h1>
            <p className="text-gray-500 text-sm mt-1">Full access to the higher education database</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-5">
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Database, label: "Full Database", color: "text-blue-600 bg-blue-50" },
                { icon: BarChart3, label: "Analytics", color: "text-purple-600 bg-purple-50" },
                { icon: TrendingUp, label: "Real-time Data", color: "text-green-600 bg-green-50" },
                { icon: Shield, label: "Job Outlook", color: "text-orange-600 bg-orange-50" },
              ].map(({ icon: Icon, label, color }) => (
                <div key={label} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg ${color}`}>
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="text-xs font-semibold">{label}</span>
                </div>
              ))}
            </div>

            {/* Google sign-up */}
            <button
              type="button"
              onClick={handleGoogleSignUp}
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
              <div className="relative flex justify-center text-xs text-gray-400 bg-white px-3">or sign up with email</div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
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
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat your password"
                  className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f] ${confirm && confirm !== password ? "border-red-400" : "border-gray-300"}`}
                />
                {confirm && confirm !== password && <p className="text-red-500 text-xs mt-1">Passwords don't match</p>}
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
                  ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating account…</>
                  : <>Create Free Account <ArrowRight className="ml-2 h-4 w-4" /></>}
              </Button>
            </form>

            <p className="text-center text-xs text-gray-400">
              No credit card. No spam. Unsubscribe anytime.
            </p>
            <div className="pt-2 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-500">
                Already have an account?{" "}
                <a href="/auth/login" className="font-semibold text-[#1e3a5f] hover:underline">Sign in</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
