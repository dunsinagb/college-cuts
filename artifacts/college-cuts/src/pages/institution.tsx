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
  ArrowLeft, Building2, MapPin, Users, GraduationCap,
  Link2, Check, ExternalLink, Calendar
} from "lucide-react";
import { slugify } from "@/lib/slugify";

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

function StatPill({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="text-amber-500">{icon}</div>
      <div>
        <span className="text-2xl font-black text-[#1e3a5f] tabular-nums">{value.toLocaleString()}</span>
        <span className="ml-1.5 text-sm text-slate-500">{label}</span>
      </div>
    </div>
  );
}

export default function InstitutionPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? "";
  const [copied, setCopied] = useState(false);

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
      `${pageName} has ${data?.stats.actions} recorded higher-ed action${(data?.stats.actions ?? 0) !== 1 ? "s" : ""} (program cuts, closures & layoffs) tracked on @collegecutscom`
    );
    const url = encodeURIComponent(pageUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank", "noopener,noreferrer,width=550,height=450");
  }

  function shareLinkedIn() {
    const url = encodeURIComponent(pageUrl);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank", "noopener,noreferrer,width=600,height=500");
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
        <meta property="og:type" content="profile" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDesc} />
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
              <button
                onClick={shareLinkedIn}
                className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-white/25 text-white hover:bg-white/10 transition-colors"
                title="Share on LinkedIn"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current text-[#a8c4e5]" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Cuts list */}
        <div className="container mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-4">
          <h2 className="text-xl font-bold text-[#1e3a5f]">
            All Recorded Actions ({data.cuts.length})
          </h2>

          <div className="space-y-3">
            {data.cuts.map((cut) => {
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
