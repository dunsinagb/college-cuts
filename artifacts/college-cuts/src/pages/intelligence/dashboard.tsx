import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import {
  AlertTriangle, ArrowRight, BarChart3, Bell, CheckCircle2, ExternalLink,
  Info, Lock, RefreshCw, Save, Send, Settings, Users, X, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase-client";

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

type EmployerProfile = {
  email: string;
  company: string;
  industry: string;
  size: string;
  states: string[];
  roleIds: string[];
  alertFrequency: string;
  riskThreshold: string;
  tier: "free" | "professional" | "enterprise";
};

type RiskResult = {
  roleId: string;
  roleName: string;
  sector: string;
  corporateTitles: string[];
  onetCodes: string[];
  cutCount: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  estimatedImpact: number;
  topStates: { state: string; count: number }[];
  recentCuts: {
    id: string;
    institution: string;
    program: string;
    state: string;
    cutType: string;
    date: string;
    facultyAffected: number | null;
    sourceUrl: string;
    sourcePublication: string;
  }[];
};

type DashboardResponse = {
  results: RiskResult[];
  generatedAt: string;
  dataWindow: string;
  geography: string | string[];
};

type DisruptionItem = {
  id: string;
  institution: string;
  program: string | null;
  state: string;
  cutType: string;
  date: string;
  facultyAffected: number | null;
  sourceUrl: string;
  mappedRoles: { id: string; name: string; corporateTitles: string[] }[];
};

const RISK_CONFIG = {
  low: { label: "LOW", bg: "bg-green-100", text: "text-green-700", border: "border-green-200", bar: "bg-green-400" },
  medium: { label: "MEDIUM", bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-200", bar: "bg-yellow-400" },
  high: { label: "HIGH", bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200", bar: "bg-orange-500" },
  critical: { label: "CRITICAL", bg: "bg-red-100", text: "text-red-700", border: "border-red-200", bar: "bg-red-500" },
};

const CUT_TYPE_LABELS: Record<string, string> = {
  program_suspension: "Pipeline Reduction",
  department_closure: "Skill Supply Disruption",
  staff_layoff: "Specialist Talent Available",
  teach_out: "Pipeline Wind-Down",
  campus_closure: "Regional Supply Disruption",
  institution_closure: "Full Supply Disruption",
};

function RiskBadge({ level }: { level: keyof typeof RISK_CONFIG }) {
  const cfg = RISK_CONFIG[level];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {cfg.label}
    </span>
  );
}

function RiskCard({ result, isBlurred, onUpgrade }: { result: RiskResult; isBlurred: boolean; onUpgrade: () => void }) {
  const cfg = RISK_CONFIG[result.riskLevel];
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`relative ${isBlurred ? "select-none" : ""}`}>
      <Card className={`border-2 ${cfg.border} shadow-sm hover:shadow-md transition-shadow`}>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{result.sector}</span>
                <RiskBadge level={result.riskLevel} />
              </div>
              <h3 className="font-bold text-[#1e3a5f] text-base mt-1 leading-snug">{result.roleName}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{result.corporateTitles.slice(0, 3).join(" · ")}</p>
            </div>
            <div className="text-right shrink-0">
              <div className="text-2xl font-black text-[#1e3a5f]">{result.cutCount}</div>
              <div className="text-xs text-gray-500">program cuts</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500 font-medium">
              <span>Pipeline impact</span>
              <span className="font-bold text-gray-700">~{result.estimatedImpact.toLocaleString()} fewer graduates/yr</span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${cfg.bar}`}
                style={{ width: `${Math.min(100, (result.cutCount / 10) * 100)}%` }}
              />
            </div>
          </div>

          {result.topStates.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {result.topStates.map(({ state, count }) => (
                <span key={state} className="inline-flex items-center gap-1 bg-[#1e3a5f]/5 text-[#1e3a5f] text-xs font-semibold px-2 py-0.5 rounded-full">
                  {state} <span className="text-gray-400">({count})</span>
                </span>
              ))}
            </div>
          )}

          {result.recentCuts.length > 0 && (
            <div>
              <button
                onClick={() => setExpanded((v) => !v)}
                className="text-xs text-[#1e3a5f] font-semibold hover:underline"
              >
                {expanded ? "Hide" : "Show"} {result.recentCuts.length} recent disruption{result.recentCuts.length !== 1 ? "s" : ""}
              </button>
              {expanded && (
                <div className="mt-2 space-y-2">
                  {result.recentCuts.map((cut) => (
                    <div key={cut.id} className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2.5 text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-semibold text-gray-800">{cut.institution}</div>
                          {cut.program && <div className="text-gray-500 mt-0.5">{cut.program}</div>}
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-gray-400">{cut.state}</span>
                            <span className="bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded text-[10px] font-medium">
                              {CUT_TYPE_LABELS[cut.cutType] ?? cut.cutType}
                            </span>
                            {cut.facultyAffected && (
                              <span className="text-amber-600 font-semibold">{cut.facultyAffected} specialists displaced</span>
                            )}
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="text-gray-400">{cut.date ? (() => { try { return format(parseISO(cut.date), "MMM d, yyyy"); } catch { return cut.date; } })() : ""}</div>
                          {cut.sourceUrl && (
                            <a href={cut.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[#1e3a5f] hover:text-amber-600 mt-1">
                              Source <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-1 text-[10px] text-gray-400 pt-1 border-t border-gray-100">
            <Info className="h-3 w-3" />
            Data: CollegeCuts Database · O*NET {result.onetCodes[0]} · IPEDS estimation
          </div>
        </CardContent>
      </Card>

      {isBlurred && (
        <div className="absolute inset-0 rounded-xl backdrop-blur-sm bg-white/70 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-amber-300">
          <Lock className="h-6 w-6 text-amber-500" />
          <div className="text-center px-6">
            <div className="font-bold text-[#1e3a5f] text-sm">Upgrade to unlock</div>
            <div className="text-xs text-gray-500 mt-1">See full data for all your tracked roles</div>
          </div>
          <Button size="sm" onClick={onUpgrade} className="bg-amber-500 hover:bg-amber-400 text-white font-bold text-xs">
            Upgrade to Professional
          </Button>
        </div>
      )}
    </div>
  );
}

type TalentProfile = {
  id: string;
  name: string;
  role_title: string;
  institution: string;
  state: string;
  department: string | null;
  years_experience: number | null;
  availability: string | null;
  linkedin_url: string | null;
  specializations: string[];
  open_to: string[];
  created_at: string;
};

type ConnectModal = {
  talent: TalentProfile;
  message: string;
  sending: boolean;
  done: boolean;
};

const FREQ_OPTIONS = [
  { id: "realtime", label: "Real-time" },
  { id: "daily", label: "Daily digest" },
  { id: "weekly", label: "Weekly summary" },
];
const RISK_OPTIONS = [
  { id: "low", label: "Low" },
  { id: "medium", label: "Medium" },
  { id: "high", label: "High" },
  { id: "critical", label: "Critical only" },
];

export default function IntelligenceDashboard() {
  const [, navigate] = useLocation();
  const [profile, setProfile] = useState<EmployerProfile | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsDraft, setSettingsDraft] = useState<Partial<EmployerProfile>>({});
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [connectModal, setConnectModal] = useState<ConnectModal | null>(null);
  const [connectedIds, setConnectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const saved = localStorage.getItem("cc_employer");
    if (!saved) {
      navigate("/intelligence/onboarding");
      return;
    }
    try {
      setProfile(JSON.parse(saved));
    } catch {
      navigate("/intelligence/onboarding");
    }
  }, [navigate]);

  const { data, isLoading, isError, refetch, isFetching } = useQuery<DashboardResponse>({
    queryKey: ["intelligence-risks", profile?.roleIds, profile?.states],
    queryFn: async () => {
      const r = await fetch(`${BASE_URL}/api/intelligence/risks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleIds: profile?.roleIds ?? [], states: profile?.states ?? [] }),
      });
      if (!r.ok) throw new Error("Failed to compute pipeline risks");
      return r.json();
    },
    enabled: !!profile && (profile.roleIds?.length ?? 0) > 0,
    staleTime: 1000 * 60 * 10,
  });

  const { data: disruptions = [] } = useQuery<DisruptionItem[]>({
    queryKey: ["intelligence-disruptions"],
    queryFn: async () => {
      const r = await fetch(`${BASE_URL}/api/intelligence/recent-disruptions`);
      if (!r.ok) throw new Error("Failed to fetch disruptions");
      return r.json();
    },
    staleTime: 1000 * 60 * 15,
  });

  const { data: talentProfiles = [] } = useQuery<TalentProfile[]>({
    queryKey: ["talent-list"],
    queryFn: async () => {
      const r = await fetch(`${BASE_URL}/api/talent?limit=50`);
      if (!r.ok) throw new Error("Failed to fetch talent");
      return r.json();
    },
    staleTime: 1000 * 60 * 10,
  });

  const { data: existingConnections = [] } = useQuery<{ talent_id: string }[]>({
    queryKey: ["intelligence-connections", profile?.email],
    queryFn: async () => {
      if (!profile?.email) return [];
      const r = await fetch(`${BASE_URL}/api/intelligence/connections?employer_email=${encodeURIComponent(profile.email)}`);
      if (!r.ok) return [];
      return r.json();
    },
    enabled: !!profile?.email,
    staleTime: 1000 * 60 * 2,
  });

  useEffect(() => {
    if (existingConnections.length > 0) {
      setConnectedIds(new Set(existingConnections.map((c) => c.talent_id)));
    }
  }, [existingConnections]);

  async function handleConnect() {
    if (!connectModal || !profile) return;
    setConnectModal((m) => m ? { ...m, sending: true } : null);
    try {
      await fetch(`${BASE_URL}/api/intelligence/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employer_email: profile.email,
          employer_company: profile.company,
          talent_id: connectModal.talent.id,
          talent_name: connectModal.talent.name,
          message: connectModal.message || undefined,
        }),
      });
      setConnectedIds((prev) => new Set([...prev, connectModal.talent.id]));
      setConnectModal((m) => m ? { ...m, sending: false, done: true } : null);
    } catch {
      setConnectModal((m) => m ? { ...m, sending: false } : null);
    }
  }

  async function saveSettings() {
    if (!profile) return;
    setSettingsSaving(true);
    const updated = { ...profile, ...settingsDraft };
    setProfile(updated);
    localStorage.setItem("cc_employer", JSON.stringify(updated));
    try {
      await fetch(`${BASE_URL}/api/intelligence/employer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        const email = updated.email || localStorage.getItem("cc_user_email") || "";
        if (email) {
          await supabase.from("employer_profiles").update({
            company: updated.company,
            alert_frequency: updated.alertFrequency,
            risk_threshold: updated.riskThreshold,
          }).eq("email", email);
        }
      }
    } catch {}
    setSettingsSaving(false);
    setShowSettingsModal(false);
  }

  function openSettings() {
    setSettingsDraft({
      company: profile?.company,
      alertFrequency: profile?.alertFrequency,
      riskThreshold: profile?.riskThreshold,
    });
    setShowSettingsModal(true);
  }

  const isFree = !profile || profile.tier === "free";
  const results = data?.results ?? [];
  const visibleResults = isFree ? results : results;
  const FREE_VISIBLE = 3;

  const criticalCount = results.filter((r) => r.riskLevel === "critical").length;
  const highCount = results.filter((r) => r.riskLevel === "high").length;
  const totalImpact = results.reduce((s, r) => s + r.estimatedImpact, 0);

  if (!profile) return null;

  return (
    <>
      <Helmet>
        <title>Pipeline Risk Dashboard | CollegeCuts Intelligence</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <Card className="max-w-md w-full border-0 shadow-2xl">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-[#1e3a5f]">Account Settings</h2>
                <button onClick={() => setShowSettingsModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Company Name</label>
                <input
                  type="text"
                  value={settingsDraft.company ?? profile?.company ?? ""}
                  onChange={(e) => setSettingsDraft((d) => ({ ...d, company: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Alert Frequency</label>
                <div className="grid grid-cols-3 gap-2">
                  {FREQ_OPTIONS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setSettingsDraft((d) => ({ ...d, alertFrequency: f.id }))}
                      className={`rounded-lg border-2 px-3 py-2 text-xs font-semibold transition-colors ${
                        (settingsDraft.alertFrequency ?? profile?.alertFrequency) === f.id
                          ? "border-[#1e3a5f] bg-[#1e3a5f]/5 text-[#1e3a5f]"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Minimum Risk Level for Alerts</label>
                <div className="grid grid-cols-2 gap-2">
                  {RISK_OPTIONS.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSettingsDraft((d) => ({ ...d, riskThreshold: r.id }))}
                      className={`rounded-lg border-2 px-3 py-2 text-xs font-semibold transition-colors ${
                        (settingsDraft.riskThreshold ?? profile?.riskThreshold) === r.id
                          ? "border-[#1e3a5f] bg-[#1e3a5f]/5 text-[#1e3a5f]"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
                To change tracked roles or geography, use{" "}
                <button onClick={() => { setShowSettingsModal(false); navigate("/intelligence/onboarding"); }} className="underline font-semibold">
                  re-configure your profile
                </button>.
              </div>

              <div className="flex gap-3">
                <Button onClick={saveSettings} disabled={settingsSaving} className="flex-1 bg-[#1e3a5f] hover:bg-[#2a4e7c] text-white font-bold">
                  {settingsSaving ? "Saving…" : <><Save className="h-4 w-4 mr-1.5" />Save Changes</>}
                </Button>
                <Button variant="outline" onClick={() => setShowSettingsModal(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {connectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <Card className="max-w-md w-full border-0 shadow-2xl">
            <CardContent className="p-6 space-y-4">
              {connectModal.done ? (
                <div className="text-center space-y-3 py-2">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
                  <h2 className="text-lg font-extrabold text-[#1e3a5f]">Request sent!</h2>
                  <p className="text-sm text-gray-500">
                    We've notified <strong>{connectModal.talent.name}</strong> that you'd like to connect. You'll also receive a confirmation email.
                  </p>
                  <Button onClick={() => setConnectModal(null)} className="w-full bg-[#1e3a5f] hover:bg-[#2a4e7c] text-white font-bold">
                    Done
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-extrabold text-[#1e3a5f]">Connect with {connectModal.talent.name}</h2>
                    <button onClick={() => setConnectModal(null)} className="text-gray-400 hover:text-gray-600">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="rounded-lg bg-[#f0f4f9] px-4 py-3 text-sm text-[#1e3a5f]">
                    <div className="font-semibold">{connectModal.talent.role_title}</div>
                    <div className="text-gray-500 text-xs mt-0.5">{connectModal.talent.institution} · {connectModal.talent.state}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Personal message <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <textarea
                      rows={3}
                      placeholder={`Hi, I'm reaching out from ${profile?.company ?? "our company"}...`}
                      value={connectModal.message}
                      onChange={(e) => setConnectModal((m) => m ? { ...m, message: e.target.value } : null)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f] resize-none"
                    />
                  </div>
                  <p className="text-xs text-gray-400">
                    We'll send your request to {connectModal.talent.name} by email and copy you on the confirmation.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      onClick={handleConnect}
                      disabled={connectModal.sending}
                      className="flex-1 bg-[#1e3a5f] hover:bg-[#2a4e7c] text-white font-bold"
                    >
                      {connectModal.sending ? "Sending…" : <><Send className="h-4 w-4 mr-1.5" />Send Request</>}
                    </Button>
                    <Button variant="outline" onClick={() => setConnectModal(null)} className="flex-1">Cancel</Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <Card className="max-w-md w-full border-0 shadow-2xl">
            <CardContent className="p-6 text-center space-y-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 mx-auto">
                <Zap className="h-7 w-7 text-amber-500" />
              </div>
              <h2 className="text-xl font-extrabold text-[#1e3a5f]">Upgrade to Professional</h2>
              <p className="text-gray-600 text-sm">
                Unlock all {results.length} of your tracked role categories, geographic filtering, real-time alerts, and PDF export.
              </p>
              <div className="bg-[#f0f4f9] rounded-xl p-4 text-sm font-medium text-[#1e3a5f]">
                <div className="text-3xl font-extrabold">$299<span className="text-base text-gray-400 font-normal">/month</span></div>
                <div className="text-gray-500 text-xs mt-1">Annual plan available at 20% discount</div>
              </div>
              <Button className="w-full bg-amber-500 hover:bg-amber-400 text-white font-bold">
                Contact Sales to Upgrade
              </Button>
              <button onClick={() => setShowUpgradeModal(false)} className="text-xs text-gray-400 hover:text-gray-600">
                Dismiss
              </button>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="min-h-screen bg-[#f0f4f9]">
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2a4e7c 100%)" }} className="py-8 px-4">
          <div className="container mx-auto max-w-7xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 className="h-5 w-5 text-amber-400" />
                  <span className="text-blue-300 text-sm font-semibold">Skills Gap Intelligence</span>
                </div>
                <h1 className="text-2xl font-extrabold text-white">{profile.company}: Pipeline Risk Dashboard</h1>
                <p className="text-blue-300 text-sm mt-1">
                  {profile.states.length > 0 ? profile.states.join(", ") : "National"} · Last 12 months ·{" "}
                  {data?.generatedAt ? format(parseISO(data.generatedAt), "MMM d, yyyy h:mm a") : "Generating..."}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => refetch()}
                  disabled={isFetching}
                  className="text-blue-200 hover:text-white hover:bg-white/10"
                >
                  <RefreshCw className={`h-4 w-4 mr-1.5 ${isFetching ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={openSettings}
                  className="text-blue-200 hover:text-white hover:bg-white/10"
                >
                  <Settings className="h-4 w-4 mr-1.5" />
                  Settings
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Summary stats */}
        {results.length > 0 && (
          <div className="bg-white border-b border-gray-200">
            <div className="container mx-auto max-w-7xl px-4 py-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-extrabold text-[#1e3a5f]">{results.length}</div>
                  <div className="text-xs text-gray-500 mt-0.5">Roles Tracked</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-extrabold text-red-600">{criticalCount + highCount}</div>
                  <div className="text-xs text-gray-500 mt-0.5">High/Critical Risks</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-extrabold text-[#1e3a5f]">{results.reduce((s, r) => s + r.cutCount, 0)}</div>
                  <div className="text-xs text-gray-500 mt-0.5">Program Cuts (12 mo)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-extrabold text-[#1e3a5f]">~{totalImpact.toLocaleString()}</div>
                  <div className="text-xs text-gray-500 mt-0.5">Est. Pipeline Impact/yr</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="container mx-auto max-w-7xl px-4 py-8">
          {/* Freemium banner */}
          {isFree && results.length > FREE_VISIBLE && (
            <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-amber-800 text-sm">You're on the free plan. {results.length - FREE_VISIBLE} roles are locked.</div>
                  <div className="text-amber-700 text-xs mt-0.5">Upgrade to Professional to see all {results.length} tracked roles, geographic filters, and real-time alerts.</div>
                </div>
              </div>
              <Button size="sm" onClick={() => setShowUpgradeModal(true)} className="shrink-0 bg-amber-500 hover:bg-amber-400 text-white font-bold">
                Upgrade ($299/mo)
              </Button>
            </div>
          )}

          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array(profile.roleIds.length || 3).fill(0).map((_, i) => (
                <div key={i} className="h-48 rounded-xl bg-white animate-pulse border border-gray-200" />
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-20">
              <AlertTriangle className="h-10 w-10 text-red-400 mx-auto mb-3" />
              <p className="text-gray-700 font-semibold">Failed to load pipeline data</p>
              <Button size="sm" variant="outline" onClick={() => refetch()} className="mt-4 border-[#1e3a5f] text-[#1e3a5f]">Try Again</Button>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-20">
              <BarChart3 className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-700 font-semibold">No pipeline risks found for your configuration</p>
              <p className="text-gray-500 text-sm mt-1">No program cuts in the last 12 months match your selected roles and geography.</p>
              <Button asChild size="sm" variant="outline" className="mt-4 border-[#1e3a5f] text-[#1e3a5f]">
                <Link href="/intelligence/onboarding">Update Configuration</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[#1e3a5f]">Your Pipeline Risk Map</h2>
                <span className="text-sm text-gray-500">{results.length} role{results.length !== 1 ? "s" : ""} tracked</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {visibleResults.map((result, idx) => (
                  <RiskCard
                    key={result.roleId}
                    result={result}
                    isBlurred={isFree && idx >= FREE_VISIBLE}
                    onUpgrade={() => setShowUpgradeModal(true)}
                  />
                ))}
              </div>
            </>
          )}

          {/* Recent Disruptions Feed */}
          {disruptions.length > 0 && (
            <div className="mt-12">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="h-5 w-5 text-amber-500" />
                <h2 className="text-lg font-bold text-[#1e3a5f]">Recent Talent Market Disruptions</h2>
                <span className="text-xs text-gray-400 font-medium ml-auto">Last 30 days</span>
              </div>
              <div className="space-y-3">
                {disruptions.slice(0, 8).map((item) => {
                  const matchesMyRoles = item.mappedRoles.some((r) => profile.roleIds.includes(r.id));
                  return (
                    <Card key={item.id} className={`border-0 shadow-sm ${matchesMyRoles ? "ring-2 ring-amber-400/50" : ""}`}>
                      <CardContent className="p-4 flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            {matchesMyRoles && (
                              <span className="bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-amber-200">
                                Matches Your Profile
                              </span>
                            )}
                            <span className="text-xs text-gray-400">{item.state}</span>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">
                              {CUT_TYPE_LABELS[item.cutType] ?? item.cutType}
                            </span>
                          </div>
                          <div className="font-semibold text-[#1e3a5f] text-sm">{item.institution}</div>
                          {item.program && <div className="text-xs text-gray-500 mt-0.5">{item.program}</div>}
                          {item.mappedRoles.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {item.mappedRoles.slice(0, 2).map((r) => (
                                <span key={r.id} className="text-[10px] bg-[#1e3a5f]/5 text-[#1e3a5f] px-2 py-0.5 rounded-full font-medium">
                                  {r.corporateTitles[0]}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="text-xs text-gray-400">{item.date ? (() => { try { return format(parseISO(item.date), "MMM d"); } catch { return item.date; } })() : ""}</div>
                          {item.facultyAffected && (
                            <div className="text-xs text-amber-600 font-semibold mt-0.5">{item.facultyAffected} specialists displaced</div>
                          )}
                          {item.sourceUrl && (
                            <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] text-[#1e3a5f] hover:text-amber-600 mt-1">
                              Source <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Talent Feed */}
          {talentProfiles.length > 0 && (
            <div className="mt-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#1e3a5f]" />
                  <h2 className="text-lg font-extrabold text-[#1e3a5f]">Displaced Academic Talent</h2>
                </div>
                <Link href="/talent" className="text-sm text-[#1e3a5f] font-semibold hover:text-amber-600 flex items-center gap-1">
                  View all <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Professionals displaced by recent program cuts who are open to industry roles, sourced directly from CollegeCuts.
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {talentProfiles.slice(0, 6).map((t) => {
                  const alreadyConnected = connectedIds.has(t.id);
                  return (
                    <Card key={t.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                      <CardContent className="p-4 space-y-2 flex flex-col flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="font-bold text-[#1e3a5f] text-sm truncate">{t.name}</div>
                            <div className="text-xs text-gray-600 truncate">{t.role_title}</div>
                          </div>
                          {t.availability && (
                            <span className={`shrink-0 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              t.availability === "immediate" ? "bg-green-100 text-green-700" :
                              t.availability === "within_3_months" ? "bg-blue-100 text-blue-700" :
                              "bg-gray-100 text-gray-600"
                            }`}>
                              {t.availability === "immediate" ? "Available now" :
                               t.availability === "within_3_months" ? "Avail. soon" : "Exploring"}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 space-y-0.5 flex-1">
                          <div className="truncate"><span className="font-medium">From:</span> {t.institution}</div>
                          {t.department && <div className="truncate"><span className="font-medium">Dept:</span> {t.department}</div>}
                          <div><span className="font-medium">State:</span> {t.state}</div>
                          {t.years_experience && <div><span className="font-medium">Experience:</span> {t.years_experience} yrs</div>}
                          {t.specializations?.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {t.specializations.slice(0, 2).map((s) => (
                                <span key={s} className="bg-[#1e3a5f]/5 text-[#1e3a5f] text-[10px] font-medium px-1.5 py-0.5 rounded">{s}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-gray-100 mt-auto">
                          {t.linkedin_url ? (
                            <a
                              href={t.linkedin_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-[#1e3a5f] hover:text-amber-600 font-semibold"
                            >
                              LinkedIn <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : <span />}
                          {alreadyConnected ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Request sent
                            </span>
                          ) : (
                            <button
                              onClick={() => setConnectModal({ talent: t, message: "", sending: false, done: false })}
                              className="inline-flex items-center gap-1 text-xs font-bold text-[#1e3a5f] hover:text-amber-600 border border-[#1e3a5f]/30 hover:border-amber-400 rounded-full px-2.5 py-1 transition-colors"
                            >
                              <Send className="h-3 w-3" /> Connect
                            </button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              {talentProfiles.length > 6 && (
                <div className="mt-4 text-center">
                  <Link href="/talent" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1e3a5f] hover:text-amber-600">
                    View all {talentProfiles.length} profiles <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Upgrade CTA */}
          {isFree && (
            <div className="mt-12 rounded-2xl bg-[#1e3a5f] p-8 text-center">
              <Zap className="h-8 w-8 text-amber-400 mx-auto mb-3" />
              <h2 className="text-xl font-extrabold text-white mb-2">Ready to bring this to your board?</h2>
              <p className="text-blue-200 text-sm max-w-lg mx-auto mb-6">
                Professional and Enterprise plans include PDF export, unlimited role tracking, geographic filtering, real-time email alerts, and team sharing.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button size="lg" onClick={() => setShowUpgradeModal(true)} className="bg-amber-500 hover:bg-amber-400 text-white font-bold">
                  Upgrade to Professional ($299/mo)
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 bg-transparent font-semibold" asChild>
                  <Link href="/intelligence">View All Plans</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
