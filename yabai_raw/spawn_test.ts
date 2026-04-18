import { base44 } from "https://sdk.base44.com/deno";

const parentId = "69ddca12d3d8be77f3670fa9";

try {
  const parent = await base44.asServiceRole.entities.Timeline.get(parentId);
  console.log("Parent found:", parent.name);
  
  const child = await base44.asServiceRole.entities.Timeline.create({
    name: `🌱 SPAWN: ${parent.name.substring(0, 40)}... [D${parent.depth + 1}]`,
    parent_id: parentId,
    depth: parent.depth + 1,
    status: "Seed",
    objective: parent.opportunity_brief || parent.objective,
    branch_logic_state: "Initial validation",
    success_metrics: parent.success_metrics,
    profit_signal: 0,
    cycles_below_threshold: 0,
    opportunity_detected: false,
    tags: parent.tags || []
  });
  
  console.log("Child created:", child.id);
  
  await base44.asServiceRole.entities.Timeline.update(parentId, {
    opportunity_detected: false
  });
  
  console.log("Parent flag reset");
} catch (err) {
  console.error("Error:", err.message);
}
