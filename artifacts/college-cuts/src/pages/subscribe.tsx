import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, CheckCircle, AlertCircle, Database, BarChart3, TrendingUp, Shield } from "lucide-react";

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

export default function Subscribe() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [, navigate] = useLocation();

  const params = new URLSearchParams(window.location.search);
  const redirectTo = params.get("redirect") || "/cuts";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${BASE_URL}/api/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsSuccess(true);
        setMessage("Success! Redirecting you now...");
        localStorage.setItem("cc_subscribed", "1");
        setTimeout(() => navigate(redirectTo), 1500);
      } else {
        setMessage(data.error || "Please enter a valid email address.");
      }
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Helmet>
        <title>Subscribe Free | CollegeCuts — Unlock the Higher Ed Database</title>
        <meta name="description" content="Subscribe free to CollegeCuts to access the full database of US college program cuts, closures, department suspensions, and faculty layoffs." />
        <link rel="canonical" href="https://college-cuts.com/subscribe" />
      </Helmet>
    <div className="min-h-[80vh] bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center pb-6 pt-8">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary shadow-lg">
              <Mail className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-extrabold text-primary">
              Unlock Full Access
            </CardTitle>
            <CardDescription className="text-base mt-2 text-muted-foreground leading-relaxed">
              Get exclusive access to the most comprehensive database of higher education program cuts and closures in the United States.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Enter your email address
                </label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="your.email@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 text-base"
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90"
                disabled={loading}
              >
                {loading ? "Unlocking Access..." : "Get Full Access Now"}
              </Button>
            </form>

            {message && (
              <Alert className={isSuccess ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                {isSuccess ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={isSuccess ? "text-green-800" : "text-red-800"}>
                  {message}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-3 pt-2">
              <p className="text-sm font-semibold text-center text-foreground">What you'll get access to:</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Database, label: "Complete Database", color: "bg-blue-50 text-blue-700" },
                  { icon: BarChart3, label: "Advanced Analytics", color: "bg-purple-50 text-purple-700" },
                  { icon: TrendingUp, label: "Real-time Updates", color: "bg-green-50 text-green-700" },
                  { icon: Shield, label: "Job Outlook Data", color: "bg-orange-50 text-orange-700" },
                ].map(({ icon: Icon, label, color }) => (
                  <div key={label} className={`flex items-center gap-2 p-3 rounded-lg ${color}`}>
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-center text-muted-foreground pt-2">
              No spam. No payment. Just your email. Unsubscribe anytime.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}
