import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSubmitTip } from "@workspace/api-client-react";
import { Helmet } from "react-helmet-async";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STATES, CUT_TYPE_LABELS } from "@/lib/constants";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { useState } from "react";

const tipSchema = z.object({
  institution: z.string().min(2, "Institution name is required"),
  state: z.string().length(2, "Please select a state"),
  cutType: z.string().min(1, "Please select an action type"),
  programName: z.string().optional(),
  announcementDate: z.string().optional(),
  sourceUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  description: z.string().min(10, "Please provide more details (at least 10 characters)"),
  submitterEmail: z.string().email("Please enter a valid email").optional().or(z.literal("")),
});

type TipFormValues = z.infer<typeof tipSchema>;

export default function SubmitTip() {
  const { toast } = useToast();
  const submitTipMutation = useSubmitTip();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<TipFormValues>({
    resolver: zodResolver(tipSchema),
    defaultValues: {
      institution: "",
      state: "",
      cutType: "",
      programName: "",
      announcementDate: "",
      sourceUrl: "",
      description: "",
      submitterEmail: "",
    },
  });

  const onSubmit = (data: TipFormValues) => {
    submitTipMutation.mutate(
      { data },
      {
        onSuccess: () => {
          setIsSubmitted(true);
          toast({
            title: "Tip Submitted Successfully",
            description: "Thank you for contributing. Our team will verify this information.",
          });
          form.reset();
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Submission Failed",
            description: "There was an error submitting your tip. Please try again.",
          });
        },
      }
    );
  };

  if (isSubmitted) {
    return (
      <>
        <Helmet>
          <title>Tip Submitted | CollegeCuts</title>
        </Helmet>
      <div className="container mx-auto max-w-2xl px-4 py-16">
        <Card className="border-primary/20 shadow-lg text-center py-12">
          <CardContent className="space-y-6 flex flex-col items-center">
            <div className="h-20 w-20 bg-primary/10 text-primary rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Thank You</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Your tip has been securely submitted. We rely on community reports to keep this tracker accurate and up-to-date.
              </p>
            </div>
            <Button onClick={() => setIsSubmitted(false)} variant="outline" className="mt-4">
              Submit Another Tip
            </Button>
          </CardContent>
        </Card>
      </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Submit a Tip | CollegeCuts — Report a College Cut or Closure</title>
        <meta name="description" content="Know about a college program closure, department suspension, campus closure, or faculty layoff? Submit a tip to CollegeCuts and help keep the public record accurate." />
        <link rel="canonical" href="https://college-cuts.com/submit-tip" />
      </Helmet>
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 space-y-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-primary">Report a Cut or Closure</h1>
        <p className="text-lg text-muted-foreground">
          Help us document the impact of retrenchment in higher education. All submissions are verified before being published to the database.
        </p>
        
        <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 rounded-lg p-4 flex gap-3 text-amber-900 dark:text-amber-200">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="text-sm space-y-1">
            <p className="font-semibold">What makes a good tip?</p>
            <p>Please include a link to a news article, press release, internal memo, or official board minutes if possible. This drastically speeds up our verification process.</p>
          </div>
        </div>
      </div>

      <Card className="shadow-md border-t-4 border-t-primary">
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Institution Details</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="institution"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Institution Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. State University" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cutType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Action Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(CUT_TYPE_LABELS).map(([k, v]) => (
                              <SelectItem key={k} value={k}>{v}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="programName"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Program/Department Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Department of History (Optional)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Verification & Context</h3>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="announcementDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Announcement Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sourceUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Source URL</FormLabel>
                        <FormControl>
                          <Input type="url" placeholder="https://..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Details & Context *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Provide details about the scope of the cuts, numbers of students/faculty affected, or context behind the decision." 
                          className="h-32 resize-none"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4 bg-muted/30 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-muted-foreground">Follow-up Contact (Optional)</h3>
                <FormField
                  control={form.control}
                  name="submitterEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormDescription className="mb-2">
                        Leave your email if you are willing to answer clarifying questions. Your email will never be published.
                      </FormDescription>
                      <FormControl>
                        <Input type="email" placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full sm:w-auto font-bold px-8"
                  disabled={submitTipMutation.isPending}
                >
                  {submitTipMutation.isPending ? "Submitting..." : "Submit Report"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
    </>
  );
}
