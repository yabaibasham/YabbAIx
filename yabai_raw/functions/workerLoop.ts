import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const TAVILY_API_KEY     = Deno.env.get('TAVILY_API_KEY');
const GROQ_API_KEY       = Deno.env.get('GROQ_API_KEY');
const OPENAI_API_KEY     = Deno.env.get('OPENAI_API_KEY');
const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
const TELEGRAM_CHAT_ID   = Deno.env.get('TELEGRAM_CHAT_ID');
const APP_URL = 'https://yabai-app-3e942cf0.base44.app';

// ── HARD LIMITS ───────────────────────────────────────────────────────────────
const MAX_DEPTH          = 3;
const CULL_SIGNAL        = 20;
const SCALE_SIGNAL       = 75;
const MAX_TOTAL_BRANCHES = 50;

// ── RULES OF ENGAGEMENT ───────────────────────────────────────────────────────
// GREEN ZONE: Capital Colony aligned + signal >= this → auto-build audit + draft email
const GREEN_ZONE_THRESHOLD = 75;
// Daily auto-action cap — loop will not exceed this per run (credit guardrail)
const MAX_AUTO_ACTIONS_PER_RUN = 10;
// BLUE ZONE: Future Vault signals are counted and shown on dashboard, never spawned
// ─────────────────────────────────────────────────────────────────────────────

// ── FOCUS KEYWORDS ────────────────────────────────────────────────────────────
const CAPITAL_COLONY_KEYWORDS = [
  'legal', 'law', 'lawyer', 'barrister', 'solicitor', 'conveyancing',
  'melbourne', 'ringwood', 'local business', 'ai search', 'schema', 'json-ld',
  'google ai overview', 'perplexity', 'local seo', 'ai visibility',
  'electrician', 'plumber', 'solar', 'ndis', 'dentist', 'accountant',
  'physio', 'mechanic', 'builder', 'tradie', 'small business',
];

const FUTURE_VAULT_KEYWORDS = [
  'drone', 'quantum', 'blockchain', 'crypto', 'web3', 'robotics',
  'aerospace', 'biotech', 'pharmaceutical', 'defence', 'mining',
  'nuclear', 'satellite', 'autonomous vehicle',
];

const LAW_AUDIT_DATA: Record<string, any> = {
  'blackburn law group':      { hours: 15, cost: '$7,200', score: 95, type: 'Corporate & M&A',        gap: 'Due diligence 100% manual — no AI clause extraction across 500-page bundles',        fix: 'M&A due diligence AI that red-flags risk clauses overnight' },
  'collins street barristers':{ hours: 13, cost: '$6,240', score: 93, type: 'Commercial Arbitration', gap: 'Manually extracting findings from arbitration awards for submissions',                fix: 'AI synthesis that extracts winning argument patterns from awards in minutes' },
  'eastfield law':            { hours: 12, cost: '$5,760', score: 94, type: 'Commercial Litigation',  gap: '12+ hrs/case doing discovery keyword searches across document dumps',                 fix: 'AI discovery — 10,000 docs ingested, 40 relevant ones surfaced in minutes' },
  'fitzroy street legal':     { hours: 11, cost: '$5,280', score: 90, type: 'Criminal Defence',       gap: 'Police brief materials reviewed manually — no inconsistency detection',              fix: 'Brief analysis AI that cross-references witness statements in seconds' },
  'maroondah lawyers':        { hours: 8,  cost: '$3,840', score: 91, type: 'Conveyancing',           gap: 'Title searches manually cross-checked against council overlays',                    fix: 'AI overlay that auto-matches title data to planning restrictions' },
  'ringwood legal':           { hours: 6,  cost: '$2,880', score: 88, type: 'Family Law',             gap: 'Manually reviewing 40-page parenting agreements for conflict clauses',              fix: 'AI contract review that highlights dispute triggers instantly' },
  'doncaster legal partners': { hours: 7,  cost: '$3,360', score: 87, type: 'Employment Law',         gap: 'Manual Fair Work Act review for every HR advisory matter',                         fix: 'Semantic search mapping client scenarios to Fair Work provisions instantly' },
  'warrandyte law':           { hours: 9,  cost: '$4,320', score: 86, type: 'Planning & Environment', gap: 'Manually interpreting 200-page planning scheme amendments per matter',              fix: 'AI that ingests planning updates and generates client summaries in 2 mins' },
  'springvale community law': { hours: 7,  cost: '$3,360', score: 85, type: 'Tenancy & Consumer',     gap: 'VCAT hearing prep entirely manual — no AI pre-screening of precedents',            fix: 'VCAT outcome predictor analysing 5 years of decisions against matter facts' },
  'box hill community legal': { hours: 10, cost: '$4,800', score: 89, type: 'Immigration',            gap: 'Caseworkers searching VCAT/AAT decisions manually — 4+ hrs per matter',           fix: 'AI precedent finder returning ranked VCAT/AAT results in 30 seconds' },
  'camberwell legal centre':  { hours: 8,  cost: '$3,840', score: 83, type: 'Personal Injury',        gap: 'Medical report analysis done manually — no structured data extraction',            fix: 'Medical document AI extracting injury classifications automatically' },
  'kew law chambers':         { hours: 6,  cost: '$2,880', score: 82, type: 'Tax & Revenue',          gap: 'ATO private ruling research done manually — no intelligent mapping',               fix: 'AI tax ruling navigator mapping client scenarios to ATO decisions semantically' },
  'richmond legal group':     { hours: 5,  cost: '$2,400', score: 80, type: 'IP & Technology',        gap: 'IP attorneys manually monitoring trademark databases for infringement risks',        fix: 'Automated IP watch with AI similarity scoring across trademark classes' },
  'healesville legal group':  { hours: 5,  cost: '$2,400', score: 79, type: 'Wills & Estates',        gap: 'Estate paralegals manually comparing testamentary documents across versions',        fix: 'Document diff AI that flags clause conflicts between will versions' },
};

function getLawAudit(name: string): any {
  const key = (name || '').toLowerCase().trim();
  for (const [k, v] of Object.entries(LAW_AUDIT_DATA)) {
    if (key.includes(k) || k.includes(key)) return { ...v, firm: name };
  }
  return null;
}

function isCapitalColonyAligned(timeline: any): boolean {
  const text = `${timeline.name} ${timeline.objective || ''} ${(timeline.tags||[]).join(' ')}`.toLowerCase();
  return CAPITAL_COLONY_KEYWORDS.some(k => text.includes(k));
}

function isFutureVault(timeline: any, analysis: any): boolean {
  const text = `${timeline.name} ${analysis?.gap_summary || ''} ${analysis?.opportunity_brief || ''}`.toLowerCase();
  return FUTURE_VAULT_KEYWORDS.some(k => text.includes(k));
}

// ── INFERENCE ENGINE ──────────────────────────────────────────────────────────
async function infer(system: string, user: string, maxTokens = 1000): Promise<string> {
  if (GROQ_API_KEY) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
          temperature: 0.7, max_tokens: maxTokens,
        }),
      });
      const data = await res.json();
      if (!data.error || data.error.code !== 'rate_limit_exceeded') {
        const content = data.choices?.[0]?.message?.content;
        if (content) return content;
      }
      console.log('[BYOK] Groq rate limited — OpenAI fallback');
    } catch (e) { console.log('[BYOK] Groq error:', e); }
  }
  if (OPENAI_API_KEY) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
          temperature: 0.7, max_tokens: maxTokens,
        }),
      });
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) { console.log('[BYOK] OpenAI used'); return content; }
    } catch (e) { console.log('[BYOK] OpenAI error:', e); }
  }
  return '';
}

async function tavilySearch(query: string): Promise<string> {
  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: TAVILY_API_KEY, query, search_depth: 'advanced', include_answer: true, max_results: 4 }),
    });
    const data = await res.json();
    return `${data.answer || ''}\n${(data.results||[]).map((r:any)=>`[${r.title}]: ${r.content}`).join('\n')}`.slice(0, 2000);
  } catch { return ''; }
}

async function sendTelegram(msg: string) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: msg.slice(0, 4000), parse_mode: 'Markdown' }),
    });
  } catch {}
}

function parseJSON(raw: string): any {
  try { const m = raw.match(/\{[\s\S]*\}/); if (m) return JSON.parse(m[0]); } catch {}
  return null;
}

// ── BUILD THOMAS-VOICE EMAIL ──────────────────────────────────────────────────
function buildThomasEmail(firmName: string, suburb: string, audit: any): { subject: string; body: string; followUp: string } {
  const subject = `Quick question about ${firmName}`;
  const body =
`Hi [Practice Manager's name],

I'm Thomas — I'm based in Melbourne and I've been looking at how local law firms are showing up when potential clients use AI search tools like ChatGPT and Perplexity.

I ran a quick check on ${firmName} and found something specific I thought you'd want to know about.

I've put together a one-page summary — would it be alright if I sent it through?

It takes about 2 minutes to read and I think it's relevant to what your ${audit.type.toLowerCase()} team is working on.

Thomas Basham
Melbourne, VIC`;

  const followUp =
`Hi,

Following up on my email from earlier this week.

The short version: ${firmName} is losing potential client enquiries to AI search — specifically around ${audit.type.toLowerCase()} work in the ${suburb} area.

I've quantified it at roughly ${audit.cost}/month in recoverable revenue.

If that's worth a 5-minute chat, I'm easy to reach.

Thomas`;

  return { subject, body, followUp };
}

// ── GREEN ZONE AUTO-ACTION ────────────────────────────────────────────────────
// Builds the audit + drops a ready-to-send lead into the Lead entity
async function greenZoneAutoAction(base44: any, timeline: any, analysis: any): Promise<string> {
  const firmName = timeline.name.replace(/[⚡🏛️]/g, '').replace(/CAPITAL COLONY —|WILDCARD —/g, '').trim();
  const suburb   = 'Melbourne';
  const audit    = getLawAudit(firmName) || {
    hours: 8, cost: `$${Math.floor((analysis.profit_signal || 75) * 40)}/mo`, score: analysis.profit_signal || 75,
    type: 'Legal Services', gap: analysis.gap_summary, fix: analysis.first_action_step,
  };

  const { subject, body, followUp } = buildThomasEmail(firmName, suburb, audit);

  // Check if lead already exists
  const existing = await base44.asServiceRole.entities.Lead.filter({ business_name: firmName });
  if (existing.length === 0) {
    await base44.asServiceRole.entities.Lead.create({
      business_name: firmName,
      suburb,
      business_type: 'lawyer',
      gap_score:     analysis.profit_signal || 75,
      email_subject: subject,
      email_body:    body,
      notes:         `FOLLOW-UP:\n${followUp}\n\nAUDIT GAP: ${audit.gap}\nFIX: ${audit.fix}\nROI: ${audit.cost}/mo`,
      status:        'Email Drafted',
    });
    return `Auto-drafted email for ${firmName} → ready in Control Room`;
  }
  return `${firmName} already in Control Room`;
}

// ── MAIN ANALYSIS ─────────────────────────────────────────────────────────────
async function analyzeTimeline(timeline: any, focused: boolean): Promise<any> {
  const niche = timeline.tags?.find(
    (t: string) => !['root','orchestrator','wildcard','high-volatility','spawned',
      'capital-colony','legal-tech','saas-product','priority-1','harvest-ready','future-vault'].includes(t)
  ) || timeline.tags?.[0] || 'local business AI visibility';

  const query     = focused
    ? `${niche} Melbourne local business AI search gap 2025`
    : `${niche} software gap market opportunity 2025`;
  const searchData = await tavilySearch(query);

  const system = focused
    ? `You are YABAI — focused on Capital Colony: AI search visibility for Melbourne local businesses (law firms, tradies, health). Mission: find businesses invisible to ChatGPT/Perplexity/Siri and sell $97 audits + $1,500 implementations. Score hard against THIS lens. JSON only.`
    : `You are YABAI — market intelligence AI. Score opportunities honestly. JSON only.`;

  const raw = await infer(system,
    `Timeline: "${timeline.name}"
Objective: "${timeline.objective || 'not set'}"
Niche: "${niche}"
Research: ${searchData}

Return ONLY this JSON (no markdown):
{
  "friction_point": "one specific painful process max 12 words",
  "profit_signal": <0-100 integer>,
  "gap_summary": "2 sentences on the exploitable gap",
  "mrr_estimate": "$X,000 - $Y,000/mo",
  "first_action_step": "one specific next step",
  "future_vault_note": "1 sentence why this matters in 2-3 years OR null"
}`, 600);

  const parsed = parseJSON(raw);
  return parsed || {
    friction_point: 'Manual workflows limiting scale',
    profit_signal: 35,
    gap_summary: `${niche} operators lack AI-powered automation. Manual processes create compounding cost.`,
    mrr_estimate: '$2,000 - $8,000/mo',
    first_action_step: `Research ${niche} AI gap entry points`,
    future_vault_note: null,
  };
}

// ── MAIN HANDLER ──────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { timeline_id } = body;

    const allTimelines = await base44.asServiceRole.entities.Timeline.list();
    const liveCount    = allTimelines.filter((t: any) => t.status !== 'Culled').length;

    if (liveCount >= MAX_TOTAL_BRANCHES && !timeline_id) {
      return Response.json({ ok: false, reason: `Branch cap (${liveCount}/${MAX_TOTAL_BRANCHES})` });
    }

    const toProcess = timeline_id
      ? allTimelines.filter((t: any) => t.id === timeline_id)
      : allTimelines.filter((t: any) =>
          ['Seed','Active','Scaling'].includes(t.status) && (t.depth || 0) <= MAX_DEPTH
        );

    // ── Tracking buckets ─────────────────────────────────────────────────────
    const results:      any[]    = [];
    const greenActions: string[] = [];   // Auto-actioned leads (Green Zone)
    const blueVault:    string[] = [];   // Future vault pulse alerts (Blue Zone)
    const culled:       string[] = [];
    let   autoActionsThisRun = 0;        // Credit guardrail counter

    for (const timeline of toProcess) {
      try {
        const aligned  = isCapitalColonyAligned(timeline);
        const analysis = await analyzeTimeline(timeline, aligned);
        const signal   = Math.max(0, Math.min(100, Number(analysis.profit_signal) || 30));
        const isVault  = isFutureVault(timeline, analysis);

        // ── Status update ────────────────────────────────────────────────────
        let newStatus = timeline.status;
        let newCycles = timeline.cycles_below_threshold || 0;
        if (timeline.status === 'Seed') newStatus = 'Active';
        if (signal >= SCALE_SIGNAL)     newStatus = 'Scaling';
        if (signal < CULL_SIGNAL) {
          newCycles += 1;
          if (newCycles >= 3) { newStatus = 'Culled'; culled.push(timeline.name); }
        } else { newCycles = 0; }

        // ── ZONE LOGIC ───────────────────────────────────────────────────────
        let zoneLabel   = 'general';
        let actionNote  = '';
        let vaultNote   = analysis.future_vault_note || null;

        // GREEN ZONE: Capital Colony aligned + high signal + under daily cap
        const isGreen = aligned && signal >= GREEN_ZONE_THRESHOLD && newStatus !== 'Culled';
        if (isGreen && autoActionsThisRun < MAX_AUTO_ACTIONS_PER_RUN) {
          const result = await greenZoneAutoAction(base44, timeline, analysis);
          actionNote = result;
          greenActions.push(`${timeline.name} (${signal}) — ${result}`);
          autoActionsThisRun++;
          zoneLabel = 'green';
        }

        // BLUE ZONE: Future Vault — tag it, note it, never spawn it
        if (isVault && signal >= 60) {
          zoneLabel = 'blue';
          blueVault.push(`${timeline.name} (${signal})${vaultNote ? ': ' + vaultNote : ''}`);
        }

        // Update tags
        const updatedTags = [...(timeline.tags || [])];
        if (isVault && !updatedTags.includes('future-vault')) updatedTags.push('future-vault');
        if (isGreen && !updatedTags.includes('green-zone'))   updatedTags.push('green-zone');

        const report = [
          `🔍 FRICTION: ${analysis.friction_point}`,
          `\n📊 GAP: ${analysis.gap_summary}`,
          `\n💰 MRR: ${analysis.mrr_estimate}`,
          `\n🚀 ACTION: ${analysis.first_action_step}`,
          actionNote ? `\n✅ AUTO-ACTIONED: ${actionNote}` : '',
          vaultNote  ? `\n🔮 FUTURE VAULT: ${vaultNote}`  : '',
          `\n📈 Signal: ${signal}/100 | ${newStatus} | Zone: ${zoneLabel.toUpperCase()}`,
          `\n⏱ ${new Date().toISOString()}`,
        ].filter(Boolean).join('');

        await base44.asServiceRole.entities.Timeline.update(timeline.id, {
          profit_signal:          signal,
          status:                 newStatus,
          cycles_below_threshold: newCycles,
          last_report:            report,
          opportunity_detected:   false,   // Always false — zones handle this now
          opportunity_brief:      null,
          tags:                   updatedTags,
        });

        results.push({ id: timeline.id, name: timeline.name, signal, status: newStatus, zone: zoneLabel });

      } catch (e) {
        console.error(`Error on ${timeline.name}:`, e);
        results.push({ id: timeline.id, name: timeline.name, error: String(e) });
      }
    }

    // ── Telegram Summary ─────────────────────────────────────────────────────
    const lines = [
      `🤖 *YABAI Loop — Rules of Engagement*`,
      `📅 ${new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney' })}`,
      `📊 Processed: ${results.length} branches`,
    ];

    if (greenActions.length > 0) {
      lines.push(`\n🟢 *GREEN ZONE — Auto-Actioned (${greenActions.length}/${MAX_AUTO_ACTIONS_PER_RUN} cap):*`);
      greenActions.forEach(a => lines.push(`• ${a}`));
      lines.push(`→ Check Control Room: Ready to Send tray`);
    } else {
      lines.push(`\n🟢 Green Zone: No new Capital Colony actions this run`);
    }

    if (blueVault.length > 0) {
      lines.push(`\n🔵 *FUTURE VAULT — ${blueVault.length} signals parked:*`);
      blueVault.slice(0, 5).forEach(v => lines.push(`• ${v}`));
      if (blueVault.length > 5) lines.push(`• ...and ${blueVault.length - 5} more on dashboard`);
    }

    if (culled.length > 0) lines.push(`\n🗑️ Culled: ${culled.length} low-signal branches`);

    lines.push(`\n💳 Auto-actions used: ${autoActionsThisRun}/${MAX_AUTO_ACTIONS_PER_RUN}`);
    lines.push(`🔗 ${APP_URL}/ControlRoom`);

    await sendTelegram(lines.join('\n'));

    return Response.json({
      ok: true,
      processed:       results.length,
      greenActioned:   greenActions.length,
      blueVaultItems:  blueVault.length,
      culled:          culled.length,
      creditGuardrail: `${autoActionsThisRun}/${MAX_AUTO_ACTIONS_PER_RUN} auto-actions used`,
      results,
    });

  } catch (e) {
    console.error('workerLoop fatal:', e);
    return Response.json({ ok: false, error: String(e) }, { status: 500 });
  }
});
