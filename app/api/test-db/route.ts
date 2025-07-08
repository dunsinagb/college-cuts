import { NextResponse } from 'next/server';
import { getServerSupabaseClient } from '@/lib/supabaseServer';

export async function GET() {
  try {
    const client = getServerSupabaseClient();
    if (!client) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // Test basic connection
    const { data: testData, error: testError } = await client
      .from('v_latest_cuts')
      .select('count')
      .limit(1);

    if (testError) {
      return NextResponse.json({ 
        error: 'Database connection failed', 
        details: testError.message 
      }, { status: 500 });
    }

    // Check if occupations table exists
    const { data: occData, error: occError } = await client
      .from('occupations')
      .select('count')
      .limit(1);

    // Check if cip_soc_xwalk table exists
    const { data: xwalkData, error: xwalkError } = await client
      .from('cip_soc_xwalk')
      .select('count')
      .limit(1);

    return NextResponse.json({
      success: true,
      database: 'Connected',
      tables: {
        v_latest_cuts: testError ? 'Error' : 'Exists',
        occupations: occError ? 'Error' : 'Exists',
        cip_soc_xwalk: xwalkError ? 'Error' : 'Exists'
      },
      errors: {
        v_latest_cuts: testError?.message,
        occupations: occError?.message,
        cip_soc_xwalk: xwalkError?.message
      }
    });

  } catch (error) {
    console.error('Test DB error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 