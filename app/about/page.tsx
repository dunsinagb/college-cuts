export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto prose dark:prose-invert">
        <h1>About CollegeCuts Tracker</h1>

        <p>
          CollegeCuts Tracker is a comprehensive, real-time database that monitors program cuts, department closures,
          and institutional changes across higher education institutions in the United States, started covering from
          2024.
        </p>

        <h2>Coverage Timeline</h2>
        <p>
          We began systematically tracking program cuts and institutional changes in 2024, as colleges and universities
          face mounting financial pressures, declining enrollment, and changing educational demands. Our database
          continues to grow as we document the ongoing transformation of higher education.
        </p>

        <h2>Data Sources</h2>
        <p>Our data is compiled from multiple public sources including:</p>
        <ul>
          <li>University and college official announcements and press releases</li>
          <li>Local and national news reports from verified journalism sources</li>
          <li>State higher education board communications and meeting minutes</li>
          <li>Accreditation body notifications and status changes</li>
          <li>Faculty senate minutes and internal communications</li>
          <li>Community submissions and verified tips from stakeholders</li>
        </ul>

        <h2>Methodology</h2>
        <p>
          We verify all reported cuts through multiple sources when possible and categorize them into the following
          types:
        </p>
        <ul>
          <li>
            <strong>Program Suspension:</strong> Temporary halt of new admissions with potential for reinstatement
          </li>
          <li>
            <strong>Teach Out:</strong> Program closure with current students allowed to complete their degrees
          </li>
          <li>
            <strong>Department Closure:</strong> Entire academic department elimination affecting multiple programs
          </li>
          <li>
            <strong>Campus Closure:</strong> Physical campus or branch location closure
          </li>
          <li>
            <strong>Institution Closure:</strong> Complete institutional shutdown or merger
          </li>
        </ul>

        <h2>Real-Time Updates</h2>
        <p>
          Our database is updated continuously as new information becomes available. We prioritize accuracy and
          verification while maintaining the timeliness needed to keep stakeholders informed of rapidly changing
          situations.
        </p>

        <h2>Impact Tracking</h2>
        <p>Beyond just tracking cuts, we monitor the broader impact including:</p>
        <ul>
          <li>Student enrollment numbers affected</li>
          <li>Faculty and staff job losses</li>
          <li>Community economic impact</li>
          <li>Regional educational access changes</li>
        </ul>

        <h2>Data Transparency</h2>
        <p>
          All data in our database is publicly accessible through our Supabase backend with appropriate security
          policies to ensure data integrity while maintaining complete transparency about our sources and methodology.
        </p>

        <h2>Community Contributions</h2>
        <p>
          Have information about a program cut or closure? We rely on community input to maintain comprehensive
          coverage. Please use our <a href="/submit-tip">online submission form</a> to share verified information.
        </p>

        <p>
          For media inquiries, data partnerships, or general questions, contact us at{" "}
          <a href="mailto:info@collegecuts.com">info@collegecuts.com</a>
        </p>

        <h2>Newsletter</h2>
        <p>
          Stay informed with our weekly newsletter featuring the latest cuts, trend analysis, and impact assessments.
          Subscribe on our homepage to receive updates directly in your inbox.
        </p>

        <h2>Disclaimer</h2>
        <p>
          While we strive for accuracy and completeness, information may not be fully current due to the rapidly
          changing nature of institutional decisions. Always verify with official institutional sources for the most
          up-to-date information regarding program availability and institutional status. This tracker is for
          informational purposes and should not be the sole source for academic or career planning decisions.
        </p>

        <p className="text-sm text-muted-foreground mt-8">
          Last updated: January 2025 • Data coverage: Started from 2024
        </p>
      </div>
    </div>
  )
}
