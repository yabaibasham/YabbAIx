import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
const TELEGRAM_CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID');
const APP_URL = 'https://yabai-app-3e942cf0.base44.app';

async function groqInfer(systemPrompt: string, userPrompt: string): Promise<string> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.75,
      max_tokens: 2000,
    }),
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

async function sendTelegram(message: string) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'Markdown',
    }),
  });
}

// Generate full waitlist landing page JSX
async function generateWaitlistPage(timeline: any, analysis: any): Promise<string> {
  const prompt = `Generate a React landing page JSX component for a "Coming Soon" waitlist page. 

Niche: ${timeline.name}
Friction Point: ${analysis.friction_point || 'Manual, slow processes'}
Gap: ${analysis.gap_summary || timeline.objective}
MRR Estimate: ${analysis.mrr_estimate || 'High potential'}
Headline style: Bold, benefit-driven, specific to the niche.

Requirements:
- Default export named "WaitlistPage"
- Dark theme (bg-gray-950, text white)
- Large hero headline and subheadline
- Email input field + "Join Waitlist" button with useState
- On submit: show a success message "You're on the list! We'll be in touch."
- Show estimated launch: "Q3 2026"
- Show a list of 3 key benefits (derive from the gap)
- Footer with "Powered by YABAI"
- Use only Tailwind classes, useState from React
- NO external imports except React useState
- The component must be self-contained

Return ONLY the JSX code, no explanation, no markdown fences.`;

  const jsx = await groqInfer(
    'You are a React/Tailwind expert. Output only valid JSX code for a React functional component. No markdown, no explanation.',
    prompt
  );
  return jsx.replace(/```(jsx|js|tsx)?/g, '').replace(/```/g, '').trim();
}

// Generate lead magnet content
async function generateLeadMagnet(timeline: any, analysis: any): Promise<string> {
  const niche = timeline.tags?.[0] || timeline.name;
  const prompt = `Write a "Top 10 Tools & Strategies for ${niche}" lead magnet document.

Friction Point: ${analysis.friction_point || ''}
Market Gap: ${analysis.gap_summary || ''}

Format:
- Title: Top 10 [Tools/Strategies] for [Niche] in 2025
- Intro paragraph (2-3 sentences on why this matters)
- 10 numbered items, each with: Tool/Strategy Name, What it does (1 sentence), Why it matters for ${niche} (1 sentence)
- Closing CTA: "Want the full automation blueprint? Join our waitlist at [URL]"

Be specific, not generic. Reference real tools where applicable.`;

  return await groqInfer(
    'You are an expert content strategist. Write compelling, specific lead magnet content.',
    prompt
  );
}

// Generate 3 SEO blog posts
async function generateSEOPosts(timeline: any, analysis: any): Promise<string> {
  const friction = analysis.friction_point || timeline.objective;
  const prompt = `Write 3 SEO-optimized blog post outlines + intros for the following market gap:

Friction: ${friction}
Niche: ${timeline.tags?.[0] || timeline.name}
Gap: ${analysis.gap_summary || ''}

For each post provide:
- SEO Title (under 60 chars, keyword-rich)
- Meta Description (under 155 chars)
- Target Keyword
- Full intro paragraph (150-200 words)
- 5 H2 section headers with 2-sentence descriptions each

Separate each post with ---POST BREAK---`;

  return await groqInfer(
    'You are an expert SEO content strategist. Write high-quality, specific blog content that ranks.',
    prompt
  );
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { timeline_id, analysis } = body;

    if (!timeline_id) {
      return Response.json({ error: 'timeline_id required' }, { status: 400 });
    }

    const timelines = await base44.asServiceRole.entities.Timeline.list();
    const timeline = timelines.find((t: any) => t.id === timeline_id);
    if (!timeline) {
      return Response.json({ error: 'Timeline not found' }, { status: 404 });
    }

    const signal = Number(timeline.profit_signal) || 0;
    const parsedAnalysis = analysis || {
      friction_point: timeline.branch_logic_state,
      gap_summary: timeline.objective,
      mrr_estimate: timeline.success_metrics?.profit_target ? `$${timeline.success_metrics.profit_target}/mo` : 'TBD',
    };

    let assetRecord: any = null;

    if (signal >= 75) {
      // ── HIGH SIGNAL: Auto-publish Waitlist Landing Page ──
      const jsx = await generateWaitlistPage(timeline, parsedAnalysis);

      // Save as DigitalAsset (Draft first, URL = dashboard for now)
      assetRecord = await base44.asServiceRole.entities.DigitalAsset.create({
        timeline_id,
        asset_type: 'Waitlist',
        title: `Waitlist: ${timeline.name}`,
        content: jsx,
        url: `${APP_URL}/waitlist-${timeline_id.slice(-6)}`,
        status: 'Published',
        signal_at_creation: signal,
        niche: timeline.tags?.[0] || timeline.name,
        mrr_estimate: parsedAnalysis.mrr_estimate || 'TBD',
        email_captures: 0,
      });

      // Notify Telegram
      await sendTelegram(
        `🚀 *YABAI SEED PUBLISHED*\n\n` +
        `📌 *Branch:* ${timeline.name}\n` +
        `📊 *Signal:* ${signal}/100\n` +
        `💰 *MRR Est:* ${parsedAnalysis.mrr_estimate || 'TBD'}\n` +
        `🌱 *Seed Type:* Waitlist Landing Page\n` +
        `🔗 *Dashboard:* ${APP_URL}\n\n` +
        `_Friction:_ ${(parsedAnalysis.friction_point || '').slice(0, 120)}`
      );

    } else if (signal >= 50) {
      // ── MID SIGNAL: Generate 3 SEO Blog Posts ──
      const content = await generateSEOPosts(timeline, parsedAnalysis);

      assetRecord = await base44.asServiceRole.entities.DigitalAsset.create({
        timeline_id,
        asset_type: 'SEO Blog Post',
        title: `SEO Footprint: ${timeline.name}`,
        content,
        url: null,
        status: 'Draft',
        signal_at_creation: signal,
        niche: timeline.tags?.[0] || timeline.name,
        mrr_estimate: parsedAnalysis.mrr_estimate || 'TBD',
        email_captures: 0,
      });

      await sendTelegram(
        `✍️ *YABAI SEO FOOTPRINT PLANTED*\n\n` +
        `📌 *Branch:* ${timeline.name}\n` +
        `📊 *Signal:* ${signal}/100\n` +
        `🌱 *Asset:* 3 SEO Blog Posts (Draft)\n` +
        `🔗 *Dashboard:* ${APP_URL}`
      );

    } else {
      // ── LOW SIGNAL: Generate Lead Magnet ──
      const content = await generateLeadMagnet(timeline, parsedAnalysis);

      assetRecord = await base44.asServiceRole.entities.DigitalAsset.create({
        timeline_id,
        asset_type: 'Lead Magnet',
        title: `Lead Magnet: ${timeline.name}`,
        content,
        url: null,
        status: 'Draft',
        signal_at_creation: signal,
        niche: timeline.tags?.[0] || timeline.name,
        mrr_estimate: parsedAnalysis.mrr_estimate || 'TBD',
        email_captures: 0,
      });

      await sendTelegram(
        `📄 *YABAI LEAD MAGNET CREATED*\n\n` +
        `📌 *Branch:* ${timeline.name}\n` +
        `📊 *Signal:* ${signal}/100\n` +
        `🌱 *Asset:* Lead Magnet (Draft)\n` +
        `🔗 *Dashboard:* ${APP_URL}`
      );
    }

    // Update timeline last_report with seed info
    await base44.asServiceRole.entities.Timeline.update(timeline_id, {
      last_report: (timeline.last_report || '') +
        `\n\n🌱 SEED BUILT: ${assetRecord?.asset_type} — "${assetRecord?.title}" [${assetRecord?.status}]`,
    });

    return Response.json({
      ok: true,
      asset_type: assetRecord?.asset_type,
      asset_id: assetRecord?.id,
      status: assetRecord?.status,
      signal,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
