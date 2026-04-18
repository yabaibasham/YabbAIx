import { base44 } from "https://sdk.base44.com/deno";

export async function testSpawn(req: any) {
  const parentId = "69ddcbe2f8c9f5c464aa04e1";
  
  try {
    const parent = await base44.asServiceRole.entities.Timeline.get(parentId);
    
    const child = await base44.asServiceRole.entities.Timeline.create({
      name: `Child-Construction-Bid-AI-${Date.now()}`,
      parent_id: parentId,
      depth: parent.depth + 1,
      status: "Seed",
      objective: parent.opportunity_brief || "Build construction bid estimation AI",
      branch_logic_state: "Seed - validate demand",
      success_metrics: { custom_kpi: "PMF", profit_target: 5000, lead_target: 100 },
      profit_signal: 0,
      cycles_below_threshold: 0,
      opportunity_detected: false,
      opportunity_brief: "",
      tags: ["construction", "ai", "child-spawn", `depth-${parent.depth + 1}`],
      last_report: `Spawned from ${parent.name} (signal: ${parent.profit_signal})`
    });
    
    await base44.asServiceRole.entities.Timeline.update(parentId, {
      opportunity_detected: false,
      last_report: parent.last_report + `\n\n✅ CHILD SPAWNED: ${child.id} at depth ${child.depth}`
    });
    
    return { success: true, child_id: child.id, depth: child.depth };
  } catch (e: any) {
    return { error: e.message };
  }
}
