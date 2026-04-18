const base44 = require('@base44/sdk');

(async () => {
  try {
    const parent = await base44.asServiceRole.entities.Timeline.get('69ddca5962531b222897903a');
    
    const newChild = {
      name: `${parent.opportunity_brief.split(',')[0]} — Child Branch`,
      parent_id: parent.id,
      depth: parent.depth + 1,
      status: 'Seed',
      objective: parent.opportunity_brief,
      branch_logic_state: 'Initial seed — evaluating market fit and user demand',
      success_metrics: {
        profit_target: 5000,
        lead_target: 50,
        custom_kpi: 'Waitlist conversion rate'
      },
      profit_signal: 80,
      cycles_below_threshold: 0,
      opportunity_detected: false,
      opportunity_brief: null,
      tags: ['child', 'seed', 'spawned-from-opportunity'],
      last_report: `🌱 SEED SPAWNED from parent (${parent.name}). Objective: ${parent.opportunity_brief}. Initial profit signal: 80.`
    };

    const created = await base44.asServiceRole.entities.Timeline.create(newChild);
    console.log(`✅ Child spawned: ${created.id}`);

    // Reset parent opportunity flags
    await base44.asServiceRole.entities.Timeline.update(parent.id, {
      opportunity_detected: false,
      last_report: `${parent.last_report}\n\n[${new Date().toISOString()}] Spawned child: ${created.id}`
    });

    console.log(`✅ Parent reset: ${parent.id}`);
  } catch (err) {
    console.error('Spawn failed:', err.message);
    process.exit(1);
  }
})();
