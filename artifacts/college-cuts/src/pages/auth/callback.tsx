import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet-async";
import { GraduationCap, Loader2 } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase-client";

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

export default function AuthCallback() {
  const [, navigate] = useLocation();
  const [error, setError] = useState("");
  const handled = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect") || "";

    async function proceed(session: Session) {
      if (handled.current) return;
      handled.current = true;

      const userEmail = session.user?.email;
      if (userEmail) {
        localStorage.setItem("cc_user_email", userEmail);
        try {
          await fetch(`${BASE_URL}/api/subscribe`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: userEmail }),
          });
          localStorage.setItem("cc_subscribed", "1");
        } catch {}
      }

      navigate(redirect || "/cuts", { replace: true });
    }

    // Listen for Supabase auth state changes — catches magic link hash-based flow
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session) {
        await proceed(session);
      }
    });

    // Also handle PKCE code flow (?code=...) and already-active sessions
    async function tryImmediate() {
      const code = params.get("code");
      if (code) {
        const { data, error: exchError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchError) {
          setError("Sign-in link has expired or already been used. Please request a new one.");
          return;
        }
        if (data.session) {
          await proceed(data.session);
          return;
        }
      }

      // Check if session is already present (e.g. returning to the page)
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        await proceed(data.session);
        return;
      }

      // Safety timeout — if nothing fires within 12s, show error
      setTimeout(() => {
        if (!handled.current) {
          setError("Sign-in could not be completed. The link may have expired. Please try again.");
        }
      }, 12000);
    }

    tryImmediate();

    return () => subscription.unsubscribe();
  }, []);

  if (error) {
    return (
      <>
        <Helmet><meta name="robots" content="noindex" /></Helmet>
        <div className="min-h-screen bg-[#f0f4f9] flex items-center justify-center px-4">
          <div className="text-center space-y-4 max-w-sm">
            <div className="flex justify-center items-center gap-2">
              <GraduationCap className="h-7 w-7 text-[#1e3a5f]" />
              <span className="font-extrabold text-xl text-[#1e3a5f]">CollegeCuts</span>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
            <a
              href="/auth/login"
              className="inline-block text-sm font-semibold text-[#1e3a5f] hover:underline"
            >
              ← Back to sign-in
            </a>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet><meta name="robots" content="noindex" /></Helmet>
      <div className="min-h-screen bg-[#f0f4f9] flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <div className="flex justify-center items-center gap-2">
            <GraduationCap className="h-7 w-7 text-[#1e3a5f]" />
            <span className="font-extrabold text-xl text-[#1e3a5f]">CollegeCuts</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin text-[#1e3a5f]" />
            <span className="text-sm font-medium">Signing you in…</span>
          </div>
        </div>
      </div>
    </>
  );
}
