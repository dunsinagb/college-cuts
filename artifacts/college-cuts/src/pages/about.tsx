import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Database, ShieldAlert, GraduationCap, ArrowRight } from "lucide-react";

export default function About() {
  return (
    <>
      <Helmet>
        <title>About CollegeCuts | Civic Data Project on Higher Education Cuts</title>
        <meta name="description" content="CollegeCuts is a civic data project documenting program closures, department suspensions, campus closures, and faculty layoffs at US colleges and universities. Learn about our methodology." />
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

      {/* Methodology & FAQ */}
      <section className="space-y-8" id="methodology">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Methodology & FAQ</h2>
          <p className="text-muted-foreground">How we collect and classify our data.</p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-lg font-semibold">Where does this data come from?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2 text-base">
              <p>Our data is compiled from three primary sources:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Local and national news reporting</li>
                <li>Official university press releases, board minutes, and regulatory filings</li>
                <li>Crowdsourced tips submitted by students, faculty, and community members</li>
              </ul>
              <p>Every submission is reviewed and verified against public records or reporting before being marked as "Confirmed".</p>
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
        </Accordion>
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
