export type RoleCategory = {
  id: string;
  name: string;
  corporateTitles: string[];
  onetCodes: string[];
  programKeywords: string[];
  sector: string;
};

export const ROLE_CATEGORIES: RoleCategory[] = [
  {
    id: "computer-science",
    name: "Software Engineering & Computer Science",
    corporateTitles: ["Software Engineer", "Software Developer", "Full-Stack Engineer", "Backend Engineer", "Systems Architect"],
    onetCodes: ["15-1252.00", "15-1251.00", "15-1299.08"],
    programKeywords: ["computer science", "software engineering", "computer engineering", "programming", "computing", "information technology", "IT"],
    sector: "Technology",
  },
  {
    id: "data-science",
    name: "Data Science & Analytics",
    corporateTitles: ["Data Scientist", "Data Analyst", "Machine Learning Engineer", "Analytics Engineer", "Business Intelligence Analyst"],
    onetCodes: ["15-2051.00", "15-2041.00", "15-1221.00"],
    programKeywords: ["data science", "data analytics", "statistics", "statistical", "mathematics", "applied mathematics", "quantitative"],
    sector: "Technology",
  },
  {
    id: "nursing",
    name: "Nursing & Clinical Care",
    corporateTitles: ["Registered Nurse", "Clinical Nurse Specialist", "Nurse Practitioner", "Clinical Coordinator", "Healthcare Administrator"],
    onetCodes: ["29-1141.00", "29-1151.00", "29-1171.00"],
    programKeywords: ["nursing", "nurse", "clinical nursing", "bsn", "msn", "rn", "lpn"],
    sector: "Healthcare",
  },
  {
    id: "healthcare-admin",
    name: "Healthcare Administration & Management",
    corporateTitles: ["Healthcare Administrator", "Hospital Operations Manager", "Health Services Manager", "Revenue Cycle Manager", "Clinical Operations Director"],
    onetCodes: ["11-9111.00", "11-9111.02"],
    programKeywords: ["health administration", "healthcare administration", "health management", "health services", "public health", "health policy", "hospital administration"],
    sector: "Healthcare",
  },
  {
    id: "biomedical",
    name: "Biomedical & Life Sciences Research",
    corporateTitles: ["Biomedical Researcher", "Research Scientist", "Clinical Research Associate", "Biostatistician", "Lab Director"],
    onetCodes: ["19-1021.00", "19-1029.00", "19-1042.00"],
    programKeywords: ["biomedical", "biology", "biochemistry", "biotechnology", "life sciences", "molecular biology", "cell biology", "genetics", "microbiology"],
    sector: "Biotech / Life Sciences",
  },
  {
    id: "mechanical-engineering",
    name: "Mechanical & Aerospace Engineering",
    corporateTitles: ["Mechanical Engineer", "Aerospace Engineer", "Manufacturing Engineer", "Product Design Engineer", "Systems Engineer"],
    onetCodes: ["17-2141.00", "17-2011.00", "17-2112.00"],
    programKeywords: ["mechanical engineering", "aerospace engineering", "aeronautical", "industrial engineering", "manufacturing engineering", "materials science"],
    sector: "Engineering",
  },
  {
    id: "civil-engineering",
    name: "Civil & Environmental Engineering",
    corporateTitles: ["Civil Engineer", "Structural Engineer", "Environmental Engineer", "Transportation Engineer", "Infrastructure Planner"],
    onetCodes: ["17-2051.00", "17-2081.00"],
    programKeywords: ["civil engineering", "environmental engineering", "structural engineering", "construction management", "urban planning", "geotechnical"],
    sector: "Engineering",
  },
  {
    id: "electrical-engineering",
    name: "Electrical & Computer Engineering",
    corporateTitles: ["Electrical Engineer", "Hardware Engineer", "Embedded Systems Engineer", "Power Systems Engineer", "RF Engineer"],
    onetCodes: ["17-2071.00", "17-2061.00"],
    programKeywords: ["electrical engineering", "electronics engineering", "computer engineering", "embedded systems", "power systems", "telecommunications"],
    sector: "Engineering",
  },
  {
    id: "finance",
    name: "Finance & Quantitative Analysis",
    corporateTitles: ["Financial Analyst", "Investment Analyst", "Risk Analyst", "Quantitative Analyst", "Corporate Finance Manager", "Actuary"],
    onetCodes: ["13-2051.00", "13-2099.01", "15-2041.01"],
    programKeywords: ["finance", "financial economics", "accounting", "economics", "econometrics", "actuarial", "investment", "banking"],
    sector: "Financial Services",
  },
  {
    id: "supply-chain",
    name: "Supply Chain & Operations",
    corporateTitles: ["Supply Chain Manager", "Logistics Manager", "Operations Analyst", "Procurement Specialist", "Demand Planner"],
    onetCodes: ["11-3071.00", "13-1081.00", "11-3071.04"],
    programKeywords: ["supply chain", "logistics", "operations management", "industrial engineering", "transportation", "procurement", "distribution"],
    sector: "Operations",
  },
  {
    id: "cybersecurity",
    name: "Cybersecurity & Information Security",
    corporateTitles: ["Security Engineer", "Cybersecurity Analyst", "Information Security Manager", "Penetration Tester", "Security Architect"],
    onetCodes: ["15-1212.00", "15-1299.05"],
    programKeywords: ["cybersecurity", "information security", "network security", "computer security", "digital forensics", "information assurance"],
    sector: "Technology",
  },
  {
    id: "education",
    name: "Education & Curriculum Design",
    corporateTitles: ["Learning & Development Specialist", "Corporate Trainer", "Curriculum Designer", "Instructional Designer", "Training Manager"],
    onetCodes: ["25-9031.00", "13-1151.00", "27-3042.00"],
    programKeywords: ["education", "curriculum", "teaching", "pedagogy", "instructional design", "learning sciences", "educational technology"],
    sector: "Corporate L&D",
  },
  {
    id: "hr-management",
    name: "Human Resources & Organizational Development",
    corporateTitles: ["HR Business Partner", "Talent Acquisition Specialist", "Organizational Development Manager", "Compensation Analyst", "HRIS Analyst"],
    onetCodes: ["13-1071.00", "13-1141.00", "11-3121.00"],
    programKeywords: ["human resources", "industrial psychology", "organizational psychology", "organizational behavior", "workforce development", "HR management"],
    sector: "Human Resources",
  },
  {
    id: "accounting",
    name: "Accounting & Audit",
    corporateTitles: ["Staff Accountant", "CPA", "Internal Auditor", "Tax Analyst", "Controller", "CFO"],
    onetCodes: ["13-2011.00", "13-2011.01", "13-2011.02"],
    programKeywords: ["accounting", "auditing", "taxation", "forensic accounting", "cpa", "cma", "financial reporting"],
    sector: "Financial Services",
  },
  {
    id: "public-health",
    name: "Epidemiology & Public Health",
    corporateTitles: ["Epidemiologist", "Public Health Analyst", "Health Data Scientist", "Policy Research Analyst", "Population Health Manager"],
    onetCodes: ["19-1041.00", "21-1094.00"],
    programKeywords: ["public health", "epidemiology", "global health", "community health", "health promotion", "biostatistics", "environmental health"],
    sector: "Healthcare",
  },
  {
    id: "social-work",
    name: "Social Work & Behavioral Health",
    corporateTitles: ["Employee Assistance Program Counselor", "Behavioral Health Specialist", "Social Services Manager", "Community Relations Manager"],
    onetCodes: ["21-1021.00", "21-1023.00", "21-1022.00"],
    programKeywords: ["social work", "counseling", "social services", "mental health", "behavioral health", "clinical social work", "MSW"],
    sector: "Healthcare",
  },
  {
    id: "communications",
    name: "Marketing, Communications & PR",
    corporateTitles: ["Marketing Manager", "Communications Specialist", "PR Manager", "Brand Strategist", "Content Director", "Corporate Affairs Manager"],
    onetCodes: ["11-2011.00", "27-3031.00", "27-3043.00"],
    programKeywords: ["communications", "journalism", "public relations", "marketing", "media studies", "advertising", "strategic communication"],
    sector: "Marketing",
  },
];

export function mapProgramToRoles(programName: string, notes?: string): RoleCategory[] {
  if (!programName && !notes) return [];
  const text = `${programName || ""} ${notes || ""}`.toLowerCase();
  return ROLE_CATEGORIES.filter((role) =>
    role.programKeywords.some((kw) => text.includes(kw.toLowerCase()))
  );
}

export function getRoleById(id: string): RoleCategory | undefined {
  return ROLE_CATEGORIES.find((r) => r.id === id);
}

export function getRolesByIds(ids: string[]): RoleCategory[] {
  return ROLE_CATEGORIES.filter((r) => ids.includes(r.id));
}
