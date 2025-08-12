import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

interface Resource {
  title: string
  url: string
  description: string
  state?: string
  stateName?: string
  institution?: string
  actionType?: string
  primaryReason?: string
  relevanceScore?: number
  source?: string
  searchQuery?: string
}

interface ResourceRequest {
  institution: string
  state: string
  actionType: string
  actionId?: string
  notes?: string
  announcementDate?: string
}

export async function POST(request: NextRequest) {
  try {
    const { institution, state, actionType, actionId, notes, announcementDate }: ResourceRequest = await request.json()
    
    // Check if this is a July 2025+ action
    const isJuly2025Plus = announcementDate && new Date(announcementDate) >= new Date('2025-07-01')
    
    if (!isJuly2025Plus) {
      // For actions before July 2025, return empty resources (no resources section)
      return NextResponse.json({
        transferAssistance: [],
        careerCounseling: [],
        legalAid: [],
        mentalHealth: [],
        financialAid: [],
        academicSupport: []
      })
    }
    
    // Try to load contextual resources first
    let resources = await loadContextualResources(actionId)
    
    // If no contextual resources, fall back to general resources
    if (!resources || Object.values(resources).every(arr => arr.length === 0)) {
      resources = await loadGeneralResources()
    }
    
    // Filter resources based on relevance
    const filteredResources = filterResourcesByRelevance(resources, institution, state, actionType, notes)
    
    return NextResponse.json(filteredResources)
  } catch (error) {
    console.error('Error serving resources:', error)
    return NextResponse.json({ error: 'Failed to load resources' }, { status: 500 })
  }
}

async function loadContextualResources(actionId?: string): Promise<Record<string, Resource[]> | null> {
  if (!actionId) return null
  
  try {
    const contextualDir = path.join(process.cwd(), 'data', 'contextual')
    const files = await fs.readdir(contextualDir)
    
    // Find the most recent contextual resources for this action
    const actionFiles = files.filter(file => file.startsWith(`action-${actionId}-resources-`))
    if (actionFiles.length === 0) {
      return null
    }
    
    const latestFile = actionFiles.sort().pop()!
    const filePath = path.join(contextualDir, latestFile)
    const fileContent = await fs.readFile(filePath, 'utf-8')
    
    return JSON.parse(fileContent)
  } catch (error) {
    console.error('Error loading contextual resources:', error)
    return null
  }
}

async function loadGeneralResources(): Promise<Record<string, Resource[]>> {
  try {
    const dataDir = path.join(process.cwd(), 'data')
    const files = await fs.readdir(dataDir)
    
    // Find the most recent all-resources file
    const resourceFiles = files.filter(file => file.startsWith('all-resources-'))
    if (resourceFiles.length === 0) {
      return getFallbackResources()
    }
    
    const latestFile = resourceFiles.sort().pop()!
    const filePath = path.join(dataDir, latestFile)
    const fileContent = await fs.readFile(filePath, 'utf-8')
    
    return JSON.parse(fileContent)
  } catch (error) {
    console.error('Error loading general resources:', error)
    return getFallbackResources()
  }
}

function filterResourcesByRelevance(
  resources: Record<string, Resource[]>, 
  institution: string, 
  state: string, 
  actionType: string,
  notes?: string
): Record<string, Resource[]> {
  const filtered: Record<string, Resource[]> = {}
  const primaryReason = categorizePrimaryReason(notes)
  
  for (const [category, resourceList] of Object.entries(resources)) {
    filtered[category] = resourceList
      .filter(resource => {
        // Check state relevance
        const isStateRelevant = !resource.state || 
          resource.state.toLowerCase() === state.toLowerCase()
        
        // Check institution relevance
        const isInstitutionRelevant = !resource.institution || 
          resource.institution.toLowerCase().includes(institution.toLowerCase()) ||
          institution.toLowerCase().includes(resource.institution.toLowerCase())
        
        // Check action type relevance
        const isActionRelevant = isRelevantToActionType(resource, actionType)
        
        // Check primary reason relevance
        const isReasonRelevant = isRelevantToPrimaryReason(resource, primaryReason)
        
        return isStateRelevant || isInstitutionRelevant || isActionRelevant || isReasonRelevant
      })
      .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
      .slice(0, 8); // Keep top 8 most relevant
  }
  
  return filtered
}

function categorizePrimaryReason(notes?: string): string {
  if (!notes) return 'Budget Deficit';
  
  const notesLower = notes.toLowerCase();
  
  const primaryReasonKeywords = {
    'Budget Deficit': ['budget deficit', 'financial crisis', 'budget cuts', 'financial shortfall', 'deficit reduction'],
    'Federal Funding Cuts': ['federal funding', 'federal cuts', 'government funding', 'federal budget'],
    'State Mandates': ['state mandate', 'state requirement', 'state law', 'legislation', 'state policy'],
    'Enrollment Decline': ['enrollment decline', 'declining enrollment', 'low enrollment', 'student decline'],
    'Strategic Restructuring': ['strategic', 'restructuring', 'realignment', 'mission alignment'],
    'Political Pressure': ['political pressure', 'political', 'controversy', 'public pressure'],
    'Operational Costs': ['operational costs', 'rising costs', 'cost constraints', 'operational expenses'],
    'Financial Mismanagement': ['mismanagement', 'financial irregularities', 'misuse of funds'],
    'Accreditation Issues': ['accreditation', 'probation', 'accreditation problems']
  };
  
  for (const [reason, keywords] of Object.entries(primaryReasonKeywords)) {
    if (keywords.some(keyword => notesLower.includes(keyword))) {
      return reason;
    }
  }
  
  return 'Budget Deficit';
}

function isRelevantToActionType(resource: Resource, actionType: string): boolean {
  const actionKeywords = {
    'program_suspension': ['transfer', 'alternative', 'suspension', 'program'],
    'department_closure': ['transfer', 'career', 'closure', 'alternative', 'department'],
    'campus_closure': ['transfer', 'closure', 'alternative', 'relocation', 'campus'],
    'institution_closure': ['transfer', 'closure', 'alternative', 'relocation', 'institution'],
    'staff_layoff': ['career', 'employment', 'job', 'layoff', 'staff'],
    'teach_out': ['transfer', 'completion', 'teach-out', 'graduation']
  };
  
  const keywords = actionKeywords[actionType as keyof typeof actionKeywords] || [];
  const resourceText = `${resource.title} ${resource.description}`.toLowerCase();
  
  return keywords.some(keyword => resourceText.includes(keyword));
}

function isRelevantToPrimaryReason(resource: Resource, primaryReason: string): boolean {
  const primaryReasonKeywords = {
    'Budget Deficit': ['budget', 'financial', 'deficit', 'funding', 'cost'],
    'Federal Funding Cuts': ['federal', 'government', 'funding', 'grants'],
    'State Mandates': ['state', 'mandate', 'law', 'legislation', 'policy'],
    'Enrollment Decline': ['enrollment', 'students', 'decline', 'admissions'],
    'Strategic Restructuring': ['strategic', 'restructuring', 'realignment', 'mission'],
    'Political Pressure': ['political', 'controversy', 'pressure', 'public'],
    'Operational Costs': ['operational', 'costs', 'expenses', 'efficiency'],
    'Financial Mismanagement': ['mismanagement', 'irregularities', 'misuse'],
    'Accreditation Issues': ['accreditation', 'probation', 'standards']
  };
  
  const keywords = primaryReasonKeywords[primaryReason as keyof typeof primaryReasonKeywords] || [];
  const resourceText = `${resource.title} ${resource.description}`.toLowerCase();
  
  return keywords.some(keyword => resourceText.includes(keyword));
}

function getFallbackResources(): Record<string, Resource[]> {
  return {
    transferAssistance: [
      {
        title: 'National Student Clearinghouse',
        url: 'https://www.studentclearinghouse.org/colleges/transfer',
        description: 'Official transfer verification and student record services',
        source: 'National Organization',
        relevanceScore: 5
      },
      {
        title: 'Transferology',
        url: 'https://www.transferology.com',
        description: 'Course equivalency and transfer pathway planning platform',
        source: 'Educational Technology',
        relevanceScore: 5
      },
      {
        title: 'College Navigator',
        url: 'https://nces.ed.gov/collegenavigator',
        description: 'Federal tool for finding and comparing colleges',
        source: 'Department of Education',
        relevanceScore: 4
      },
      {
        title: 'Transfer Credit Evaluation Services',
        url: 'https://www.naces.org',
        description: 'Professional credential evaluation for transfer students',
        source: 'Professional Association',
        relevanceScore: 4
      }
    ],
    careerCounseling: [
      {
        title: 'National Career Development Association',
        url: 'https://www.ncda.org',
        description: 'Professional career counseling resources and guidance for career transitions',
        source: 'Professional Organization',
        relevanceScore: 5
      },
      {
        title: 'CareerOneStop',
        url: 'https://www.careeronestop.org',
        description: 'Federal career resources and job search assistance',
        source: 'Department of Labor',
        relevanceScore: 5
      },
      {
        title: 'O*NET Interest Profiler',
        url: 'https://www.mynextmove.org/explore/ip',
        description: 'Career exploration and skills assessment tool',
        source: 'Department of Labor',
        relevanceScore: 4
      },
      {
        title: 'Career Transitions for Faculty',
        url: 'https://versatilephd.com',
        description: 'Career transition resources specifically for academic professionals',
        source: 'Career Services',
        relevanceScore: 4
      }
    ],
    legalAid: [
      {
        title: 'Student Borrower Protection Center',
        url: 'https://protectborrowers.org',
        description: 'Legal advocacy and resources for student loan borrowers',
        source: 'Non-profit Organization',
        relevanceScore: 5
      },
      {
        title: 'Legal Aid Society',
        url: 'https://www.lsc.gov/find-legal-aid',
        description: 'Find free legal aid in your area for education-related issues',
        source: 'Legal Services Corporation',
        relevanceScore: 5
      },
      {
        title: 'National Association of Consumer Advocates',
        url: 'https://www.naca.net',
        description: 'Consumer protection lawyers for education fraud cases',
        source: 'Professional Association',
        relevanceScore: 4
      },
      {
        title: 'Student Defense',
        url: 'https://www.studentdefense.org',
        description: 'Legal assistance for students defrauded by their schools',
        source: 'Non-profit Organization',
        relevanceScore: 4
      }
    ],
    mentalHealth: [
      {
        title: 'National Alliance on Mental Illness',
        url: 'https://www.nami.org',
        description: 'Mental health support, education, and advocacy resources',
        source: 'Non-profit Organization',
        relevanceScore: 5
      },
      {
        title: 'Crisis Text Line',
        url: 'https://www.crisistextline.org',
        description: '24/7 crisis support via text message (Text HOME to 741741)',
        source: 'Crisis Support',
        relevanceScore: 5
      },
      {
        title: 'National Suicide Prevention Lifeline',
        url: 'https://988lifeline.org',
        description: '24/7 suicide prevention and crisis intervention (Call 988)',
        source: 'Federal Government',
        relevanceScore: 5
      },
      {
        title: 'Mental Health America',
        url: 'https://www.mhanational.org',
        description: 'Mental health screening tools and local resources',
        source: 'Non-profit Organization',
        relevanceScore: 4
      },
      {
        title: 'BetterHelp',
        url: 'https://www.betterhelp.com',
        description: 'Online professional counseling and therapy services',
        source: 'Private Platform',
        relevanceScore: 3
      }
    ],
    financialAid: [
      {
        title: 'Federal Student Aid',
        url: 'https://studentaid.gov',
        description: 'Official federal financial aid information and FAFSA applications',
        source: 'Department of Education',
        relevanceScore: 5
      },
      {
        title: 'Scholarship America',
        url: 'https://scholarshipamerica.org',
        description: 'Scholarship search and financial aid guidance',
        source: 'Non-profit Organization',
        relevanceScore: 5
      },
      {
        title: 'Fastweb',
        url: 'https://www.fastweb.com',
        description: 'Comprehensive scholarship search and financial aid resources',
        source: 'Educational Platform',
        relevanceScore: 4
      },
      {
        title: 'College Board Scholarship Search',
        url: 'https://bigfuture.collegeboard.org/scholarships',
        description: 'Scholarship database and financial planning tools',
        source: 'Educational Organization',
        relevanceScore: 4
      },
      {
        title: 'Emergency Financial Aid',
        url: 'https://www.collegefinancialaidadvice.com/emergency-aid',
        description: 'Resources for emergency financial assistance for students',
        source: 'Financial Aid Resource',
        relevanceScore: 4
      }
    ],
    academicSupport: [
      {
        title: 'Khan Academy',
        url: 'https://www.khanacademy.org',
        description: 'Free online courses and academic support across all subjects',
        source: 'Educational Platform',
        relevanceScore: 5
      },
      {
        title: 'Coursera Financial Aid',
        url: 'https://www.coursera.org/financial-aid',
        description: 'Free access to online courses for students in need',
        source: 'Educational Platform',
        relevanceScore: 4
      },
      {
        title: 'edX',
        url: 'https://www.edx.org',
        description: 'Free online courses from top universities worldwide',
        source: 'Educational Platform',
        relevanceScore: 4
      },
      {
        title: 'Academic Writing Support',
        url: 'https://owl.purdue.edu',
        description: 'Purdue Online Writing Lab - comprehensive writing resources',
        source: 'Purdue University',
        relevanceScore: 4
      },
      {
        title: 'Study Groups International',
        url: 'https://www.studygroup.com',
        description: 'Academic pathway programs and university preparation',
        source: 'Educational Services',
        relevanceScore: 3
      }
    ],
    emergencyAssistance: [
      {
        title: 'College Crisis Fund',
        url: 'https://www.collegecrisis.org',
        description: 'Emergency financial assistance for college students in crisis',
        source: 'Non-profit Organization',
        relevanceScore: 5
      },
      {
        title: 'United Way',
        url: 'https://www.unitedway.org',
        description: 'Local emergency assistance programs including housing and food',
        source: 'Non-profit Network',
        relevanceScore: 4
      },
      {
        title: 'Salvation Army',
        url: 'https://www.salvationarmyusa.org',
        description: 'Emergency assistance with rent, utilities, and basic needs',
        source: 'Non-profit Organization',
        relevanceScore: 4
      },
      {
        title: '211 Helpline',
        url: 'https://www.211.org',
        description: 'Comprehensive directory of local emergency and social services',
        source: 'Information Service',
        relevanceScore: 5
      }
    ],
    housingAssistance: [
      {
        title: 'National Alliance to End Homelessness',
        url: 'https://endhomelessness.org',
        description: 'Resources for students experiencing housing insecurity',
        source: 'Non-profit Organization',
        relevanceScore: 5
      },
      {
        title: 'HUD Housing Resources',
        url: 'https://www.hud.gov/topics/rental_assistance',
        description: 'Federal housing assistance programs and rental support',
        source: 'Department of Housing',
        relevanceScore: 4
      },
      {
        title: 'Campus Housing Support',
        url: 'https://www.basicneeds.ucla.edu/housing',
        description: 'Resources for students experiencing housing instability',
        source: 'UCLA Basic Needs',
        relevanceScore: 4
      },
      {
        title: 'CoStar Student Housing',
        url: 'https://www.apartments.com/student-housing',
        description: 'Student-specific housing search and rental assistance',
        source: 'Housing Platform',
        relevanceScore: 3
      }
    ]
  }
} 