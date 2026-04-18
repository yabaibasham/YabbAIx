import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

export default async function workerOpportunitySpawn(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    
    // The automation passes the updated timeline entity as data
    const timeline = body.data || body;
    
    if (!timeline.id) {
      return Response.json({ ok: false, error: 'No timeline ID provided' });
    }

    // Safety checks
    if (!timeline.opportunity_detected || !timeline.opportunity_brief) {
      return Response.json({ ok: false, reason: 'No opportunity detected or brief missing' });
    }

    if (timeline.depth >= 3) {
      return Response.json({ ok: false, reason: 'Max depth reached' });
    }

    // Count total live branches
    const allTimelines = await base44.asServiceRole.entities.Timeline.list();
    const liveCount = allTimelines.filter((t: any) => t.status !== 'Culled').length;
    
    if (liveCount >= 50) {
      return Response.json({ ok: false, reason: 'Branch cap (50) reached' });
    }

    // Create the child timeline
    const child = await base44.asServiceRole.entities.Timeline.create({
      name: `🔬 CHILD — ${timeline.opportunity_brief.substring(0, 40)}...`,
      parent_id: timeline.id,
      depth: (timeline.depth || 0) + 1,
      status: 'Seed',
      objective: timeline.opportunity_brief,
      branch_logic_state: 'Market validation phase',
      profit_signal: 0,
      cycles_below_threshold: 0,
      success_metrics: {
        profit_target: 25000,
        lead_target: 100,
        custom_kpi: 'Proof of concept validated'
      },
      tags: ['child-spawn', ...(timeline.tags || [])],
      opportunity_detected: false,
      opportunity_brief: ''
    });

    // Reset parent's opportunity flag
    await base44.asServiceRole.entities.Timeline.update(timeline.id, {
      opportunity_detected: false
    });

    return Response.json({
      ok: true,
      childId: child.id,
      childName: child.name,
      parentDepth: timeline.depth,
      childDepth: child.depth
    });

  } catch (error) {
    console.error('Spawn error:', error);
    return Response.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
