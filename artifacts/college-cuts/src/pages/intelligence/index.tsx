import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { ArrowRight, BarChart3, Bell, Building2, CheckCircle2, Lock, TrendingDown, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const TIERS = [
  {
    name: "Freemium",
    price: "Free",
    period: "",
    description: "See the risk landscape. Upgrade when it becomes urgent.",
    features: [
      "3 pipeline risk alerts per month",
      "National-level data only",
      "Basic risk scoring",
      "No export",
    ],
    cta: "Get Started Free",
    href: "/intelligence/onboarding",
    highlight: false,
  },
  {
    name: "Professional",
    price: "$299",
    period: "/month",
    description: "For talent acquisition managers who need to act early.",
    features: [
      "Up to 5 role categories",
      "3 metro-area filters",
      "Real-time pipeline alerts",
      "Dashboard + PDF export",
      "Source transparency on every data point",
    ],
    cta: "Start Professional Trial",
    href: "/intelligence/onboarding",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "$1,500",
    period: "/month",
    description: "For VP-level buyers and workforce planning teams.",
    features: [
      "Unlimited roles & geographies",
      "Competitive benchmarking",
      "Up to 10 team seats",
      "ATS / HRIS API access",
      "Dedicated account manager",
    ],
    cta: "Contact Sales",
    href: "/intelligence/onboarding",
    highlight: false,
  },
];

const HOW_IT_WORKS = [
  {
    icon: TrendingDown,
    title: "We track every program cut",
    body: "Our database logs every academic program suspension, department closure, and faculty layoff at U.S. universities, updated continuously.",
  },
  {
    icon: BarChart3,
    title: "We map it to your talent pipelines",
    body: "Using O*NET occupational codes, we translate higher education events into corporate workforce terms: roles, skills, and hiring timelines.",
  },
  {
    icon: Bell,
    title: "You get early warning signals",
    body: "Before the talent shortage hits your ATS, you see it coming 18–36 months out and can adjust sourcing, compensation, or internal development strategy.",
  },
];

const PROOF_POINTS = [
  { stat: "1,200+", label: "Program cuts tracked" },
  { stat: "18–36", label: "Months of lead time" },
  { stat: "50+", label: "Role categories mapped" },
  { stat: "Real-time", label: "Alert delivery" },
];

export default function IntelligenceLanding() {
  return (
    <>
      <Helmet>
        <title>Skills Gap Intelligence | CollegeCuts</title>
        <meta name="description" content="Early warning system for corporate talent pipelines. Know which skills are disappearing from U.S. universities before the shortage hits your hiring." />
        <link rel="canonical" href="https://college-cuts.com/intelligence" />
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Hero */}
        <div
          className="relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0f2440 0%, #1e3a5f 60%, #1a3352 100%)" }}
        >
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at 25% 50%, #fbbf24 0%, transparent 60%)" }} />
          <div className="relative container mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 border border-amber-500/30 px-4 py-1.5 mb-6">
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">New: B2B Workforce Intelligence</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight mb-6">
                Your talent pipelines are shrinking.{" "}
                <span className="text-amber-400">We see it 2 years early.</span>
              </h1>
              <p className="text-lg sm:text-xl text-blue-200 max-w-2xl leading-relaxed mb-10">
                CollegeCuts tracks every academic program cut, department closure, and faculty layoff at U.S. universities.
                The Skills Gap Intelligence Tool maps that data to your specific talent pipelines, giving HR and talent teams
                an early warning system that doesn't exist anywhere else.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-amber-500 hover:bg-amber-400 text-white font-bold text-base px-8 py-6 h-auto shadow-lg shadow-amber-900/30"
                >
                  <Link href="/intelligence/onboarding">
                    Build Your Risk Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10 font-semibold text-base px-8 py-6 h-auto bg-transparent"
                >
                  <Link href="#how-it-works">See How It Works</Link>
                </Button>
              </div>
              <p className="mt-5 text-sm text-blue-300">
                Already have an organization account?{" "}
                <Link href="/auth/login?redirect=/intelligence/dashboard" className="text-amber-400 font-semibold hover:underline">
                  Sign in to your dashboard →
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Proof points */}
        <div className="bg-[#f0f4f9] border-b border-gray-200">
          <div className="container mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {PROOF_POINTS.map((p) => (
                <div key={p.stat} className="text-center">
                  <div className="text-3xl font-extrabold text-[#1e3a5f]">{p.stat}</div>
                  <div className="text-sm text-gray-500 mt-1 font-medium">{p.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* How it works */}
        <div id="how-it-works" className="container mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-[#1e3a5f] mb-3">How the intelligence engine works</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Three steps from a university program cut to an actionable alert in your inbox.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.title} className="relative">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#1e3a5f]/10">
                    <step.icon className="h-6 w-6 text-[#1e3a5f]" />
                  </div>
                  <span className="text-4xl font-black text-gray-100 select-none">0{i + 1}</span>
                </div>
                <h3 className="font-bold text-[#1e3a5f] text-lg mb-2">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Use case callout */}
        <div className="bg-[#1e3a5f] py-16">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <h2 className="text-3xl font-extrabold text-white mb-4">
                  The early warning signal your board will want to see
                </h2>
                <p className="text-blue-200 text-base leading-relaxed mb-6">
                  When a university cuts a nursing program, the pipeline of RN graduates shrinks by roughly 45 per year.
                  If 7 programs are cut in your target metro over 6 months, that's 315 fewer candidates available by 2027.
                  That's a board-level talent risk. And you can see it now, not in 2027.
                </p>
                <Button asChild size="lg" className="bg-amber-500 hover:bg-amber-400 text-white font-bold">
                  <Link href="/intelligence/onboarding">
                    Build your pipeline risk dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                {[
                  { role: "Registered Nurse (RN)", risk: "CRITICAL", cuts: 9, impact: "~405 fewer graduates/yr" },
                  { role: "Data Scientist", risk: "HIGH", cuts: 6, impact: "~270 fewer graduates/yr" },
                  { role: "Mechanical Engineer", risk: "MEDIUM", cuts: 3, impact: "~135 fewer graduates/yr" },
                ].map((row) => (
                  <div key={row.role} className="flex items-center justify-between gap-4 bg-white/5 rounded-xl px-4 py-3">
                    <div>
                      <div className="text-white font-semibold text-sm">{row.role}</div>
                      <div className="text-blue-300 text-xs mt-0.5">{row.impact}</div>
                    </div>
                    <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide ${
                      row.risk === "CRITICAL" ? "bg-red-500/20 text-red-300 border border-red-500/30" :
                      row.risk === "HIGH" ? "bg-orange-500/20 text-orange-300 border border-orange-500/30" :
                      "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                    }`}>{row.risk}</span>
                  </div>
                ))}
                <div className="text-center text-blue-400 text-xs pt-2">
                  <Lock className="h-3 w-3 inline mr-1" />Sample dashboard · build yours free
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="container mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-[#1e3a5f] mb-3">Plans for every organization</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Annual contracts available at 20% discount.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TIERS.map((tier) => (
              <Card
                key={tier.name}
                className={`border-2 ${tier.highlight ? "border-amber-400 shadow-xl shadow-amber-100" : "border-gray-200"} relative`}
              >
                {tier.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-amber-400 text-white text-xs font-bold uppercase tracking-wider px-4 py-1 rounded-full shadow">Most Popular</span>
                  </div>
                )}
                <CardContent className="p-6">
                  <div className="mb-4">
                    <h3 className="font-bold text-[#1e3a5f] text-lg">{tier.name}</h3>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-3xl font-extrabold text-[#1e3a5f]">{tier.price}</span>
                      <span className="text-gray-400 text-sm">{tier.period}</span>
                    </div>
                    <p className="text-gray-500 text-sm mt-2">{tier.description}</p>
                  </div>
                  <ul className="space-y-2.5 mb-6">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    asChild
                    className={`w-full font-bold ${tier.highlight ? "bg-amber-500 hover:bg-amber-400 text-white" : "bg-[#1e3a5f] hover:bg-[#2a4e7c] text-white"}`}
                  >
                    <Link href={tier.href}>{tier.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Data sources trust bar */}
        <div className="bg-[#f0f4f9] border-t border-gray-200 py-12">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-6">Powered by authoritative public data</p>
            <div className="flex flex-wrap justify-center gap-x-10 gap-y-4">
              {["CollegeCuts Database", "O*NET (U.S. Dept. of Labor)", "IPEDS (Dept. of Education)", "BLS Occupational Outlook"].map((src) => (
                <div key={src} className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  {src}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
