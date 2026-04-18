import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Database, ShieldAlert, GraduationCap, ArrowRight, Mail, ExternalLink, BookOpen, TrendingUp, Building2, Briefcase } from "lucide-react";
import { SectionAxis } from "@/components/ui/section-axis";

export default function About() {
  return (
    <>
      <Helmet>
        <title>About CollegeCuts | The Free US College Program Cuts & Closures Database</title>
        <meta name="description" content="CollegeCuts is a free civic database documenting US higher education program closures, department suspensions, campus shutdowns, and faculty layoffs. Learn about our methodology and how we source data." />
        <link rel="canonical" href="https://college-cuts.com/about" />
      </Helmet>
    <div className="container mx-auto max-w-4xl px-4 py-12 space-y-16">
      
      {/* Mission */}
      <section className="space-y-6 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary">
          Documenting the Contraction
        </h1>
        <p className="text-xl text-muted-foreground leading-relaxed">
          CollegeCuts is a civic data project built to track, quantify, and preserve the record of program closures, department suspensions, and institutional collapses across the United States.
        </p>
      </section>

      <SectionAxis label="§ 01 · PRINCIPLES" />
      {/* Core Values */}
      <section className="grid gap-6 md:grid-cols-3">
        <Card className="border-t-4 border-t-primary shadow-sm bg-muted/10">
          <CardContent className="pt-6 space-y-4">
            <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
              <Database className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-lg">Data as Accountability</h3>
            <p className="text-sm text-muted-foreground">
              Institutional closures are often framed as isolated incidents. By aggregating them, we reveal systemic trends and demand better policy responses.
            </p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-destructive shadow-sm bg-muted/10">
          <CardContent className="pt-6 space-y-4">
            <div className="h-10 w-10 bg-destructive/10 rounded-lg flex items-center justify-center text-destructive">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-lg">Human Impact First</h3>
            <p className="text-sm text-muted-foreground">
              Behind every row in this database are students whose degrees are in jeopardy and faculty whose livelihoods have been eliminated.
            </p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-primary shadow-sm bg-muted/10">
          <CardContent className="pt-6 space-y-4">
            <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
              <GraduationCap className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-lg">Community Driven</h3>
            <p className="text-sm text-muted-foreground">
              We rely on journalists, educators, and affected students to report cuts. Transparency requires collective effort.
            </p>
          </CardContent>
        </Card>
      </section>

      <SectionAxis label="§ 02 · DATA SOURCES" />
      {/* Data Sources */}
      <section className="space-y-8" id="data-sources">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Data Sources</h2>
          <p className="text-muted-foreground">Every number in this database has a documented origin. Here is what powers each section of the site.</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Card className="border shadow-sm">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Database className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-sm text-foreground">Higher Ed Actions Database</p>
                  <p className="text-xs text-muted-foreground">Cuts, closures, layoffs</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Compiled manually from local and national news reporting, official university press releases, board meeting minutes, accreditor filings, and crowdsourced tips. Every record is verified against a public source before being marked Confirmed.
              </p>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                  <TrendingUp className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-bold text-sm text-foreground">Bureau of Labor Statistics (BLS)</p>
                  <p className="text-xs text-muted-foreground">Job Outlook &amp; Skills Gap</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Occupational employment counts, 10-year projected growth rates, and median wages come from the BLS Occupational Employment and Wage Statistics (OEWS) program and the Occupational Outlook Handbook. Data is updated with each BLS release cycle.
              </p>
              <a href="https://www.bls.gov/ooh/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                bls.gov/ooh <ExternalLink className="h-3 w-3" />
              </a>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                  <Building2 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-sm text-foreground">College Scorecard</p>
                  <p className="text-xs text-muted-foreground">Institution profiles</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Enrollment size, graduation rates, median earnings 6 years after enrollment, and average net price on each institution page come directly from the US Department of Education's College Scorecard API. Figures reflect the latest published academic year.
              </p>
              <a href="https://collegescorecard.ed.gov/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                collegescorecard.ed.gov <ExternalLink className="h-3 w-3" />
              </a>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                  <Briefcase className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-bold text-sm text-foreground">O*NET OnLine</p>
                  <p className="text-xs text-muted-foreground">Occupational skills data</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Detailed skill requirements, work activities, and knowledge areas by occupation come from O*NET, the US Department of Labor's primary occupational information database. Integration is live and populates the Skills section of each Job Outlook entry.
              </p>
              <a href="https://www.onetonline.org/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                onetonline.org <ExternalLink className="h-3 w-3" />
              </a>
            </CardContent>
          </Card>

          <Card className="border shadow-sm sm:col-span-2">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-rose-100 flex items-center justify-center shrink-0">
                  <BookOpen className="h-5 w-5 text-rose-600" />
                </div>
                <div>
                  <p className="font-bold text-sm text-foreground">Skills Gap Intelligence: Scoring Methodology</p>
                  <p className="text-xs text-muted-foreground">Skills Gap dashboard</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The Skills Gap Scorecard ranks 15 academic fields by a composite Gap Score derived from three inputs: (1) the number of programs in that field cut or suspended since 2024, drawn from the CollegeCuts database; (2) the projected 10-year employment growth rate from BLS; and (3) the current national employment base from BLS OEWS. A higher score indicates a field where supply of trained graduates is contracting against growing employer demand. No estimates or modeled figures are used. Every data point is sourced directly from the BLS or the verified cuts database.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <SectionAxis label="§ 03 · METHODOLOGY" />
      {/* Methodology & FAQ */}
      <section className="space-y-8" id="methodology">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Methodology & FAQ</h2>
          <p className="text-muted-foreground">How we collect and classify our data.</p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-lg font-semibold">Where does the cuts data come from?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2 text-base">
              <p>Our cuts database is compiled from three primary sources:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Local and national news reporting</li>
                <li>Official university press releases, board minutes, and regulatory filings</li>
                <li>Crowdsourced tips submitted by students, faculty, and community members</li>
              </ul>
              <p>Every submission is reviewed and verified against public records or reporting before being marked as "Confirmed".</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-1b">
            <AccordionTrigger className="text-lg font-semibold">Where do the job growth and employment figures come from?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2 text-base">
              <p>All occupational employment, wage, and growth figures displayed in the Job Outlook and Skills Gap sections come from the US Bureau of Labor Statistics (BLS), specifically:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong className="text-foreground">Employment counts:</strong> BLS Occupational Employment and Wage Statistics (OEWS), latest annual release</li>
                <li><strong className="text-foreground">10-year growth projections:</strong> BLS Employment Projections program</li>
                <li><strong className="text-foreground">Median wages:</strong> BLS OEWS</li>
              </ul>
              <p>We do not model, interpolate, or adjust these figures. They are published government statistics.</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-1c">
            <AccordionTrigger className="text-lg font-semibold">Where does the institution data (grad rate, net price, earnings) come from?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2 text-base">
              <p>Institution-level data shown on each cut record and institution profile page is pulled live from the <strong className="text-foreground">US Department of Education College Scorecard API</strong>. This includes:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Total enrollment</li>
                <li>Graduation rate (overall, completion rate suppressed)</li>
                <li>Median earnings 6 years after enrollment</li>
                <li>Average annual net price</li>
              </ul>
              <p>Figures reflect the latest available academic year in the Scorecard dataset. They are not estimates. They are the federal government's own published figures for each school.</p>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-2">
            <AccordionTrigger className="text-lg font-semibold">How do you define the different Action Types?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4 text-base">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <strong className="text-foreground">Institution Closure:</strong> The complete shutdown of a college or university, ending all operations.
                </div>
                <div>
                  <strong className="text-foreground">Campus Closure:</strong> The closure of a branch or regional campus, while the parent institution remains open.
                </div>
                <div>
                  <strong className="text-foreground">Teach-Out:</strong> A formal process where an institution halts new enrollment but remains open long enough for current students to finish their degrees.
                </div>
                <div>
                  <strong className="text-foreground">Program Suspension:</strong> Halting admissions to a specific major or degree program, often a precursor to closure.
                </div>
                <div>
                  <strong className="text-foreground">Department Closure:</strong> The complete elimination of an academic department, usually resulting in faculty layoffs.
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger className="text-lg font-semibold">Are the "affected" numbers exact?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-base">
              No. Numbers for affected students and faculty are estimates based on available reporting at the time of the announcement. Universities often obscure these figures or report them inconsistently. We treat our numbers as conservative baselines.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger className="text-lg font-semibold">Can I use this data in my research or reporting?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2 text-base">
              <p>Yes. CollegeCuts data is free to use for journalism, academic research, and policy work. The public API is available at <strong className="text-foreground">college-cuts.com/api/cuts</strong> (no key required). Please credit CollegeCuts and link back to the relevant record or institution page when citing specific figures.</p>
              <p>For bulk data exports, methodology questions, or collaboration inquiries, email us directly.</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      <SectionAxis label="§ 04 · ABOUT THE CREATOR" />
      {/* Creator */}
      <section className="space-y-6" id="creator">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Creator</h2>
          <p className="text-muted-foreground">The person behind the data.</p>
        </div>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-primary">Oluwadunsin Agbolabori</h3>
                  <p className="text-sm text-muted-foreground font-medium">Data Analyst & Independent Builder</p>
                </div>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Oluwadunsin Agbolabori is a data analyst and independent builder focused on tracking and interpreting structural changes in U.S. higher education. He created CollegeCuts to systematically document program closures, layoffs, and institutional shifts, turning fragmented reporting into a clear, structured record of what's changing across colleges and universities. His work aims to provide journalists, researchers, and higher ed professionals with a reliable, data-driven view of emerging trends.
                </p>
                <div className="pt-2">
                  <p className="text-sm font-semibold text-foreground mb-1">Contact</p>
                  <p className="text-sm text-muted-foreground mb-3">For media inquiries, tips, corrections, or collaboration:</p>
                  <a
                    href="mailto:agbolaboridunsin@gmail.com"
                    className="inline-flex items-center gap-2 text-primary font-semibold hover:underline text-sm"
                  >
                    <Mail className="h-4 w-4" />
                    agbolaboridunsin@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground rounded-2xl p-8 sm:p-12 text-center space-y-6">
        <h2 className="text-3xl font-bold">Help keep the record accurate.</h2>
        <p className="text-primary-foreground/80 max-w-2xl mx-auto text-lg">
          If you know of a closure, suspension, or layoff that isn't reflected in our database, please report it. You can remain anonymous.
        </p>
        <div className="pt-4">
          <Button asChild size="lg" variant="secondary" className="font-bold">
            <Link href="/submit-tip">
              Submit a Report <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

    </div>
    </>
  );
}
