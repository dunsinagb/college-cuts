import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Database, 
  TrendingUp, 
  Users, 
  Globe, 
  Shield, 
  Mail, 
  Calendar,
  FileText,
  CheckCircle,
  AlertTriangle
} from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            About CollegeCuts Tracker
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A comprehensive, real-time database monitoring program cuts, department closures, 
            and institutional changes across higher education institutions in the United States.
          </p>
          <div className="flex justify-center gap-2 mt-4">
            <Badge variant="secondary" className="text-sm">
              <Calendar className="w-3 h-3 mr-1" />
              Coverage from 2024
            </Badge>
            <Badge variant="secondary" className="text-sm">
              <Database className="w-3 h-3 mr-1" />
              Real-time Updates
            </Badge>
            <Badge variant="secondary" className="text-sm">
              <Shield className="w-3 h-3 mr-1" />
              Verified Data
            </Badge>
          </div>
        </div>

        {/* Mission & Coverage */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                We began systematically tracking program cuts and institutional changes in 2024, 
                as colleges and universities face mounting financial pressures, declining enrollment, 
                and changing educational demands.
              </p>
              <p className="text-muted-foreground">
                Our database continues to grow as we document the ongoing transformation of higher education, 
                providing transparency and insights for students, faculty, and stakeholders.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-green-600" />
                Coverage Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <span className="text-sm">2024 - Present: Active monitoring</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  <span className="text-sm">Real-time updates and verification</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                  <span className="text-sm">Comprehensive data collection</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Sources */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              Data Sources & Methodology
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Our Data Sources</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    University and college official announcements
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    Local and national news reports
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    State higher education board communications
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    Accreditation body notifications
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    Faculty senate minutes and internal communications
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    Community submissions and verified tips
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Cut Categories</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="font-medium text-sm">Program Suspension</div>
                    <div className="text-xs text-muted-foreground">Temporary halt with potential reinstatement</div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="font-medium text-sm">Teach Out</div>
                    <div className="text-xs text-muted-foreground">Closure with current students completing degrees</div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="font-medium text-sm">Department Closure</div>
                    <div className="text-xs text-muted-foreground">Entire academic department elimination</div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="font-medium text-sm">Campus/Institution Closure</div>
                    <div className="text-xs text-muted-foreground">Physical campus or complete institutional shutdown</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Impact Tracking */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-red-600" />
              Impact Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Beyond just tracking cuts, we monitor the broader impact including:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-2">Students</div>
                <div className="text-sm text-muted-foreground">Enrollment numbers affected</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-2">Faculty</div>
                <div className="text-sm text-muted-foreground">Job losses and transitions</div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-2">Community</div>
                <div className="text-sm text-muted-foreground">Economic impact assessment</div>
              </div>
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="text-2xl font-bold text-orange-600 mb-2">Access</div>
                <div className="text-sm text-muted-foreground">Regional educational access changes</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact & Community */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                Contact & Contributions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Have information about a program cut or closure? We rely on community input to maintain comprehensive coverage.
              </p>
              <div className="space-y-3">
                <Link 
                  href="/submit-tip" 
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Submit a Tip →
                </Link>
                <div className="text-sm text-muted-foreground">
                  For media inquiries, data partnerships, or general questions, contact us at{" "}
                  <a href="mailto:agbolaboridunsin@gmail.com" className="text-blue-600 hover:underline">
                    agbolaboridunsin@gmail.com
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                Data Transparency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                All data in our database is publicly accessible through our Supabase backend with appropriate 
                security policies to ensure data integrity while maintaining complete transparency about our 
                sources and methodology.
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Verified sources only
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Disclaimer */}
        <Card className="border-orange-200 dark:border-orange-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
              <AlertTriangle className="w-5 h-5" />
              Important Disclaimer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              While we strive for accuracy and completeness, information may not be fully current due to the rapidly 
              changing nature of institutional decisions. Always verify with official institutional sources for the 
              most up-to-date information regarding program availability and institutional status. This tracker is 
              for informational purposes and should not be the sole source for academic or career planning decisions.
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t">
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} • Data coverage: Started from 2024
          </p>
        </div>
      </div>
    </div>
  )
}
