'use client';

import { useState, useEffect, useCallback } from 'react';

export interface JobOutlook {
  soc: string;
  title: string;
  median_wage: number | null;
  growth_pct: number | null;
  employment_level: number | null;
  annual_openings: number | null;
  entry_education: string | null;
  state_wage_data: any | null;
}

export interface MajorJobMatch {
  soc: string;
  title: string;
  median_wage: number | null;
  growth_pct: number | null;
  employment_level: number | null;
  annual_openings: number | null;
  entry_education: string | null;
  unemployment_rate: number | null;
  state_wage_data: any | null;
}

export function useJobOutlook(initialMajor: string = '') {
  const [jobs, setJobs] = useState<MajorJobMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [major, setMajor] = useState(initialMajor);

  const fetchJobs = useCallback(async (searchMajor: string) => {
    if (!searchMajor || searchMajor.trim().length < 3) {
      setJobs([]);
      return;
    }

    setLoading(true);
    setError(null);
    setMajor(searchMajor);

    try {
      const response = await fetch(`/api/job-outlook?major=${encodeURIComponent(searchMajor)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Transform the API response to match the expected format
      const jobMatches: MajorJobMatch[] = (data.jobs || []).map((job: any) => ({
        soc: job.soc,
        title: job.title,
        median_wage: job.median_wage || null,
        growth_pct: job.growth_pct || null,
        employment_level: job.employment_level || null,
        annual_openings: job.annual_openings || null,
        entry_education: job.entry_education || null,
        unemployment_rate: job.unemployment_rate || null,
        state_wage_data: job.state_wage_data || null
      }));

      setJobs(jobMatches);

    } catch (err) {
      console.error('Error fetching job outlook:', err);
      setError('Failed to fetch job outlook data');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch when major changes (for backward compatibility)
  useEffect(() => {
    if (initialMajor && initialMajor.trim().length >= 3) {
      fetchJobs(initialMajor);
    }
  }, [initialMajor, fetchJobs]);

  return { jobs, loading, error, fetchJobs, major };
} 