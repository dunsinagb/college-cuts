import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, ArrowRight, BarChart3, Bell, Building2, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase-client";

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

const INDUSTRIES = [
  "Technology", "Healthcare", "Financial Services", "Biotech / Life Sciences",
  "Government & Defense", "Consulting", "Manufacturing", "Energy", "Retail & Consumer", "Education",
];
const COMPANY_SIZES = ["1–50", "51–200", "201–500", "501–2,000", "2,001–10,000", "10,000+"];
const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC",
];
const ALERT_FREQUENCIES = [
  { id: "realtime", label: "Real-time", desc: "Within 24 hours of a new cut being logged" },
  { id: "daily", label: "Daily Digest", desc: "Summary every morning at 8 AM" },
  { id: "weekly", label: "Weekly Summary", desc: "Delivered every Monday" },
];
const RISK_THRESHOLDS = [
  { id: "all", label: "All risks", desc: "Low, Medium, High, and Critical" },
  { id: "medium", label: "Medium and above", desc: "Filters out low-signal events" },
  { id: "high", label: "High and Critical only", desc: "Board-level signal only" },
];

type EmployerProfile = {
  email: string;
  company: string;
  industry: string;
  size: string;
  states: string[];
  roleIds: string[];
  alertFrequency: string;
  riskThreshold: string;
  tier: "free";
};

type RoleOption = { id: string; name: string; sector: string; corporateTitles: string[] };

const STEPS = [
  { label: "Company", icon: Building2 },
  { label: "Roles", icon: BarChart3 },
  { label: "Alerts", icon: Bell },
  { label: "Dashboard", icon: CheckCircle2 },
];

export default function IntelligenceOnboarding() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<EmployerProfile>({
    email: "",
    company: "",
    industry: "",
    size: "",
    states: [],
    roleIds: [],
    alertFrequency: "realtime",
    riskThreshold: "medium",
    tier: "free",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [finishing, setFinishing] = useState(false);

  const { data: roles = [], isLoading: rolesLoading } = useQuery<RoleOption[]>({
    queryKey: ["intelligence-roles"],
    queryFn: async () => {
      const r = await fetch(`${BASE_URL}/api/intelligence/roles`);
      if (!r.ok) throw new Error("Failed to load roles");
      return r.json();
    },
  });

  const grouped = roles.reduce<Record<string, RoleOption[]>>((acc, r) => {
    if (!acc[r.sector]) acc[r.sector] = [];
    acc[r.sector].push(r);
    return acc;
  }, {});

  function toggleState(s: string) {
    setProfile((p) => ({
      ...p,
      states: p.states.includes(s) ? p.states.filter((x) => x !== s) : p.states.length < 10 ? [...p.states, s] : p.states,
    }));
  }

  function toggleRole(id: string) {
    setProfile((p) => ({
      ...p,
      roleIds: p.roleIds.includes(id)
        ? p.roleIds.filter((x) => x !== id)
        : p.roleIds.length < 20 ? [...p.roleIds, id] : p.roleIds,
    }));
  }

  function validateStep(): boolean {
    const e: Record<string, string> = {};
    if (step === 0) {
      if (!profile.email.includes("@")) e.email = "Valid business email required";
      if (!profile.company.trim()) e.company = "Company name required";
      if (!profile.industry) e.industry = "Select your industry";
      if (!profile.size) e.size = "Select company size";
      if (password.length < 8) e.password = "Password must be at least 8 characters";
      if (password !== confirmPw) e.confirmPw = "Passwords don't match";
    }
    if (step === 1) {
      if (profile.roleIds.length === 0) e.roles = "Select at least one role category";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleNext() {
    if (!validateStep()) return;
    if (step < 3) setStep((s) => s + 1);
  }

  async function handleFinish() {
    if (!validateStep()) return;
    setFinishing(true);

    const cleanEmail = profile.email.trim().toLowerCase();

    const { data: existingUser } = await supabase.auth.getUser();
    if (!existingUser.user) {
      const { error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: { emailRedirectTo: `${window.location.origin}${BASE_URL}/intelligence/dashboard` },
      });
      if (authError && authError.message !== "User already registered") {
        setErrors((e) => ({ ...e, email: authError.message }));
        setFinishing(false);
        return;
      }
      if (authError?.message === "User already registered") {
        await supabase.auth.signInWithPassword({ email: cleanEmail, password });
      }
    }

    localStorage.setItem("cc_employer", JSON.stringify(profile));
    localStorage.setItem("cc_user_email", cleanEmail);

    try {
      await fetch(`${BASE_URL}/api/intelligence/employer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
    } catch {}

    navigate("/intelligence/dashboard");
  }

  useEffect(() => {
    const saved = localStorage.getItem("cc_employer");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProfile(parsed);
      } catch {}
    }
  }, []);

  return (
    <>
      <Helmet>
        <title>Set Up Your Risk Dashboard | CollegeCuts Intelligence</title>
      </Helmet>
      <div className="min-h-screen bg-[#f0f4f9]">
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2a4e7c 100%)" }} className="py-10 px-4">
          <div className="container mx-auto max-w-3xl">
            <h1 className="text-2xl font-extrabold text-white mb-1">Build Your Pipeline Risk Dashboard</h1>
            <p className="text-blue-200 text-sm">Takes about 2 minutes. See your risk profile immediately, free.</p>
          </div>
        </div>

        {/* Stepper */}
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="container mx-auto max-w-3xl">
            <div className="flex items-center gap-2">
              {STEPS.map((s, i) => (
                <div key={s.label} className="flex items-center gap-2 flex-1 last:flex-none">
                  <div className={`flex items-center gap-1.5 ${i <= step ? "text-[#1e3a5f]" : "text-gray-400"}`}>
                    <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                      i < step ? "bg-[#1e3a5f] border-[#1e3a5f] text-white"
                      : i === step ? "border-[#1e3a5f] text-[#1e3a5f] bg-white"
                      : "border-gray-300 text-gray-400 bg-white"
                    }`}>
                      {i < step ? "✓" : i + 1}
                    </div>
                    <span className="text-xs font-semibold hidden sm:block">{s.label}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 ${i < step ? "bg-[#1e3a5f]" : "bg-gray-200"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="container mx-auto max-w-3xl px-4 py-8">
          {/* Step 0: Company Profile */}
          {step === 0 && (
            <>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-5">
                <h2 className="text-xl font-bold text-[#1e3a5f]">Company Profile</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Business Email *</label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                      placeholder="you@company.com"
                      className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f] ${errors.email ? "border-red-400" : "border-gray-300"}`}
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Company Name *</label>
                    <input
                      type="text"
                      value={profile.company}
                      onChange={(e) => setProfile((p) => ({ ...p, company: e.target.value }))}
                      placeholder="Acme Corp"
                      className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f] ${errors.company ? "border-red-400" : "border-gray-300"}`}
                    />
                    {errors.company && <p className="text-red-500 text-xs mt-1">{errors.company}</p>}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Create Password *</label>
                    <div className="relative">
                      <input
                        type={showPw ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min. 8 characters"
                        className={`w-full rounded-lg border pr-10 px-3 py-2.5 text-sm outline-none focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f] ${errors.password ? "border-red-400" : "border-gray-300"}`}
                      />
                      <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password *</label>
                    <input
                      type="password"
                      value={confirmPw}
                      onChange={(e) => setConfirmPw(e.target.value)}
                      placeholder="Repeat password"
                      className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f] ${errors.confirmPw ? "border-red-400" : "border-gray-300"}`}
                    />
                    {errors.confirmPw && <p className="text-red-500 text-xs mt-1">{errors.confirmPw}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Industry *</label>
                  <div className="flex flex-wrap gap-2">
                    {INDUSTRIES.map((ind) => (
                      <button
                        key={ind}
                        onClick={() => setProfile((p) => ({ ...p, industry: ind }))}
                        className={`px-3 py-1.5 rounded-full text-sm border font-medium transition-colors ${
                          profile.industry === ind
                            ? "bg-[#1e3a5f] text-white border-[#1e3a5f]"
                            : "bg-white text-gray-600 border-gray-300 hover:border-[#1e3a5f]/50"
                        }`}
                      >
                        {ind}
                      </button>
                    ))}
                  </div>
                  {errors.industry && <p className="text-red-500 text-xs mt-1">{errors.industry}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Company Size *</label>
                  <div className="flex flex-wrap gap-2">
                    {COMPANY_SIZES.map((sz) => (
                      <button
                        key={sz}
                        onClick={() => setProfile((p) => ({ ...p, size: sz }))}
                        className={`px-3 py-1.5 rounded-full text-sm border font-medium transition-colors ${
                          profile.size === sz
                            ? "bg-[#1e3a5f] text-white border-[#1e3a5f]"
                            : "bg-white text-gray-600 border-gray-300 hover:border-[#1e3a5f]/50"
                        }`}
                      >
                        {sz} employees
                      </button>
                    ))}
                  </div>
                  {errors.size && <p className="text-red-500 text-xs mt-1">{errors.size}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Primary Hiring States <span className="text-gray-400 font-normal">(up to 10, or leave blank for national)</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                    {US_STATES.map((s) => (
                      <button
                        key={s}
                        onClick={() => toggleState(s)}
                        className={`px-2.5 py-1 rounded-md text-xs border font-semibold transition-colors ${
                          profile.states.includes(s)
                            ? "bg-[#1e3a5f] text-white border-[#1e3a5f]"
                            : "bg-white text-gray-600 border-gray-300 hover:border-[#1e3a5f]/50"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  {profile.states.length > 0 && (
                    <p className="text-xs text-[#1e3a5f] mt-1 font-medium">Selected: {profile.states.join(", ")}</p>
                  )}
                </div>
              </CardContent>
            </Card>
            <p className="text-center text-sm text-gray-500 mt-3">
              Already have an organization account?{" "}
              <a href="/auth/login?redirect=/intelligence/dashboard" className="text-[#1e3a5f] font-semibold hover:underline">
                Sign in →
              </a>
            </p>
            </>
          )}

          {/* Step 1: Role Selection */}
          {step === 1 && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-[#1e3a5f]">Which talent pipelines do you rely on?</h2>
                  <p className="text-gray-500 text-sm mt-1">Select up to 20 role categories. We'll map your selections to O*NET occupational codes for precise matching.</p>
                </div>
                {errors.roles && <p className="text-red-500 text-sm">{errors.roles}</p>}
                {rolesLoading ? (
                  <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-[#1e3a5f]" /></div>
                ) : (
                  <div className="space-y-5">
                    {Object.entries(grouped).map(([sector, sRoles]) => (
                      <div key={sector}>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{sector}</h3>
                        <div className="flex flex-wrap gap-2">
                          {sRoles.map((role) => (
                            <button
                              key={role.id}
                              onClick={() => toggleRole(role.id)}
                              className={`px-3 py-2 rounded-lg text-sm border font-medium transition-colors text-left ${
                                profile.roleIds.includes(role.id)
                                  ? "bg-[#1e3a5f] text-white border-[#1e3a5f]"
                                  : "bg-white text-gray-700 border-gray-300 hover:border-[#1e3a5f]/50"
                              }`}
                            >
                              {role.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-400">{profile.roleIds.length}/20 roles selected</p>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Alert Preferences */}
          {step === 2 && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-[#1e3a5f]">Alert Preferences</h2>
                  <p className="text-gray-500 text-sm mt-1">Configure when and how you receive pipeline disruption alerts.</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Alert frequency</h3>
                  <div className="space-y-2">
                    {ALERT_FREQUENCIES.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setProfile((p) => ({ ...p, alertFrequency: f.id }))}
                        className={`w-full text-left flex items-center gap-3 rounded-xl border-2 px-4 py-3 transition-colors ${
                          profile.alertFrequency === f.id
                            ? "border-[#1e3a5f] bg-[#1e3a5f]/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          profile.alertFrequency === f.id ? "border-[#1e3a5f]" : "border-gray-300"
                        }`}>
                          {profile.alertFrequency === f.id && <div className="h-2 w-2 rounded-full bg-[#1e3a5f]" />}
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-gray-800">{f.label}</div>
                          <div className="text-xs text-gray-500">{f.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Minimum risk level to trigger an alert</h3>
                  <div className="space-y-2">
                    {RISK_THRESHOLDS.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setProfile((p) => ({ ...p, riskThreshold: t.id }))}
                        className={`w-full text-left flex items-center gap-3 rounded-xl border-2 px-4 py-3 transition-colors ${
                          profile.riskThreshold === t.id
                            ? "border-[#1e3a5f] bg-[#1e3a5f]/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          profile.riskThreshold === t.id ? "border-[#1e3a5f]" : "border-gray-300"
                        }`}>
                          {profile.riskThreshold === t.id && <div className="h-2 w-2 rounded-full bg-[#1e3a5f]" />}
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-gray-800">{t.label}</div>
                          <div className="text-xs text-gray-500">{t.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
                  <strong>Free tier:</strong> Up to 3 pipeline risk alerts per month. Upgrade to Professional for unlimited real-time alerts.
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#1e3a5f]">You're ready to go</h2>
                    <p className="text-gray-500 text-sm">Here's a summary of your pipeline risk configuration.</p>
                  </div>
                </div>
                <div className="space-y-3 rounded-xl bg-[#f0f4f9] p-4 text-sm">
                  <div className="flex justify-between"><span className="font-semibold text-gray-600">Company</span><span className="text-gray-800">{profile.company}</span></div>
                  <div className="flex justify-between"><span className="font-semibold text-gray-600">Industry</span><span className="text-gray-800">{profile.industry}</span></div>
                  <div className="flex justify-between"><span className="font-semibold text-gray-600">Geography</span><span className="text-gray-800">{profile.states.length > 0 ? profile.states.join(", ") : "National"}</span></div>
                  <div className="flex justify-between"><span className="font-semibold text-gray-600">Role Categories</span><span className="text-gray-800">{profile.roleIds.length} selected</span></div>
                  <div className="flex justify-between"><span className="font-semibold text-gray-600">Alert Frequency</span><span className="text-gray-800 capitalize">{profile.alertFrequency}</span></div>
                  <div className="flex justify-between"><span className="font-semibold text-gray-600">Min. Risk Level</span><span className="text-gray-800 capitalize">{profile.riskThreshold}</span></div>
                  <div className="flex justify-between"><span className="font-semibold text-gray-600">Plan</span><span className="text-amber-600 font-bold">Freemium</span></div>
                </div>
                <p className="text-xs text-gray-400">
                  Your account will be created and your dashboard configuration saved. You can sign in at any time with your email and password.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="ghost"
              onClick={() => step > 0 ? setStep((s) => s - 1) : undefined}
              disabled={step === 0}
              className="text-gray-500"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            {step < 3 ? (
              <Button onClick={handleNext} className="bg-[#1e3a5f] hover:bg-[#2a4e7c] text-white font-bold">
                Continue <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleFinish} disabled={finishing} className="bg-amber-500 hover:bg-amber-400 text-white font-bold">
                {finishing
                  ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Setting up…</>
                  : <>Launch My Dashboard <ArrowRight className="h-4 w-4 ml-1" /></>}
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
