"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, CheckCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient"
import type { Cut } from "@/types/supabase"

// Mock data for fallback
const mockLatestCuts: Cut[] = [
  {
    id: "1",
    institution: "University of Example",
    program_name: "Liberal Arts Program",
    state: "CA",
    control: "Public",
    cut_type: "program_suspension",
    announcement_date: "2024-03-15",
    effective_term: "Fall 2024",
    students_affected: 150,
    faculty_affected: 8,
    notes: "Program suspended due to budget constraints",
    source_url: "https://example.com/news",
    source_publication: "University Times",
    created_at: "2024-03-15T10:00:00Z",
    updated_at: "2024-03-15T10:00:00Z",
  },
  {
    id: "2",
    institution: "State College",
    program_name: "Philosophy Department",
    state: "TX",
    control: "Public",
    cut_type: "department_closure",
    announcement_date: "2024-03-10",
    effective_term: "Spring 2025",
    students_affected: 75,
    faculty_affected: 12,
    notes: "Department closure effective next semester",
    source_url: "https://example.com/announcement",
    source_publication: "State College News",
    created_at: "2024-03-10T09:00:00Z",
    updated_at: "2024-03-10T09:00:00Z",
  },
  {
    id: "3",
    institution: "Regional University",
    program_name: "Art History Program",
    state: "IL",
    control: "Private non-profit",
    cut_type: "program_suspension",
    announcement_date: "2024-02-20",
    effective_term: "Summer 2024",
    students_affected: 45,
    faculty_affected: 3,
    notes: "Program suspended pending review",
    source_url: "https://example.com/university-update",
    source_publication: "Regional News",
    created_at: "2024-02-20T14:00:00Z",
    updated_at: "2024-02-20T14:00:00Z",
  },
]

export default function SubmitTipPage() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [latestCuts, setLatestCuts] = useState<Cut[]>([])
  const [cutsLoading, setCutsLoading] = useState(true)
  const [formData, setFormData] = useState({
    institution: "",
    cutDetails: "",
    sourceInfo: "",
    relationship: "",
    email: "",
    name: "",
  })

  useEffect(() => {
    fetchLatestCuts()
  }, [])

  async function fetchLatestCuts() {
    if (!isSupabaseConfigured) {
      setLatestCuts(mockLatestCuts)
      setCutsLoading(false)
      return
    }

    try {
      const client = supabase()
      if (!client) {
        setLatestCuts(mockLatestCuts)
        setCutsLoading(false)
        return
      }

      const { data, error } = await client
        .from("v_latest_cuts")
        .select("*")
        .order("announcement_date", { ascending: false })
        .limit(3)

      if (error) throw error
      setLatestCuts(data || mockLatestCuts)
    } catch (error) {
      console.error("Error fetching latest cuts:", error)
      setLatestCuts(mockLatestCuts)
    } finally {
      setCutsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/submit-tip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit tip')
      }

      const result = await response.json()
      setIsSubmitted(true)
    } catch (error) {
      console.error("Error submitting tip:", error)
      alert('Failed to submit tip. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (isSubmitted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
          <h1 className="text-3xl font-bold">Thank You!</h1>
          <p className="text-lg text-muted-foreground">
            Your tip has been submitted successfully. We'll review the information and add it to our database if
            verified.
          </p>
          <Button asChild>
            <Link href="/">Return to Dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Share Program Cut Intel</h1>
              <p className="text-muted-foreground mt-2">
                Seen a list of program cuts or have info about institutional changes?
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Let us know in the form below and help affected students get exposure to alternative programs.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Share program cut intel</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="institution" className="block text-sm font-medium mb-2">
                      Institution name or system <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="institution"
                      value={formData.institution}
                      onChange={(e) => handleInputChange("institution", e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="cutDetails" className="block text-sm font-medium mb-2">
                      What program cut intel do you have? <span className="text-red-500">*</span>
                    </label>
                    <p className="text-sm text-muted-foreground mb-2">
                      ex. # of programs cut, % of programs cut, date of cut announcement, specific programs affected,
                      etc.
                    </p>
                    <Textarea
                      id="cutDetails"
                      rows={4}
                      value={formData.cutDetails}
                      onChange={(e) => handleInputChange("cutDetails", e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="sourceInfo" className="block text-sm font-medium mb-2">
                      How do you know this intel? <span className="text-red-500">*</span>
                    </label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Please include a link if the news is public (ex. news article, LinkedIn post, institutional
                      announcement)
                    </p>
                    <Textarea
                      id="sourceInfo"
                      rows={3}
                      value={formData.sourceInfo}
                      onChange={(e) => handleInputChange("sourceInfo", e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="relationship" className="block text-sm font-medium mb-2">
                      What is your relationship to this organization? <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={formData.relationship}
                      onValueChange={(value) => handleInputChange("relationship", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Current Student</SelectItem>
                        <SelectItem value="alumni">Alumni</SelectItem>
                        <SelectItem value="faculty">Faculty/Staff</SelectItem>
                        <SelectItem value="parent">Parent/Family</SelectItem>
                        <SelectItem value="community">Community Member</SelectItem>
                        <SelectItem value="media">Media/Journalist</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Your email (optional)
                    </label>
                    <p className="text-sm text-muted-foreground mb-2">
                      I'll be able to better verify your intel if you include this. Will be kept anonymous
                    </p>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                    />
                  </div>

                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                      Your name (optional)
                    </label>
                    <p className="text-sm text-muted-foreground mb-2">Will be kept anonymous</p>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                    />
                  </div>

                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? "Submitting..." : "Submit"}
                  </Button>

                  <p className="text-xs text-muted-foreground">
                    Do not submit passwords through this form. Report malicious form behavior.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Hoping to help those affected get exposure to alternative programs and institutions still offering
                similar opportunities.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Latest Program Cuts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cutsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-24 mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {latestCuts.map((cut) => (
                    <div
                      key={cut.id}
                      className="flex justify-between items-start p-3 bg-gray-50 dark:bg-gray-800 rounded"
                    >
                      <div>
                        <div className="font-medium">{cut.institution}</div>
                        <div className="text-sm text-muted-foreground">
                          {cut.program_name ? `Program: ${cut.program_name}` : `${cut.cut_type.replace("_", " ")}`}
                        </div>
                        {cut.students_affected && (
                          <div className="text-sm text-muted-foreground">{cut.students_affected} students affected</div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">Date</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(cut.announcement_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2">
                <Link href="/cuts" className="text-sm text-blue-600 hover:underline">
                  View full list of cuts
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Have Info?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Seen a program cut list and want to help the affected students? Share using{" "}
                <Link href="/submit-tip" className="text-green-600 hover:underline">
                  this form
                </Link>
                .
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
