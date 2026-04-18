import { useState, useEffect, useCallback } from "react";
import { Lead } from "@/api/entities";

// ─── Law firm specific audit data ────────────────────────────────────────────
const LAW_AUDITS = {
  "blackburn law group": { hours: 15, cost: "$7,200", score: 95, type: "Corporate & M&A", gap: "Due diligence document review is 100% manual — no AI extraction of risk clauses across 500+ page bundles", fix: "M&A due diligence AI that extracts and red-flags risk clauses overnight" },
  "collins street barristers": { hours: 13, cost: "$6,240", score: 93, type: "Commercial Arbitration", gap: "Barristers manually extracting findings from arbitration awards for submissions", fix: "AI synthesis layer that extracts winning argument patterns from awards in minutes" },
  "eastfield law": { hours: 12, cost: "$5,760", score: 94, type: "Commercial Litigation", gap: "Junior lawyers spending 12+ hours per case doing discovery keyword searches across document dumps", fix: "AI discovery that ingests 10,000 documents and surfaces the 40 relevant ones in minutes" },
  "fitzroy street legal": { hours: 11, cost: "$5,280", score: 90, type: "Criminal Defence", gap: "Solicitors manually reviewing police brief materials — no AI-assisted inconsistency detection", fix: "Brief analysis AI that cross-references witness statements for inconsistencies" },
  "box hill community legal": { hours: 10, cost: "$4,800", score: 89, type: "Immigration", gap: "Caseworkers manually searching VCAT and AAT decisions for relevant precedents — 4+ hours per matter", fix: "AI precedent finder trained on VCAT/AAT decisions, returning ranked results in 30 seconds" },
  "maroondah lawyers": { hours: 8, cost: "$3,840", score: 91, type: "Conveyancing", gap: "Staff manually cross-checking title searches against council overlays — missing automated risk flags", fix: "AI overlay that auto-matches title data to planning restrictions before settlement" },
  "camberwell legal centre": { hours: 8, cost: "$3,840", score: 83, type: "Personal Injury", gap: "Medical report analysis done manually — no structured data extraction for PI claims", fix: "Medical document AI that extracts injury classifications and treatment timelines automatically" },
  "warrandyte law": { hours: 9, cost: "$4,320", score: 86, type: "Planning & Environment", gap: "Lawyers manually interpreting 200-page planning scheme amendments for each client matter", fix: "AI that ingests planning updates and generates client-ready impact summaries in 2 minutes" },
  "doncaster legal partners": { hours: 7, cost: "$3,360", score: 87, type: "Employment Law", gap: "HR advisory matters require manual review of Fair Work Act sections — no semantic search", fix: "Semantic legal search that maps client scenarios to Fair Work provisions instantly" },
  "springvale community law": { hours: 7, cost: "$3,360", score: 85, type: "Tenancy & Consumer", gap: "VCAT hearing preparation entirely manual — no AI pre-screening of tribunal precedents", fix: "VCAT outcome predictor that analyses matter facts against 5 years of decisions" },
  "ringwood legal": { hours: 6, cost: "$2,880", score: 88, type: "Family Law", gap: "Manually reviewing 40+ page parenting agreements instead of AI-flagging conflict clauses", fix: "AI contract review that highlights dispute triggers and precedent mismatches instantly" },
  "kew law chambers": { hours: 6, cost: "$2,880", score: 82, type: "Tax & Revenue", gap: "ATO private ruling research done manually — no intelligent mapping to relevant decisions", fix: "AI tax ruling navigator that maps client scenarios to ATO decisions semantically" },
  "richmond legal group": { hours: 5, cost: "$2,400", score: 80, type: "IP & Technology", gap: "IP attorneys manually monitoring trademark and patent databases for infringement risks", fix: "Automated IP watch service with AI similarity scoring across trademark classes" },
  "healesville legal group": { hours: 5, cost: "$2,400", score: 79, type: "Wills & Estates", gap: "Estate paralegals manually comparing testamentary documents across multiple versions", fix: "Document diff AI that flags clause conflicts between will versions automatically" },
};

function getLawAudit(name) {
  const key = (name || "").toLowerCase().trim();
  for (const [k, v] of Object.entries(LAW_AUDITS)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return null;
}

// ─── Business type detection ──────────────────────────────────────────────────
const TYPES = {
  electrician: { gap: "No licence schema — invisible to 'licensed electrician Ringwood open now'", roi: "$1,800-$5,400/mo", fix: "Electrician schema with licence credential, service area and emergency hours" },
  plumber:     { gap: "No emergency hours — AI can't surface you for 'burst pipe Ringwood urgent'", roi: "$1,200-$4,800/mo", fix: "Plumber schema with 24/7 availability and suburb coverage" },
  solar:       { gap: "No CEC accreditation markup — AI returns Solar Victoria instead of you", roi: "$2,000-$8,000/mo", fix: "SolarInstaller schema with CEC credentials and Victorian rebate FAQ" },
  ndis:        { gap: "No NDIS registration schema — invisible to 'NDIS provider near me Ringwood'", roi: "$1,500-$6,000/mo", fix: "LocalBusiness schema with NDIS registration and support categories" },
  mechanic:    { gap: "Missing vehicle brand tags — invisible to 'Toyota service Ringwood'", roi: "$800-$3,200/mo", fix: "AutoRepair schema with vehicle brands and roadworthy certificate FAQ" },
  dentist:     { gap: "No bulk billing markup — AI returns healthdirect instead of you", roi: "$1,500-$6,000/mo", fix: "Dentist schema with Medicare CDBS, HICAPS and gap-free FAQ" },
  lawyer:      { gap: "No specialty schema — AI surfaces government legal aid instead of your firm", roi: "$1,200-$5,000/mo", fix: "LegalService schema with practice area, suburb and client FAQ" },
  accountant:  { gap: "No SMSF or tax specialty markup — AI returns ATO pages instead of you", roi: "$600-$2,400/mo", fix: "AccountingService schema with CPA credential and specialty tags" },
  builder:     { gap: "No licence markup — AI can't verify you for 'licensed builder Ringwood'", roi: "$1,500-$6,000/mo", fix: "HomeAndConstructionBusiness schema with VBA licence and project types" },
  physio:      { gap: "No WorkCover markup — invisible to 'WorkCover physio near me'", roi: "$800-$2,800/mo", fix: "Physiotherapist schema with WorkCover, NDIS and HICAPS" },
  default:     { gap: "No LocalBusiness schema — AI can't verify your location, hours or specialty", roi: "$400-$2,000/mo", fix: "Full LocalBusiness JSON-LD with address, hours, specialty and FAQ" },
};

function detectType(name) {
  const n = (name || "").toLowerCase();
  if (n.includes("electric")) return "electrician";
  if (n.includes("plumb")) return "plumber";
  if (n.includes("solar")) return "solar";
  if (n.includes("ndis") || n.includes("disab")) return "ndis";
  if (n.includes("mechanic") || n.includes("auto") || n.includes("tyre")) return "mechanic";
  if (n.includes("dent")) return "dentist";
  if (n.includes("law") || n.includes("legal") || n.includes("barrister") || n.includes("solicitor")) return "lawyer";
  if (n.includes("account") || n.includes("tax")) return "accountant";
  if (n.includes("build") || n.includes("carpent")) return "builder";
  if (n.includes("physio") || n.includes("chiro")) return "physio";
  return "default";
}

function gapScore(name, hasSchema, rating, reviews) {
  let s = 50;
  if (!hasSchema) s += 30;
  if (rating >= 4.5) s += 10;
  if (reviews >= 50) s += 5;
  if (reviews >= 100) s += 5;
  if (["electrician","solar","ndis","lawyer"].includes(detectType(name))) s += 4;
  return Math.min(s, 99);
}

// ─── The "Thomas from Melbourne" email voice ──────────────────────────────────
function buildEmail(lead) {
  const biz = lead.business_name || "your firm";
  const suburb = lead.suburb || "Ringwood";
  const lawAudit = getLawAudit(biz);

  // If it's a law firm with a real audit
  if (lawAudit) {
    const firstName = "[Practice Manager's name]";
    return {
      subject: `Quick question about ${biz}`,
      body: `Hi ${firstName},

I'm Thomas — I'm based in Melbourne and I've been looking at how local law firms are showing up (or not showing up) when potential clients use AI search tools like ChatGPT and Perplexity.

I ran a quick check on ${biz} and found something specific I thought you'd want to know about.

I've put together a one-page summary — would it be alright if I sent it through?

It takes about 2 minutes to read and I think it's relevant to what your team is working on.

Thomas Basham
Melbourne, VIC`,
      followUp: `Hi ${firstName},

Following up on my email from earlier this week.

The short version: I found that ${biz} is losing potential client enquiries to AI search tools — specifically around ${lawAudit.type.toLowerCase()} work in the ${suburb} area.

I've quantified it at roughly ${lawAudit.cost}/month in recoverable revenue.

If that's worth a 5-minute chat, I'm easy to reach.

Thomas`,
    };
  }

  // Generic local business email
  const type = detectType(biz);
  return {
    subject: `Quick question about ${biz}`,
    body: `Hi there,

I'm Thomas, based in Melbourne. I've been looking at how local businesses in ${suburb} are showing up when people use AI tools like Siri, ChatGPT and Google AI to search for services nearby.

I ran a quick check on ${biz} and noticed a specific gap — the kind that's quietly sending potential clients to competitors.

I've written up a one-page summary of what I found. Would it be alright if I sent it through?

No cost, no pitch — just the data.

Thomas Basham
Melbourne, VIC`,
    followUp: `Hi,

Just following up on my earlier email about ${biz}.

The short version is that when someone in ${suburb} asks an AI assistant to find a ${type === "default" ? "local service" : type} nearby, your business isn't appearing in the answer — and I found the specific reason why.

Happy to send the one-pager if it's useful.

Thomas`,
  };
}

function buildSchema(lead) {
  const type = detectType(lead.business_name || "");
  const n = lead.business_name || "Business";
  const s = lead.suburb || "Ringwood";
  const schemas = {
    electrician: `{"@context":"https://schema.org","@type":"Electrician","name":"${n}","hasCredential":"Electrical Licence VIC","areaServed":"${s} VIC","openingHours":"Mo-Fr 07:00-17:00"}`,
    plumber:     `{"@context":"https://schema.org","@type":"Plumber","name":"${n}","openingHours":"Mo-Su 00:00-23:59","areaServed":"${s} VIC"}`,
    solar:       `{"@context":"https://schema.org","@type":"LocalBusiness","name":"${n}","hasCredential":"CEC Accredited Installer","areaServed":"${s} VIC"}`,
    ndis:        `{"@context":"https://schema.org","@type":"LocalBusiness","name":"${n}","hasCredential":"NDIS Registration","areaServed":"${s} VIC"}`,
    mechanic:    `{"@context":"https://schema.org","@type":"AutoRepair","name":"${n}","brand":["Toyota","Honda","Ford"],"areaServed":"${s} VIC"}`,
    dentist:     `{"@context":"https://schema.org","@type":"Dentist","name":"${n}","paymentAccepted":"Medicare CDBS, HICAPS","areaServed":"${s} VIC"}`,
    lawyer:      `{"@context":"https://schema.org","@type":"LegalService","name":"${n}","legalService":"[SPECIALTY]","areaServed":"${s} VIC"}`,
    accountant:  `{"@context":"https://schema.org","@type":"AccountingService","name":"${n}","hasCredential":"CPA Australia","areaServed":"${s} VIC"}`,
    builder:     `{"@context":"https://schema.org","@type":"HomeAndConstructionBusiness","name":"${n}","hasCredential":"VBA Licence","areaServed":"${s} VIC"}`,
    physio:      `{"@context":"https://schema.org","@type":"Physiotherapist","name":"${n}","paymentAccepted":"WorkCover, NDIS, HICAPS","areaServed":"${s} VIC"}`,
    default:     `{"@context":"https://schema.org","@type":"LocalBusiness","name":"${n}","areaServed":"${s} VIC","openingHours":"Mo-Fr 09:00-17:00"}`,
  };
  return schemas[type] || schemas.default;
}

const scColor = s => s >= 90 ? "#f87171" : s >= 75 ? "#fb923c" : "#fbbf24";

// ─── Pre-loaded law firm strike targets ───────────────────────────────────────
const STRIKE_TARGETS = [
  { business_name: "Blackburn Law Group",      suburb: "Blackburn",     business_type: "lawyer", google_rating: 4.8, review_count: 142, has_schema: false, gap_score: 95, status: "Scouted" },
  { business_name: "Collins Street Barristers",suburb: "Melbourne CBD", business_type: "lawyer", google_rating: 4.9, review_count: 88,  has_schema: false, gap_score: 93, status: "Scouted" },
  { business_name: "Eastfield Law",            suburb: "Croydon",       business_type: "lawyer", google_rating: 4.7, review_count: 94,  has_schema: false, gap_score: 94, status: "Scouted" },
  { business_name: "Fitzroy Street Legal",     suburb: "St Kilda",      business_type: "lawyer", google_rating: 4.8, review_count: 76,  has_schema: false, gap_score: 90, status: "Scouted" },
  { business_name: "Maroondah Lawyers",        suburb: "Ringwood",      business_type: "lawyer", google_rating: 4.6, review_count: 110, has_schema: false, gap_score: 91, status: "Scouted" },
  { business_name: "Ringwood Legal",           suburb: "Ringwood",      business_type: "lawyer", google_rating: 4.7, review_count: 98,  has_schema: false, gap_score: 88, status: "Scouted" },
  { business_name: "Doncaster Legal Partners", suburb: "Doncaster",     business_type: "lawyer", google_rating: 4.5, review_count: 67,  has_schema: false, gap_score: 87, status: "Scouted" },
  { business_name: "Warrandyte Law",           suburb: "Warrandyte",    business_type: "lawyer", google_rating: 4.8, review_count: 55,  has_schema: false, gap_score: 86, status: "Scouted" },
  { business_name: "Springvale Community Law", suburb: "Springvale",    business_type: "lawyer", google_rating: 4.6, review_count: 72,  has_schema: false, gap_score: 85, status: "Scouted" },
  { business_name: "Box Hill Community Legal", suburb: "Box Hill",      business_type: "lawyer", google_rating: 4.7, review_count: 83,  has_schema: false, gap_score: 89, status: "Scouted" },
  { business_name: "Camberwell Legal Centre",  suburb: "Camberwell",    business_type: "lawyer", google_rating: 4.5, review_count: 61,  has_schema: false, gap_score: 83, status: "Scouted" },
  { business_name: "Kew Law Chambers",         suburb: "Kew",           business_type: "lawyer", google_rating: 4.7, review_count: 49,  has_schema: false, gap_score: 82, status: "Scouted" },
  { business_name: "Richmond Legal Group",     suburb: "Richmond",      business_type: "lawyer", google_rating: 4.6, review_count: 58,  has_schema: false, gap_score: 80, status: "Scouted" },
  { business_name: "Healesville Legal Group",  suburb: "Healesville",   business_type: "lawyer", google_rating: 4.8, review_count: 44,  has_schema: false, gap_score: 79, status: "Scouted" },
];

export default function ControlRoom() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("strike");
  const [active, setActive] = useState(null);
  const [copied, setCopied] = useState(null);
  const [toast, setToast] = useState(null);
  const [pasteInput, setPasteInput] = useState("");
  const [suburb, setSuburb] = useState("Ringwood");
  const [scouting, setScouting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [loadingTargets, setLoadingTargets] = useState(false);

  const showToast = (m, t = "ok") => { setToast({ m, t }); setTimeout(() => setToast(null), 3500); };
  const copyText = (text, key) => { try { navigator.clipboard.writeText(text); } catch(e) {} setCopied(key); setTimeout(() => setCopied(null), 2500); };

  const load = useCallback(async () => {
    try { const data = await Lead.list(); setLeads(Array.isArray(data) ? data : []); }
    catch (e) { console.warn(e); setLeads([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Pre-load all 14 Capital Colony targets
  const loadCapitalTargets = async () => {
    setLoadingTargets(true);
    const existing = new Set(leads.map(l => (l.business_name || "").toLowerCase()));
    let added = 0;
    for (const t of STRIKE_TARGETS) {
      if (existing.has(t.business_name.toLowerCase())) continue;
      try { await Lead.create(t); added++; }
      catch (e) { console.warn(e); }
    }
    showToast(`${added} Capital Colony targets loaded`);
    setLoadingTargets(false);
    load();
  };

  const runScout = async () => {
    const lines = pasteInput.split("\n").map(l => l.trim()).filter(l => l.length > 2);
    if (!lines.length) { showToast("Paste at least one business name", "err"); return; }
    setScouting(true);
    const existing = new Set(leads.map(l => (l.business_name || "").toLowerCase()));
    let added = 0, skipped = 0;
    for (const line of lines) {
      const parts = line.split(/[|,\t]/).map(p => p.trim());
      const name = parts[0];
      if (!name || name.length < 2) continue;
      if (existing.has(name.toLowerCase())) { skipped++; continue; }
      const rating = parseFloat(parts[1]) || (3.9 + Math.random() * 0.9);
      const reviews = parseInt(parts[2]) || Math.floor(20 + Math.random() * 130);
      const score = gapScore(name, false, rating, reviews);
      try {
        await Lead.create({ business_name: name, suburb, business_type: detectType(name), google_rating: Math.round(rating*10)/10, review_count: reviews, has_schema: false, gap_score: score, status: "Scouted" });
        added++; existing.add(name.toLowerCase());
      } catch (e) { console.warn(e); }
    }
    showToast(`${added} leads added${skipped ? ` · ${skipped} already known` : ""}`);
    setPasteInput(""); setScouting(false); load();
  };

  const draftAll = async () => {
    const undrafted = leads.filter(l => l.status === "Scouted");
    if (!undrafted.length) { showToast("No scouted leads", "err"); return; }
    setGenerating(true);
    let done = 0;
    for (const lead of undrafted) {
      const { subject, body } = buildEmail(lead);
      try { await Lead.update(lead.id, { email_subject: subject, email_body: body, status: "Email Drafted" }); done++; }
      catch (e) { console.warn(e); }
    }
    showToast(`${done} emails drafted`); setGenerating(false); load();
  };

  const draftOne = async (lead) => {
    const { subject, body } = buildEmail(lead);
    try { await Lead.update(lead.id, { email_subject: subject, email_body: body, status: "Email Drafted" }); showToast(`Drafted: ${lead.business_name}`); load(); }
    catch { showToast("Failed", "err"); }
  };

  const updateStatus = async (lead, status, extra = {}) => {
    try { await Lead.update(lead.id, { status, ...extra }); showToast(`${lead.business_name} → ${status}`); load(); }
    catch { showToast("Failed", "err"); }
  };

  const deleteLead = async (lead) => {
    try { await Lead.delete(lead.id); showToast(`Removed`); setActive(null); load(); }
    catch { showToast("Failed", "err"); }
  };

  const scouted   = leads.filter(l => l.status === "Scouted").length;
  const drafted   = leads.filter(l => l.status === "Email Drafted").length;
  const contacted = leads.filter(l => l.status === "Contacted").length;
  const replied   = leads.filter(l => l.status === "Replied").length;
  const closed    = leads.filter(l => l.status === "Closed").length;
  const revenue   = leads.filter(l => l.status === "Closed").reduce((s, l) => s + (l.revenue || 200), 0);

  // Strike targets = top 3 by score from Capital Colony leads
  const capitalLeads = [...leads].filter(l => getLawAudit(l.business_name)).sort((a,b) => (b.gap_score||0)-(a.gap_score||0));
  const closerLeads  = leads.filter(l => ["Email Drafted","Contacted","Replied"].includes(l.status));

  const W = { minHeight: "100vh", background: "#080808", color: "#fff", fontFamily: "'Inter',system-ui,sans-serif" };
  const card = (extra={}) => ({ background: "#0f0f0f", border: "1px solid rgba(255,255,255,.06)", borderRadius: 18, padding: 20, ...extra });
  const pill = (color) => ({ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color, margin: 0 });
  const btn  = (bg, color, extra={}) => ({ background: bg, color, border: "none", borderRadius: 10, padding: "8px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer", ...extra });

  return (
    <div style={W}>
      {toast && (
        <div style={{ position:"fixed", top:16, right:16, zIndex:9999, padding:"10px 16px", borderRadius:12, fontSize:13, fontWeight:500, background: toast.t==="err"?"#1a0505":"#051a0a", border:`1px solid ${toast.t==="err"?"rgba(239,68,68,.3)":"rgba(52,211,153,.3)"}`, color: toast.t==="err"?"#fca5a5":"#6ee7b7" }}>
          {toast.m}
        </div>
      )}

      {/* Nav */}
      <nav style={{ borderBottom:"1px solid rgba(255,255,255,.05)", background:"rgba(0,0,0,.6)", backdropFilter:"blur(20px)", position:"sticky", top:0, zIndex:40 }}>
        <div style={{ maxWidth:960, margin:"0 auto", padding:"0 20px", height:56, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:28, height:28, borderRadius:8, background:"linear-gradient(135deg,#8b5cf6,#d946ef)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:12 }}>Y</div>
            <span style={{ fontSize:14, fontWeight:600, color:"rgba(255,255,255,.85)" }}>YABAI</span>
            <span style={{ color:"rgba(255,255,255,.2)" }}>/</span>
            <span style={{ fontSize:14, color:"rgba(255,255,255,.4)" }}>Control Room</span>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            {[{href:"/Dashboard",l:"Colonies"},{href:"/Rover",l:"Rover"},{href:"/StrikeDeck",l:"Strike Deck"}].map(a=>(
              <a key={a.href} href={a.href} style={{ fontSize:11, background:"rgba(255,255,255,.04)", color:"rgba(255,255,255,.4)", border:"1px solid rgba(255,255,255,.08)", padding:"6px 12px", borderRadius:10, textDecoration:"none" }}>{a.l}</a>
            ))}
          </div>
        </div>
      </nav>

      <div style={{ maxWidth:960, margin:"0 auto", padding:"32px 20px" }}>

        {/* Header */}
        <div style={{ marginBottom:28 }}>
          <p style={pill("rgba(255,255,255,.25)")}>Hybrid Strike Protocol — Capital Colony</p>
          <h1 style={{ fontSize:26, fontWeight:900, color:"rgba(255,255,255,.9)", margin:"6px 0 4px 0" }}>Agentic Control Room</h1>
          <p style={{ fontSize:13, color:"rgba(255,255,255,.3)", margin:0 }}>Thomas from Melbourne → 14 law firms → first reply = $97 audit → upsell to $1,500/mo retainer</p>
        </div>

        {/* The playbook — always visible */}
        <div style={{ ...card(), marginBottom:20, background:"rgba(139,92,246,.06)", border:"1px solid rgba(139,92,246,.15)" }}>
          <p style={pill("rgba(167,139,250,.8)")}>The Hybrid Strike Playbook</p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginTop:14 }}>
            {[
              { step:"1", title:"Scout", desc:"14 Capital Colony law firms already loaded. Top 3 by score: Blackburn (95), Eastfield (94), Collins St (93).", color:"#38bdf8" },
              { step:"2", title:"Send", desc:"3-sentence email as Thomas from Melbourne. Not a pitch — a question. 'Would it be alright if I sent you the one-pager?'", color:"#fbbf24" },
              { step:"3", title:"Close", desc:"They say yes → send the audit link from Strike Deck → they ask how to fix it → $97 audit, $1,500 retainer.", color:"#34d399" },
            ].map(s=>(
              <div key={s.step} style={{ background:"rgba(0,0,0,.3)", borderRadius:12, padding:14 }}>
                <div style={{ width:22, height:22, borderRadius:6, background:`${s.color}22`, border:`1px solid ${s.color}44`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:s.color, marginBottom:10 }}>{s.step}</div>
                <p style={{ fontSize:13, fontWeight:700, color:"rgba(255,255,255,.75)", margin:"0 0 6px 0" }}>{s.title}</p>
                <p style={{ fontSize:12, color:"rgba(255,255,255,.35)", margin:0, lineHeight:1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop:14, padding:"12px 16px", background:"rgba(251,191,36,.06)", border:"1px solid rgba(251,191,36,.12)", borderRadius:10 }}>
            <p style={{ fontSize:12, color:"rgba(251,191,36,.7)", margin:0, lineHeight:1.6 }}>
              <strong>When they reply:</strong> "I'm a local specialist looking at how AI is changing the Melbourne legal market. I've got the data ready — when are you free for a 5-minute chat?" That's it. Don't over-explain.
            </p>
          </div>
        </div>

        {/* Pipeline stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:10, marginBottom:20 }}>
          {[
            { l:"Scouted", v:leads.length, bg:"rgba(255,255,255,.04)" },
            { l:"Drafted", v:drafted, bg:"rgba(56,189,248,.08)" },
            { l:"Contacted", v:contacted, bg:"rgba(251,191,36,.08)" },
            { l:"Replied", v:replied, bg:"rgba(167,139,250,.08)" },
            { l:"Closed", v:closed, bg:"rgba(52,211,153,.08)" },
            { l:"Revenue", v:`$${revenue}`, bg:"rgba(52,211,153,.12)" },
          ].map(s=>(
            <div key={s.l} style={{ background:s.bg, border:"1px solid rgba(255,255,255,.05)", borderRadius:14, padding:"12px 8px", textAlign:"center" }}>
              <div style={{ fontSize:20, fontWeight:900, fontFamily:"monospace", color:"rgba(255,255,255,.8)" }}>{s.v}</div>
              <div style={{ fontSize:9, textTransform:"uppercase", letterSpacing:"0.1em", color:"rgba(255,255,255,.25)", marginTop:3 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:4, background:"rgba(255,255,255,.03)", borderRadius:12, padding:4, width:"fit-content", marginBottom:24 }}>
          {[["strike","Strike Targets"],["closer","Email Closer"],["scout","Add Leads"],["closed","Closed"]].map(([id,l])=>(
            <button key={id} onClick={()=>setTab(id)} style={{ fontSize:12, padding:"8px 16px", borderRadius:8, fontWeight:500, border:"none", cursor:"pointer", background:tab===id?"rgba(255,255,255,.1)":"transparent", color:tab===id?"#fff":"rgba(255,255,255,.35)" }}>{l}</button>
          ))}
        </div>

        {/* ── STRIKE TARGETS TAB ── */}
        {tab === "strike" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, flexWrap:"wrap", gap:8 }}>
              <div>
                <p style={{ fontSize:14, fontWeight:600, color:"rgba(255,255,255,.7)", margin:0 }}>14 Capital Colony Targets</p>
                <p style={{ fontSize:12, color:"rgba(255,255,255,.25)", margin:"3px 0 0 0" }}>Sorted by gap score · Click to expand email + audit</p>
              </div>
              {leads.filter(l=>getLawAudit(l.business_name)).length === 0 && (
                <button onClick={loadCapitalTargets} disabled={loadingTargets}
                  style={{ ...btn("rgba(139,92,246,.12)","#c4b5fd"), border:"1px solid rgba(139,92,246,.2)", opacity: loadingTargets ? .5 : 1 }}>
                  {loadingTargets ? "Loading..." : "Load 14 targets into CRM"}
                </button>
              )}
              {leads.filter(l=>getLawAudit(l.business_name) && l.status==="Scouted").length > 0 && (
                <button onClick={draftAll} disabled={generating}
                  style={{ ...btn("rgba(56,189,248,.1)","#7dd3fc"), border:"1px solid rgba(56,189,248,.2)", opacity: generating ? .5 : 1 }}>
                  {generating ? "Drafting..." : `Draft all ${leads.filter(l=>getLawAudit(l.business_name) && l.status==="Scouted").length} emails`}
                </button>
              )}
            </div>

            {/* Show static targets if not loaded yet */}
            {(() => {
              const targets = leads.filter(l => getLawAudit(l.business_name)).length > 0
                ? [...leads].filter(l=>getLawAudit(l.business_name)).sort((a,b)=>(b.gap_score||0)-(a.gap_score||0))
                : STRIKE_TARGETS.map((t,i)=>({...t, id:`preview-${i}`, _preview:true}));

              return targets.map((lead, i) => {
                const audit = getLawAudit(lead.business_name);
                const open = active === (lead.id || i);
                const { subject, body, followUp } = buildEmail(lead);
                const isPreview = lead._preview;

                return (
                  <div key={lead.id || i} style={{ background: open ? "#0f0f0f" : "#0a0a0a", border: `1px solid ${open ? "rgba(255,255,255,.1)" : "rgba(255,255,255,.05)"}`, borderRadius:16, marginBottom:8, overflow:"hidden" }}>
                    <div onClick={()=>setActive(open ? null : (lead.id||i))} style={{ padding:"14px 20px", display:"flex", alignItems:"center", gap:14, cursor:"pointer" }}>
                      <div style={{ width:22, height:22, borderRadius:6, background:"rgba(255,255,255,.04)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontFamily:"monospace", color:"rgba(255,255,255,.25)", flexShrink:0 }}>{String(i+1).padStart(2,"0")}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontSize:14, fontWeight:600, color:"rgba(255,255,255,.8)", margin:0 }}>{lead.business_name}</p>
                        <p style={{ fontSize:11, color:"rgba(255,255,255,.25)", margin:"3px 0 0 0" }}>{lead.suburb} · {audit?.type} · {audit?.hours}h/wk · {audit?.cost}/mo</p>
                      </div>
                      {isPreview && <span style={{ fontSize:10, color:"rgba(139,92,246,.6)", border:"1px solid rgba(139,92,246,.2)", padding:"3px 8px", borderRadius:6 }}>Preview</span>}
                      {!isPreview && lead.status && lead.status !== "Scouted" && <span style={{ fontSize:10, color:"rgba(52,211,153,.7)", border:"1px solid rgba(52,211,153,.2)", padding:"3px 8px", borderRadius:6 }}>{lead.status}</span>}
                      <div style={{ fontSize:22, fontWeight:900, fontFamily:"monospace", color:scColor(lead.gap_score||85), flexShrink:0 }}>{lead.gap_score||85}</div>
                      <span style={{ color:"rgba(255,255,255,.2)", fontSize:11, transition:"transform .2s", transform:open?"rotate(180deg)":"none" }}>▼</span>
                    </div>

                    {open && (
                      <div style={{ padding:"0 20px 20px 20px", borderTop:"1px solid rgba(255,255,255,.05)" }}>
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, paddingTop:16, marginBottom:16 }}>
                          <div style={{ background:"rgba(239,68,68,.05)", border:"1px solid rgba(239,68,68,.1)", borderRadius:12, padding:14 }}>
                            <p style={pill("rgba(248,113,113,.7)")}>The Gap</p>
                            <p style={{ fontSize:12, color:"rgba(255,255,255,.5)", marginTop:8, lineHeight:1.6 }}>{audit?.gap}</p>
                          </div>
                          <div style={{ background:"rgba(52,211,153,.05)", border:"1px solid rgba(52,211,153,.1)", borderRadius:12, padding:14 }}>
                            <p style={pill("rgba(52,211,153,.7)")}>The Fix</p>
                            <p style={{ fontSize:12, color:"rgba(255,255,255,.5)", marginTop:8, lineHeight:1.6 }}>{audit?.fix}</p>
                          </div>
                        </div>

                        {/* 3-sentence email */}
                        <div style={{ marginBottom:14 }}>
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                            <p style={pill("rgba(251,191,36,.7)")}>First Email (Thomas voice — 3 sentences)</p>
                            <button onClick={()=>copyText(`Subject: ${subject}\n\n${body}`, `email-${lead.id||i}`)} style={{ ...btn("rgba(255,255,255,.04)","rgba(255,255,255,.4)"), padding:"5px 12px", fontSize:10 }}>
                              {copied===`email-${lead.id||i}` ? "Copied" : "Copy"}
                            </button>
                          </div>
                          <div style={{ background:"rgba(0,0,0,.4)", border:"1px solid rgba(255,255,255,.06)", borderRadius:12, padding:16 }}>
                            <p style={{ fontSize:11, color:"rgba(251,191,36,.5)", margin:"0 0 10px 0", fontFamily:"monospace" }}>Subject: {subject}</p>
                            <pre style={{ fontSize:13, color:"rgba(255,255,255,.55)", whiteSpace:"pre-wrap", fontFamily:"sans-serif", lineHeight:1.8, margin:0 }}>{body}</pre>
                          </div>
                        </div>

                        {/* Follow up */}
                        <div style={{ marginBottom:14 }}>
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                            <p style={pill("rgba(167,139,250,.7)")}>Follow-up (if no reply in 3 days)</p>
                            <button onClick={()=>copyText(followUp||"", `fu-${lead.id||i}`)} style={{ ...btn("rgba(255,255,255,.04)","rgba(255,255,255,.4)"), padding:"5px 12px", fontSize:10 }}>
                              {copied===`fu-${lead.id||i}` ? "Copied" : "Copy"}
                            </button>
                          </div>
                          <pre style={{ background:"rgba(0,0,0,.4)", border:"1px solid rgba(255,255,255,.06)", borderRadius:12, padding:16, fontSize:13, color:"rgba(255,255,255,.45)", whiteSpace:"pre-wrap", fontFamily:"sans-serif", lineHeight:1.8, margin:0 }}>{followUp}</pre>
                        </div>

                        {/* Audit link */}
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"rgba(139,92,246,.06)", border:"1px solid rgba(139,92,246,.15)", borderRadius:12, padding:"12px 16px", marginBottom:14 }}>
                          <div>
                            <p style={{ fontSize:11, fontWeight:600, color:"rgba(167,139,250,.8)", margin:"0 0 3px 0" }}>Attach this link in the email</p>
                            <p style={{ fontSize:11, color:"rgba(255,255,255,.3)", margin:0 }}>yabai-app-3e942cf0.base44.app/StrikeDeck</p>
                          </div>
                          <button onClick={()=>copyText("https://yabai-app-3e942cf0.base44.app/StrikeDeck", `link-${lead.id||i}`)} style={{ ...btn("rgba(139,92,246,.1)","#c4b5fd"), border:"1px solid rgba(139,92,246,.2)", fontSize:11 }}>
                            {copied===`link-${lead.id||i}` ? "Copied" : "Copy link"}
                          </button>
                        </div>

                        {/* CRM actions (only for real leads, not previews) */}
                        {!isPreview && (
                          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                            {lead.status === "Scouted" && <button onClick={()=>draftOne(lead)} style={{ ...btn("rgba(56,189,248,.08)","#7dd3fc"), border:"1px solid rgba(56,189,248,.2)" }}>Draft email</button>}
                            {lead.status === "Email Drafted" && <button onClick={()=>updateStatus(lead,"Contacted")} style={{ ...btn("rgba(251,191,36,.08)","#fcd34d"), border:"1px solid rgba(251,191,36,.2)" }}>Mark sent</button>}
                            {["Contacted","Replied"].includes(lead.status) && <button onClick={()=>updateStatus(lead,"Closed",{revenue:1500})} style={{ ...btn("rgba(52,211,153,.08)","#6ee7b7"), border:"1px solid rgba(52,211,153,.2)" }}>Closed $1,500</button>}
                            <button onClick={()=>updateStatus(lead,"Replied")} style={{ ...btn("rgba(167,139,250,.08)","#c4b5fd"), border:"1px solid rgba(167,139,250,.2)" }}>Got reply</button>
                            <button onClick={()=>deleteLead(lead)} style={{ ...btn("transparent","rgba(255,255,255,.2)"), marginLeft:"auto" }}>Remove</button>
                          </div>
                        )}
                        {isPreview && (
                          <button onClick={loadCapitalTargets} disabled={loadingTargets} style={{ ...btn("rgba(139,92,246,.1)","#c4b5fd"), border:"1px solid rgba(139,92,246,.2)" }}>
                            Load into CRM to track this lead →
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              });
            })()}
          </div>
        )}

        {/* ── CLOSER TAB ── */}
        {tab === "closer" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, flexWrap:"wrap", gap:8 }}>
              <p style={{ fontSize:14, fontWeight:600, color:"rgba(255,255,255,.6)", margin:0 }}>Drafted Emails</p>
              {scouted > 0 && <button onClick={draftAll} disabled={generating} style={{ ...btn("rgba(56,189,248,.08)","#7dd3fc"), border:"1px solid rgba(56,189,248,.2)", opacity:generating?.5:1 }}>{generating?"Drafting...":"Draft all scouted"}</button>}
            </div>
            {closerLeads.length === 0 ? (
              <div style={{ textAlign:"center", padding:"60px 0" }}>
                <p style={{ color:"rgba(255,255,255,.2)", fontSize:14 }}>No emails drafted yet.</p>
                <button onClick={()=>setTab("strike")} style={{ marginTop:12, color:"#a78bfa", background:"none", border:"none", cursor:"pointer", fontSize:12 }}>Go to Strike Targets →</button>
              </div>
            ) : closerLeads.map(lead => {
              const open = active === lead.id;
              return (
                <div key={lead.id} style={{ background:open?"#0f0f0f":"#0a0a0a", border:`1px solid ${open?"rgba(255,255,255,.1)":"rgba(255,255,255,.05)"}`, borderRadius:16, marginBottom:8, overflow:"hidden" }}>
                  <div onClick={()=>setActive(open?null:lead.id)} style={{ padding:"14px 20px", display:"flex", alignItems:"center", gap:12, cursor:"pointer" }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:14, fontWeight:600, color:"rgba(255,255,255,.75)", margin:0 }}>{lead.business_name}</p>
                      <p style={{ fontSize:11, color:"rgba(255,255,255,.25)", margin:"3px 0 0 0", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{lead.email_subject}</p>
                    </div>
                    <span style={{ fontSize:10, padding:"3px 10px", borderRadius:7, border:"1px solid rgba(255,255,255,.1)", color:"rgba(255,255,255,.4)" }}>{lead.status}</span>
                    <span style={{ color:"rgba(255,255,255,.2)", fontSize:11, transform:open?"rotate(180deg)":"none" }}>▼</span>
                  </div>
                  {open && (
                    <div style={{ padding:"0 20px 20px", borderTop:"1px solid rgba(255,255,255,.05)" }}>
                      <div style={{ paddingTop:16 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                          <p style={pill("rgba(251,191,36,.7)")}>Subject</p>
                          <button onClick={()=>copyText(lead.email_subject,`sub-${lead.id}`)} style={{ ...btn("transparent","rgba(255,255,255,.3)"), padding:"3px 8px", fontSize:10 }}>{copied===`sub-${lead.id}`?"Copied":"Copy"}</button>
                        </div>
                        <p style={{ fontSize:13, color:"rgba(251,191,36,.6)", fontStyle:"italic", marginBottom:16 }}>"{lead.email_subject}"</p>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                          <p style={pill("rgba(56,189,248,.7)")}>Body</p>
                          <button onClick={()=>copyText(lead.email_body,`body-${lead.id}`)} style={{ ...btn("transparent","rgba(255,255,255,.3)"), padding:"3px 8px", fontSize:10 }}>{copied===`body-${lead.id}`?"Copied":"Copy"}</button>
                        </div>
                        <pre style={{ background:"rgba(0,0,0,.4)", border:"1px solid rgba(255,255,255,.06)", borderRadius:12, padding:16, fontSize:13, color:"rgba(255,255,255,.5)", whiteSpace:"pre-wrap", fontFamily:"sans-serif", lineHeight:1.8, maxHeight:240, overflow:"auto", marginBottom:16 }}>{lead.email_body}</pre>
                        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                          {lead.status === "Email Drafted" && <button onClick={()=>updateStatus(lead,"Contacted")} style={{ ...btn("rgba(251,191,36,.08)","#fcd34d"), border:"1px solid rgba(251,191,36,.2)" }}>Mark sent</button>}
                          {["Contacted","Replied"].includes(lead.status) && <button onClick={()=>updateStatus(lead,"Closed",{revenue:1500})} style={{ ...btn("rgba(52,211,153,.08)","#6ee7b7"), border:"1px solid rgba(52,211,153,.2)" }}>Closed $1,500</button>}
                          <button onClick={()=>updateStatus(lead,"Replied")} style={{ ...btn("rgba(167,139,250,.08)","#c4b5fd"), border:"1px solid rgba(167,139,250,.2)" }}>Got reply</button>
                          <button onClick={()=>deleteLead(lead)} style={{ ...btn("transparent","rgba(255,255,255,.2)"), marginLeft:"auto" }}>Remove</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── ADD LEADS TAB ── */}
        {tab === "scout" && (
          <div style={{ ...card() }}>
            <p style={pill("rgba(255,255,255,.25)")}>Add new leads from Google Maps / GMB Everywhere</p>
            <p style={{ fontSize:12, color:"rgba(255,255,255,.3)", margin:"8px 0 16px 0", lineHeight:1.6 }}>
              Format: <code style={{ background:"rgba(255,255,255,.06)", padding:"2px 6px", borderRadius:4 }}>Business Name | Rating | Reviews</code>. Duplicates are ignored automatically.
            </p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 140px", gap:12, marginBottom:12 }}>
              <textarea value={pasteInput} onChange={e=>setPasteInput(e.target.value)} placeholder={"Ringwood Plumbing | 4.8 | 120\nEastern Electricals | 4.6 | 88\n..."} rows={6}
                style={{ background:"rgba(0,0,0,.5)", border:"1px solid rgba(255,255,255,.08)", borderRadius:12, padding:"12px 16px", fontSize:13, color:"rgba(255,255,255,.8)", fontFamily:"monospace", resize:"vertical", outline:"none", boxSizing:"border-box" }} />
              <div>
                <label style={{ fontSize:10, textTransform:"uppercase", letterSpacing:"0.1em", color:"rgba(255,255,255,.3)", display:"block", marginBottom:6 }}>Suburb</label>
                <input value={suburb} onChange={e=>setSuburb(e.target.value)} style={{ width:"100%", background:"rgba(0,0,0,.5)", border:"1px solid rgba(255,255,255,.08)", borderRadius:10, padding:"8px 12px", fontSize:13, color:"rgba(255,255,255,.8)", outline:"none", boxSizing:"border-box" }} />
              </div>
            </div>
            <button onClick={runScout} disabled={scouting || !pasteInput.trim()} style={{ ...btn(scouting||!pasteInput.trim()?"rgba(255,255,255,.06)":"#fff", scouting||!pasteInput.trim()?"rgba(255,255,255,.25)":"#000"), width:"100%", padding:"12px", fontSize:14, borderRadius:12, cursor:scouting||!pasteInput.trim()?"not-allowed":"pointer" }}>
              {scouting ? "Scouting..." : `Scout ${pasteInput.split("\n").filter(l=>l.trim().length>2).length||""} leads`}
            </button>
          </div>
        )}

        {/* ── CLOSED TAB ── */}
        {tab === "closed" && (
          <div>
            {closed === 0 ? (
              <div style={{ textAlign:"center", padding:"60px 0" }}>
                <p style={{ fontSize:36, margin:"0 0 12px 0", color:"rgba(255,255,255,.2)" }}>$0</p>
                <p style={{ color:"rgba(255,255,255,.2)", fontSize:14 }}>First close incoming.</p>
                <p style={{ color:"rgba(255,255,255,.15)", fontSize:12, marginTop:6 }}>14 firms · 1 reply needed · $1,500 retainer</p>
              </div>
            ) : (
              <div>
                <div style={{ background:"rgba(52,211,153,.05)", border:"1px solid rgba(52,211,153,.15)", borderRadius:16, padding:20, textAlign:"center", marginBottom:16 }}>
                  <div style={{ fontSize:44, fontWeight:900, fontFamily:"monospace", color:"#34d399" }}>${revenue}</div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,.3)", textTransform:"uppercase", letterSpacing:"0.1em", marginTop:4 }}>{closed} client{closed>1?"s":""} closed</div>
                </div>
                {leads.filter(l=>l.status==="Closed").map(lead=>(
                  <div key={lead.id} style={{ ...card(), display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                    <div>
                      <p style={{ fontSize:14, fontWeight:600, color:"rgba(255,255,255,.8)", margin:0 }}>{lead.business_name}</p>
                      <p style={{ fontSize:11, color:"rgba(255,255,255,.3)", margin:"3px 0 0 0" }}>{lead.suburb}</p>
                    </div>
                    <div style={{ fontSize:20, fontWeight:900, color:"#34d399" }}>${lead.revenue||1500}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <footer style={{ borderTop:"1px solid rgba(255,255,255,.04)", marginTop:60, padding:"20px 0", textAlign:"center", fontSize:10, color:"rgba(255,255,255,.1)", letterSpacing:"0.15em", textTransform:"uppercase" }}>
        YABAI Control Room · Thomas from Melbourne · 14 Law Firms · Hybrid Strike Protocol
      </footer>
    </div>
  );
}
