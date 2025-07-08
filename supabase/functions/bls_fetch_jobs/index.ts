import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js';

serve(async () => {
  const supa = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  /* 1. Get distinct SOC codes (400 max to keep API calls light) */
  const { data: socRows } = await supa
    .from('cip_soc_xwalk')
    .select('soc')
    .limit(400)
    .group('soc');

  if (!socRows?.length) return new Response('no soc codes');

  for (const { soc } of socRows) {
    try {
      /* BLS wage series ID: OEUM + SOC w/o dash + 000000 */
      const series = 'OEUM' + soc.replace('-', '') + '000000';
      const key = Deno.env.get('BLS_API_KEY')!;
const wageUrl = `https://api.bls.gov/publicAPI/v2/timeseries/data/${series}?api_key=${key}`;
      const wageJson = await fetch(wageUrl).then(r => r.json());
      const wageVal  = wageJson.Results?.series?.[0]?.data?.[0]?.value;
      if (!wageVal) continue;

      /* Employment-projection CSV (growth %) */
      const epUrl   = `https://download.bls.gov/pub/time.series/ep/ep_data.${soc}.json`;
      const epJson  = await fetch(epUrl).then(r => r.json()).catch(()=>null);
      const growth  = epJson?.[0]?.pct_emp_change ?? null;
      if (growth === null) continue;

      /* Optional occupation title from O*NET mini service */
      const titleUrl = `https://services.onetcenter.org/ws/mnm/careers/${soc}.json`;
      const titleRes = await fetch(titleUrl).catch(()=>null);
      const titleObj = titleRes && titleRes.ok ? await titleRes.json() : { title: '' };

      await supa.from('occupations').upsert({
        soc,
        title       : titleObj.title || '',
        median_wage : parseInt(wageVal.replace(',','')),
        growth_pct  : parseFloat(growth),
        updated_at  : new Date().toISOString()
      });
    } catch { /* skip bad code */ }
  }
  return new Response('ok');
}); 