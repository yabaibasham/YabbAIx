import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { parent_id, opportunity_brief, parent_name, parent_profit_signal } = body;

    if (!parent_id || !opportunity_brief) {
      return new Response(JSON.stringify({ success: false, error: 'Missing parent_id or opportunity_brief' }), { status: 400 });
    }

    // Fetch parent timeline
    const parentTimeline = await base44.asServiceRole.entities.Timeline.get(parent_id);
    const newDepth = (parentTimeline.depth || 0) + 1;
    const childName = `Child Branch — ${opportunity_brief.substring(0, 50)}...`;

    // Create child timeline
    const childTimeline = await base44.asServiceRole.entities.Timeline.create({
      name: childName,
      parent_id,
      depth: newDepth,
      status: "Seed",
      branch_logic_state: parentTimeline.branch_logic_state,
      objective: opportunity_brief,
      success_metrics: {
        custom_kpi: "MVP launch and initial user feedback",
        profit_target: (parent_profit_signal * 1.5) * 100,
        lead_target: 50,
      },
      profit_signal: 0,
      cycles_below_threshold: 0,
      opportunity_detected: false,
      opportunity_brief: "",
      tags: [...(parentTimeline.tags || []), `depth-${newDepth}`],
      last_report: `🌱 SPAWNED from parent: ${parent_name}. Objective: ${opportunity_brief}. Initial profit signal: 0 (seed stage). Ready for task execution.`,
    });

    // Reset parent's opportunity flag
    await base44.asServiceRole.entities.Timeline.update(parent_id, {
      opportunity_detected: false,
      last_report: `${parentTimeline.last_report}\n\n✅ CHILD BRANCH SPAWNED: ${childName} (depth ${newDepth})`,
    });

    return new Response(JSON.stringify({
      success: true,
      child_id: childTimeline.id,
      child_name: childTimeline.name,
      depth: newDepth,
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ success: false, error: errorMsg }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});
