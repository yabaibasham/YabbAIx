import { base44 } from '@base44/functions-sdk';

export default async function spawnChild(event: {
  parent_id: string;
  opportunity_brief: string;
  parent_name: string;
  parent_depth: number;
}) {
  const { parent_id, opportunity_brief, parent_name, parent_depth } = event;

  try {
    // Spawn child Timeline
    const childTimeline = await base44.asServiceRole.entities.Timeline.create({
      name: `Child — ${opportunity_brief.split('.')[0].substring(0, 50)}...`,
      parent_id,
      depth: parent_depth + 1,
      status: 'Seed',
      objective: opportunity_brief,
      branch_logic_state: 'Initial seeding — market research and solution validation',
      success_metrics: {
        custom_kpi: 'Landing page built and published',
        profit_target: 500,
        lead_target: 10,
      },
      profit_signal: 0,
      cycles_below_threshold: 0,
      opportunity_detected: false,
      tags: ['ai', 'saas', `depth-${parent_depth + 1}`],
    });

    // Reset parent's opportunity flag
    await base44.asServiceRole.entities.Timeline.update(parent_id, {
      opportunity_detected: false,
      last_report: `${parent_name} — Child spawned at depth ${parent_depth + 1}\nChild ID: ${childTimeline.id}\nChild objective: ${opportunity_brief}`,
    });

    return {
      success: true,
      child_id: childTimeline.id,
      parent_id,
      depth: parent_depth + 1,
    };
  } catch (error) {
    return {
      success: false,
      error: String(error),
    };
  }
}
