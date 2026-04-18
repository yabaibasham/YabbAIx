import { base44 } from '@base44/functions-sdk';

export default async function quickSpawn(req: Request) {
  const body = await req.json();
  const { parentId, opportunity_brief } = body;

  try {
    const parent = await base44.asServiceRole.entities.Timeline.get(parentId);
    
    if (!parent) {
      return Response.json({ error: 'Parent not found' }, { status: 404 });
    }

    // Create child
    const child = await base44.asServiceRole.entities.Timeline.create({
      name: `🔍 Contract Review AI → SMB Law Firms`,
      parent_id: parentId,
      depth: (parent.depth || 0) + 1,
      status: 'Seed',
      objective: opportunity_brief,
      branch_logic_state: 'Market validation — contract review SaaS positioning',
      profit_signal: 0,
      cycles_below_threshold: 0,
      opportunity_detected: false,
      tags: ['contract-review', 'legal-ai', 'smb-focus', 'child-spawn'],
      success_metrics: {
        profit_target: 7500,
        lead_target: 25,
        custom_kpi: 'Sub-niche product-market fit validated'
      }
    });

    // Reset parent
    await base44.asServiceRole.entities.Timeline.update(parentId, {
      opportunity_detected: false
    });

    return Response.json({
      ok: true,
      child_id: child.id,
      parent_id: parentId,
      depth: child.depth
    });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
