import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const url     = new URL(req.url!);
  const cip     = url.searchParams.get('cip');        // e.g. 52.0201
  const state   = url.searchParams.get('state') || ''; // optional 2-letter
  const limit   = url.searchParams.get('limit') || '15';

  if (!cip) return NextResponse.json({error:'cip required'},{status:400});

  const KEY   = process.env.SCORECARD_KEY!;
  if (!KEY) {
    console.error('SCORECARD_KEY not found in environment variables');
    return NextResponse.json({error:'API key not configured'},{status:500});
  }

  /* build Scorecard query */
  const base  = 'https://api.data.gov/ed/collegescorecard/v1/schools';
  const fields= [
    'id','school.name','school.city','school.state','school.school_url',
    'latest.student.net_price.average',
    'latest.student.transfer_rate',
    `latest.academics.program_percentage.cip_${cip.replace('.','_')}`
  ].join(',');
  const qs    = new URLSearchParams({
    api_key: KEY,
    fields,
    [`latest.academics.program_percentage.cip_${cip.replace('.','_')}__range`]:'0.02..',
    per_page: limit,
    sort: `latest.student.net_price.average:asc`
  });
  if (state) qs.append('school.state', state);

  try {
    const resp  = await fetch(`${base}?${qs.toString()}`);
    if (!resp.ok) {
      console.error('College Scorecard API error:', resp.status, resp.statusText);
      return NextResponse.json({error:'Failed to fetch from College Scorecard API'},{status:500});
    }
    
    const json  = await resp.json();
    const rows  = json.results?.map((r:any)=>({
      id       : r.id,
      name     : r['school.name'],
      city     : r['school.city'],
      state    : r['school.state'],
      url      : r['school.school_url'],
      net_price: r['latest.student.net_price.average'],
      transfer : r['latest.student.transfer_rate'],
      pct_major: r[`latest.academics.program_percentage.cip_${cip.replace('.','_')}`]
    })) ?? [];

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching teach-out data:', error);
    return NextResponse.json({error:'Internal server error'},{status:500});
  }
} 