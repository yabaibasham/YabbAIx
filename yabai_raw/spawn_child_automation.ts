import { base44 } from "@base44/sdk";

export default async function spawnChildTimeline(payload: any) {
  const parentId = "69ddca193f9a98d5e05e3bb3";
  const opportunityBrief = "Create an affordable, user-friendly automation tool that helps SMBs convert leads into scheduled appointments, addressing a significant pain point and generating substantial revenue potential";
  
  try {
    const newChild = await base44.asServiceRole.entities.Timeline.create({
      name: "Branch Delta — Automation Tool MVP",
      parent_id: parentId,
      depth: 4,
      status: "Seed",
      objective: opportunityBrief,
      branch_logic_state: "New Branch Spawned from Lead Generation Opportunity",
      success_metrics: {
        custom_kpi: "MVP Launch",
        profit_target: 5000,
        lead_target: 50
      },
      profit_signal: 0,
      cycles_below_threshold: 0,
      opportunity_detected: false,
      tags: ["automation", "smb", "depth-4", "mvp", "lead-conversion"]
    });

    // Reset parent opportunity flag
    await base44.asServiceRole.entities.Timeline.update(parentId, {
      opportunity_detected: false,
      last_report: `✅ CHILD SPAWNED: Branch Delta — Automation Tool MVP (ID: ${newChild.id})\n\nParent branch opportunity flag reset. Child now in Seed status.`
    });

    console.log(`✅ Child branch created: ${newChild.id}`);
    return { success: true, child_id: newChild.id };
  } catch (error) {
    console.error("Spawn failed:", error);
    throw error;
  }
}
