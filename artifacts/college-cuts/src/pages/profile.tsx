import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "wouter";
import { LogOut, Mail, ShieldCheck, User, ExternalLink, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";

export default function Profile() {
  const { user, role, signOut, loading } = useAuth();
  const [, navigate] = useLocation();
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth/login?redirect=/profile");
    }
  }, [loading, user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#f0f4f9] flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-400">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#1e3a5f] border-t-transparent" />
          <span className="text-sm">Loading…</span>
        </div>
      </div>
    );
  }

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
    navigate("/");
  }

  const createdAt = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : null;

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Subscriber";
  const provider = user?.app_metadata?.provider;

  return (
    <>
      <Helmet>
        <title>My Account | CollegeCuts</title>
      </Helmet>
      <div className="min-h-screen bg-[#f0f4f9] py-12 px-4">
        <div className="max-w-lg mx-auto space-y-5">

          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-[#1e3a5f] flex items-center justify-center shrink-0">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[#1e3a5f]">{displayName}</h1>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>

          {/* Account details */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5 space-y-4">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Account</h2>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                  <div>
                    <div className="text-xs text-gray-400">Email address</div>
                    <div className="text-sm font-semibold text-gray-800">{user?.email}</div>
                  </div>
                </div>

                {createdAt && (
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-4 w-4 text-gray-400 shrink-0" />
                    <div>
                      <div className="text-xs text-gray-400">Member since</div>
                      <div className="text-sm font-semibold text-gray-800">{createdAt}</div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <GraduationCap className="h-4 w-4 text-gray-400 shrink-0" />
                  <div>
                    <div className="text-xs text-gray-400">Access level</div>
                    <div className="text-sm font-semibold text-gray-800 capitalize">
                      {role === "employer" ? "Employer / Intelligence" : "Full subscriber"}
                    </div>
                  </div>
                </div>

                {provider && provider !== "email" && (
                  <div className="flex items-center gap-3">
                    <ExternalLink className="h-4 w-4 text-gray-400 shrink-0" />
                    <div>
                      <div className="text-xs text-gray-400">Signed in with</div>
                      <div className="text-sm font-semibold text-gray-800 capitalize">{provider}</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Access */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5 space-y-3">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">What you have access to</h2>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "Full cut database",
                  "Analytics & trends",
                  "Job outlook data",
                  "Institution pages",
                  "News feed",
                  "Submit tips",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-gray-700">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-2">
            {role === "employer" && (
              <Button
                className="w-full bg-[#1e3a5f] hover:bg-[#2a4e7c] text-white font-bold justify-start"
                onClick={() => navigate("/intelligence/dashboard")}
              >
                Go to Intelligence Dashboard
              </Button>
            )}
            <Button
              variant="outline"
              className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-semibold justify-start"
              onClick={handleSignOut}
              disabled={signingOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {signingOut ? "Signing out…" : "Sign out"}
            </Button>
          </div>

        </div>
      </div>
    </>
  );
}
