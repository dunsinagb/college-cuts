import { useState, useEffect } from "react";
import { useSearch } from "wouter";
import { Helmet } from "react-helmet-async";
import {
  ArrowRight, Briefcase, Building2, CheckCircle2, GraduationCap,
  Linkedin, Loader2, Users, Zap, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

const DEGREE_LEVELS = ["Bachelor's", "Master's", "PhD / Doctorate", "Professional (MD, JD, etc.)", "Associate's", "Other"];
const OPEN_TO_OPTIONS = [
  { id: "industry", label: "Industry / Corporate roles" },
  { id: "consulting", label: "Consulting / Advisory" },
  { id: "adjunct", label: "Adjunct / Part-time teaching" },
  { id: "research", label: "Research institution" },
  { id: "government", label: "Government / Policy" },
  { id: "nonprofit", label: "Nonprofit / NGO" },
];
const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC",
];

type FormData = {
  name: string;
  email: string;
  institution: string;
  role_title: string;
  department: string;
  degree_level: string;
  years_experience: string;
  specializations: string;
  open_to: string[];
  state: string;
  linkedin_url: string;
  bio: string;
  visible: boolean;
};

export default function TalentRegister() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const prefillInstitution = params.get("institution") || "";
  const prefillSlug = params.get("slug") || "";

  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<FormData>({
    name: "", email: "", institution: prefillInstitution, role_title: "",
    department: "", degree_level: "", years_experience: "", specializations: "",
    open_to: [], state: "", linkedin_url: "", bio: "", visible: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (prefillInstitution) setForm((f) => ({ ...f, institution: prefillInstitution }));
  }, [prefillInstitution]);

  function set(field: keyof FormData, value: any) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => { const n = { ...e }; delete n[field]; return n; });
  }

  function toggleOpenTo(id: string) {
    setForm((f) => ({
      ...f,
      open_to: f.open_to.includes(id) ? f.open_to.filter((x) => x !== id) : [...f.open_to, id],
    }));
  }

  function validateStep1(): boolean {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Full name required";
    if (!form.email.includes("@")) e.email = "Valid email required";
    if (!form.institution.trim()) e.institution = "Institution required";
    if (!form.role_title.trim()) e.role_title = "Your title is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleStep1Continue(e: React.FormEvent) {
    e.preventDefault();
    if (validateStep1()) setStep(2);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");

    const specializations = form.specializations
      .split(",").map((s) => s.trim()).filter(Boolean);

    try {
      const r = await fetch(`${BASE_URL}/api/talent/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          institution_slug: prefillSlug || undefined,
          years_experience: form.years_experience ? Number(form.years_experience) : undefined,
          specializations,
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Submission failed");
      setStatus("success");
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="min-h-screen bg-[#f0f4f9] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mx-auto">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#1e3a5f]">Your profile is live</h1>
          <p className="text-gray-600 leading-relaxed">
            Employers using the Skills Gap Intelligence platform can now discover your profile.
            You'll be notified when a company views your background.
          </p>
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
            <strong>What happens next:</strong> When an employer's pipeline alert fires for your field, your profile surfaces in their talent feed. No action needed on your end.
          </div>
          <Button asChild className="bg-[#1e3a5f] hover:bg-[#2a4e7c] text-white font-bold">
            <a href="/">Back to CollegeCuts</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Create Your Talent Profile | CollegeCuts</title>
        <meta name="description" content="Were you affected by higher education cuts? Create a free profile and get discovered by companies actively hiring in your field." />
        <link rel="canonical" href="https://college-cuts.com/talent" />
      </Helmet>

      <div className="min-h-screen bg-[#f0f4f9]">
        {/* Hero */}
        <div style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2a4e7c 100%)" }} className="py-14 px-4">
          <div className="container mx-auto max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-amber-300">Free · Takes 2 minutes</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-4">
              Were you affected by cuts at{" "}
              {prefillInstitution ? (
                <span className="text-amber-400">{prefillInstitution}?</span>
              ) : "a university?"}
            </h1>
            <p className="text-blue-200 text-base max-w-xl leading-relaxed mb-6">
              Companies are actively looking for talent displaced from academia. Create a free profile and get discovered directly by employers who need your background.
            </p>
            <div className="flex flex-wrap gap-4">
              {[
                { icon: Briefcase, text: "Matched to employers hiring in your field" },
                { icon: Users, text: "No resume needed. Your credentials speak for themselves." },
                { icon: Building2, text: "Visible to Fortune 500 HR teams and workforce planners" },
              ].map((p) => (
                <div key={p.text} className="flex items-center gap-2 text-sm text-blue-200">
                  <p.icon className="h-4 w-4 text-amber-400 shrink-0" />
                  {p.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Step indicator */}
        <div className="container mx-auto max-w-3xl px-4 pt-8">
          <div className="flex items-center gap-3 mb-6">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  step >= s ? "bg-[#1e3a5f] text-white" : "bg-gray-200 text-gray-500"
                }`}>
                  {step > s ? <CheckCircle2 className="h-4 w-4" /> : s}
                </div>
                <span className={`text-sm font-medium ${step >= s ? "text-[#1e3a5f]" : "text-gray-400"}`}>
                  {s === 1 ? "Your basics" : "Enhance your profile"}
                </span>
                {s < 2 && <ChevronRight className="h-4 w-4 text-gray-300" />}
              </div>
            ))}
          </div>
        </div>

        <div className="container mx-auto max-w-3xl px-4 pb-10">
          {/* Step 1 */}
          {step === 1 && (
            <form onSubmit={handleStep1Continue}>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6 space-y-6">
                  <h2 className="text-lg font-bold text-[#1e3a5f]">Tell us who you are</h2>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name *</label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => set("name", e.target.value)}
                        placeholder="Dr. Jane Smith"
                        className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f] ${errors.name ? "border-red-400" : "border-gray-300"}`}
                      />
                      {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email *</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => set("email", e.target.value)}
                        placeholder="you@email.com"
                        className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f] ${errors.email ? "border-red-400" : "border-gray-300"}`}
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Institution you were at *</label>
                      <input
                        type="text"
                        value={form.institution}
                        onChange={(e) => set("institution", e.target.value)}
                        placeholder="Ohio State University"
                        className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f] ${errors.institution ? "border-red-400" : "border-gray-300"}`}
                      />
                      {errors.institution && <p className="text-red-500 text-xs mt-1">{errors.institution}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your Title / Role *</label>
                      <input
                        type="text"
                        value={form.role_title}
                        onChange={(e) => set("role_title", e.target.value)}
                        placeholder="Associate Professor / Research Scientist"
                        className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f] ${errors.role_title ? "border-red-400" : "border-gray-300"}`}
                      />
                      {errors.role_title && <p className="text-red-500 text-xs mt-1">{errors.role_title}</p>}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-amber-400 text-white font-bold py-3 h-auto text-base"
                  >
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <p className="text-center text-xs text-gray-400">
                    Free forever. No spam. Your email is never shared with employers without your consent.
                  </p>
                </CardContent>
              </Card>
            </form>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <form onSubmit={handleSubmit}>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-[#1e3a5f]">Enhance your profile</h2>
                    <p className="text-sm text-gray-500 mt-1">These details help employers find you faster. All optional.</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Department / Program</label>
                      <input
                        type="text"
                        value={form.department}
                        onChange={(e) => set("department", e.target.value)}
                        placeholder="Dept. of Statistics"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Years of Experience</label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={form.years_experience}
                        onChange={(e) => set("years_experience", e.target.value)}
                        placeholder="12"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Highest Degree</label>
                    <div className="flex flex-wrap gap-2">
                      {DEGREE_LEVELS.map((d) => (
                        <button
                          type="button"
                          key={d}
                          onClick={() => set("degree_level", d)}
                          className={`px-3 py-1.5 rounded-full text-sm border font-medium transition-colors ${
                            form.degree_level === d
                              ? "bg-[#1e3a5f] text-white border-[#1e3a5f]"
                              : "bg-white text-gray-600 border-gray-300 hover:border-[#1e3a5f]/50"
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Specializations <span className="text-gray-400 font-normal">(comma-separated)</span>
                    </label>
                    <input
                      type="text"
                      value={form.specializations}
                      onChange={(e) => set("specializations", e.target.value)}
                      placeholder="Machine learning, statistical modeling, biostatistics"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Open to opportunities in</label>
                    <div className="flex flex-wrap gap-2">
                      {OPEN_TO_OPTIONS.map((opt) => (
                        <button
                          type="button"
                          key={opt.id}
                          onClick={() => toggleOpenTo(opt.id)}
                          className={`px-3 py-1.5 rounded-full text-sm border font-medium transition-colors ${
                            form.open_to.includes(opt.id)
                              ? "bg-[#1e3a5f] text-white border-[#1e3a5f]"
                              : "bg-white text-gray-600 border-gray-300 hover:border-[#1e3a5f]/50"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Location (State)</label>
                      <select
                        value={form.state}
                        onChange={(e) => set("state", e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f] bg-white"
                      >
                        <option value="">Select state…</option>
                        {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        LinkedIn URL <span className="text-gray-400 font-normal">(optional)</span>
                      </label>
                      <div className="relative">
                        <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="url"
                          value={form.linkedin_url}
                          onChange={(e) => set("linkedin_url", e.target.value)}
                          placeholder="https://linkedin.com/in/..."
                          className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2.5 text-sm outline-none focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f]"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Brief Bio <span className="text-gray-400 font-normal">(optional, 2-3 sentences)</span>
                    </label>
                    <textarea
                      value={form.bio}
                      onChange={(e) => set("bio", e.target.value)}
                      rows={3}
                      placeholder="Research scientist with 12 years in computational biology, specializing in genomic data pipelines. Previously led a team of 8 at the Center for Bioinformatics…"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f] resize-none"
                    />
                  </div>

                  <div className="flex items-start gap-3 rounded-xl bg-[#f0f4f9] border border-gray-200 p-4">
                    <input
                      type="checkbox"
                      id="visible"
                      checked={form.visible}
                      onChange={(e) => set("visible", e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-[#1e3a5f]"
                    />
                    <label htmlFor="visible" className="text-sm text-gray-700 leading-relaxed cursor-pointer">
                      <span className="font-semibold">Make my profile discoverable.</span> Employers using the Skills Gap Intelligence platform can find and view my profile. I can request removal at any time by emailing <a href="mailto:hello@college-cuts.com" className="text-[#1e3a5f] underline">hello@college-cuts.com</a>.
                    </label>
                  </div>

                  {status === "error" && (
                    <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                      {errorMsg}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-none"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={status === "loading"}
                      className="flex-1 bg-amber-500 hover:bg-amber-400 text-white font-bold py-3 h-auto text-base"
                    >
                      {status === "loading" ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating Profile…</>
                      ) : (
                        <>Create My Profile <ArrowRight className="ml-2 h-4 w-4" /></>
                      )}
                    </Button>
                  </div>
                  <p className="text-center text-xs text-gray-400">
                    Free forever. No spam. Your email is never shared with employers without your consent.
                  </p>
                </CardContent>
              </Card>
            </form>
          )}

          {/* How it works */}
          <div className="mt-10 grid sm:grid-cols-3 gap-6 text-center">
            {[
              { icon: GraduationCap, title: "Your credentials stay with you", body: "We record your background from academia: the depth of expertise that's often invisible on a standard resume." },
              { icon: Briefcase, title: "Companies find you", body: "When an employer's pipeline alert fires for your field, your profile is surfaced directly in their talent feed." },
              { icon: Zap, title: "No cold applications", body: "You don't apply to anything. Interested employers reach out to you through the platform." },
            ].map((s) => (
              <div key={s.title} className="space-y-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1e3a5f]/10 mx-auto">
                  <s.icon className="h-5 w-5 text-[#1e3a5f]" />
                </div>
                <h3 className="font-bold text-[#1e3a5f] text-sm">{s.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
