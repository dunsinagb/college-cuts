/**
 * Shared BLS / SOC crosswalk data used by both job-outlook and skills-gap routes.
 * Single source of truth for major→SOC mappings and growth rates.
 */

/* ---------- major → SOC crosswalk ---------- */
export const MAJOR_SOC_MAP: Record<string, { soc: string; title: string }[]> = {
  "computer science": [
    { soc: "15-1251", title: "Software Developers" },
    { soc: "15-1252", title: "Software Quality Assurance Analysts and Testers" },
    { soc: "15-1212", title: "Information Security Analysts" },
    { soc: "15-1241", title: "Computer Network Architects" },
    { soc: "15-1244", title: "Network and Computer Systems Administrators" },
  ],
  "information technology": [
    { soc: "15-1244", title: "Network and Computer Systems Administrators" },
    { soc: "15-1232", title: "Computer User Support Specialists" },
    { soc: "15-1251", title: "Software Developers" },
    { soc: "15-1212", title: "Information Security Analysts" },
  ],
  "data science": [
    { soc: "15-2041", title: "Statisticians" },
    { soc: "15-2051", title: "Data Scientists" },
    { soc: "15-1221", title: "Computer and Information Research Scientists" },
    { soc: "15-2031", title: "Operations Research Analysts" },
  ],
  "mathematics": [
    { soc: "15-2041", title: "Statisticians" },
    { soc: "15-2031", title: "Operations Research Analysts" },
    { soc: "25-1022", title: "Mathematical Science Teachers, Postsecondary" },
    { soc: "15-2011", title: "Actuaries" },
  ],
  "statistics": [
    { soc: "15-2041", title: "Statisticians" },
    { soc: "15-2031", title: "Operations Research Analysts" },
    { soc: "15-2051", title: "Data Scientists" },
  ],
  "nursing": [
    { soc: "29-1141", title: "Registered Nurses" },
    { soc: "29-1171", title: "Nurse Practitioners" },
    { soc: "29-1151", title: "Nurse Anesthetists" },
    { soc: "29-2061", title: "Licensed Practical and Licensed Vocational Nurses" },
  ],
  "medicine": [
    { soc: "29-1216", title: "General Internal Medicine Physicians" },
    { soc: "29-1215", title: "Family Medicine Physicians" },
    { soc: "29-1141", title: "Registered Nurses" },
    { soc: "29-1071", title: "Physician Assistants" },
  ],
  "public health": [
    { soc: "29-9099", title: "Healthcare Practitioners and Technical Workers, All Other" },
    { soc: "13-1111", title: "Management Analysts" },
    { soc: "19-1042", title: "Medical Scientists, Except Epidemiologists" },
    { soc: "19-1041", title: "Epidemiologists" },
  ],
  "biology": [
    { soc: "19-1042", title: "Medical Scientists, Except Epidemiologists" },
    { soc: "19-1021", title: "Biochemists and Biophysicists" },
    { soc: "19-1022", title: "Microbiologists" },
    { soc: "29-1216", title: "General Internal Medicine Physicians" },
  ],
  "chemistry": [
    { soc: "19-2031", title: "Chemists" },
    { soc: "19-2032", title: "Materials Scientists" },
    { soc: "17-2081", title: "Environmental Engineers" },
    { soc: "19-1042", title: "Medical Scientists, Except Epidemiologists" },
  ],
  "physics": [
    { soc: "19-2012", title: "Physicists" },
    { soc: "19-2011", title: "Astronomers" },
    { soc: "17-2071", title: "Electrical and Electronics Engineers" },
    { soc: "15-1221", title: "Computer and Information Research Scientists" },
  ],
  "engineering": [
    { soc: "17-2141", title: "Mechanical Engineers" },
    { soc: "17-2051", title: "Civil Engineers" },
    { soc: "17-2071", title: "Electrical and Electronics Engineers" },
    { soc: "17-2112", title: "Industrial Engineers" },
  ],
  "mechanical engineering": [
    { soc: "17-2141", title: "Mechanical Engineers" },
    { soc: "17-2112", title: "Industrial Engineers" },
    { soc: "17-2011", title: "Aerospace Engineers" },
  ],
  "civil engineering": [
    { soc: "17-2051", title: "Civil Engineers" },
    { soc: "17-2081", title: "Environmental Engineers" },
    { soc: "17-1022", title: "Surveyors" },
  ],
  "electrical engineering": [
    { soc: "17-2071", title: "Electrical and Electronics Engineers" },
    { soc: "17-2072", title: "Electronics Engineers, Except Computer" },
    { soc: "15-1241", title: "Computer Network Architects" },
  ],
  "business administration": [
    { soc: "11-1021", title: "General and Operations Managers" },
    { soc: "13-2051", title: "Financial and Investment Analysts" },
    { soc: "13-1111", title: "Management Analysts" },
    { soc: "11-2021", title: "Marketing Managers" },
  ],
  "business": [
    { soc: "11-1021", title: "General and Operations Managers" },
    { soc: "13-2051", title: "Financial and Investment Analysts" },
    { soc: "13-1111", title: "Management Analysts" },
    { soc: "11-3031", title: "Financial Managers" },
  ],
  "economics": [
    { soc: "19-3011", title: "Economists" },
    { soc: "13-2051", title: "Financial and Investment Analysts" },
    { soc: "13-2052", title: "Personal Financial Advisors" },
    { soc: "15-2031", title: "Operations Research Analysts" },
  ],
  "finance": [
    { soc: "13-2051", title: "Financial and Investment Analysts" },
    { soc: "11-3031", title: "Financial Managers" },
    { soc: "13-2052", title: "Personal Financial Advisors" },
    { soc: "13-2011", title: "Accountants and Auditors" },
  ],
  "accounting": [
    { soc: "13-2011", title: "Accountants and Auditors" },
    { soc: "11-3031", title: "Financial Managers" },
    { soc: "13-2082", title: "Tax Preparers" },
  ],
  "psychology": [
    { soc: "19-3031", title: "Clinical and Counseling Psychologists" },
    { soc: "21-1014", title: "Mental Health Counselors" },
    { soc: "19-3032", title: "Industrial-Organizational Psychologists" },
    { soc: "21-1012", title: "Educational, Guidance, and Career Counselors and Advisors" },
  ],
  "social work": [
    { soc: "21-1022", title: "Healthcare Social Workers" },
    { soc: "21-1023", title: "Mental Health and Substance Abuse Social Workers" },
    { soc: "21-1021", title: "Child, Family, and School Social Workers" },
  ],
  "education": [
    { soc: "25-2021", title: "Elementary School Teachers, Except Special Education" },
    { soc: "25-2031", title: "Secondary School Teachers, Except Special and Career/Technical Education" },
    { soc: "25-2051", title: "Special Education Teachers, Preschool" },
    { soc: "11-9032", title: "Education Administrators, Kindergarten through Secondary" },
  ],
  "english": [
    { soc: "27-3041", title: "Editors" },
    { soc: "27-3043", title: "Writers and Authors" },
    { soc: "25-1123", title: "English Language and Literature Teachers, Postsecondary" },
    { soc: "27-3031", title: "Public Relations Specialists" },
  ],
  "communications": [
    { soc: "27-3031", title: "Public Relations Specialists" },
    { soc: "27-3041", title: "Editors" },
    { soc: "27-3023", title: "News Analysts, Reporters, and Journalists" },
    { soc: "11-2011", title: "Advertising and Promotions Managers" },
  ],
  "journalism": [
    { soc: "27-3023", title: "News Analysts, Reporters, and Journalists" },
    { soc: "27-3041", title: "Editors" },
    { soc: "27-3043", title: "Writers and Authors" },
  ],
  "art": [
    { soc: "27-1024", title: "Graphic Designers" },
    { soc: "27-1011", title: "Art Directors" },
    { soc: "27-1013", title: "Fine Artists, Including Painters, Sculptors, and Illustrators" },
    { soc: "27-1025", title: "Interior Designers" },
  ],
  "graphic design": [
    { soc: "27-1024", title: "Graphic Designers" },
    { soc: "27-1011", title: "Art Directors" },
    { soc: "27-3043", title: "Writers and Authors" },
  ],
  "music": [
    { soc: "27-2041", title: "Music Directors and Composers" },
    { soc: "27-2042", title: "Musicians and Singers" },
    { soc: "25-1121", title: "Art, Drama, and Music Teachers, Postsecondary" },
  ],
  "history": [
    { soc: "25-4022", title: "Archivists" },
    { soc: "19-3093", title: "Historians" },
    { soc: "25-1125", title: "History Teachers, Postsecondary" },
    { soc: "27-3043", title: "Writers and Authors" },
  ],
  "political science": [
    { soc: "23-1011", title: "Lawyers" },
    { soc: "11-1031", title: "Legislators" },
    { soc: "19-3094", title: "Political Scientists" },
    { soc: "13-1041", title: "Compliance Officers" },
  ],
  "law": [
    { soc: "23-1011", title: "Lawyers" },
    { soc: "23-2011", title: "Paralegals and Legal Assistants" },
    { soc: "23-1021", title: "Administrative Law Judges, Adjudicators, and Hearing Officers" },
  ],
  "philosophy": [
    { soc: "23-1011", title: "Lawyers" },
    { soc: "25-1126", title: "Philosophy and Religion Teachers, Postsecondary" },
    { soc: "19-3094", title: "Political Scientists" },
  ],
  "sociology": [
    { soc: "19-3041", title: "Sociologists" },
    { soc: "21-1021", title: "Child, Family, and School Social Workers" },
    { soc: "13-1111", title: "Management Analysts" },
  ],
  "anthropology": [
    { soc: "19-3091", title: "Anthropologists and Archeologists" },
    { soc: "25-4022", title: "Archivists" },
    { soc: "19-3094", title: "Political Scientists" },
  ],
  "environmental science": [
    { soc: "19-2041", title: "Environmental Scientists and Specialists, Including Health" },
    { soc: "17-2081", title: "Environmental Engineers" },
    { soc: "19-1031", title: "Conservation Scientists" },
  ],
  "architecture": [
    { soc: "17-1011", title: "Architects, Except Landscape and Naval" },
    { soc: "17-1012", title: "Landscape Architects" },
    { soc: "17-3011", title: "Architectural and Civil Drafters" },
  ],
  "criminal justice": [
    { soc: "33-3051", title: "Police and Sheriff's Patrol Officers" },
    { soc: "33-1011", title: "First-Line Supervisors of Correctional Officers" },
    { soc: "13-1041", title: "Compliance Officers" },
    { soc: "23-1011", title: "Lawyers" },
  ],
  "social science": [
    { soc: "19-3094", title: "Political Scientists" },
    { soc: "19-3041", title: "Sociologists" },
    { soc: "19-3011", title: "Economists" },
    { soc: "19-3091", title: "Anthropologists and Archeologists" },
  ],
  "healthcare": [
    { soc: "29-1141", title: "Registered Nurses" },
    { soc: "29-1071", title: "Physician Assistants" },
    { soc: "29-2061", title: "Licensed Practical and Licensed Vocational Nurses" },
    { soc: "29-1216", title: "General Internal Medicine Physicians" },
  ],
  "physical therapy": [
    { soc: "29-1123", title: "Physical Therapists" },
    { soc: "31-2021", title: "Physical Therapist Assistants" },
  ],
  "occupational therapy": [
    { soc: "29-1122", title: "Occupational Therapists" },
    { soc: "31-2011", title: "Occupational Therapy Assistants" },
  ],
  "theater": [
    { soc: "27-2011", title: "Actors" },
    { soc: "27-2012", title: "Producers and Directors" },
    { soc: "25-1121", title: "Art, Drama, and Music Teachers, Postsecondary" },
  ],
  "film": [
    { soc: "27-2012", title: "Producers and Directors" },
    { soc: "27-4032", title: "Film and Video Editors" },
    { soc: "27-4031", title: "Camera Operators, Television, Video, and Film" },
  ],
};

/* ---------- 2024 BLS OES national mean annual wages by SOC code ---------- */
export const BLS_2024_WAGES: Record<string, number> = {
  "15-1251": 130160, "15-1252": 107750, "15-1212": 120360, "15-1241": 126900,
  "15-1244": 95360,  "15-1232": 62760,  "15-1221": 145080, "15-2041": 104860,
  "15-2051": 112590, "15-2031": 91270,  "15-2011": 120000, "15-1211": 105090,
  "29-1141": 89010,  "29-1171": 124680, "29-1151": 214060, "29-2061": 59730,
  "29-1216": 223410, "29-1215": 234000, "29-1071": 130020, "29-1123": 99710,
  "29-1122": 94620,  "29-1041": 78530,  "29-1042": 105600, "29-1021": 108890,
  "29-1022": 88540,  "29-1031": 135620,
  "13-2011": 83580,  "13-2051": 108790, "13-2052": 132660, "13-2082": 50940,
  "11-1021": 130560, "11-3031": 166050, "11-2021": 157620, "13-1111": 99400,
  "13-1041": 77890,
  "19-3011": 119490, "17-2051": 98130,  "17-2071": 107890, "17-2141": 99510,
  "17-2112": 99660,  "17-2011": 132590, "17-2081": 100090, "17-1011": 98580,
  "17-1012": 77810,  "17-3011": 62590,
  "19-2031": 86560,  "19-2032": 108850, "19-2041": 78980,  "19-2012": 147850,
  "19-1031": 67390,  "19-1042": 105600, "19-1021": 108890, "19-1022": 88540,
  "19-1041": 78530,
  "25-2021": 64020,  "25-2031": 68020,  "25-2051": 65840,  "11-9032": 102340,
  "25-1022": 82180,  "25-1123": 82640,  "25-1125": 89490,  "25-1126": 79270,
  "25-1121": 88020,
  "19-3031": 96100,  "19-3032": 147420, "21-1014": 56960,  "21-1012": 62520,
  "21-1021": 54350,  "21-1022": 59190,  "21-1023": 53990,
  "19-3041": 95510,  "19-3091": 72140,  "19-3093": 67300,  "19-3094": 128020,
  "27-3041": 72640,  "27-3043": 73700,  "27-3023": 60170,  "27-3031": 72440,
  "27-1024": 60510,  "27-1011": 105180, "27-1013": 55430,  "27-1025": 65400,
  "27-2011": 40000,  "27-2012": 80240,  "27-2041": 78400,  "27-4032": 64610,
  "27-4031": 63200,
  "23-1011": 145760, "23-2011": 62550,  "23-1021": 95700,
  "33-3051": 68160,  "33-1011": 78190,
  "25-4022": 60440,  "11-1031": 165430, "31-2021": 62770,  "31-2011": 68160,
};

/* ---------- 2024 BLS employment levels ---------- */
export const BLS_2024_EMPLOYMENT: Record<string, number> = {
  "15-1251": 1847900, "15-1252": 265200, "15-1212": 168350, "15-1241": 167300,
  "15-1244": 314900,  "15-1232": 715500, "15-2041": 45700,  "15-2051": 199100,
  "29-1141": 3177400, "29-1171": 355700, "29-2061": 728800, "29-1123": 230700,
  "29-1122": 146800,
  "13-2011": 1457500, "13-2051": 316700, "11-1021": 3337300, "11-3031": 726800,
  "19-3011": 21700,   "17-2051": 309800, "17-2071": 193800, "17-2141": 294700,
  "25-2021": 1394300, "25-2031": 1076400, "19-3031": 48600, "21-1014": 373600,
  "23-1011": 813900,  "33-3051": 706400,
};

/* ── Growth rate by SOC code (BLS Employment Projections 2022–2032) ── */
export function getGrowthRate(soc: string): number {
  const prefix = parseInt(soc.slice(0, 2), 10);
  if (soc.startsWith("15-2051")) return 35;
  if (soc.startsWith("15-1212")) return 33;
  if (soc.startsWith("15-1251")) return 26;
  if (soc.startsWith("29-1171")) return 45;
  if (soc.startsWith("29-1151")) return 38;
  if (soc.startsWith("29-1071")) return 28;
  if (soc.startsWith("21-1014")) return 22;
  if (prefix === 15) return 15;
  if (prefix === 29) return 6;
  if (prefix === 17) return 4;
  if (prefix === 13) return 5;
  if (prefix === 11) return 3;
  if (prefix === 25) return 2;
  return 5;
}

export function getBLSWage(soc: string, title: string): number {
  return BLS_2024_WAGES[soc] ?? getPlaceholderWage(title);
}

export function getBLSEmployment(soc: string): number {
  return BLS_2024_EMPLOYMENT[soc] ?? getPlaceholderEmployment(soc);
}

export function findSocsForMajor(major: string): { soc: string; title: string }[] {
  const key = major.toLowerCase().trim();
  if (MAJOR_SOC_MAP[key]) return MAJOR_SOC_MAP[key];
  const match = Object.entries(MAJOR_SOC_MAP).find(([k]) => k.includes(key) || key.includes(k));
  return match ? match[1] : [];
}

function getPlaceholderWage(title: string): number {
  const t = title.toLowerCase();
  if (t.includes("physician") || t.includes("surgeon") || t.includes("anesthes")) return 220000;
  if (t.includes("lawyer") || t.includes("attorney")) return 135000;
  if (t.includes("software") || t.includes("developer")) return 127000;
  if (t.includes("data scientist") || t.includes("machine learning")) return 122000;
  if (t.includes("engineer") && (t.includes("electrical") || t.includes("computer"))) return 105000;
  if (t.includes("engineer")) return 96000;
  if (t.includes("nurse practitioner") || t.includes("nurse anesthetist")) return 121000;
  if (t.includes("registered nurs")) return 82000;
  if (t.includes("physical therapist") && !t.includes("assistant")) return 95000;
  if (t.includes("accountant") || t.includes("auditor")) return 79000;
  if (t.includes("financial") && t.includes("analyst")) return 96000;
  if (t.includes("manager")) return 98000;
  if (t.includes("economist")) return 115000;
  if (t.includes("statistician") || t.includes("actuar")) return 104000;
  if (t.includes("teacher") || t.includes("postsecondary")) return 82000;
  if (t.includes("social worker")) return 52000;
  if (t.includes("police") || t.includes("detective")) return 66000;
  if (t.includes("graphic design")) return 57000;
  if (t.includes("journalist") || t.includes("reporter")) return 55000;
  if (t.includes("historian") || t.includes("archivist")) return 57000;
  return 62000;
}

function getPlaceholderEmployment(soc: string): number {
  const prefix = parseInt(soc.slice(0, 2), 10);
  if (prefix === 15) return 1800000;
  if (prefix === 17) return 2900000;
  if (prefix === 25) return 1700000;
  if (prefix === 29) return 3500000;
  if (prefix === 11) return 3600000;
  if (prefix === 13) return 2100000;
  if (prefix === 19) return 600000;
  if (prefix === 21) return 900000;
  if (prefix === 23) return 800000;
  if (prefix === 27) return 700000;
  if (prefix === 33) return 1100000;
  return 500000;
}

export function getPlaceholderEducation(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("physician") || t.includes("surgeon") || t.includes("psychiatrist")) return "Doctoral or professional degree";
  if (t.includes("lawyer") || t.includes("attorney") || t.includes("judge")) return "Professional degree";
  if (t.includes("nurse practitioner") || t.includes("nurse anesthetist")) return "Master's degree";
  if (t.includes("physical therapist") || t.includes("occupational therapist")) return "Doctoral or professional degree";
  if (t.includes("statistician") || t.includes("economist") || t.includes("psychologist") || t.includes("scientist")) return "Master's degree";
  if (t.includes("postsecondary") || t.includes("professor")) return "Doctoral or professional degree";
  return "Bachelor's degree";
}
