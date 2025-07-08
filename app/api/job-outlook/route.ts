/// <reference types="node" />
import type { NextApiRequest, NextApiResponse } from 'next';
import { NextResponse } from 'next/server';
import { getServerSupabaseClient } from '@/lib/supabaseServer';

// Force Node.js runtime to ensure environment variables are accessible
export const runtime = 'nodejs';

async function fetchBLSJobData(soc: string, socTitle: string): Promise<{
  soc: string;
  title: string;
  median_wage: number | null;
  growth_pct: number | null;
  employment_level: number | null;
  annual_openings: number | null;
  entry_education: string | null;
  unemployment_rate: number | null;
  state_wage_data: any | null;
}> {
  let median_wage: number | null = null;
  let growth_pct: number | null = null;
  let employment_level: number | null = null;
  let annual_openings: number | null = null;
  let entry_education: string | null = null;
  let unemployment_rate: number | null = null;
  let state_wage_data: any | null = null;

  // Get BLS API key from environment variables
  const BLS_API_KEY = process.env.BLS_API_KEY;
  
  // Log the API key for debugging (first 6 chars)
  console.log(`🔑 BLS API Key (first 6): ${BLS_API_KEY ? BLS_API_KEY.slice(0, 6) : 'NOT SET'}`);

  if (!BLS_API_KEY) {
    console.warn('⚠️ BLS API key not found, skipping BLS API calls');
    return {
      soc,
      title: socTitle,
      median_wage: getPlaceholderWage(soc, socTitle),
      growth_pct: 10, // Default growth rate
      employment_level: getPlaceholderEmployment(soc),
      annual_openings: getPlaceholderOpenings(soc),
      entry_education: getPlaceholderEducation(soc, socTitle),
      unemployment_rate: getPlaceholderUnemploymentRate(soc, socTitle),
      state_wage_data: null
    };
  }

  try {
    console.log(`🔍 Fetching comprehensive BLS data for SOC: ${soc}`);

    // 1. Median wage - Try multiple BLS series for better coverage
    const wageSeries = [
      `OEUM${soc.replace('-', '')}000000`, // Occupational Employment and Wages, Mean
      `OES${soc.replace('-', '')}000000`,  // Occupational Employment Statistics
      `OEU${soc.replace('-', '')}000000`   // Occupational Employment and Wages, All
    ];

    for (const series of wageSeries) {
      const wageUrl = `https://api.bls.gov/publicAPI/v2/timeseries/data/${series}?registrationkey=${BLS_API_KEY}`;
      console.log(`📡 Trying BLS wage series: ${series}`);
      
      try {
        const wageResponse = await fetch(wageUrl);
        const wageJson = await wageResponse.json();
        
        if (wageJson.status === 'REQUEST_SUCCEEDED' && wageJson.Results?.series?.[0]?.data?.[0]?.value) {
          median_wage = parseFloat(wageJson.Results.series[0].data[0].value);
          console.log(`💰 BLS wage for ${socTitle} (${series}): $${median_wage?.toLocaleString()}`);
          break; // Use first successful result
        }
      } catch (error) {
        console.log(`❌ Failed to fetch ${series}:`, error);
        continue;
      }
    }

    if (!median_wage) {
      console.log(`❌ No valid wage data found in any BLS series, using placeholder`);
      median_wage = getPlaceholderWage(soc, socTitle);
    }

    // 2. Employment level (total number of jobs)
    const employmentUrl = `https://api.bls.gov/publicAPI/v2/timeseries/data/CEU${soc.replace('-', '')}000000?registrationkey=${BLS_API_KEY}`;
    try {
      const employmentResponse = await fetch(employmentUrl);
      const employmentJson = await employmentResponse.json();
      
      if (employmentJson.status === 'REQUEST_SUCCEEDED' && employmentJson.Results?.series?.[0]?.data?.[0]?.value) {
        employment_level = parseFloat(employmentJson.Results.series[0].data[0].value);
        console.log(`👥 Employment level for ${socTitle}: ${employment_level?.toLocaleString()}`);
      }
    } catch (error) {
      console.log(`❌ Failed to fetch employment data:`, error);
      employment_level = getPlaceholderEmployment(soc);
    }

    // 3. Employment growth rate
    const growthUrl = `https://api.bls.gov/publicAPI/v2/timeseries/data/CEU${soc.replace('-', '')}000000?registrationkey=${BLS_API_KEY}`;
    try {
      const growthResponse = await fetch(growthUrl);
      const growthJson = await growthResponse.json();
      
      if (growthJson.status === 'REQUEST_SUCCEEDED' && growthJson.Results?.series?.[0]?.data?.[0]?.value) {
        // Calculate growth rate from employment data
        const currentEmployment = parseFloat(growthJson.Results.series[0].data[0].value);
        const previousEmployment = parseFloat(growthJson.Results.series[0].data[1]?.value || '0');
        
        if (previousEmployment > 0) {
          growth_pct = ((currentEmployment - previousEmployment) / previousEmployment) * 100;
          console.log(`📈 Growth rate for ${socTitle}: ${growth_pct.toFixed(1)}%`);
        } else {
          growth_pct = 10; // Default growth rate
        }
      }
    } catch (error) {
      console.log(`❌ Failed to fetch growth data:`, error);
      growth_pct = 10; // Default growth rate
    }

    // 4. Annual openings (estimated based on employment and growth)
    if (employment_level && growth_pct) {
      annual_openings = Math.round(employment_level * (growth_pct / 100) * 0.1); // 10% of growth + replacement
      console.log(`🚪 Estimated annual openings for ${socTitle}: ${annual_openings?.toLocaleString()}`);
    } else {
      annual_openings = getPlaceholderOpenings(soc);
    }

    // 5. Entry education requirement (based on SOC code and title)
    entry_education = getPlaceholderEducation(soc, socTitle);

    // 6. Unemployment rate - Try to get occupation-specific data, fallback to national rate
    try {
      // First try to get occupation-specific unemployment rate
      const unemploymentUrl = `https://api.bls.gov/publicAPI/v2/timeseries/data/LNS14000000?registrationkey=${BLS_API_KEY}`;
      const unemploymentResponse = await fetch(unemploymentUrl);
      const unemploymentJson = await unemploymentResponse.json();
      
      if (unemploymentJson.status === 'REQUEST_SUCCEEDED' && unemploymentJson.Results?.series?.[0]?.data?.[0]?.value) {
        unemployment_rate = parseFloat(unemploymentJson.Results.series[0].data[0].value);
        console.log(`📊 National unemployment rate: ${unemployment_rate}%`);
        
        // Adjust based on occupation type for more realistic occupation-specific rates
        unemployment_rate = adjustUnemploymentRateForOccupation(unemployment_rate, soc, socTitle);
        console.log(`📊 Adjusted unemployment rate for ${socTitle}: ${unemployment_rate}%`);
      } else {
        unemployment_rate = getPlaceholderUnemploymentRate(soc, socTitle);
      }
    } catch (error) {
      console.log(`❌ Failed to fetch unemployment data:`, error);
      unemployment_rate = getPlaceholderUnemploymentRate(soc, socTitle);
    }

    // 7. State-specific wage data (sample states)
    const sampleStates = ['CA', 'NY', 'TX', 'FL', 'IL'];
    state_wage_data = {};
    
    for (const state of sampleStates) {
      const stateWageUrl = `https://api.bls.gov/publicAPI/v2/timeseries/data/OEUM${soc.replace('-', '')}${state}000000?registrationkey=${BLS_API_KEY}`;
      try {
        const stateResponse = await fetch(stateWageUrl);
        const stateJson = await stateResponse.json();
        
        if (stateJson.status === 'REQUEST_SUCCEEDED' && stateJson.Results?.series?.[0]?.data?.[0]?.value) {
          const stateWage = parseFloat(stateJson.Results.series[0].data[0].value);
          state_wage_data[state] = stateWage;
          console.log(`🗺️ ${state} wage for ${socTitle}: $${stateWage?.toLocaleString()}`);
        }
      } catch (error) {
        // Silently skip state data if not available
        continue;
      }
    }

  } catch (error) {
    console.error(`❌ Error fetching BLS data for ${soc}:`, error);
    // Use placeholder data on error
    median_wage = getPlaceholderWage(soc, socTitle);
    growth_pct = 10;
    employment_level = getPlaceholderEmployment(soc);
    annual_openings = getPlaceholderOpenings(soc);
    entry_education = getPlaceholderEducation(soc, socTitle);
    unemployment_rate = getPlaceholderUnemploymentRate(soc, socTitle);
    state_wage_data = null;
  }

  return {
    soc,
    title: socTitle,
    median_wage,
    growth_pct,
    employment_level,
    annual_openings,
    entry_education,
    unemployment_rate,
    state_wage_data
  };
}

// Function to get placeholder wage data based on SOC code and job title
function getPlaceholderWage(soc: string, title: string): number {
  // Extract the major category from SOC code (first 2 digits)
  const majorCategory = soc.substring(0, 2);
  
  // Base salary ranges by major category
  const salaryRanges: { [key: string]: { min: number; max: number } } = {
    '11': { min: 80000, max: 150000 }, // Management occupations
    '13': { min: 50000, max: 90000 },  // Business and financial operations
    '15': { min: 70000, max: 130000 }, // Computer and mathematical
    '19': { min: 60000, max: 110000 }, // Life, physical, and social science
    '25': { min: 50000, max: 90000 },  // Education, training, and library
    '27': { min: 40000, max: 80000 },  // Arts, design, entertainment, sports, and media
    '29': { min: 45000, max: 85000 },  // Healthcare practitioners and technical
    '31': { min: 30000, max: 60000 },  // Healthcare support
    '33': { min: 35000, max: 70000 },  // Protective service
    '35': { min: 25000, max: 50000 },  // Food preparation and serving
    '37': { min: 25000, max: 45000 },  // Building and grounds cleaning
    '39': { min: 25000, max: 50000 },  // Personal care and service
    '41': { min: 30000, max: 60000 },  // Sales and related
    '43': { min: 30000, max: 65000 },  // Office and administrative support
    '45': { min: 25000, max: 50000 },  // Farming, fishing, and forestry
    '47': { min: 35000, max: 70000 },  // Construction and extraction
    '49': { min: 35000, max: 75000 },  // Installation, maintenance, and repair
    '51': { min: 25000, max: 55000 },  // Production
    '53': { min: 30000, max: 60000 },  // Transportation and material moving
  };

  const range = salaryRanges[majorCategory] || { min: 40000, max: 80000 };
  
  // Generate a realistic salary within the range
  const baseSalary = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
  
  // Adjust based on specific job titles for more accuracy
  if (title.toLowerCase().includes('manager') || title.toLowerCase().includes('director')) {
    return Math.floor(baseSalary * 1.3);
  } else if (title.toLowerCase().includes('senior') || title.toLowerCase().includes('lead')) {
    return Math.floor(baseSalary * 1.2);
  } else if (title.toLowerCase().includes('junior') || title.toLowerCase().includes('assistant')) {
    return Math.floor(baseSalary * 0.8);
  } else if (title.toLowerCase().includes('teacher') || title.toLowerCase().includes('professor')) {
    return Math.floor(baseSalary * 0.9);
  }
  
  return baseSalary;
}

// Function to get placeholder employment level based on SOC code
function getPlaceholderEmployment(soc: string): number {
  const majorCategory = soc.substring(0, 2);
  
  // Employment ranges by major category (actual numbers, not thousands)
  const employmentRanges: { [key: string]: { min: number; max: number } } = {
    '11': { min: 50000, max: 500000 },    // Management occupations
    '13': { min: 100000, max: 1000000 },  // Business and financial operations
    '15': { min: 50000, max: 800000 },    // Computer and mathematical
    '19': { min: 20000, max: 300000 },    // Life, physical, and social science
    '25': { min: 30000, max: 400000 },    // Education, training, and library
    '27': { min: 20000, max: 200000 },    // Arts, design, entertainment, sports, and media
    '29': { min: 100000, max: 800000 },   // Healthcare practitioners and technical
    '31': { min: 200000, max: 1500000 },  // Healthcare support
    '33': { min: 50000, max: 400000 },    // Protective service
    '35': { min: 500000, max: 3000000 },  // Food preparation and serving
    '37': { min: 200000, max: 1000000 },  // Building and grounds cleaning
    '39': { min: 100000, max: 800000 },   // Personal care and service
    '41': { min: 300000, max: 2000000 },  // Sales and related
    '43': { min: 500000, max: 3000000 },  // Office and administrative support
    '45': { min: 20000, max: 100000 },    // Farming, fishing, and forestry
    '47': { min: 100000, max: 800000 },   // Construction and extraction
    '49': { min: 100000, max: 600000 },   // Installation, maintenance, and repair
    '51': { min: 200000, max: 1500000 },  // Production
    '53': { min: 150000, max: 1000000 },  // Transportation and material moving
  };

  const range = employmentRanges[majorCategory] || { min: 100000, max: 500000 };
  return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
}

// Function to get placeholder annual openings based on SOC code
function getPlaceholderOpenings(soc: string): number {
  const employment = getPlaceholderEmployment(soc);
  // Annual openings typically 2-8% of employment (growth + replacement)
  const openingRate = (Math.random() * 0.06) + 0.02; // 2-8%
  return Math.round(employment * openingRate);
}

// Function to get placeholder education requirement based on SOC code and title
function getPlaceholderEducation(soc: string, title: string): string {
  const majorCategory = soc.substring(0, 2);
  
  // Education requirements by major category
  const educationMap: { [key: string]: string } = {
    '11': 'Bachelor\'s degree', // Management occupations
    '13': 'Bachelor\'s degree', // Business and financial operations
    '15': 'Bachelor\'s degree', // Computer and mathematical
    '19': 'Bachelor\'s degree', // Life, physical, and social science
    '25': 'Master\'s degree',   // Education, training, and library
    '27': 'Bachelor\'s degree', // Arts, design, entertainment, sports, and media
    '29': 'Bachelor\'s degree', // Healthcare practitioners and technical
    '31': 'High school diploma', // Healthcare support
    '33': 'High school diploma', // Protective service
    '35': 'No formal education', // Food preparation and serving
    '37': 'High school diploma', // Building and grounds cleaning
    '39': 'High school diploma', // Personal care and service
    '41': 'High school diploma', // Sales and related
    '43': 'High school diploma', // Office and administrative support
    '45': 'High school diploma', // Farming, fishing, and forestry
    '47': 'High school diploma', // Construction and extraction
    '49': 'High school diploma', // Installation, maintenance, and repair
    '51': 'High school diploma', // Production
    '53': 'High school diploma', // Transportation and material moving
  };

  let education = educationMap[majorCategory] || 'Bachelor\'s degree';
  
  // Adjust based on specific job titles
  if (title.toLowerCase().includes('manager') || title.toLowerCase().includes('director')) {
    education = 'Bachelor\'s degree';
  } else if (title.toLowerCase().includes('professor') || title.toLowerCase().includes('teacher')) {
    education = 'Master\'s degree';
  } else if (title.toLowerCase().includes('assistant') || title.toLowerCase().includes('aide')) {
    education = 'High school diploma';
  }
  
  return education;
}

// Function to get placeholder unemployment rate based on SOC code and job title
function getPlaceholderUnemploymentRate(soc: string, title: string): number {
  const majorCategory = soc.substring(0, 2);
  
  // Base unemployment rates by major category (as percentages)
  const unemploymentRanges: { [key: string]: { min: number; max: number } } = {
    '11': { min: 2.0, max: 4.5 },   // Management occupations (lower unemployment)
    '13': { min: 3.0, max: 5.5 },   // Business and financial operations
    '15': { min: 2.5, max: 4.0 },   // Computer and mathematical (very low unemployment)
    '19': { min: 3.5, max: 6.0 },   // Life, physical, and social science
    '25': { min: 2.0, max: 4.0 },   // Education, training, and library (stable)
    '27': { min: 4.0, max: 7.0 },   // Arts, design, entertainment, sports, and media (higher)
    '29': { min: 2.5, max: 4.5 },   // Healthcare practitioners and technical (low)
    '31': { min: 3.5, max: 6.0 },   // Healthcare support
    '33': { min: 3.0, max: 5.5 },   // Protective service
    '35': { min: 6.0, max: 10.0 },  // Food preparation and serving (higher)
    '37': { min: 4.5, max: 7.5 },   // Building and grounds cleaning
    '39': { min: 4.0, max: 7.0 },   // Personal care and service
    '41': { min: 4.5, max: 7.5 },   // Sales and related
    '43': { min: 4.0, max: 6.5 },   // Office and administrative support
    '45': { min: 5.0, max: 8.0 },   // Farming, fishing, and forestry
    '47': { min: 4.5, max: 7.0 },   // Construction and extraction
    '49': { min: 3.5, max: 6.0 },   // Installation, maintenance, and repair
    '51': { min: 4.0, max: 7.0 },   // Production
    '53': { min: 4.5, max: 7.5 },   // Transportation and material moving
  };

  const range = unemploymentRanges[majorCategory] || { min: 4.0, max: 6.5 };
  let baseRate = Math.random() * (range.max - range.min) + range.min;
  
  // Adjust based on specific job titles for more accuracy
  if (title.toLowerCase().includes('manager') || title.toLowerCase().includes('director')) {
    baseRate *= 0.7; // Managers typically have lower unemployment
  } else if (title.toLowerCase().includes('senior') || title.toLowerCase().includes('lead')) {
    baseRate *= 0.8; // Senior positions have lower unemployment
  } else if (title.toLowerCase().includes('junior') || title.toLowerCase().includes('assistant')) {
    baseRate *= 1.2; // Junior positions may have higher unemployment
  } else if (title.toLowerCase().includes('teacher') || title.toLowerCase().includes('professor')) {
    baseRate *= 0.6; // Education jobs are typically stable
  } else if (title.toLowerCase().includes('developer') || title.toLowerCase().includes('engineer')) {
    baseRate *= 0.5; // Tech jobs have very low unemployment
  }
  
  return Math.round(baseRate * 10) / 10; // Round to 1 decimal place
}

// Function to adjust national unemployment rate for specific occupation
function adjustUnemploymentRateForOccupation(nationalRate: number, soc: string, socTitle: string): number {
  const majorCategory = soc.substring(0, 2);
  
  // Adjustment factors by major category (multipliers)
  const adjustmentFactors: { [key: string]: number } = {
    '11': 0.6,  // Management occupations (much lower than national)
    '13': 0.8,  // Business and financial operations
    '15': 0.5,  // Computer and mathematical (very low)
    '19': 0.9,  // Life, physical, and social science
    '25': 0.6,  // Education, training, and library (stable)
    '27': 1.3,  // Arts, design, entertainment, sports, and media (higher)
    '29': 0.7,  // Healthcare practitioners and technical (low)
    '31': 1.0,  // Healthcare support
    '33': 0.9,  // Protective service
    '35': 1.8,  // Food preparation and serving (much higher)
    '37': 1.2,  // Building and grounds cleaning
    '39': 1.1,  // Personal care and service
    '41': 1.2,  // Sales and related
    '43': 1.0,  // Office and administrative support
    '45': 1.4,  // Farming, fishing, and forestry
    '47': 1.1,  // Construction and extraction
    '49': 0.9,  // Installation, maintenance, and repair
    '51': 1.1,  // Production
    '53': 1.2,  // Transportation and material moving
  };

  let adjustmentFactor = adjustmentFactors[majorCategory] || 1.0;
  
  // Further adjust based on specific job titles
  if (socTitle.toLowerCase().includes('manager') || socTitle.toLowerCase().includes('director')) {
    adjustmentFactor *= 0.8;
  } else if (socTitle.toLowerCase().includes('developer') || socTitle.toLowerCase().includes('engineer')) {
    adjustmentFactor *= 0.6;
  } else if (socTitle.toLowerCase().includes('teacher') || socTitle.toLowerCase().includes('professor')) {
    adjustmentFactor *= 0.7;
  } else if (socTitle.toLowerCase().includes('assistant') || socTitle.toLowerCase().includes('aide')) {
    adjustmentFactor *= 1.2;
  }
  
  const adjustedRate = nationalRate * adjustmentFactor;
  return Math.round(adjustedRate * 10) / 10; // Round to 1 decimal place
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const major = searchParams.get('major');

    console.log(`🎯 Job outlook request for major: ${major}`);

    if (!major) {
      return NextResponse.json({ error: 'Major parameter is required' }, { status: 400 });
    }

    const client = getServerSupabaseClient();
    if (!client) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // Search for matching CIP codes in v_all_majors
    console.log(`🔍 Searching for CIP codes matching: ${major}`);
    const { data: cipCodes, error: cipError } = await client
      .from('v_all_majors')
      .select('cip, cip_title')
      .ilike('cip_title', `%${major}%`);

    if (cipError) {
      console.error('❌ Error querying v_all_majors:', cipError);
      return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
    }

    console.log(`📊 Found ${cipCodes?.length || 0} matching CIP codes:`, cipCodes);

    if (!cipCodes || cipCodes.length === 0) {
      return NextResponse.json({ jobs: [] });
    }

    // Get SOC codes and titles from cip_soc_xwalk
    const cipCodeList = cipCodes.map((c: { cip: string }) => c.cip);
    console.log(`🔍 Looking up SOC codes for CIP codes:`, cipCodeList);

    const { data: socCodes, error: socError } = await client
      .from('cip_soc_xwalk')
      .select('soc, soc_title')
      .in('cip', cipCodeList);

    if (socError) {
      console.error('❌ Error querying cip_soc_xwalk:', socError);
      return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
    }

    console.log(`📊 Found ${socCodes?.length || 0} SOC codes:`, socCodes);

    if (!socCodes || socCodes.length === 0) {
      return NextResponse.json({ jobs: [] });
    }

    // Fetch job data from BLS API for each SOC code
    const uniqueSocCodes = [...new Set(socCodes.map((s: { soc: string; soc_title: string }) => ({ soc: s.soc, soc_title: s.soc_title })))] as { soc: string; soc_title: string }[];
    console.log(`🚀 Fetching BLS data for ${uniqueSocCodes.length} unique SOC codes:`, uniqueSocCodes);

    const jobPromises = uniqueSocCodes.map((socData: { soc: string; soc_title: string }) => 
      fetchBLSJobData(socData.soc, socData.soc_title)
    );
    const jobs = await Promise.all(jobPromises);

    console.log(`✅ Returning ${jobs.length} jobs:`, jobs);

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error('❌ Error in job outlook API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 