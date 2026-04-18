export default async function handleSpawn(req: Request): Promise<Response> {
  const body = await req.json();
  const { parent_id, opportunity_brief, parent_data } = body;

  try {
    const child = await base44.asServiceRole.entities.Timeline.create({
      name: `Branch Depth ${(parent_data?.depth || 0) + 1}`,
      parent_id,
      depth: (parent_data?.depth || 0) + 1,
      status: "Seed",
      objective: opportunity_brief,
      profit_signal: 0,
    });

    await base44.asServiceRole.entities.Timeline.update(parent_id, {
      opportunity_detected: false,
    });

    return new Response(JSON.stringify({ success: true, child_id: child.id }), {
      status: 200,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
    });
  }
}
