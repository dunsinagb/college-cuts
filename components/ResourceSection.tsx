"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  GraduationCap, 
  Briefcase, 
  Scale, 
  Heart, 
  DollarSign, 
  BookOpen,
  ExternalLink,
  MapPin,
  Building,
  AlertTriangle,
  Home
} from 'lucide-react'
import Link from 'next/link'

interface Resource {
  title: string
  url: string
  description: string
  state?: string
  stateName?: string
  institution?: string
  source?: string
  searchQuery?: string
}

interface ResourceSectionProps {
  institution: string
  state: string
  actionType: string
  actionId?: string
  notes?: string
  announcementDate?: string
}

const categoryIcons = {
  transferAssistance: GraduationCap,
  careerCounseling: Briefcase,
  legalAid: Scale,
  mentalHealth: Heart,
  financialAid: DollarSign,
  academicSupport: BookOpen,
  emergencyAssistance: AlertTriangle,
  housingAssistance: Home
}

const categoryColors = {
  transferAssistance: "bg-blue-100 text-blue-800 border-blue-200",
  careerCounseling: "bg-green-100 text-green-800 border-green-200",
  legalAid: "bg-orange-100 text-orange-800 border-orange-200",
  mentalHealth: "bg-purple-100 text-purple-800 border-purple-200",
  financialAid: "bg-yellow-100 text-yellow-800 border-yellow-200",
  academicSupport: "bg-indigo-100 text-indigo-800 border-indigo-200",
  emergencyAssistance: "bg-red-100 text-red-800 border-red-200",
  housingAssistance: "bg-teal-100 text-teal-800 border-teal-200"
}

const categoryLabels = {
  transferAssistance: "Transfer Assistance",
  careerCounseling: "Career Counseling",
  legalAid: "Legal Aid",
  mentalHealth: "Mental Health",
  financialAid: "Financial Aid",
  academicSupport: "Academic Support",
  emergencyAssistance: "Emergency Assistance",
  housingAssistance: "Housing Assistance"
}

export function ResourceSection({ institution, state, actionType, actionId, notes, announcementDate }: ResourceSectionProps) {
  const [resources, setResources] = useState<Record<string, Resource[]>>({})
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  useEffect(() => {
    loadResources()
  }, [institution, state, actionType, actionId, notes, announcementDate])

  const loadResources = async () => {
    try {
      setLoading(true)
      
      // Check if this is a July 2025+ action
      const isJuly2025Plus = announcementDate && new Date(announcementDate) >= new Date('2025-07-01')
      
      // Don't render anything for pre-July 2025 actions
      if (!isJuly2025Plus) {
        setResources({})
        setLoading(false)
        return
      }
      
      // Load contextual resources with action-specific data
      const response = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          institution, 
          state, 
          actionType, 
          actionId, 
          notes,
          announcementDate
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setResources(data)
      } else {
        // Fallback to mock data
        setResources(getMockResources())
      }
    } catch (error) {
      console.error('Error loading resources:', error)
      setResources(getMockResources())
    } finally {
      setLoading(false)
    }
  }

  const getMockResources = (): Record<string, Resource[]> => ({
    transferAssistance: [
      {
        title: `${state} Transfer Network`,
        url: `https://${state.toLowerCase()}.transfernetwork.org`,
        description: 'State-specific transfer assistance and articulation agreements',
        state,
        source: 'State Transfer Network'
      },
      {
        title: 'National Transfer Network',
        url: 'https://www.nationaltransfernetwork.org',
        description: 'Comprehensive transfer resources and guidance',
        state,
        source: 'National Organization'
      }
    ],
    careerCounseling: [
      {
        title: `${institution} Career Services`,
        url: `https://${institution.toLowerCase().replace(/\s+/g, '')}.edu/career`,
        description: 'Institution-specific career counseling and job placement services',
        institution,
        source: 'Institution'
      },
      {
        title: 'National Career Development Association',
        url: 'https://www.ncda.org',
        description: 'Professional career counseling resources and guidance',
        state,
        source: 'Professional Organization'
      }
    ],
    legalAid: [
      {
        title: `${state} Student Legal Services`,
        url: `https://${state.toLowerCase()}.studentlegal.org`,
        description: 'State-specific legal aid for students affected by institutional changes',
        state,
        source: 'State Legal Aid'
      },
      {
        title: 'Student Borrower Protection Center',
        url: 'https://protectborrowers.org',
        description: 'Legal resources for student loan and education rights',
        state,
        source: 'National Organization'
      }
    ],
    mentalHealth: [
      {
        title: `${institution} Counseling Center`,
        url: `https://${institution.toLowerCase().replace(/\s+/g, '')}.edu/counseling`,
        description: 'Institution-specific mental health and counseling services',
        institution,
        source: 'Institution'
      },
      {
        title: 'National Alliance on Mental Illness',
        url: 'https://www.nami.org',
        description: 'Mental health support and resources for students',
        state,
        source: 'National Organization'
      }
    ],
    financialAid: [
      {
        title: `${state} Financial Aid Office`,
        url: `https://${state.toLowerCase()}.financialaid.gov`,
        description: 'State-specific financial aid and scholarship information',
        state,
        source: 'State Government'
      },
      {
        title: 'Federal Student Aid',
        url: 'https://studentaid.gov',
        description: 'Federal financial aid resources and guidance',
        state,
        source: 'Federal Government'
      }
    ],
    academicSupport: [
      {
        title: `${institution} Academic Support`,
        url: `https://${institution.toLowerCase().replace(/\s+/g, '')}.edu/academic-support`,
        description: 'Institution-specific academic support and tutoring services',
        institution,
        source: 'Institution'
      },
      {
        title: 'Khan Academy',
        url: 'https://www.khanacademy.org',
        description: 'Free online courses and academic support across all subjects',
        source: 'Educational Platform'
      }
    ],
    emergencyAssistance: [
      {
        title: 'College Crisis Fund',
        url: 'https://www.collegecrisis.org',
        description: 'Emergency financial assistance for college students in crisis',
        source: 'Non-profit Organization'
      },
      {
        title: '211 Helpline',
        url: 'https://www.211.org',
        description: 'Comprehensive directory of local emergency and social services',
        source: 'Information Service'
      }
    ],
    housingAssistance: [
      {
        title: `${state} Housing Authority`,
        url: `https://${state.toLowerCase()}.gov/housing`,
        description: 'State housing assistance programs and rental support',
        state,
        source: 'State Government'
      },
      {
        title: 'National Alliance to End Homelessness',
        url: 'https://endhomelessness.org',
        description: 'Resources for students experiencing housing insecurity',
        source: 'Non-profit Organization'
      }
    ]
  })

  const getFilteredResources = (category: string): Resource[] => {
    const categoryResources = resources[category] || []
    
    // Filter by state and institution relevance
    return categoryResources.filter(resource => {
      const isStateRelevant = !resource.state || resource.state === state
      const isInstitutionRelevant = !resource.institution || 
        resource.institution.toLowerCase().includes(institution.toLowerCase()) ||
        institution.toLowerCase().includes(resource.institution.toLowerCase())
      
      return isStateRelevant || isInstitutionRelevant
    })
  }

  // Don't render if no resources are available
  if (Object.values(resources).every(arr => arr.length === 0)) {
    return null
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Resources for Affected Students & Faculty
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          Resources for Affected Students & Faculty
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Find support and assistance programs relevant to this institutional action
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Category Navigation */}
          <div className="flex flex-wrap gap-2">
            {Object.keys(categoryLabels).map((category) => {
              const Icon = categoryIcons[category as keyof typeof categoryIcons]
              const resources = getFilteredResources(category)
              const isActive = selectedCategory === category
              
              return (
                <Button
                  key={category}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(isActive ? null : category)}
                  className="flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {categoryLabels[category as keyof typeof categoryLabels]}
                  <Badge variant="secondary" className="ml-1">
                    {resources.length}
                  </Badge>
                </Button>
              )
            })}
          </div>

          {/* Resources Display */}
          {selectedCategory ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">
                  {categoryLabels[selectedCategory as keyof typeof categoryLabels]}
                </h3>
                <Badge className={categoryColors[selectedCategory as keyof typeof categoryColors]}>
                  {getFilteredResources(selectedCategory).length} resources
                </Badge>
              </div>
              
              <div className="grid gap-4">
                {getFilteredResources(selectedCategory).map((resource, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{resource.title}</h4>
                            {resource.state && (
                              <Badge variant="outline" className="text-xs">
                                <MapPin className="h-3 w-3 mr-1" />
                                {resource.state}
                              </Badge>
                            )}
                            {resource.institution && (
                              <Badge variant="outline" className="text-xs">
                                <Building className="h-3 w-3 mr-1" />
                                Institution
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {resource.description}
                          </p>
                          {resource.source && (
                            <p className="text-xs text-muted-foreground">
                              Source: {resource.source}
                            </p>
                          )}
                        </div>
                        <Button asChild size="sm" variant="outline">
                          <a 
                            href={resource.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Visit
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Select a category above to view relevant resources for students and faculty affected by this institutional action.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 