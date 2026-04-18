import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: CORS });

  try {
    const base44 = createClientFromRequest(req);
    const body   = await req.json().catch(() => ({}));
    const type   = body.type || 'pipeline';

    if (type === 'pipeline') {
      const leads = await base44.asServiceRole.entities.Lead.list();
      const arr   = Array.isArray(leads) ? leads : [];
      const drafted   = arr.filter((l: any) => l.status === 'Email Drafted').length;
      const contacted = arr.filter((l: any) => ['Sent','Opened','Replied','Closed'].includes(l.status)).length;
      const replied   = arr.filter((l: any) => l.status === 'Replied').length;
      const closed    = arr.filter((l: any) => l.status === 'Closed').length;
      const revenue   = arr
        .filter((l: any) => l.status === 'Closed')
        .reduce((s: number, l: any) => s + (Number(String(l.revenue || 1500).replace(/[^0-9.-]+/g,'')) || 1500), 0);
      return Response.json({ ok: true, data: { drafted, contacted, replied, closed, revenue } }, { headers: CORS });
    }

    if (type === 'dashboard') {
      const [timelines, assets] = await Promise.all([
        base44.asServiceRole.entities.Timeline.list(),
        base44.asServiceRole.entities.DigitalAsset.list(),
      ]);
      const t = (Array.isArray(timelines) ? timelines : []).map((t: any) => ({
        id: t.id, name: t.name, status: t.status,
        profit_signal: t.profit_signal, tags: t.tags,
        depth: t.depth, objective: t.objective, last_report: t.last_report,
      }));
      const a = (Array.isArray(assets) ? assets : []).map((a: any) => ({
        id: a.id, title: a.title, asset_type: a.asset_type,
        status: a.status, niche: a.niche, mrr_estimate: a.mrr_estimate,
      }));
      return Response.json({ ok: true, data: { timelines: t, assets: a } }, { headers: CORS });
    }

    return Response.json({ ok: false, error: 'Unknown type' }, { status: 400, headers: CORS });

  } catch (e: any) {
    console.error('publicData error:', e);
    return Response.json({ ok: false, error: e.message }, { status: 500, headers: CORS });
  }
});
