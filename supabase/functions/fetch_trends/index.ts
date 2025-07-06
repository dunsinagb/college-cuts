import { createClient } from 'https://esm.sh/@supabase/supabase-js';
import 'https://deno.land/x/dotenv/load.ts';

const supa = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const apiKey = Deno.env.get('SCORECARD_KEY')!;

const cips = ['52.0301','45.1001','09.0101']; // start with 3 demo majors
const institutions = await supa.from('institutions').select('id,ipeds_id');

for (const cip of cips) {
  for (const inst of institutions.data ?? []) {
    const url =
      `https://api.data.gov/ed/collegescorecard/v1/schools` +
      `?api_key=${apiKey}&id=${inst.ipeds_id}` +
      `&fields=latest.academics.program_percentage.${cip},2019.academics.program_percentage.${cip}`;

    const { results } = await (await fetch(url)).json();
    const [row]     = results;
    const yr2023    = row?.latest?.academics?.program_percentage?.[cip] ?? 0;
    const yr2019    = row?.['2019']?.academics?.program_percentage?.[cip] ?? 0;
    const trendPct  = yr2019 ? ((yr2023 - yr2019) / yr2019) * 100 : 0;

    await supa.from('major_trends').upsert({
      ipeds_id: inst.ipeds_id,
      cip_code: cip,
      yr_2019 : yr2019,
      yr_2023 : yr2023,
      trend_pct: trendPct,
      updated_at: new Date().toISOString()
    });
  }
} 