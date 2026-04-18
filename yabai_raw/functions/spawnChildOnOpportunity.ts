import { base44 } from 'https://deno.land/x/base44/mod.ts';

export default async function spawnChildOnOpportunity(req: Request) {
  try {
    const { parent_id, opportunity_brief, parent_data } = await req.json();

    // Create child timeline with service role to bypass permission checks
    const child = await base44.asServiceRole.entities.Timeline.create({
      name: `${parent_data.name} → Child Branch`,
      parent_id: parent_id,
      depth: (parent_data.depth || 0) + 1,
      status: 'Seed',
      objective: opportunity_brief,
      branch_logic_state: `Child branch spawned from parent: ${parent_data.branch_logic_state}`,
      success_metrics: {
        custom_kpi: 'Child branch validated',
        profit_target: parent_data.success_metrics?.profit_target || 5000,
        lead_target: parent_data.success_metrics?.lead_target || 50,
      },
      profit_signal: parent_data.profit_signal * 0.85, // Inherit 85% of parent signal
      cycles_below_threshold: 0,
      opportunity_detected: false,
      last_report: `🌱 SPAWNED: Child branch created from parent opportunity. Pursuing: ${opportunity_brief}`,
      tags: [
        ...(parent_data.tags || []),
        `depth-${(parent_data.depth || 0) + 1}`,
        'child-branch',
      ],
    });

    // Reset parent's opportunity flag
    await base44.asServiceRole.entities.Timeline.update(parent_id, {
      opportunity_detected: false,
      last_report: `${parent_data.last_report}\n\n✅ CHILD SPAWNED: ID ${child.id}`,
    });

    return new Response(
      JSON.stringify({
        success: true,
        child_id: child.id,
        parent_reset: true,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Spawn error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
