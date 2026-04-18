import { base44 } from '@base44/sdk';

export async function spawnTimelineChild(parentId: string, opportunityBrief: string, depth: number) {
  try {
    const newChild = await base44.asServiceRole.entities.Timeline.create({
      name: `Child Branch — ${opportunityBrief.substring(0, 50)}...`,
      parent_id: parentId,
      depth: depth + 1,
      status: "Seed",
      objective: opportunityBrief,
      branch_logic_state: "Initialize validation",
      success_metrics: { custom_kpi: "MVP validation", profit_target: 5000, lead_target: 50 },
      profit_signal: 0,
      cycles_below_threshold: 0,
      opportunity_detected: false,
      opportunity_brief: "",
      tags: ["spawned", `depth-${depth + 1}`],
      last_report: `🌱 SEED SPAWNED from parent. Objective: ${opportunityBrief}`
    });

    // Reset parent's opportunity flag
    await base44.asServiceRole.entities.Timeline.update(parentId, {
      opportunity_detected: false,
      last_report: `[${new Date().toISOString()}] Child timeline spawned: ${newChild.id}`
    });

    return { success: true, childId: newChild.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
