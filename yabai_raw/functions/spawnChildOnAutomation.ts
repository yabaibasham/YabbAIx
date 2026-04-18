import { base44 } from 'https://esm.sh/@base44/sdk@latest';

export async function spawnChildOnAutomation(event: any) {
  const parentId = event.entity_id;
  const parentData = event.data;
  
  console.log(`[SPAWN] Parent: ${parentData.name} (Signal: ${parentData.profit_signal})`);
  
  // Safety checks
  const depth = parentData.depth || 0;
  if (depth >= 3) {
    console.log('[SPAWN] Depth cap reached, halting');
    return { ok: false, reason: 'depth_cap' };
  }
  
  const childName = `${parentData.opportunity_brief?.split(' ')[0] || 'CHILD'} AI → ${parentData.opportunity_brief || 'Opportunity'}`;
  
  try {
    // Spawn as service role (admin)
    const child = await base44.asServiceRole.entities.Timeline.create({
      name: childName,
      parent_id: parentId,
      depth: depth + 1,
      status: 'Seed',
      objective: parentData.opportunity_brief,
      branch_logic_state: 'Spawned from opportunity',
      profit_signal: 0,
      cycles_below_threshold: 0,
      opportunity_detected: false,
      tags: [...(parentData.tags || []), 'child-spawn'],
      success_metrics: {
        custom_kpi: 'Child branch validation',
        profit_target: (parentData.success_metrics?.profit_target || 10000) / 2,
        lead_target: (parentData.success_metrics?.lead_target || 50) / 2
      }
    });
    
    console.log(`[SPAWN] ✅ Child created: ${child.id}`);
    
    // Reset parent
    await base44.asServiceRole.entities.Timeline.update(parentId, {
      opportunity_detected: false
    });
    
    return { ok: true, child_id: child.id };
  } catch (err) {
    console.error('[SPAWN] Error:', err);
    return { ok: false, error: err.message };
  }
}
