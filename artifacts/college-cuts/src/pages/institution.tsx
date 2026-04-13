import { useState } from "react";
import { Link, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { format, parseISO } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { StatusBadge, CutTypeBadge } from "@/components/shared/Badges";
import {
  ArrowLeft, ArrowRight, Building2, MapPin, Users, GraduationCap,
  Link2, Check, ExternalLink, Calendar, Bell, ChevronDown, ChevronUp,
} from "lucide-react";

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

type InstitutionCut = {
  id: string;
  institution: string;
  programName: string | null;
  state: string;
  cutType: string;
  announcementDate: string | null;
  effectiveTerm: string | null;
  studentsAffected: number | null;
  facultyAffected: number | null;
  status: string;
  notes: string | null;
  sourceUrl: string | null;
  primaryReason: string | null;
};

type InstitutionData = {
  institution: string;
  slug: string;
  stats: {
    actions: number;
    studentsAffected: number;
    facultyAffected: number;
    state: string;
  };
  cuts: InstitutionCut[];
};

const CUT_TYPE_LABELS: Record<string, string> = {
  staff_layoff:         "Staff Layoff",
  program_suspension:   "Program Suspension",
  teach_out:            "Teach-Out",
  department_closure:   "Department Closure",
  campus_closure:       "Campus Closure",
  institution_closure:  "Institution Closure",
};

export default function InstitutionPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? "";
  const [copied, setCopied] = useState(false);
  const [linkedInCopied, setLinkedInCopied] = useState(false);
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [alertEmail, setAlertEmail] = useState("");
  const [alertStatus, setAlertStatus] = useState<"idle"|"loading"|"success"|"error">("idle");
  const [showActionsExpanded, setShowActionsExpanded] = useState(false);

  // Inline affected-worker registration
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regTitle, setRegTitle] = useState("");
  const [regStatus, setRegStatus] = useState<"idle"|"loading"|"success"|"error">("idle");
  const [regErrors, setRegErrors] = useState<Record<string,string>>({});

  async function handleAffectedSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string,string> = {};
    if (!regName.trim()) errs.name = "Name required";
    if (!regEmail.includes("@")) errs.email = "Valid email required";
    if (!regTitle.trim()) errs.title = "Your title/role is required";
    setRegErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setRegStatus("loading");
    try {
      const r = await fetch(`${BASE_URL}/api/talent/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName.trim(),
          email: regEmail.trim().toLowerCase(),
          institution: data?.institution ?? "",
          institution_slug: slug,
          role_title: regTitle.trim(),
          visible: true,
        }),
      });
      if (!r.ok) {
        const body = await r.json().catch(() => null);
        throw new Error(body?.error || "failed");
      }
      setRegStatus("success");
    } catch {
      setRegStatus("error");
    }
  }

  const { data, isLoading, error } = useQuery<InstitutionData>({
    queryKey: ["institution", slug],
    queryFn: async () => {
      const r = await fetch(`${BASE_URL}/api/institution/${encodeURIComponent(slug)}`);
      if (r.status === 404) throw new Error("not_found");
      if (!r.ok) throw new Error("fetch_error");
      return r.json();
    },
    enabled: !!slug,
    retry: false,
  });

  const pageUrl  = `https://college-cuts.com/institution/${slug}`;
  const pageName = data?.institution ?? "Institution";
  const pageTitle = data
    ? `${data.institution} — Program Cuts & Layoffs | CollegeCuts`
    : "Institution | CollegeCuts";
  const pageDesc  = data
    ? `${data.institution} (${data.stats.state}) has ${data.stats.actions} recorded action${data.stats.actions !== 1 ? "s" : ""} — program cuts, closures, and layoffs tracked by CollegeCuts.`
    : "Higher education cuts tracked by CollegeCuts.";

  function handleCopyLink() {
    navigator.clipboard.writeText(pageUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function shareTwitter() {
    const text = encodeURIComponent(
      `${pageName} has ${data?.stats.actions} recorded higher-ed action${(data?.stats.actions ?? 0) !== 1 ? "s" : ""} (program cuts, closures & layoffs) tracked on College Cuts Tracker`
    );
    const url = encodeURIComponent(pageUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank", "noopener,noreferrer,width=550,height=450");
  }

  async function handleAlertSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!alertEmail || !data) return;
    setAlertStatus("loading");
    try {
      const r = await fetch(`${BASE_URL}/api/alert-subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: alertEmail,
          institution_slug: slug,
          institution_name: data.institution,
          state: data.stats.state,
        }),
      });
      if (!r.ok) {
        const body = await r.json().catch(() => null);
        throw new Error(body?.error || "failed");
      }
      setAlertStatus("success");
    } catch (err) {
      console.error("alert subscribe failed", err);
      setAlertStatus("error");
    }
  }

  function shareLinkedIn() {
    const n = data?.stats.actions ?? 0;
    const shareText = `${pageName} has ${n} recorded higher-ed action${n !== 1 ? "s" : ""} (program cuts, closures & layoffs) — tracked by College Cuts Tracker.\n\n${pageUrl}`;
    navigator.clipboard.writeText(shareText).catch(() => {});
    setLinkedInCopied(true);
    setTimeout(() => setLinkedInCopied(false), 3500);
    const url = encodeURIComponent(pageUrl);
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      "linkedin-share",
      "noopener,noreferrer,width=600,height=600,scrollbars=yes"
    );
  }

  if (isLoading) {
    return (
      <>
        <Helmet><title>Loading… | CollegeCuts</title></Helmet>
        <div className="container mx-auto max-w-4xl px-4 py-8 space-y-6">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-14 w-2/3" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </>
    );
  }

  if (error || !data) {
    const isNotFound = (error as Error)?.message === "not_found";
    return (
      <>
        <Helmet><title>{isNotFound ? "Institution Not Found" : "Error"} | CollegeCuts</title></Helmet>
        <div className="container mx-auto max-w-4xl px-4 py-16 text-center space-y-6">
          <Building2 className="mx-auto h-12 w-12 text-slate-300" />
          <h1 className="text-3xl font-bold">{isNotFound ? "Institution Not Found" : "Something went wrong"}</h1>
          <p className="text-muted-foreground">
            {isNotFound
              ? `We couldn't find an institution matching "${slug}". Check the URL or browse the full database.`
              : "There was an error loading this page. Please try again."}
          </p>
          <Button asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content="https://college-cuts.com/opengraph.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDesc} />
        <meta name="twitter:image" content="https://college-cuts.com/opengraph.jpg" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Dataset",
          "name": `${data.institution} — Higher Education Cuts & Closures`,
          "description": pageDesc,
          "url": pageUrl,
          "publisher": {
            "@type": "Organization",
            "name": "CollegeCuts Tracker",
            "url": "https://college-cuts.com"
          },
          "spatialCoverage": data.stats.state,
          "temporalCoverage": "2023/..",
          "variableMeasured": [
            { "@type": "PropertyValue", "name": "Recorded Actions", "value": data.stats.actions },
            ...(data.stats.studentsAffected > 0 ? [{ "@type": "PropertyValue", "name": "Students Affected", "value": data.stats.studentsAffected }] : []),
            ...(data.stats.facultyAffected > 0 ? [{ "@type": "PropertyValue", "name": "Faculty/Staff Affected", "value": data.stats.facultyAffected }] : []),
          ],
        })}</script>
      </Helmet>

      <div className="min-h-screen bg-[#f0f4f9]">
        {/* Hero */}
        <div
          className="relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2a4e7c 60%, #1a3352 100%)" }}
        >
          <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
            <Button
              asChild
              variant="ghost"
              className="mb-4 pl-0 text-blue-200 hover:text-white hover:bg-transparent"
            >
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
              </Link>
            </Button>

            <div className="flex items-start gap-3 mb-4">
              <div className="rounded-lg bg-white/10 p-2.5 shrink-0">
                <Building2 className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-blue-300 font-semibold uppercase tracking-wider mb-1">Institution Profile</p>
                <h1 className="text-3xl font-extrabold text-white leading-tight sm:text-4xl">
                  {data.institution}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 text-blue-200 text-sm mb-6">
              <MapPin className="h-4 w-4 text-amber-400" />
              <span>{data.stats.state}</span>
            </div>

            {/* Stat bar */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 bg-white/10 border border-white/15 rounded-xl px-5 py-4 mb-6">
              <div className="flex items-center gap-2 text-white">
                <span className="text-3xl font-black text-amber-400 tabular-nums">{data.stats.actions}</span>
                <span className="text-sm text-blue-200">recorded action{data.stats.actions !== 1 ? "s" : ""}</span>
              </div>
              {data.stats.studentsAffected > 0 && (
                <>
                  <span className="text-blue-400/40 text-lg hidden sm:block">·</span>
                  <div className="flex items-center gap-2 text-white">
                    <GraduationCap className="h-4 w-4 text-amber-400" />
                    <span className="text-xl font-bold text-white tabular-nums">{data.stats.studentsAffected.toLocaleString()}</span>
                    <span className="text-sm text-blue-200">students affected</span>
                  </div>
                </>
              )}
              {data.stats.facultyAffected > 0 && (
                <>
                  <span className="text-blue-400/40 text-lg hidden sm:block">·</span>
                  <div className="flex items-center gap-2 text-white">
                    <Users className="h-4 w-4 text-amber-400" />
                    <span className="text-xl font-bold text-white tabular-nums">{data.stats.facultyAffected.toLocaleString()}</span>
                    <span className="text-sm text-blue-200">faculty/staff affected</span>
                  </div>
                </>
              )}
            </div>

            {/* Affected CTA — primary action */}
            <div className="mb-5">
              <a
                href="#affected-form"
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-lg shadow-amber-900/30 transition-colors"
              >
                <Users className="h-4 w-4" />
                Were you or a colleague affected here? Join the talent pool →
              </a>
              <p className="text-blue-300 text-xs mt-2">
                Free · 30 seconds · employers recruiting from this institution will find you directly
              </p>
            </div>

            {/* Share toolbar */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-blue-300">Share this page:</span>
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1.5 text-xs border-white/25 text-white hover:bg-white/10 bg-transparent"
                onClick={handleCopyLink}
              >
                {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Link2 className="h-3.5 w-3.5" />}
                {copied ? "Copied!" : "Copy link"}
              </Button>
              <button
                onClick={shareTwitter}
                className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-white/25 text-white hover:bg-white/10 transition-colors"
                title="Share on X / Twitter"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.261 5.636 5.903-5.636zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </button>
              <div className="relative">
                <button
                  onClick={shareLinkedIn}
                  className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-white/25 text-white hover:bg-white/10 transition-colors"
                  title="Share on LinkedIn"
                >
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current text-[#a8c4e5]" aria-hidden="true">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </button>
                {linkedInCopied && (
                  <div className="absolute bottom-full right-0 mb-2 w-44 rounded-md bg-white text-[#1e3a5f] text-xs px-2.5 py-1.5 shadow-lg pointer-events-none z-10 text-center leading-snug font-medium">
                    Caption copied!<br />Paste it in LinkedIn ⌘V
                  </div>
                )}
              </div>
            </div>

            {/* Alert Me */}
            <div className="mt-4 pt-4 border-t border-white/15">
              {!showAlertForm ? (
                <button
                  onClick={() => setShowAlertForm(true)}
                  className="inline-flex items-center gap-1.5 text-xs text-blue-200 hover:text-amber-400 transition-colors font-medium"
                >
                  <Bell className="h-3.5 w-3.5" />
                  Alert me when new data is added for this institution
                </button>
              ) : alertStatus === "success" ? (
                <div className="flex items-center gap-2 text-sm text-green-300">
                  <Check className="h-4 w-4" />
                  You'll be emailed when new data is added for {data.institution}.
                </div>
              ) : (
                <form onSubmit={handleAlertSubscribe} className="flex items-center gap-2 flex-wrap">
                  <Bell className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <input
                    type="email"
                    required
                    placeholder="your@email.com"
                    value={alertEmail}
                    onChange={e => setAlertEmail(e.target.value)}
                    className="h-8 rounded-md bg-white/10 border border-white/20 text-white placeholder:text-blue-300 text-sm px-3 focus:outline-none focus:border-amber-400 w-48"
                  />
                  <button
                    type="submit"
                    disabled={alertStatus === "loading"}
                    className="h-8 px-3 rounded-md bg-amber-500 hover:bg-amber-400 text-[#1e3a5f] text-xs font-bold transition-colors disabled:opacity-60"
                  >
                    {alertStatus === "loading" ? "Saving…" : "Alert me"}
                  </button>
                  <button type="button" onClick={() => setShowAlertForm(false)} className="text-blue-300 hover:text-white text-xs">
                    Cancel
                  </button>
                  {alertStatus === "error" && <span className="text-red-300 text-xs">Something went wrong. Try again.</span>}
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Were you affected? — inline registration (FIRST, before action cards) */}
        <div id="affected-form" className="container mx-auto max-w-4xl px-4 pt-6 sm:px-6 lg:px-8">
          <Card className="border-0 shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-amber-400 px-6 py-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 shrink-0">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="font-extrabold text-white text-base leading-tight">
                  Were you or a colleague affected by cuts at {data.institution}?
                </h2>
                <p className="text-amber-100 text-xs mt-0.5">
                  Add your name to our displaced talent pool — companies actively recruiting from this list will reach out to you directly.
                </p>
              </div>
            </div>

            <CardContent className="p-6">
              {regStatus === "success" ? (
                <div className="flex flex-col items-center gap-3 py-4 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                    <Check className="h-7 w-7 text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-[#1e3a5f] text-lg">You're in the pool!</p>
                    <p className="text-gray-500 text-sm mt-1 max-w-sm">
                      Your profile has been added. Employers searching for talent from {data.institution} will be able to find and contact you.
                    </p>
                  </div>
                  <a
                    href={`/talent?institution=${encodeURIComponent(data.institution)}&slug=${encodeURIComponent(slug)}`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600 hover:text-amber-700"
                  >
                    Add more details to your profile <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              ) : (
                <form onSubmit={handleAffectedSubmit} className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Takes 30 seconds. No account needed — just your name, email, and role. We'll never spam you.
                  </p>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name *</label>
                      <input
                        type="text"
                        value={regName}
                        onChange={e => setRegName(e.target.value)}
                        placeholder="Dr. Jane Smith"
                        className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 ${regErrors.name ? "border-red-400" : "border-gray-300"}`}
                      />
                      {regErrors.name && <p className="text-red-500 text-xs mt-0.5">{regErrors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Email Address *</label>
                      <input
                        type="email"
                        value={regEmail}
                        onChange={e => setRegEmail(e.target.value)}
                        placeholder="you@email.com"
                        className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 ${regErrors.email ? "border-red-400" : "border-gray-300"}`}
                      />
                      {regErrors.email && <p className="text-red-500 text-xs mt-0.5">{regErrors.email}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Your Title / Role *</label>
                      <input
                        type="text"
                        value={regTitle}
                        onChange={e => setRegTitle(e.target.value)}
                        placeholder="Associate Professor, CS"
                        className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 ${regErrors.title ? "border-red-400" : "border-gray-300"}`}
                      />
                      {regErrors.title && <p className="text-red-500 text-xs mt-0.5">{regErrors.title}</p>}
                    </div>
                  </div>

                  {regStatus === "error" && (
                    <p className="text-red-500 text-sm">Something went wrong. Please try again.</p>
                  )}

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <Button
                      type="submit"
                      disabled={regStatus === "loading"}
                      className="bg-amber-500 hover:bg-amber-400 text-white font-bold px-6"
                    >
                      {regStatus === "loading"
                        ? <><span className="animate-spin mr-2">⏳</span>Saving…</>
                        : <>Join the Talent Pool <ArrowRight className="ml-1.5 h-4 w-4" /></>
                      }
                    </Button>
                    <a
                      href={`/talent?institution=${encodeURIComponent(data.institution)}&slug=${encodeURIComponent(slug)}`}
                      className="text-xs text-gray-500 hover:text-[#1e3a5f] underline underline-offset-2"
                    >
                      Add full profile with LinkedIn, bio & more →
                    </a>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Cuts list */}
        <div className="container mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8 space-y-4">
          <button
            onClick={() => setShowActionsExpanded(v => !v)}
            className="w-full flex items-center justify-between text-left group"
          >
            <h2 className="text-xl font-bold text-[#1e3a5f] group-hover:text-[#2a4e7c]">
              Recorded Actions ({data.cuts.length})
            </h2>
            <span className="flex items-center gap-1.5 text-sm text-gray-500 group-hover:text-[#1e3a5f] font-medium">
              {showActionsExpanded ? (
                <><ChevronUp className="h-4 w-4" /> Hide</>
              ) : (
                <><ChevronDown className="h-4 w-4" /> View all actions</>
              )}
            </span>
          </button>

          {/* Always show first action; rest are behind the toggle */}
          <div className="space-y-3">
            {data.cuts.slice(0, showActionsExpanded ? data.cuts.length : 1).map((cut) => {
              const typeLabel = CUT_TYPE_LABELS[cut.cutType] ?? cut.cutType.replace(/_/g, " ");
              return (
                <Card key={cut.id} className="shadow-sm border-0 hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <CutTypeBadge cutType={cut.cutType} className="text-xs px-2 py-0.5" />
                          <StatusBadge status={cut.status} />
                          {cut.primaryReason && (
                            <Badge variant="outline" className="text-xs text-slate-500 border-slate-200">
                              {cut.primaryReason}
                            </Badge>
                          )}
                        </div>

                        <p className="font-semibold text-[#1e3a5f]">
                          {cut.programName ?? typeLabel}
                        </p>

                        {cut.notes && (
                          <p className="text-sm text-slate-500 line-clamp-2">{cut.notes}</p>
                        )}

                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                          {cut.announcementDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {format(parseISO(cut.announcementDate), "MMM d, yyyy")}
                            </span>
                          )}
                          {cut.effectiveTerm && (
                            <span>Effective: {cut.effectiveTerm}</span>
                          )}
                          {(cut.studentsAffected ?? 0) > 0 && (
                            <span className="flex items-center gap-1">
                              <GraduationCap className="h-3.5 w-3.5" />
                              {cut.studentsAffected?.toLocaleString()} students
                            </span>
                          )}
                          {(cut.facultyAffected ?? 0) > 0 && (
                            <span className="flex items-center gap-1">
                              <Users className="h-3.5 w-3.5" />
                              {cut.facultyAffected?.toLocaleString()} faculty/staff
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:flex-col sm:items-end shrink-0">
                        <Button asChild size="sm" variant="outline" className="text-xs h-8">
                          <Link href={`/cuts/${cut.id}`}>
                            View details
                          </Link>
                        </Button>
                        {cut.sourceUrl && (
                          <a
                            href={cut.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Source
                          </a>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {data.cuts.length > 1 && !showActionsExpanded && (
            <button
              onClick={() => setShowActionsExpanded(true)}
              className="w-full text-center text-sm font-semibold text-[#1e3a5f] hover:text-amber-600 py-2 border border-dashed border-gray-300 rounded-xl hover:border-amber-400 transition-colors"
            >
              Show {data.cuts.length - 1} more action{data.cuts.length - 1 !== 1 ? "s" : ""} <ChevronDown className="inline h-4 w-4 ml-1" />
            </button>
          )}

          <div className="pt-4 border-t border-slate-200">
            <p className="text-xs text-slate-400 text-center">
              Data sourced from public announcements and news reports. Tracked by{" "}
              <a href="https://college-cuts.com" className="text-[#1e3a5f] hover:underline">CollegeCuts</a>.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
