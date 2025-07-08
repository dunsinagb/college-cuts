import { NextResponse } from 'next/server';
import { getServerSupabaseClient } from '@/lib/supabaseServer';

export async function POST() {
  try {
    const client = getServerSupabaseClient();
    if (!client) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // Sample CIP-SOC crosswalk data
    const sampleCrosswalk = [
      {
        cip_code: '11.0101',
        cip_title: 'Computer and Information Sciences, General',
        soc: '15-1131'
      },
      {
        cip_code: '11.0101',
        cip_title: 'Computer and Information Sciences, General',
        soc: '15-1132'
      },
      {
        cip_code: '11.0101',
        cip_title: 'Computer and Information Sciences, General',
        soc: '15-1133'
      },
      {
        cip_code: '52.0301',
        cip_title: 'Accounting',
        soc: '13-2011'
      },
      {
        cip_code: '52.0301',
        cip_title: 'Accounting',
        soc: '13-2031'
      },
      {
        cip_code: '45.0601',
        cip_title: 'Economics, General',
        soc: '19-3011'
      },
      {
        cip_code: '45.0601',
        cip_title: 'Economics, General',
        soc: '19-3022'
      },
      {
        cip_code: '45.0601',
        cip_title: 'Economics, General',
        soc: '11-3031'
      },
      {
        cip_code: '52.0201',
        cip_title: 'Business Administration and Management, General',
        soc: '11-3031'
      },
      {
        cip_code: '52.0201',
        cip_title: 'Business Administration and Management, General',
        soc: '11-3121'
      },
      {
        cip_code: '52.0201',
        cip_title: 'Business Administration and Management, General',
        soc: '11-9199'
      }
    ];

    // Insert sample crosswalk data
    const { error } = await client
      .from('cip_soc_xwalk')
      .upsert(sampleCrosswalk, { onConflict: 'cip_code,soc' });

    if (error) {
      console.error('Error inserting crosswalk data:', error);
      return NextResponse.json({ error: 'Failed to insert crosswalk data' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Inserted ${sampleCrosswalk.length} crosswalk records` 
    });

  } catch (error) {
    console.error('Populate crosswalk error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 