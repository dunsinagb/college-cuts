import { NextResponse } from 'next/server';
import { getServerSupabaseClient } from '@/lib/supabaseServer';

export async function POST() {
  try {
    // DEBUG: Log the first 6 chars of the service role key
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    console.log('Service Role Key (first 6):', serviceRoleKey.slice(0, 6));

    const client = getServerSupabaseClient();
    if (!client) {
      return NextResponse.json({ error: 'Database not configured', serviceRoleKey: serviceRoleKey.slice(0, 6) }, { status: 500 });
    }

    // Sample job data for testing - expanded with more diverse fields
    const sampleJobs = [
      // Computer Science related
      {
        soc: '15-1131',
        title: 'Computer Programmers',
        median_wage: 93400,
        growth_pct: 8.2,
        updated_at: new Date().toISOString()
      },
      {
        soc: '15-1132',
        title: 'Software Developers, Applications',
        median_wage: 124200,
        growth_pct: 22.2,
        updated_at: new Date().toISOString()
      },
      {
        soc: '15-1133',
        title: 'Software Developers, Systems Software',
        median_wage: 132000,
        growth_pct: 20.1,
        updated_at: new Date().toISOString()
      },
      {
        soc: '15-1134',
        title: 'Web Developers',
        median_wage: 78000,
        growth_pct: 15.0,
        updated_at: new Date().toISOString()
      },
      // Economics related
      {
        soc: '13-2011',
        title: 'Accountants and Auditors',
        median_wage: 78000,
        growth_pct: 4.4,
        updated_at: new Date().toISOString()
      },
      {
        soc: '13-2031',
        title: 'Budget Analysts',
        median_wage: 82000,
        growth_pct: 3.0,
        updated_at: new Date().toISOString()
      },
      {
        soc: '13-2051',
        title: 'Financial Analysts',
        median_wage: 96000,
        growth_pct: 8.2,
        updated_at: new Date().toISOString()
      },
      {
        soc: '13-2052',
        title: 'Personal Financial Advisors',
        median_wage: 95000,
        growth_pct: 13.4,
        updated_at: new Date().toISOString()
      },
      // Business related
      {
        soc: '11-1021',
        title: 'General and Operations Managers',
        median_wage: 100000,
        growth_pct: 5.6,
        updated_at: new Date().toISOString()
      },
      {
        soc: '11-2021',
        title: 'Marketing Managers',
        median_wage: 140000,
        growth_pct: 6.6,
        updated_at: new Date().toISOString()
      },
      {
        soc: '11-2022',
        title: 'Sales Managers',
        median_wage: 130000,
        growth_pct: 4.3,
        updated_at: new Date().toISOString()
      },
      // Engineering related
      {
        soc: '17-2071',
        title: 'Electrical Engineers',
        median_wage: 104000,
        growth_pct: 1.7,
        updated_at: new Date().toISOString()
      },
      {
        soc: '17-2072',
        title: 'Electronics Engineers, Except Computer',
        median_wage: 108000,
        growth_pct: 2.0,
        updated_at: new Date().toISOString()
      },
      {
        soc: '17-2141',
        title: 'Mechanical Engineers',
        median_wage: 96000,
        growth_pct: 1.4,
        updated_at: new Date().toISOString()
      },
      // Healthcare related
      {
        soc: '29-1141',
        title: 'Registered Nurses',
        median_wage: 81000,
        growth_pct: 5.6,
        updated_at: new Date().toISOString()
      },
      {
        soc: '29-1229',
        title: 'Physicians, All Other',
        median_wage: 220000,
        growth_pct: 3.0,
        updated_at: new Date().toISOString()
      }
    ];

    // Clear existing data first
    const { error: deleteError } = await client
      .from('occupations')
      .delete()
      .neq('soc', 'dummy'); // Delete all records

    if (deleteError) {
      console.error('Error clearing existing data:', deleteError);
      return NextResponse.json({ error: 'Failed to clear existing data', details: deleteError.message }, { status: 500 });
    }

    // Insert new sample data
    const { data: insertedData, error: insertError } = await client
      .from('occupations')
      .insert(sampleJobs)
      .select();

    if (insertError) {
      console.error('Error inserting sample jobs:', insertError);
      return NextResponse.json({ 
        error: 'Failed to insert test record', 
        details: insertError.message,
        record: sampleJobs[0],
        serviceRoleKey: serviceRoleKey.slice(0, 6)
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Inserted ${sampleJobs.length} sample job records`,
      existingCount: insertedData?.length || 0,
      serviceRoleKey: serviceRoleKey.slice(0, 6)
    });

  } catch (error) {
    console.error('Populate jobs error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 