import { base44 } from "https://deno.land/x/base44@latest/mod.ts";

const parent_id = "69df1c30648d9b7b5f5c4f06";
const opportunity_brief = "Create a scalable, automated lead generation platform for SMBs, addressing the current gap in integrated automation infrastructure";
const depth = 5;

try {
  const child = await base44.asServiceRole.entities.Timeline.create({
    name: `Branch Gamma Child — Automated Lead Gen Platform`,
    parent_id,
    depth: depth + 1,
    status: "Seed",
    objective: opportunity_brief,
    branch_logic_state: "Initial spawn — awaiting evaluation",
    profit_signal: 0,
    cycles_below_threshold: 0,
    opportunity_detected: false,
    tags: ["auto-spawned", "child", "lead-generation"],
  });

  console.log("✅ Child spawned successfully");
  console.log("Child ID:", child.id);
  console.log("Parent ID:", parent_id);

  // Reset parent's opportunity flag
  await base44.asServiceRole.entities.Timeline.update(parent_id, {
    opportunity_detected: false,
    last_report: `✅ Child spawned (ID: ${child.id}) from opportunity\n⏱ Cycle: ${new Date().toISOString()}`,
  });

  console.log("✅ Parent opportunity flag reset");
} catch (error) {
  console.error("❌ Spawn failed:", error.message);
}
