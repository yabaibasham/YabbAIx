import { base44 } from '@base44/deno';

export default async function spawnOpportunityChild(req: Request) {
  const body = await req.json();
  const { parentId, opportunityBrief, parentData } = body;

  try {
    // Spawn child Timeline as service role
    const childTimeline = await base44.asServiceRole.entities.Timeline.create({
      name: `Branch Child — ${parentData.name} → ${opportunityBrief.substring(0, 40)}...`,
      parent_id: parentId,
      depth: (parentData.depth || 0) + 1,
      branch_logic_state: `Execute opportunity: ${opportunityBrief}`,
      objective: opportunityBrief,
      status: 'Seed',
      success_metrics: {
        custom_kpi: 'Validate and iterate',
        profit_target: (parentData.success_metrics?.profit_target || 5000) * 1.25,
        lead_target: (parentData.success_metrics?.lead_target || 20) * 1.5,
      },
      profit_signal: 0,
      cycles_below_threshold: 0,
      last_report: `🌱 SPAWNED from ${parentData.name} | Opportunity: ${opportunityBrief.substring(0, 60)}... | Status: Seed, awaiting validation`,
      opportunity_detected: false,
      opportunity_brief: null,
      tags: [...(parentData.tags || []), 'spawned-from-opportunity', `depth-${(parentData.depth || 0) + 1}`],
    });

    // Reset parent opportunity flag as service role
    await base44.asServiceRole.entities.Timeline.update(parentId, {
      opportunity_detected: false,
      last_report: `${parentData.last_report}\n\n✅ SPAWNED CHILD: ${childTimeline.id} | Brief: ${opportunityBrief.substring(0, 60)}...`,
    });

    return new Response(
      JSON.stringify({
        success: true,
        childId: childTimeline.id,
        childName: childTimeline.name,
        parentReset: true,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error spawning opportunity child:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: String(error),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
