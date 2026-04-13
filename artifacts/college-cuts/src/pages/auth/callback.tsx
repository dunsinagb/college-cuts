import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { GraduationCap, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase-client";

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

export default function AuthCallback() {
  const [, navigate] = useLocation();
  const [error, setError] = useState("");

  useEffect(() => {
    async function handleCallback() {
      const params = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace("#", "?"));
      const redirect = params.get("redirect") || hashParams.get("redirect") || "";

      // Supabase writes session to localStorage automatically on redirect.
      // We just need to wait for the session to be picked up.
      const { data, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !data.session) {
        // Try exchanging the code if present (PKCE flow)
        const code = params.get("code");
        if (code) {
          const { error: exchError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchError) {
            setError("Sign-in link has expired or already been used. Please try again.");
            return;
          }
        } else {
          setError("Sign-in could not be completed. Please try again.");
          return;
        }
      }

      // Re-fetch session after exchange
      const { data: freshData } = await supabase.auth.getSession();
      const userEmail = freshData.session?.user?.email;

      if (userEmail) {
        localStorage.setItem("cc_user_email", userEmail);

        // Ensure subscriber record exists (for Google sign-ups and magic link users)
        try {
          await fetch(`${BASE_URL}/api/subscribe`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: userEmail }),
          });
          localStorage.setItem("cc_subscribed", "1");
        } catch {}
      }

      // Navigate based on redirect param or role
      if (redirect) {
        navigate(redirect);
      } else {
        navigate("/cuts");
      }
    }

    handleCallback();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-[#f0f4f9] flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="flex justify-center">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-7 w-7 text-[#1e3a5f]" />
              <span className="font-extrabold text-xl text-[#1e3a5f]">CollegeCuts</span>
            </div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4">
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
          <a href="/auth/login" className="text-sm font-semibold text-[#1e3a5f] hover:underline">
            Back to sign-in
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f4f9] flex items-center justify-center px-4">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-[#1e3a5f]" />
            <span className="font-extrabold text-xl text-[#1e3a5f]">CollegeCuts</span>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin text-[#1e3a5f]" />
          <span className="text-sm font-medium">Signing you in…</span>
        </div>
      </div>
    </div>
  );
}
