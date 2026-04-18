import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

export default async function spawnChildTimeline(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const { parentId, opportunityBrief } = await req.json();

    // Fetch parent timeline
    const parent = await base44.asServiceRole.entities.Timeline.get(parentId);
    if (!parent) {
      return new Response(JSON.stringify({ error: 'Parent timeline not found' }), { status: 404 });
    }

    // Depth check
    if (parent.depth >= 3) {
      return new Response(JSON.stringify({ error: 'Max depth reached' }), { status: 400 });
    }

    // Create child timeline
    const child = await base44.asServiceRole.entities.Timeline.create({
      name: `🔬 CHILD — ${opportunityBrief.substring(0, 40)}...`,
      parent_id: parentId,
      depth: parent.depth + 1,
      status: 'Seed',
      objective: opportunityBrief,
      branch_logic_state: 'Market validation phase',
      profit_signal: 0,
      cycles_below_threshold: 0,
      success_metrics: {
        profit_target: 25000,
        lead_target: 100,
        custom_kpi: 'Proof of concept validated'
      },
      tags: ['child-spawn', ...(parent.tags || [])],
      opportunity_detected: false,
      opportunity_brief: ''
    });

    // Reset parent's opportunity flag
    await base44.asServiceRole.entities.Timeline.update(parentId, {
      opportunity_detected: false
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        childId: child.id, 
        childName: child.name 
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error('Spawn error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
