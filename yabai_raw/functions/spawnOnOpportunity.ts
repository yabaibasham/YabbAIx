// YABAI Opportunity Spawner — Triggered by Timeline update automation
// Spawns child branch when opportunity_detected flag is set
export default async function spawnOnOpportunity(req: Request): Promise<Response> {
  try {
    const { timeline_id, opportunity_brief, parent_depth } = await req.json();

    if (!timeline_id || !opportunity_brief) {
      return new Response(
        JSON.stringify({ error: "Missing timeline_id or opportunity_brief" }),
        { status: 400 }
      );
    }

    // Create child Timeline using service role
    const childTimeline = {
      name: `Branch Depth ${parent_depth + 1} — ${opportunity_brief.substring(0, 40)}...`,
      parent_id: timeline_id,
      depth: parent_depth + 1,
      status: "Seed",
      objective: opportunity_brief,
      branch_logic_state: "Seed phase — market validation",
      success_metrics: {
        lead_target: 50,
        profit_target: 5000,
        custom_kpi: "Market validation",
      },
      profit_signal: 0,
      cycles_below_threshold: 0,
      opportunity_detected: false,
      opportunity_brief: null,
      tags: [`depth-${parent_depth + 1}`, "spawned-from-opportunity"],
      last_report: `🌱 SPAWNED from opportunity\nObjective: ${opportunity_brief}`,
    };

    const created = await base44.asServiceRole.entities.Timeline.create(
      childTimeline
    );

    // Reset parent's opportunity flag
    await base44.asServiceRole.entities.Timeline.update(timeline_id, {
      opportunity_detected: false,
      last_report: `✅ Child spawned: ${created.id} at ${new Date().toISOString()}`,
    });

    return new Response(
      JSON.stringify({
        success: true,
        child_id: created.id,
        parent_id: timeline_id,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Spawn error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
    });
  }
}
