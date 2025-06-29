import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ExternalLink, Calendar, Users, GraduationCap } from "lucide-react"
import { createClient } from "@supabase/supabase-js"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Database } from "@/types/supabase"

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

const cutTypeColors = {
  program_suspension: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  teach_out: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  department_closure: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  campus_closure: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300",
  institution_closure: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
}

export default async function CutDetailsPage({
  params,
}: {
  params: { id: string }
}) {
  const { data: cut, error } = await supabase.from("v_latest_cuts").select("*").eq("id", params.id).single()

  if (error || !cut) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/cuts">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to All Cuts
          </Link>
        </Button>

        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">
            {cut.program_name ? `${cut.program_name} at ${cut.institution}` : cut.institution}
          </h1>

          <div className="flex flex-wrap gap-2">
            <Badge className={cutTypeColors[cut.cut_type]}>{cut.cut_type.replace("_", " ")}</Badge>
            {cut.effective_term && <Badge variant="outline">Effective: {cut.effective_term}</Badge>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Announcement Date</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{new Date(cut.announcement_date).toLocaleDateString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Students Affected</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {cut.students_affected ? cut.students_affected.toLocaleString() : ""}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Faculty Affected</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {cut.faculty_affected ? cut.faculty_affected.toLocaleString() : ""}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Institution Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="font-medium">Institution:</span> {cut.institution}
              </div>
              <div>
                <span className="font-medium">State:</span> {cut.state}
              </div>
              {cut.program_name && (
                <div>
                  <span className="font-medium">Program:</span> {cut.program_name}
                </div>
              )}
            </CardContent>
          </Card>

          {cut.source_url && (
            <Card>
              <CardHeader>
                <CardTitle>Source Information</CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href={cut.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  {cut.source_publication || "View Source"}
                  <ExternalLink className="h-4 w-4 ml-2" />
                </a>
              </CardContent>
            </Card>
          )}
        </div>

        {cut.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none">{cut.notes}</div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
