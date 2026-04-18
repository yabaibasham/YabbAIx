import { base44 } from '@base44/sdk';

export default async function spawnChildOnSignal(req: any) {
  const { parentId, opportunity_brief, parent_signal } = req.body;

  if (!parentId || !opportunity_brief) {
    return { error: 'Missing parentId or opportunity_brief' };
  }

  try {
    // Create child Timeline
    const child = await base44.asServiceRole.entities.Timeline.create({
      name: `🎯 CHILD SPAWN — ${opportunity_brief.substring(0, 50)}...`,
      parent_id: parentId,
      depth: 2,
      status: 'Seed',
      objective: opportunity_brief,
      branch_logic_state: 'Initial seed phase — gathering market signals',
      success_metrics: {
        custom_kpi: 'Child branch validation',
        profit_target: 5000,
        lead_target: 20,
      },
      profit_signal: 0,
      cycles_below_threshold: 0,
      opportunity_detected: false,
      opportunity_brief: null,
      tags: ['child-spawn', 'automated'],
      last_report: `🌱 CHILD SPAWNED from parent (signal: ${parent_signal}) — Inheriting objective: ${opportunity_brief}`,
    });

    // Reset parent opportunity flag
    await base44.asServiceRole.entities.Timeline.update(parentId, {
      opportunity_detected: false,
      last_report: `✅ CHILD SPAWNED: ${child.id} — Resetting opportunity flag`,
    });

    return { success: true, child_id: child.id, parent_id: parentId };
  } catch (error: any) {
    return { error: error.message, details: error };
  }
}
