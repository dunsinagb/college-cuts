import { Link, useParams } from "wouter";
import { useGetCut } from "@workspace/api-client-react";
import { format, parseISO } from "date-fns";
import { getGetCutQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge, CutTypeBadge } from "@/components/shared/Badges";
import { ArrowLeft, ExternalLink, Calendar, Users, GraduationCap, Building2, MapPin } from "lucide-react";

export default function CutDetail() {
  const params = useParams();
  const id = params.id ?? "";

  const { data: cut, isLoading, error } = useGetCut(id, {
    query: {
      enabled: !!id,
      queryKey: getGetCutQueryKey(id)
    }
  });

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8 space-y-8">
        <Skeleton className="h-10 w-24" />
        <div className="space-y-4">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (error || !cut) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-16 text-center space-y-6">
        <h1 className="text-3xl font-bold">Record Not Found</h1>
        <p className="text-muted-foreground">We couldn't find the requested data.</p>
        <Button asChild>
          <Link href="/cuts">Back to Database</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <div>
        <Button asChild variant="ghost" className="mb-6 pl-0 hover:bg-transparent hover:text-primary">
          <Link href="/cuts">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to database
          </Link>
        </Button>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-3 items-center mb-2">
            <CutTypeBadge cutType={cut.cutType} className="text-sm px-3 py-1" />
            <StatusBadge status={cut.status} />
          </div>
          
          <h1 className="text-4xl font-extrabold tracking-tight text-primary">
            {cut.institution}
          </h1>
          
          {cut.programName && (
            <h2 className="text-2xl text-muted-foreground font-medium">
              {cut.programName}
            </h2>
          )}
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
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
        </div>
      </div>
    </div>
  );
}
