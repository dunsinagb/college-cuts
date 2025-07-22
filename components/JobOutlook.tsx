'use client';

import { useState, useRef, useEffect } from 'react';
import { useJobOutlook, type MajorJobMatch } from '@/hooks/useJobOutlook';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  TrendingUp, 
  DollarSign, 
  Briefcase, 
  Loader2, 
  AlertCircle, 
  Users, 
  GraduationCap,
  Filter,
  FileText,
  ExternalLink,
  X,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown
} from 'lucide-react';
import * as XLSX from 'xlsx';

type SortField = 'title' | 'entry_education' | 'median_wage' | 'employment_level' | 'annual_openings' | 'unemployment_rate';
type SortDirection = 'asc' | 'desc' | null;

// Extended interface for jobs with related majors information
interface JobWithRelatedMajors extends MajorJobMatch {
  relatedMajors: string[];
  hasVariations: boolean;
}

export function JobOutlook() {
  const [major, setMajor] = useState('Computer Science');
  const [educationFilter, setEducationFilter] = useState('all');
  const [salaryFilter, setSalaryFilter] = useState('all');
  const [filteredJobs, setFilteredJobs] = useState<JobWithRelatedMajors[]>([]);
  const [sortField, setSortField] = useState<SortField>('title');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const tableRef = useRef<HTMLTableElement>(null);
  
  const { jobs, loading, error, fetchJobs } = useJobOutlook();

  // Load Computer Science data by default
  useEffect(() => {
    fetchJobs('Computer Science');
  }, [fetchJobs]);

  // Apply filters and sorting whenever jobs, filters, or sort changes
  useEffect(() => {
    console.log('🔄 Applying filters and sorting...', { educationFilter, salaryFilter, jobsCount: jobs.length });
    
    const filtered = jobs.filter(job => {
      // Education filter
      if (educationFilter !== 'all' && job.entry_education !== educationFilter) {
        return false;
      }
      
      // Salary filter
      if (salaryFilter !== 'all' && job.median_wage !== null) {
        const salary = job.median_wage;
        switch (salaryFilter) {
          case 'low': 
            if (salary >= 60000) return false;
            break;
          case 'medium': 
            if (salary < 60000 || salary >= 100000) return false;
            break;
          case 'high': 
            if (salary < 100000) return false;
            break;
        }
      }
      
      return true;
    });

    // Group jobs by title and collect related majors
    const jobGroups = filtered.reduce((acc, job) => {
      if (!acc[job.title]) {
        acc[job.title] = {
          job: job,
          relatedMajors: [major],
          variations: [job]
        };
      } else {
        acc[job.title].variations.push(job);
        // Keep track of which major this variation came from
        if (!acc[job.title].relatedMajors.includes(major)) {
          acc[job.title].relatedMajors.push(major);
        }
      }
      return acc;
    }, {} as Record<string, { job: MajorJobMatch; relatedMajors: string[]; variations: MajorJobMatch[] }>);

    // For each job title, select the best representative data
    const consolidatedJobs = Object.values(jobGroups).map(group => {
      // If there are multiple variations, select the one with the most complete data
      if (group.variations.length > 1) {
        const bestJob = group.variations.reduce((best, current) => {
          const bestNulls = Object.values(best).filter(v => v === null || v === undefined).length;
          const currentNulls = Object.values(current).filter(v => v === null || v === undefined).length;
          return currentNulls < bestNulls ? current : best;
        });
        
        return {
          ...bestJob,
          relatedMajors: group.relatedMajors,
          hasVariations: true
        };
      }
      
      return {
        ...group.job,
        relatedMajors: group.relatedMajors,
        hasVariations: false
      };
    });

    // Apply sorting
    const sorted = [...consolidatedJobs].sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Handle null values
      if (aValue === null || aValue === undefined) aValue = '';
      if (bValue === null || bValue === undefined) bValue = '';

      // Handle numeric sorting
      if (sortField === 'median_wage' || sortField === 'employment_level' || sortField === 'annual_openings' || sortField === 'unemployment_rate') {
        aValue = aValue || 0;
        bValue = bValue || 0;
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // Handle string sorting
      aValue = String(aValue).toLowerCase();
      bValue = String(bValue).toLowerCase();
      
      if (sortDirection === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
    
    console.log(`✅ Filtered and sorted ${jobs.length} jobs to ${sorted.length} unique jobs`);
    setFilteredJobs(sorted);
  }, [jobs, educationFilter, salaryFilter, sortField, sortDirection, major]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field with ascending direction
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronsUpDown className="h-4 w-4 text-gray-400" />;
    }
    return sortDirection === 'asc' 
      ? <ChevronUp className="h-4 w-4 text-blue-600" />
      : <ChevronDown className="h-4 w-4 text-blue-600" />;
  };

  const handleSearch = () => {
    if (major.trim()) {
      fetchJobs(major.trim());
    }
  };

  const clearFilters = () => {
    setEducationFilter('all');
    setSalaryFilter('all');
  };

  const hasActiveFilters = educationFilter !== 'all' || salaryFilter !== 'all';

  // Export function
  const exportToCSV = () => {
    const headers = [
      'Job Title',
      'Required Education',
      'Median Salary',
      'Employment Level',
      'Annual Openings',
      'Unemployment Rate'
    ];

    const data = filteredJobs.map(job => [
      job.title,
      job.entry_education || 'N/A',
      formatSalary(job.median_wage),
      formatEmployment(job.employment_level),
      formatOpenings(job.annual_openings),
      job.unemployment_rate ? `${job.unemployment_rate.toFixed(2)}%` : 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...data.map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `job-outlook-${major}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const getLinkedInUrl = (jobTitle: string) => {
    // Extract only the job title before the comma (if any)
    const cleanTitle = jobTitle.split(',')[0].trim();
    return `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(cleanTitle)}`;
  };

  const formatSalary = (salary: number | null) => {
    if (!salary) return 'N/A';
    return `$${salary.toLocaleString()}`;
  };

  const formatEmployment = (employment: number | null) => {
    if (!employment) return 'N/A';
    return employment.toLocaleString();
  };

  const formatOpenings = (openings: number | null) => {
    if (!openings) return 'N/A';
    return openings.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Main Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-blue-100 rounded-full">
              <GraduationCap className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">
              Major → Job Outlook
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover median salaries, employment levels, and annual job openings for occupations related to your major.
          </p>
        </div>

        {/* Data Source Information */}
        <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <FileText className="h-5 w-5 text-blue-600" />
              Data Source & Methodology
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-blue-600" />
                  U.S. Bureau of Labor Statistics (BLS)
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Job outlook data is sourced directly from the BLS API, providing real-time access to:
                </p>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>• Median annual wages and salary data</li>
                  <li>• Employment levels and growth projections</li>
                  <li>• Annual job openings and replacement needs</li>
                  <li>• Educational requirements for occupations</li>
                  <li>• State-specific wage data for major markets</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  Professional Notes
                </h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• <strong>Data Currency:</strong> BLS data is updated quarterly and reflects the most recent labor market conditions</li>
                  <li>• <strong>Methodology:</strong> Uses Standard Occupational Classification (SOC) codes for accurate job matching</li>
                  <li>• <strong>Coverage:</strong> Includes all major occupation categories across the U.S. economy</li>
                  <li>• <strong>Reliability:</strong> Government-sourced data ensures accuracy and consistency</li>
                  <li>• <strong>Limitations:</strong> Some emerging roles may use placeholder data when BLS series are unavailable</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-100 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>💡 Tip:</strong> You can search for any major to explore related career opportunities.
              </p>
            </div>
          </CardContent>
        </Card>
        {/* Search Section */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <Search className="h-5 w-5 text-blue-600" />
              Search by Major
            </CardTitle>
            <CardDescription>
              Computer Science data is loaded by default. Enter any major to explore related career opportunities and salary data.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Input
                placeholder="e.g., Computer Science, Business Administration..."
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={loading || !major.trim()}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="h-5 w-5" />
                <span>Error: {error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {jobs.length > 0 && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100">Total Jobs</p>
                      <p className="text-2xl font-bold">{jobs.length}</p>
                    </div>
                    <Briefcase className="h-8 w-8 text-blue-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100">Avg. Salary</p>
                      <p className="text-2xl font-bold">
                        {jobs.filter(j => j.median_wage).length > 0 
                          ? `$${Math.round(jobs.filter(j => j.median_wage).reduce((sum, j) => sum + (j.median_wage || 0), 0) / jobs.filter(j => j.median_wage).length).toLocaleString()}`
                          : 'N/A'
                        }
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-purple-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100">Total Employment</p>
                      <p className="text-2xl font-bold">
                        {jobs.filter(j => j.employment_level).length > 0 
                          ? jobs.filter(j => j.employment_level).reduce((sum, j) => sum + (j.employment_level || 0), 0).toLocaleString()
                          : 'N/A'
                        }
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-green-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100">Annual Openings</p>
                      <p className="text-2xl font-bold">
                        {jobs.filter(j => j.annual_openings).length > 0 
                          ? jobs.filter(j => j.annual_openings).reduce((sum, j) => sum + (j.annual_openings || 0), 0).toLocaleString()
                          : 'N/A'
                        }
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-orange-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters Section */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-gray-800">
                    <Filter className="h-5 w-5 text-blue-600" />
                    Filters
                  </CardTitle>
                  {hasActiveFilters && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={clearFilters}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Clear Filters
                    </Button>
                  )}
                </div>
                <CardDescription>
                  Filter jobs by education requirements and salary ranges
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Education Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Required Education</label>
                    <Select value={educationFilter} onValueChange={setEducationFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select education level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Education Levels</SelectItem>
                        <SelectItem value="High school diploma or equivalent">High School</SelectItem>
                        <SelectItem value="Some college, no degree">Some College</SelectItem>
                        <SelectItem value="Associate's degree">Associate's Degree</SelectItem>
                        <SelectItem value="Bachelor's degree">Bachelor's Degree</SelectItem>
                        <SelectItem value="Master's degree">Master's Degree</SelectItem>
                        <SelectItem value="Doctoral or professional degree">Doctoral Degree</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Salary Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Salary Range</label>
                    <Select value={salaryFilter} onValueChange={setSalaryFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select salary range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Salaries</SelectItem>
                        <SelectItem value="low">Under $60,000</SelectItem>
                        <SelectItem value="medium">$60,000 - $99,999</SelectItem>
                        <SelectItem value="high">$100,000+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Filter Status */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <Filter className="h-4 w-4" />
                    <span>
                      Showing {filteredJobs.length} of {jobs.length} jobs
                      {hasActiveFilters && (
                        <span className="ml-2">
                          (filtered by {educationFilter !== 'all' ? 'education' : ''}
                          {educationFilter !== 'all' && salaryFilter !== 'all' ? ' and ' : ''}
                          {salaryFilter !== 'all' ? 'salary' : ''})
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results Table */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-gray-800">Results for "{major}"</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportToCSV}
                    disabled={filteredJobs.length === 0}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                </div>
                <CardDescription className="text-sm text-gray-600">
                  Showing {filteredJobs.length} unique occupations related to {major}
                  </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredJobs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Filter className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No jobs match your current filters.</p>
                    <p className="text-sm">Try adjusting your filter criteria.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table ref={tableRef}>
                      <TableHeader>
                        <TableRow>
                          <TableHead 
                            className="cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => handleSort('title')}
                          >
                            <div className="flex items-center gap-2">
                              Job Title
                              {getSortIcon('title')}
                            </div>
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => handleSort('entry_education')}
                          >
                            <div className="flex items-center gap-2">
                              Required Education
                              {getSortIcon('entry_education')}
                            </div>
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => handleSort('median_wage')}
                          >
                            <div className="flex items-center gap-2">
                              Median Salary
                              {getSortIcon('median_wage')}
                            </div>
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => handleSort('employment_level')}
                          >
                            <div className="flex items-center gap-2">
                              Employment Level
                              {getSortIcon('employment_level')}
                            </div>
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => handleSort('annual_openings')}
                          >
                            <div className="flex items-center gap-2">
                              Annual Openings
                              {getSortIcon('annual_openings')}
                            </div>
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => handleSort('unemployment_rate')}
                          >
                            <div className="flex items-center gap-2">
                              Unemployment Rate
                              {getSortIcon('unemployment_rate')}
                            </div>
                          </TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredJobs.map((job, index) => (
                          <TableRow key={`${job.soc}-${job.title.replace(/[^a-zA-Z0-9]/g, '')}`}>
                            <TableCell className="font-medium">{job.title}</TableCell>
                            <TableCell>
                              {job.entry_education || 'N/A'}
                            </TableCell>
                            <TableCell className="font-mono">
                              {formatSalary(job.median_wage)}
                            </TableCell>
                            <TableCell className="font-mono">
                              {formatEmployment(job.employment_level)}
                            </TableCell>
                            <TableCell className="font-mono">
                              {formatOpenings(job.annual_openings)}
                            </TableCell>
                            <TableCell className="font-mono">
                              {job.unemployment_rate ? `${job.unemployment_rate.toFixed(2)}%` : 'N/A'}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-xs"
                                onClick={() => window.open(getLinkedInUrl(job.title), '_blank')}
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                LinkedIn
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
} 