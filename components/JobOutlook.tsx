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

export function JobOutlook() {
  const [major, setMajor] = useState('');
  const [educationFilter, setEducationFilter] = useState('all');
  const [salaryFilter, setSalaryFilter] = useState('all');
  const [filteredJobs, setFilteredJobs] = useState<MajorJobMatch[]>([]);
  const [sortField, setSortField] = useState<SortField>('title');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const tableRef = useRef<HTMLTableElement>(null);
  
  const { jobs, loading, error, fetchJobs } = useJobOutlook();

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

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
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
    
    console.log(`✅ Filtered and sorted ${jobs.length} jobs to ${sorted.length} jobs`);
    setFilteredJobs(sorted);
  }, [jobs, educationFilter, salaryFilter, sortField, sortDirection]);

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
    const data = filteredJobs.map(job => ({
      title: job.title,
      soc: job.soc,
      median_wage: job.median_wage,
      employment_level: job.employment_level,
      annual_openings: job.annual_openings,
      entry_education: job.entry_education,
      unemployment_rate: job.unemployment_rate,
      major: major
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Job Outlook Data');
    XLSX.writeFile(wb, `job-outlook-${major}.xlsx`);
  };

  const getLinkedInUrl = (jobTitle: string) => {
    // Extract only the job title before the comma (if any)
    const cleanTitle = jobTitle.split(',')[0].trim();
    return `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(cleanTitle)}`;
  };

  // Function to create unique job identifier to differentiate duplicates
  const getUniqueJobId = (job: MajorJobMatch, index: number) => {
    // Create a unique identifier based on SOC, title, and index
    return `${job.soc}-${job.title.replace(/[^a-zA-Z0-9]/g, '')}-${index}`;
  };

  // Function to format job title with duplicate indicator
  const formatJobTitle = (job: MajorJobMatch, index: number, allJobs: MajorJobMatch[]) => {
    const sameTitleJobs = allJobs.filter(j => j.title === job.title);
    
    if (sameTitleJobs.length > 1) {
      // Find the position of this job among duplicates (1-based)
      const duplicateIndex = sameTitleJobs.findIndex(j => 
        j.soc === job.soc && 
        j.median_wage === job.median_wage && 
        j.employment_level === job.employment_level
      ) + 1;
      
      return `${job.title} (${duplicateIndex})`;
    }
    
    return job.title;
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
        {/* Search Section */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <Search className="h-5 w-5 text-blue-600" />
              Search by Major
            </CardTitle>
            <CardDescription>
              Enter your major to explore related career opportunities and salary data
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
                {jobs.filter(j => jobs.filter(j2 => j2.title === j.title).length > 1).length > 0 && (
                  <CardDescription className="text-sm text-blue-600">
                    💡 Jobs with numbers in parentheses (e.g., "Software Developers (1)") are duplicates with different data from various majors.
                  </CardDescription>
                )}
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
                          <TableRow key={getUniqueJobId(job, index)}>
                            <TableCell className="font-medium">{formatJobTitle(job, index, jobs)}</TableCell>
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