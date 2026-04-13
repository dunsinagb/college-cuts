import { useState } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet-async";
import { GraduationCap, Loader2, Eye, EyeOff, CheckCircle2, ArrowRight, Database, BarChart3, TrendingUp, Shield } from "lucide-react";
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
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const redirect = params.get("redirect") || "/cuts";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords don't match."); return; }

    setSubmitting(true);
    const cleanEmail = email.trim().toLowerCase();

    const { error: authError } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: { emailRedirectTo: `${window.location.origin}${BASE_URL}/auth/login` },
    });

    if (authError) {
      setError(authError.message);
      setSubmitting(false);
      return;
    }

    await fetch(`${BASE_URL}/api/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: cleanEmail }),
    });

    localStorage.setItem("cc_subscribed", "1");
    localStorage.setItem("cc_user_email", cleanEmail);

    setSuccess(true);
    setTimeout(() => navigate(redirect), 2000);
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#f0f4f9] flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mx-auto">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl font-extrabold text-[#1e3a5f]">You're in!</h2>
          <p className="text-gray-500 text-sm">Account created. Taking you to the database now…</p>
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
