import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "./supabase-client";

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

export type UserRole = "subscriber" | "employer" | null;

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  role: UserRole;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshRole: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  user: null, session: null, role: null, loading: true,
  signOut: async () => {}, refreshRole: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  async function detectRole(email: string): Promise<UserRole> {
    try {
      const [empRes, subRes] = await Promise.all([
        fetch(`${BASE_URL}/api/intelligence/employer/${encodeURIComponent(email)}`),
        fetch(`${BASE_URL}/api/subscriber-check?email=${encodeURIComponent(email)}`),
      ]);
      if (empRes.ok) return "employer";
      if (subRes.ok) return "subscriber";
    } catch {}
    return null;
  }

  // Silently ensures the user exists in the subscribers table.
  // Idempotent — the subscribe endpoint skips insert + email if already present.
  async function ensureSubscriber(email: string) {
    try {
      await fetch(`${BASE_URL}/api/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {}
  }

  async function refreshRole() {
    if (!user?.email) { setRole(null); return; }
    const r = await detectRole(user.email);
    setRole(r);
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user?.email) {
        const email = session.user.email;
        const r = await detectRole(email);
        setRole(r);
        // Ensure they're in the subscribers table regardless of sign-in method
        if (!r) ensureSubscriber(email);
        localStorage.setItem("cc_subscribed", "1");
        localStorage.setItem("cc_user_email", email);
        if (r === "employer") localStorage.setItem("cc_employer", "1");
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user?.email) {
        const email = session.user.email;
        const r = await detectRole(email);
        setRole(r);
        // Ensure they're in the subscribers table regardless of sign-in method
        if (!r) ensureSubscriber(email);
        localStorage.setItem("cc_subscribed", "1");
        localStorage.setItem("cc_user_email", email);
        if (r === "employer") localStorage.setItem("cc_employer", "1");
      } else {
        setRole(null);
        localStorage.removeItem("cc_user_email");
        localStorage.removeItem("cc_subscribed");
        localStorage.removeItem("cc_employer");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    localStorage.removeItem("cc_subscribed");
    localStorage.removeItem("cc_employer");
    localStorage.removeItem("cc_user_email");
  }

  return (
    <AuthContext.Provider value={{ user, session, role, loading, signOut, refreshRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
