import { useState } from "react";
import { Link, useParams } from "wouter";
import { useGetCut } from "@workspace/api-client-react";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { getGetCutQueryKey } from "@workspace/api-client-react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge, CutTypeBadge } from "@/components/shared/Badges";
import { ArrowLeft, ExternalLink, Calendar, Users, GraduationCap, Building2, MapPin, Lock, BarChart3, Briefcase, Link2, Check } from "lucide-react";
import { InstitutionInfoCard } from "@/components/shared/InstitutionInfoCard";
import { slugify } from "@/lib/slugify";

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

const CUT_TYPE_LABELS: Record<string, string> = {
  staff_layoff: "Staff Layoff",
  program_suspension: "Program Suspension",
  teach_out: "Teach-Out",
  department_closure: "Department Closure",
  campus_closure: "Campus Closure",
  institution_closure: "Institution Closure",
};

function isSubscribed() {
  return localStorage.getItem("cc_subscribed") === "1";
}

export default function CutDetail() {
  const params = useParams();
  const id = params.id ?? "";
  const subscribed = isSubscribed();
  const [copied, setCopied] = useState(false);
  const [linkedInCopied, setLinkedInCopied] = useState(false);

  const { data: cut, isLoading, error } = useGetCut(id, {
    query: {
      enabled: !!id,
      queryKey: getGetCutQueryKey(id)
    }
  });

  // Institution permalink is the primary shareable URL
  const institutionSlug = cut ? slugify(cut.institution) : "";
  const institutionUrl  = institutionSlug
    ? `https://college-cuts.com/institution/${institutionSlug}`
    : `https://college-cuts.com/cuts/${id}`;

  function handleCopyLink() {
    navigator.clipboard.writeText(institutionUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleShareTwitter() {
    const text = encodeURIComponent(
      `${cut?.institution ?? "This institution"} has recorded program cuts, closures, or layoffs — tracked on College Cuts Tracker`
    );
    const url = encodeURIComponent(institutionUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank", "noopener,noreferrer,width=550,height=450");
  }

  function handleShareLinkedIn() {
    const shareText = `${cut?.institution ?? "This institution"} has recorded program cuts, closures, or layoffs — tracked by College Cuts Tracker.\n\n${institutionUrl}`;
    navigator.clipboard.writeText(shareText).catch(() => {});
    setLinkedInCopied(true);
    setTimeout(() => setLinkedInCopied(false), 3500);
    const url = encodeURIComponent(institutionUrl);
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      "linkedin-share",
      "noopener,noreferrer,width=600,height=600,scrollbars=yes"
    );
  }

  const cutTypeLabel = cut?.cutType ? (CUT_TYPE_LABELS[cut.cutType] ?? cut.cutType.replace(/_/g, " ")) : "";

  const pageTitle = cut
    ? `${cut.institution}${cut.programName ? ` — ${cut.programName}` : ""} — Higher Ed ${cutTypeLabel} | CollegeCuts`
    : "Higher Education Action | CollegeCuts";

  const pageDescription = cut
    ? `Higher education ${cutTypeLabel.toLowerCase()} at ${cut.institution} (${cut.state})${cut.announcementDate ? `, announced ${format(parseISO(cut.announcementDate), "MMMM yyyy")}` : ""}. ${cut.notes ? cut.notes.slice(0, 120) + "…" : "Tracked by CollegeCuts — a civic higher ed data project monitoring program cuts, closures, and faculty layoffs across US universities."}`
    : "Track higher education program closures, department suspensions, and faculty layoffs at US colleges and universities. CollegeCuts civic data project.";

  if (isLoading) {
    return (
      <>
        <Helmet>
          <title>Loading… | CollegeCuts</title>
        </Helmet>
        <div className="container mx-auto max-w-4xl px-4 py-8 space-y-8">
          <Skeleton className="h-10 w-24" />
          <div className="space-y-4">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
          </div>
          <Skeleton className="h-[400px] w-full" />
        </div>
      </>
    );
  }

  if (error || !cut) {
    return (
      <>
        <Helmet>
          <title>Record Not Found | CollegeCuts</title>
        </Helmet>
        <div className="container mx-auto max-w-4xl px-4 py-16 text-center space-y-6">
          <h1 className="text-3xl font-bold">Record Not Found</h1>
          <p className="text-muted-foreground">We couldn't find the requested data.</p>
          <Button asChild>
            <Link href="/cuts">Back to Database</Link>
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={institutionUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={institutionUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content="https://college-cuts.com/opengraph.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content="https://college-cuts.com/opengraph.jpg" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": pageTitle,
          "description": pageDescription,
          "url": institutionUrl,
          "datePublished": cut.announcementDate ?? undefined,
          "publisher": {
            "@type": "Organization",
            "name": "CollegeCuts Tracker",
            "url": "https://college-cuts.com",
            "logo": { "@type": "ImageObject", "url": "https://college-cuts.com/favicon-512.png" }
          },
          "about": {
            "@type": "Organization",
            "name": cut.institution,
            "address": { "@type": "PostalAddress", "addressRegion": cut.state }
          },
        })}</script>
      </Helmet>

      {!subscribed && (
        <div
          className="sticky top-0 z-40 py-3 px-4 text-center text-sm text-white shadow-md"
          style={{ background: "linear-gradient(90deg, #1e3a5f, #2a4e7c)" }}
        >
          <span className="text-blue-200">You're viewing a public record. </span>
          <Link
            href={`/subscribe?redirect=/cuts/${id}`}
            className="font-semibold text-amber-400 hover:text-amber-300 underline underline-offset-2"
          >
            Subscribe free
          </Link>
          <span className="text-blue-200"> to unlock the full database, analytics, and job outlook.</span>
        </div>
      )}

      <div className="container mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        <div>
          <div className="flex items-center justify-between mb-6 gap-2">
            <Button asChild variant="ghost" className="pl-0 hover:bg-transparent hover:text-primary">
              <Link href={subscribed ? "/cuts" : "/"}>
                <ArrowLeft className="mr-2 h-4 w-4" /> {subscribed ? "Back to database" : "Back to home"}
              </Link>
            </Button>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={handleCopyLink}
              >
                {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Link2 className="h-3.5 w-3.5" />}
                {copied ? "Copied!" : "Copy link"}
              </Button>
              <button
                onClick={handleShareTwitter}
                className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-input bg-background hover:bg-accent transition-colors"
                title="Share on X / Twitter"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.261 5.636 5.903-5.636zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </button>
              <div className="relative">
                <button
                  onClick={handleShareLinkedIn}
                  className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-input bg-background hover:bg-accent transition-colors"
                  title="Share on LinkedIn"
                >
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current text-[#0A66C2]" aria-hidden="true">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </button>
                {linkedInCopied && (
                  <div className="absolute bottom-full right-0 mb-2 w-44 rounded-md bg-[#1e3a5f] text-white text-xs px-2.5 py-1.5 shadow-lg pointer-events-none z-10 text-center leading-snug">
                    Caption copied!<br />Paste it in LinkedIn ⌘V
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-3 items-center mb-2">
              <CutTypeBadge cutType={cut.cutType} className="text-sm px-3 py-1" />
              <StatusBadge status={cut.status} />
            </div>
            
            <h1 className="text-4xl font-extrabold tracking-tight text-primary">
              {cut.institution}
            </h1>

            {institutionSlug && (
              subscribed ? (
                <Link
                  href={`/institution/${institutionSlug}`}
                  className="inline-flex items-center gap-1 text-sm text-[#1e3a5f] hover:text-amber-600 font-medium transition-colors"
                >
                  <Building2 className="h-3.5 w-3.5" />
                  View all actions for this institution →
                </Link>
              ) : (
                <Link
                  href={`/subscribe?redirect=/institution/${institutionSlug}`}
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-amber-600 font-medium transition-colors"
                >
                  <Lock className="h-3.5 w-3.5 text-amber-500" />
                  View all actions for this institution
                  <span className="text-xs text-amber-600 font-semibold">— Sign in to unlock</span>
                </Link>
              )
            )}

            <InstitutionInfoCard institutionName={cut.institution} />
            
            {cut.programName && (
              <h2 className="text-2xl text-muted-foreground font-medium">
                {cut.programName}
              </h2>
            )}
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-3" itemScope itemType="https://schema.org/Event">
          <div className="md:col-span-2 space-y-8">
            <Card>
              <CardHeader className="bg-muted/30 border-b">
                <CardTitle className="text-lg">Details</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <dl className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-1">
                    <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" /> Announcement Date
                    </dt>
                    <dd className="text-base font-semibold">
                      {cut.announcementDate ? format(parseISO(cut.announcementDate), "MMMM d, yyyy") : "—"}
                    </dd>
                  </div>
                  
                  {cut.effectiveTerm && (
                    <div className="space-y-1">
                      <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4" /> Effective Term
                      </dt>
                      <dd className="text-base font-semibold">
                        {cut.effectiveTerm}
                      </dd>
                    </div>
                  )}
                  
                  <div className="space-y-1">
                    <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Building2 className="h-4 w-4" /> Control Type
                    </dt>
                    <dd className="text-base font-semibold">
                      {cut.control || "Not specified"}
                    </dd>
                  </div>
                  
                  <div className="space-y-1">
                    <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <MapPin className="h-4 w-4" /> Location
                    </dt>
                    <dd className="text-base font-semibold">
                      {cut.state}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {cut.notes && (
              <Card>
                <CardHeader className="bg-muted/30 border-b">
                  <CardTitle className="text-lg">Notes & Context</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="prose prose-sm dark:prose-invert max-w-none text-base">
                    {cut.notes}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="bg-muted/30 border-b">
                <CardTitle className="text-lg">Sources</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {cut.sourceUrl ? (
                  <div className="flex flex-col gap-2">
                    {cut.sourcePublication && (
                      <span className="font-medium text-sm">{cut.sourcePublication}</span>
                    )}
                    <a 
                      href={cut.sourceUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-2 break-all"
                    >
                      View Original Source <ExternalLink className="h-4 w-4 shrink-0" />
                    </a>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No source link provided.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-destructive/20 bg-destructive/5">
              <CardHeader>
                <CardTitle className="text-lg">Human Impact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground mb-2 font-medium">
                    <GraduationCap className="h-5 w-5" /> Students Affected
                  </div>
                  <div className="text-3xl font-bold">
                    {cut.studentsAffected !== null ? cut.studentsAffected.toLocaleString() : "Unknown"}
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground mb-2 font-medium">
                    <Users className="h-5 w-5" /> Faculty/Staff Affected
                  </div>
                  <div className="text-3xl font-bold">
                    {cut.facultyAffected !== null ? cut.facultyAffected.toLocaleString() : "Unknown"}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="bg-muted p-4 rounded-lg text-sm text-muted-foreground">
              <p>
                Are these numbers inaccurate? Do you have more recent information?
              </p>
              <Button asChild variant="outline" className="w-full mt-4">
                <Link href="/submit-tip">Submit an Update</Link>
              </Button>
            </div>

            {!subscribed && (
              <div
                className="rounded-xl p-5 space-y-4 text-white shadow-md"
                style={{ background: "linear-gradient(135deg, #1e3a5f, #2a4e7c)" }}
              >
                <h3 className="text-base font-bold text-white">Unlock the Full Database</h3>
                <div className="space-y-2.5 text-sm text-blue-100">
                  {[
                    { icon: <BarChart3 className="h-4 w-4 text-amber-400" />, label: "Full analytics dashboard" },
                    { icon: <GraduationCap className="h-4 w-4 text-amber-400" />, label: "Continuously growing database" },
                    { icon: <Briefcase className="h-4 w-4 text-amber-400" />, label: "Job outlook by major" },
                    { icon: <Lock className="h-4 w-4 text-amber-400" />, label: "Search & filter all records" },
                  ].map(({ icon, label }) => (
                    <div key={label} className="flex items-center gap-2">
                      {icon}
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
                <Button
                  asChild
                  className="w-full bg-amber-500 hover:bg-amber-400 text-white border-0 font-semibold"
                  size="sm"
                >
                  <Link href={`/subscribe?redirect=/cuts/${id}`}>Get Free Access</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
        <RelatedCutsSection state={cut.state} currentId={id} subscribed={subscribed} />
      </div>
    </>
  );
}

function RelatedCutsSection({ state, currentId, subscribed }: { state: string; currentId: string; subscribed: boolean }) {
  const { data, isLoading } = useQuery<{ cuts: { id: string; institution: string; programName: string | null; cutType: string; announcementDate: string | null; state: string }[] }>({
    queryKey: ["cuts/by-state", state],
    queryFn: async () => {
      const r = await fetch(`${BASE_URL}/api/cuts?state=${encodeURIComponent(state)}&limit=6`);
      if (!r.ok) throw new Error("Failed");
      return r.json();
    },
    enabled: !!state,
  });

  const related = (data?.cuts ?? []).filter(c => c.id !== currentId).slice(0, 4);
  if (!isLoading && related.length === 0 && subscribed) return null;

  if (!subscribed) {
    return (
      <section className="border-t pt-8 mt-4">
        <h2 className="text-xl font-bold text-[#1e3a5f] mb-5">
          More higher education cuts in {state}
        </h2>
        <div
          className="rounded-xl p-6 text-center space-y-3 border border-amber-200"
          style={{ background: "linear-gradient(135deg, #fefce8, #fffbeb)" }}
        >
          <Lock className="h-6 w-6 text-amber-500 mx-auto" />
          <p className="text-sm font-semibold text-[#1e3a5f]">
            Sign in free to browse all {state} records and the full database
          </p>
          <Button
            asChild
            size="sm"
            className="bg-amber-500 hover:bg-amber-400 text-white border-0 font-semibold"
          >
            <Link href={`/subscribe?redirect=/cuts`}>Get Free Access →</Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="border-t pt-8 mt-4">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-[#1e3a5f]">
          More higher education cuts in {state}
        </h2>
        <Link href={`/cuts?state=${encodeURIComponent(state)}`} className="text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors">
          View all in {state} →
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {isLoading
          ? Array(4).fill(0).map((_, i) => <Card key={i}><CardContent className="p-4"><Skeleton className="h-16 w-full" /></CardContent></Card>)
          : related.map(cut => (
            <Link key={cut.id} href={`/cuts/${cut.id}`} className="block group">
              <Card className="h-full transition-all hover:border-[#1e3a5f]/40 hover:shadow-md border-0 shadow-sm bg-white">
                <CardContent className="p-4 space-y-2">
                  <h3 className="font-semibold text-sm leading-tight group-hover:text-[#1e3a5f] transition-colors line-clamp-2">
                    {cut.institution}
                  </h3>
                  {cut.programName && (
                    <p className="text-xs text-muted-foreground line-clamp-1">{cut.programName}</p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <CutTypeBadge cutType={cut.cutType} className="text-[10px] px-1.5 py-0 h-5" />
                    <span className="text-xs text-muted-foreground">
                      {cut.announcementDate ? format(parseISO(cut.announcementDate), "MMM yyyy") : "—"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        }
      </div>
    </section>
  );
}
