const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

class ContextualResourceScraper {
  constructor() {
    this.resources = {
      transferAssistance: [],
      careerCounseling: [],
      legalAid: [],
      mentalHealth: [],
      financialAid: [],
      academicSupport: []
    };
    
    this.actionTypeKeywords = {
      'program_suspension': ['program suspension', 'suspended program', 'program closure', 'academic suspension'],
      'department_closure': ['department closure', 'department shutdown', 'academic department', 'department elimination'],
      'campus_closure': ['campus closure', 'campus shutdown', 'campus consolidation', 'campus elimination'],
      'institution_closure': ['institution closure', 'college closure', 'university closure', 'institution shutdown'],
      'staff_layoff': ['staff layoff', 'faculty layoff', 'employee termination', 'job loss', 'reduction in force'],
      'teach_out': ['teach out', 'teach-out', 'program completion', 'graduation plan', 'student completion']
    };
    
    this.primaryReasonKeywords = {
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

    // Pre-curated contextual resources
    this.curatedResources = {
      'TX': {
        transferAssistance: [
          {
            title: 'Texas Transfer Network',
            url: 'https://www.txhighereddata.org/transfer',
            description: 'Official Texas higher education transfer resources and articulation agreements',
            state: 'TX',
            relevanceScore: 15,
            source: 'Texas Higher Education Coordinating Board'
          },
          {
            title: 'University of Texas Transfer Services',
            url: 'https://admissions.utexas.edu/transfer',
            description: 'Transfer assistance and credit evaluation for UT system students',
            state: 'TX',
            relevanceScore: 12,
            source: 'University of Texas'
          }
        ],
        careerCounseling: [
          {
            title: 'Texas Workforce Commission',
            url: 'https://www.twc.texas.gov',
            description: 'State career services and job placement assistance',
            state: 'TX',
            relevanceScore: 12,
            source: 'Texas Government'
          }
        ],
        legalAid: [
          {
            title: 'Texas Legal Services Center',
            url: 'https://www.tlsc.org',
            description: 'Free legal assistance for Texas residents',
            state: 'TX',
            relevanceScore: 10,
            source: 'Legal Aid'
          }
        ]
      },
      'IL': {
        transferAssistance: [
          {
            title: 'Illinois Articulation Initiative',
            url: 'https://www.itransfer.org',
            description: 'Illinois transfer network and credit transfer resources',
            state: 'IL',
            relevanceScore: 15,
            source: 'Illinois Board of Higher Education'
          }
        ],
        careerCounseling: [
          {
            title: 'Illinois Department of Employment Security',
            url: 'https://www2.illinois.gov/ides',
            description: 'State employment services and career counseling',
            state: 'IL',
            relevanceScore: 12,
            source: 'Illinois Government'
          }
        ],
        legalAid: [
          {
            title: 'Legal Aid Chicago',
            url: 'https://www.legalaidchicago.org',
            description: 'Free legal services for Illinois residents',
            state: 'IL',
            relevanceScore: 10,
            source: 'Legal Aid'
          }
        ]
      },
      'NY': {
        transferAssistance: [
          {
            title: 'New York State Transfer and Articulation Association',
            url: 'https://www.nystaa.org',
            description: 'NY transfer resources and articulation agreements',
            state: 'NY',
            relevanceScore: 15,
            source: 'NYS Transfer Association'
          }
        ],
        careerCounseling: [
          {
            title: 'New York State Department of Labor',
            url: 'https://www.labor.ny.gov',
            description: 'State career services and job placement',
            state: 'NY',
            relevanceScore: 12,
            source: 'New York Government'
          }
        ],
        legalAid: [
          {
            title: 'Legal Aid Society of New York',
            url: 'https://www.legalaidnyc.org',
            description: 'Free legal services for New York residents',
            state: 'NY',
            relevanceScore: 10,
            source: 'Legal Aid'
          }
        ]
      }
    };
  }

  async init() {
    this.browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security', '--disable-features=VizDisplayCompositor']
    });
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async scrapeContextualResources(action) {
    console.log(`🔍 Scraping contextual resources for: ${action.institution} - ${action.cut_type}`);
    
    // Start with curated resources for the state
    const curatedStateResources = this.curatedResources[action.state] || {};
    
    // Add institution-specific curated resources
    const institutionResources = this.getInstitutionSpecificResources(action);
    
    // Combine curated resources
    const allResources = {
      transferAssistance: [
        ...(curatedStateResources.transferAssistance || []),
        ...(institutionResources.transferAssistance || [])
      ],
      careerCounseling: [
        ...(curatedStateResources.careerCounseling || []),
        ...(institutionResources.careerCounseling || [])
      ],
      legalAid: [
        ...(curatedStateResources.legalAid || []),
        ...(institutionResources.legalAid || [])
      ],
      mentalHealth: [
        ...(curatedStateResources.mentalHealth || []),
        ...(institutionResources.mentalHealth || [])
      ],
      financialAid: [
        ...(curatedStateResources.financialAid || []),
        ...(institutionResources.financialAid || [])
      ],
      academicSupport: [
        ...(curatedStateResources.academicSupport || []),
        ...(institutionResources.academicSupport || [])
      ]
    };

    // Add primary reason specific resources
    const primaryReason = this.categorizePrimaryReason(action.notes);
    const reasonResources = this.getPrimaryReasonResources(primaryReason, action.state);
    
    for (const [category, resources] of Object.entries(reasonResources)) {
      allResources[category] = [...(allResources[category] || []), ...resources];
    }

    // Add action type specific resources
    const actionTypeResources = this.getActionTypeResources(action.cut_type, action.state);
    
    for (const [category, resources] of Object.entries(actionTypeResources)) {
      allResources[category] = [...(allResources[category] || []), ...resources];
    }

    // Remove duplicates and sort by relevance
    for (const category in allResources) {
      const seen = new Set();
      allResources[category] = allResources[category]
        .filter(item => {
          const key = `${item.title}-${item.url}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
        .slice(0, 8); // Keep top 8 most relevant
    }

    return allResources;
  }

  getInstitutionSpecificResources(action) {
    const institution = action.institution.toLowerCase();
    const resources = {};

    // University of Texas system
    if (institution.includes('university of texas') || institution.includes('ut')) {
      resources.transferAssistance = [
        {
          title: 'UT System Transfer Services',
          url: 'https://www.utsystem.edu',
          description: 'Transfer assistance for UT system students affected by program changes',
          institution: action.institution,
          state: action.state,
          relevanceScore: 15,
          source: 'UT System'
        }
      ];
      resources.careerCounseling = [
        {
          title: 'UT Career Services',
          url: 'https://career.utexas.edu',
          description: 'Career counseling and job placement for UT students and faculty',
          institution: action.institution,
          state: action.state,
          relevanceScore: 12,
          source: 'UT Career Services'
        }
      ];
    }

    // Northwestern University
    if (institution.includes('northwestern')) {
      resources.careerCounseling = [
        {
          title: 'Northwestern Career Services',
          url: 'https://career.northwestern.edu',
          description: 'Career counseling and job placement for Northwestern students and faculty',
          institution: action.institution,
          state: action.state,
          relevanceScore: 15,
          source: 'Northwestern University'
        }
      ];
      resources.mentalHealth = [
        {
          title: 'Northwestern Counseling Services',
          url: 'https://www.northwestern.edu/counseling',
          description: 'Mental health support for Northwestern community',
          institution: action.institution,
          state: action.state,
          relevanceScore: 12,
          source: 'Northwestern University'
        }
      ];
    }

    // The King's College
    if (institution.includes('king')) {
      resources.transferAssistance = [
        {
          title: 'King\'s College Transfer Resources',
          url: 'https://www.tkc.edu',
          description: 'Transfer assistance for King\'s College students',
          institution: action.institution,
          state: action.state,
          relevanceScore: 15,
          source: 'The King\'s College'
        }
      ];
      resources.legalAid = [
        {
          title: 'Student Borrower Protection Center',
          url: 'https://protectborrowers.org',
          description: 'Legal assistance for students affected by institutional closures',
          institution: action.institution,
          state: action.state,
          relevanceScore: 12,
          source: 'Student Rights Organization'
        }
      ];
    }

    return resources;
  }

  getPrimaryReasonResources(primaryReason, state) {
    const resources = {};

    switch (primaryReason) {
      case 'Budget Deficit':
        resources.financialAid = [
          {
            title: 'Federal Student Aid Emergency',
            url: 'https://studentaid.gov',
            description: 'Emergency financial assistance for students affected by budget cuts',
            state: state,
            relevanceScore: 12,
            source: 'Federal Student Aid'
          }
        ];
        resources.careerCounseling = [
          {
            title: 'CareerOneStop Transition',
            url: 'https://www.careeronestop.org',
            description: 'Career counseling for those affected by budget-related changes',
            state: state,
            relevanceScore: 10,
            source: 'CareerOneStop'
          }
        ];
        break;

      case 'Federal Funding Cuts':
        resources.legalAid = [
          {
            title: 'Student Borrower Protection Center',
            url: 'https://protectborrowers.org',
            description: 'Legal resources for students affected by federal funding cuts',
            state: state,
            relevanceScore: 12,
            source: 'Student Rights Organization'
          }
        ];
        resources.financialAid = [
          {
            title: 'Federal Student Aid',
            url: 'https://studentaid.gov',
            description: 'Alternative funding sources for students affected by federal cuts',
            state: state,
            relevanceScore: 10,
            source: 'Federal Government'
          }
        ];
        break;

      case 'Accreditation Issues':
        resources.legalAid = [
          {
            title: 'Legal Services Corporation',
            url: 'https://www.lsc.gov',
            description: 'Legal assistance for students affected by accreditation issues',
            state: state,
            relevanceScore: 15,
            source: 'Legal Services'
          }
        ];
        resources.transferAssistance = [
          {
            title: 'National Student Clearinghouse',
            url: 'https://www.studentclearinghouse.org',
            description: 'Transfer assistance to accredited institutions',
            state: state,
            relevanceScore: 12,
            source: 'Transfer Network'
          }
        ];
        break;

      case 'Enrollment Decline':
        resources.transferAssistance = [
          {
            title: 'College Transfer Guide',
            url: 'https://www.collegetransfer.net',
            description: 'Transfer assistance to programs with strong enrollment',
            state: state,
            relevanceScore: 12,
            source: 'Transfer Network'
          }
        ];
        break;
    }

    return resources;
  }

  getActionTypeResources(actionType, state) {
    const resources = {};

    switch (actionType) {
      case 'program_suspension':
        resources.transferAssistance = [
          {
            title: 'National Student Clearinghouse',
            url: 'https://www.studentclearinghouse.org',
            description: 'Specialized transfer assistance for suspended programs',
            state: state,
            relevanceScore: 15,
            source: 'Transfer Network'
          }
        ];
        break;

      case 'department_closure':
        resources.careerCounseling = [
          {
            title: 'National Career Development Association',
            url: 'https://www.ncda.org',
            description: 'Career counseling for faculty and students affected by department closures',
            state: state,
            relevanceScore: 15,
            source: 'Career Support Network'
          }
        ];
        resources.transferAssistance = [
          {
            title: 'College Transfer Guide',
            url: 'https://www.collegetransfer.net',
            description: 'Transfer assistance for students in closed departments',
            state: state,
            relevanceScore: 12,
            source: 'Transfer Network'
          }
        ];
        break;

      case 'institution_closure':
        resources.transferAssistance = [
          {
            title: 'National Student Clearinghouse',
            url: 'https://www.studentclearinghouse.org',
            description: 'Emergency transfer assistance for institution closures',
            state: state,
            relevanceScore: 15,
            source: 'Emergency Transfer Network'
          }
        ];
        resources.legalAid = [
          {
            title: 'Student Borrower Protection Center',
            url: 'https://protectborrowers.org',
            description: 'Legal rights and assistance for institution closures',
            state: state,
            relevanceScore: 15,
            source: 'Student Rights Organization'
          }
        ];
        break;

      case 'staff_layoff':
        resources.careerCounseling = [
          {
            title: 'National Career Development Association',
            url: 'https://www.ncda.org',
            description: 'Career counseling and job placement for laid-off faculty',
            state: state,
            relevanceScore: 15,
            source: 'Faculty Career Network'
          }
        ];
        resources.mentalHealth = [
          {
            title: 'National Alliance on Mental Illness',
            url: 'https://www.nami.org',
            description: 'Mental health support for faculty affected by layoffs',
            state: state,
            relevanceScore: 12,
            source: 'Faculty Wellness Network'
          }
        ];
        break;
    }

    return resources;
  }

  categorizePrimaryReason(notes) {
    if (!notes) return 'Budget Deficit';
    
    const notesLower = notes.toLowerCase();
    
    for (const [reason, keywords] of Object.entries(this.primaryReasonKeywords)) {
      if (keywords.some(keyword => notesLower.includes(keyword))) {
        return reason;
      }
    }
    
    return 'Budget Deficit';
  }

  async saveContextualResources(actionId, resources) {
    const outputDir = path.join(__dirname, '../data/contextual');
    await fs.mkdir(outputDir, { recursive: true });
    
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `action-${actionId}-resources-${timestamp}.json`;
    const filepath = path.join(outputDir, filename);
    
    await fs.writeFile(filepath, JSON.stringify(resources, null, 2));
    console.log(`✅ Contextual resources saved to ${filepath}`);
    
    return filepath;
  }

  async runForAction(action) {
    try {
      console.log(`🚀 Starting contextual resource scraping for: ${action.institution}`);
      
      // Generate contextual resources using curated data
      const contextualResources = await this.scrapeContextualResources(action);
      
      // Save contextual resources
      await this.saveContextualResources(action.id, contextualResources);
      
      console.log(`✅ Contextual resource scraping completed for ${action.institution}!`);
      console.log(`📊 Results:`);
      for (const [category, data] of Object.entries(contextualResources)) {
        console.log(`   ${category}: ${data.length} resources`);
      }
      
      return contextualResources;
      
    } catch (error) {
      console.error('❌ Error during contextual scraping:', error);
      throw error;
    }
  }
}

// Run the scraper for a specific action
if (require.main === module) {
  // Example action for testing
  const testAction = {
    id: "test-1",
    institution: "University of Texas at Dallas",
    state: "TX",
    cut_type: "department_closure",
    notes: "Department closed due to budget deficit and declining enrollment"
  };
  
  const scraper = new ContextualResourceScraper();
  scraper.runForAction(testAction);
}

module.exports = ContextualResourceScraper; 