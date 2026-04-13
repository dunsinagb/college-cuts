import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet-async";
import { GraduationCap, Loader2, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase-client";
import { useAuth } from "@/lib/auth-context";

export default function Login() {
  const [, navigate] = useLocation();
  const { user, role, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (error) {
      setError(error.message === "Invalid login credentials"
        ? "Incorrect email or password. Check your details and try again."
        : error.message);
      setSubmitting(false);
    }
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

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
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
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#1e3a5f] hover:bg-[#2a4e7c] text-white font-bold py-2.5 h-auto"
              >
                {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Signing in…</> : <>Sign In <ArrowRight className="ml-2 h-4 w-4" /></>}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-100 space-y-3 text-center">
              <p className="text-sm text-gray-500">
                Don't have an account?{" "}
                <a href="/auth/signup" className="font-semibold text-[#1e3a5f] hover:underline">
                  Create one free
                </a>
              </p>
              <p className="text-sm text-gray-500">
                Setting up employer alerts?{" "}
                <a href="/intelligence/onboarding" className="font-semibold text-amber-600 hover:underline">
                  Set up Intelligence →
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
