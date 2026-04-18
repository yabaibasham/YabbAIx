import { useState, useEffect, useCallback } from "react";
import { Lead, Signal } from "@/api/entities";

const SECTORS = ["Legal", "Medical/NDIS", "Real Estate", "Other"];
const STATUSES = ["Discovered", "Email Drafted", "Sent", "Opened", "Replied", "Closed", "Dead"];
const SENTIMENTS = ["Positive", "Negative", "Objection-HasTool", "Objection-Budget", "Objection-Timing", "Neutral"];

const STATUS_COLOR = {
  "Discovered":    "#555",
  "Email Drafted": "#38bdf8",
  "Sent":          "#a78bfa",
  "Opened":        "#fbbf24",
  "Replied":       "#fb923c",
  "Closed":        "#34d399",
  "Dead":          "#2a2a2a",
};

const SENTIMENT_COLOR = {
  "Positive":           "#34d399",
  "Negative":           "#f87171",
  "Objection-HasTool":  "#f97316",
  "Objection-Budget":   "#fbbf24",
  "Objection-Timing":   "#a78bfa",
  "Neutral":            "#555",
};

// Pivot email templates based on objection type
const PIVOT_TEMPLATES = {
  "Objection-HasTool": {
    label: "AI Integration Audit",
    hook: "I saw you already have an AI tool in place — that's actually why I'm reaching out. 80% of firms that adopt AI tools in year one are leaving the biggest gains on the table because the integration wasn't mapped to their workflow. I do a 48-hour Integration Audit for $97 — it tells you exactly what your current tool is missing.",
  },
  "Objection-Budget":  {
    label: "ROI-First Pitch",
    hook: "Completely understand. That's why I built a free 5-minute diagnostic — no commitment, just a number. It tells you exactly what your current manual process is costing per month. If the number isn't bigger than our fee, I'll tell you to save your money.",
  },
  "Objection-Timing":  {
    label: "Timing Follow-Up",
    hook: "No rush at all — I'll park this and check back in 30 days. One thing worth knowing: the firms that move first in their suburb own the AI-advantage for 18 months before competitors catch up. Happy to hold your spot.",
  },
};

const TOKEN_COST_PER_RUN = 0.08; // credits per orchestrator run

export default function StrikeDeck() {
  const [leads,     setLeads]     = useState([]);
  const [signals,   setSignals]   = useState([]);
  const [sector,    setSector]    = useState("Legal");
  const [loading,   setLoading]   = useState(true);
  const [selected,  setSelected]  = useState(null);
  const [editMode,  setEditMode]  = useState(false);
  const [editData,  setEditData]  = useState({});
  const [saving,    setSaving]    = useState(false);
  const [toast,     setToast]     = useState(null);
  const [tab,       setTab]       = useState("pipeline"); // pipeline | shadow | roi | feedback

  const showToast = (m, t="ok") => { setToast({m,t}); setTimeout(()=>setToast(null), 3000); };

  const load = useCallback(async () => {
    try {
      const [l, s] = await Promise.all([Lead.list(), Signal.list()]);
      setLeads(Array.isArray(l) ? l : []);
      setSignals(Array.isArray(s) ? s : []);
    } catch(e) { showToast("Load error", "err"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = leads.filter(l => !sector || l.sector === sector || (!l.sector && sector === "Legal"));

  // Stats
  const closed   = filtered.filter(l => l.status === "Closed");
  const replied  = filtered.filter(l => l.status === "Replied");
  const sent     = filtered.filter(l => ["Sent","Opened","Replied","Closed"].includes(l.status));
  const revenue  = closed.reduce((s,l) => s + (l.revenue || 1500), 0);
  const pipeline = filtered.filter(l => ["Email Drafted","Sent","Opened","Replied"].includes(l.status)).length * 1500;
  const replyRate = sent.length > 0 ? Math.round((replied.length + closed.length) / sent.length * 100) : 0;

  // Feedback analysis
  const objections = leads.filter(l => l.reply_sentiment && l.reply_sentiment.startsWith("Objection"));
  const wins       = leads.filter(l => l.reply_sentiment === "Positive" || l.status === "Closed");
  const winVoice   = wins.length > 0 ? wins[0].voice_variant || "Thomas Direct" : "Thomas Direct";

  // Shadow signals
  const shadowLeads = leads.filter(l => l.shadow_signal || l.seek_job_url);

  // ROI
  const totalRuns    = 12; // approx
  const tokenSpend   = (totalRuns * TOKEN_COST_PER_RUN).toFixed(2);
  const wasteFound   = filtered.reduce((s,l) => s + (l.gap_score || 0) * 120, 0);
  const roiMultiple  = tokenSpend > 0 ? Math.round(revenue / (tokenSpend * 10) || 0) : 0;

  const openLead = (lead) => {
    setSelected(lead);
    setEditData({ status: lead.status, reply_text: lead.reply_text || "", reply_sentiment: lead.reply_sentiment || "", notes: lead.notes || "", revenue: lead.revenue || 1500 });
    setEditMode(false);
  };

  const saveEdit = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await Lead.update(selected.id, editData);
      // If replied with objection → log a signal for feedback loop
      if (editData.reply_sentiment && editData.reply_sentiment.startsWith("Objection")) {
        await Signal.create({
          timeline_id: "capital-colony",
          signal_type: "UserInput",
          source: `Lead feedback: ${selected.business_name}`,
          raw_data: `Objection type: ${editData.reply_sentiment}. Reply: ${editData.reply_text}`,
          score: 40,
          processed: false,
        });
      }
      if (editData.reply_sentiment === "Positive" || editData.status === "Closed") {
        await Signal.create({
          timeline_id: "capital-colony",
          signal_type: "RevenueEvent",
          source: `Win signal: ${selected.business_name}`,
          raw_data: `Winning voice: ${selected.voice_variant || "Thomas Direct"}. Status: ${editData.status}`,
          score: 95,
          processed: false,
        });
      }
      showToast("Saved — feedback loop updated");
      load();
      setSelected(null);
    } catch(e) { showToast("Save failed", "err"); }
    finally { setSaving(false); }
  };

  const S = { minHeight:"100vh", background:"#080808", color:"#fff", fontFamily:"system-ui,-apple-system,sans-serif" };

  if (loading) return (
    <div style={{...S, display:"flex", alignItems:"center", justifyContent:"center"}}>
      <p style={{color:"#444"}}>Loading Strike Deck…</p>
    </div>
  );

  return (
    <div style={S}>
      {/* Toast */}
      {toast && (
        <div style={{ position:"fixed", top:16, right:16, zIndex:999, background: toast.t==="err" ? "#3a0a0a" : "#0a1f14", border:`1px solid ${toast.t==="err"?"#7a2020":"#1a4a2a"}`, color: toast.t==="err"?"#f87171":"#34d399", padding:"10px 18px", borderRadius:10, fontSize:13 }}>
          {toast.m}
        </div>
      )}

      {/* Nav */}
      <div style={{ borderBottom:"1px solid #181818", background:"#050505", position:"sticky", top:0, zIndex:40, padding:"0 20px", height:52, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:26, height:26, borderRadius:7, background:"linear-gradient(135deg,#8b5cf6,#d946ef)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:12, color:"#fff" }}>Y</div>
          <span style={{ fontSize:14, fontWeight:700, color:"#ccc" }}>YABAI</span>
          <span style={{ color:"#333", margin:"0 4px" }}>/</span>
          <span style={{ fontSize:13, color:"#a78bfa", fontWeight:600 }}>Strike Deck</span>
        </div>
        {/* Sector Pivot */}
        <div style={{ display:"flex", gap:6 }}>
          {SECTORS.map(s => (
            <button key={s} onClick={() => setSector(s)}
              style={{ background: sector===s ? "#1a0f2e" : "transparent", border:`1px solid ${sector===s?"#5b21b6":"#222"}`, color: sector===s?"#a78bfa":"#555", borderRadius:8, padding:"4px 12px", fontSize:11, fontWeight:600, cursor:"pointer" }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:1000, margin:"0 auto", padding:"24px 20px" }}>

        {/* Stats row */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:8, marginBottom:20 }}>
          {[
            { v:filtered.length,        l:"In Sector",   c:"#a78bfa" },
            { v:sent.length,            l:"Sent",        c:"#38bdf8" },
            { v:replied.length,         l:"Replied",     c:"#fb923c" },
            { v:`${replyRate}%`,        l:"Reply Rate",  c: replyRate>20?"#34d399":"#fbbf24" },
            { v:closed.length,          l:"Closed",      c:"#34d399" },
            { v:`$${revenue.toLocaleString()}`, l:"Earned", c:"#fbbf24" },
          ].map(s => (
            <div key={s.l} style={{ background:"#0d0d0d", border:"1px solid #1c1c1c", borderRadius:12, padding:"12px 10px", textAlign:"center" }}>
              <div style={{ fontSize:20, fontWeight:900, fontFamily:"monospace", color:s.c }}>{s.v}</div>
              <div style={{ fontSize:10, color:"#444", marginTop:4, textTransform:"uppercase", letterSpacing:"0.08em" }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Tab nav */}
        <div style={{ display:"flex", gap:4, marginBottom:20, borderBottom:"1px solid #181818", paddingBottom:12 }}>
          {[
            { k:"pipeline", l:"Pipeline" },
            { k:"feedback", l:"Feedback Loop" },
            { k:"shadow",   l:"Shadow Signals" },
            { k:"roi",      l:"Real-Time ROI" },
          ].map(t => (
            <button key={t.k} onClick={() => setTab(t.k)}
              style={{ background: tab===t.k?"#0f0f0f":"transparent", border:`1px solid ${tab===t.k?"#2a2a2a":"transparent"}`, color: tab===t.k?"#ccc":"#555", borderRadius:8, padding:"6px 14px", fontSize:12, fontWeight:600, cursor:"pointer" }}>
              {t.l}
            </button>
          ))}
        </div>

        {/* PIPELINE TAB */}
        {tab === "pipeline" && (
          <div>
            {STATUSES.filter(st => st !== "Dead").map(status => {
              const group = filtered.filter(l => l.status === status);
              if (group.length === 0) return null;
              return (
                <div key={status} style={{ marginBottom:20 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:STATUS_COLOR[status] }} />
                    <span style={{ fontSize:12, fontWeight:700, color:"#555", textTransform:"uppercase", letterSpacing:"0.1em" }}>{status}</span>
                    <span style={{ fontSize:11, color:"#333" }}>({group.length})</span>
                  </div>
                  {group.map(lead => (
                    <div key={lead.id} onClick={() => openLead(lead)}
                      style={{ background:"#0a0a0a", border:"1px solid #181818", borderRadius:12, padding:"12px 16px", marginBottom:6, cursor:"pointer", display:"flex", alignItems:"center", gap:12, transition:"border .1s" }}
                      onMouseEnter={e=>e.currentTarget.style.borderColor="#2a2a2a"}
                      onMouseLeave={e=>e.currentTarget.style.borderColor="#181818"}>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontSize:13, fontWeight:600, color:"#ccc", margin:0 }}>{lead.business_name || "Unnamed"}</p>
                        <p style={{ fontSize:11, color:"#444", margin:"3px 0 0" }}>{lead.suburb} · {lead.business_type} · gap score {lead.gap_score || "—"}</p>
                      </div>
                      {lead.reply_sentiment && (
                        <span style={{ fontSize:10, padding:"3px 8px", borderRadius:6, background:"#111", border:"1px solid #222", color:SENTIMENT_COLOR[lead.reply_sentiment] }}>
                          {lead.reply_sentiment}
                        </span>
                      )}
                      {lead.shadow_signal && (
                        <span style={{ fontSize:10, padding:"3px 8px", borderRadius:6, background:"#120a00", border:"1px solid #2a1800", color:"#fb923c" }}>⚡ shadow</span>
                      )}
                      <span style={{ fontSize:11, color:"#333" }}>→</span>
                    </div>
                  ))}
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div style={{ textAlign:"center", padding:"60px 20px", color:"#333" }}>
                <p style={{ fontSize:14 }}>No {sector} leads yet.</p>
                <p style={{ fontSize:12, marginTop:8 }}>Run the Scout to populate this sector.</p>
              </div>
            )}
          </div>
        )}

        {/* FEEDBACK LOOP TAB */}
        {tab === "feedback" && (
          <div>
            <div style={{ background:"#0c0c18", border:"1px solid #1a1828", borderRadius:14, padding:"18px 20px", marginBottom:16 }}>
              <p style={{ fontSize:11, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:"#4a3a7a", margin:"0 0 12px" }}>Current Winning Voice</p>
              <div style={{ display:"flex", align:"center", gap:12 }}>
                <div style={{ background:"#080810", border:"1px solid #1e1a30", borderRadius:10, padding:"12px 16px", flex:1 }}>
                  <p style={{ fontSize:12, color:"#666", margin:"0 0 4px" }}>Active Voice Variant</p>
                  <p style={{ fontSize:16, fontWeight:700, color:"#a78bfa", margin:0 }}>{winVoice}</p>
                  <p style={{ fontSize:11, color:"#444", marginTop:4 }}>Based on {wins.length} positive signal{wins.length!==1?"s":""}</p>
                </div>
                <div style={{ background:"#080810", border:"1px solid #1e1a30", borderRadius:10, padding:"12px 16px", flex:1 }}>
                  <p style={{ fontSize:12, color:"#666", margin:"0 0 4px" }}>Objections Logged</p>
                  <p style={{ fontSize:16, fontWeight:700, color:"#f87171", margin:0 }}>{objections.length}</p>
                  <p style={{ fontSize:11, color:"#444", marginTop:4 }}>Pivot templates ready</p>
                </div>
              </div>
            </div>

            {Object.entries(PIVOT_TEMPLATES).map(([key, tpl]) => {
              const count = leads.filter(l => l.reply_sentiment === key).length;
              return (
                <div key={key} style={{ background:"#0a0a0a", border:"1px solid #1c1c1c", borderRadius:12, padding:"16px 18px", marginBottom:10 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                    <div>
                      <span style={{ fontSize:10, padding:"3px 8px", borderRadius:6, background:"#111", border:"1px solid #222", color:SENTIMENT_COLOR[key], marginRight:8 }}>{key}</span>
                      <span style={{ fontSize:13, fontWeight:600, color:"#ccc" }}>{tpl.label}</span>
                    </div>
                    <span style={{ fontSize:11, color:"#444" }}>{count} lead{count!==1?"s":""} triggered</span>
                  </div>
                  <div style={{ background:"#060606", border:"1px solid #181818", borderRadius:8, padding:"10px 12px" }}>
                    <p style={{ fontSize:11, fontWeight:700, color:"#444", textTransform:"uppercase", letterSpacing:"0.1em", margin:"0 0 6px" }}>Auto-pivot hook</p>
                    <p style={{ fontSize:12, color:"#777", margin:0, fontStyle:"italic", lineHeight:1.7 }}>"{tpl.hook}"</p>
                  </div>
                </div>
              );
            })}

            <div style={{ background:"#0a0a0a", border:"1px solid #1c1c1c", borderRadius:12, padding:"16px 18px", marginTop:16 }}>
              <p style={{ fontSize:11, fontWeight:700, color:"#444", textTransform:"uppercase", letterSpacing:"0.1em", margin:"0 0 12px" }}>Recent Feedback Signals</p>
              {signals.filter(s => s.signal_type === "UserInput" || s.signal_type === "RevenueEvent").slice(0,5).map(sig => (
                <div key={sig.id} style={{ padding:"8px 0", borderBottom:"1px solid #141414" }}>
                  <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                    <span style={{ fontSize:10, color: sig.signal_type==="RevenueEvent"?"#34d399":"#fb923c" }}>{sig.signal_type==="RevenueEvent"?"✓ Win":"⚡ Objection"}</span>
                    <span style={{ fontSize:12, color:"#666" }}>{sig.source}</span>
                    <span style={{ fontSize:11, color:"#333", marginLeft:"auto" }}>score {sig.score}</span>
                  </div>
                  {sig.raw_data && <p style={{ fontSize:11, color:"#444", margin:"4px 0 0", lineHeight:1.5 }}>{sig.raw_data.slice(0,120)}…</p>}
                </div>
              ))}
              {signals.length === 0 && <p style={{ fontSize:12, color:"#333" }}>No feedback signals yet — log a reply below to start the loop.</p>}
            </div>
          </div>
        )}

        {/* SHADOW SIGNALS TAB */}
        {tab === "shadow" && (
          <div>
            <div style={{ background:"#120a00", border:"1px solid #2a1800", borderRadius:14, padding:"18px 20px", marginBottom:16 }}>
              <p style={{ fontSize:11, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:"#6a3a00", margin:"0 0 8px" }}>Shadow Data Engine</p>
              <p style={{ fontSize:13, color:"#7a5020", lineHeight:1.7, margin:0 }}>
                A firm hiring a "Legal Secretary" or "Data Entry" operator on Seek is a <strong style={{color:"#fb923c"}}>Red Hot Signal</strong>. They're paying ~$55k/yr for work AI does at $1,500 flat. The Closer pivots: "I see you're hiring a Legal Secretary — I can automate 60% of that role's workload for 1/10th the annual cost."
              </p>
            </div>

            {shadowLeads.length > 0 ? (
              shadowLeads.map(lead => (
                <div key={lead.id} style={{ background:"#0a0a0a", border:"1px solid #2a1800", borderRadius:12, padding:"14px 18px", marginBottom:8 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                    <div>
                      <p style={{ fontSize:13, fontWeight:600, color:"#ccc", margin:"0 0 4px" }}>{lead.business_name}</p>
                      <p style={{ fontSize:11, color:"#444", margin:0 }}>{lead.suburb} · {lead.business_type}</p>
                    </div>
                    <span style={{ fontSize:10, padding:"3px 8px", borderRadius:6, background:"#120a00", border:"1px solid #3a2000", color:"#fb923c" }}>⚡ Shadow Signal</span>
                  </div>
                  {lead.shadow_signal && <p style={{ fontSize:12, color:"#7a5020", margin:"10px 0 0", lineHeight:1.6, background:"#0f0800", padding:"8px 10px", borderRadius:8 }}>{lead.shadow_signal}</p>}
                  {lead.seek_job_url && <a href={lead.seek_job_url} target="_blank" style={{ fontSize:11, color:"#fb923c", display:"block", marginTop:8 }}>View Seek listing →</a>}
                </div>
              ))
            ) : (
              <div style={{ textAlign:"center", padding:"48px 20px" }}>
                <p style={{ fontSize:22, marginBottom:8 }}>👁️</p>
                <p style={{ fontSize:14, color:"#444" }}>No shadow signals yet.</p>
                <p style={{ fontSize:12, color:"#333", marginTop:6 }}>When you add a Seek job URL or shadow signal note to a lead, it appears here as a hot target.</p>
              </div>
            )}
          </div>
        )}

        {/* REAL-TIME ROI TAB */}
        {tab === "roi" && (
          <div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
              <div style={{ background:"#0a120a", border:"1px solid #1a2a1a", borderRadius:14, padding:"20px" }}>
                <p style={{ fontSize:11, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:"#2a5a2a", margin:"0 0 12px" }}>Revenue Side</p>
                {[
                  { l:"Closed revenue",     v:`$${revenue.toLocaleString()}` },
                  { l:"Pipeline value",     v:`$${pipeline.toLocaleString()}` },
                  { l:"Total addressable",  v:`$${(filtered.length * 1500).toLocaleString()}` },
                  { l:"Close rate",         v: filtered.length > 0 ? `${Math.round(closed.length/filtered.length*100)}%` : "0%" },
                ].map(r => (
                  <div key={r.l} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #141414" }}>
                    <span style={{ fontSize:12, color:"#555" }}>{r.l}</span>
                    <span style={{ fontSize:13, fontWeight:700, fontFamily:"monospace", color:"#34d399" }}>{r.v}</span>
                  </div>
                ))}
              </div>
              <div style={{ background:"#120808", border:"1px solid #2a1010", borderRadius:14, padding:"20px" }}>
                <p style={{ fontSize:11, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:"#5a2020", margin:"0 0 12px" }}>Cost Side</p>
                {[
                  { l:"Orchestrator runs",  v:totalRuns },
                  { l:"Credits used",       v:`${tokenSpend} cr` },
                  { l:"Waste identified",   v:`$${wasteFound.toLocaleString()}` },
                  { l:"ROI multiple",       v: revenue > 0 ? `${Math.round(revenue / Math.max(parseFloat(tokenSpend)*10, 1))}x` : "∞" },
                ].map(r => (
                  <div key={r.l} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #1a0a0a" }}>
                    <span style={{ fontSize:12, color:"#555" }}>{r.l}</span>
                    <span style={{ fontSize:13, fontWeight:700, fontFamily:"monospace", color:"#f87171" }}>{r.v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background:"#0a0a0a", border:"1px solid #1c1c1c", borderRadius:14, padding:"20px" }}>
              <p style={{ fontSize:11, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:"#444", margin:"0 0 16px" }}>Suburban Blitz Expansion Map</p>
              {[
                { phase:"Phase 1", sector:"Legal (Current)",       suburb:"Ringwood / Eastern Suburbs", status:"Active",  signal:92, note:"14 firms audited. Pipeline open." },
                { phase:"Phase 2", sector:"Medical / NDIS",        suburb:"Heidelberg / Preston",        status:"Queued", signal:78, note:"NDIS compliance paperwork = massive admin gap. Same audit model." },
                { phase:"Phase 3", sector:"Real Estate",           suburb:"Ringwood / Mitcham",          status:"Queued", signal:71, note:"Automate personalised property reports. Salesman voice fits perfectly." },
                { phase:"Phase 4", sector:"Accounting / Finance",  suburb:"Box Hill / Doncaster",        status:"Locked", signal:65, note:"Tax season compliance bottlenecks. Unlock after Phase 2 closes." },
              ].map(p => (
                <div key={p.phase} style={{ display:"flex", alignItems:"center", gap:14, padding:"12px 0", borderBottom:"1px solid #141414" }}>
                  <div style={{ width:64, flexShrink:0 }}>
                    <span style={{ fontSize:10, fontWeight:700, color:"#333", textTransform:"uppercase" }}>{p.phase}</span>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:13, fontWeight:600, color: p.status==="Active"?"#ccc":"#555", margin:"0 0 3px" }}>{p.sector}</p>
                    <p style={{ fontSize:11, color:"#333", margin:0 }}>{p.suburb} · {p.note}</p>
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <div style={{ fontSize:16, fontWeight:900, fontFamily:"monospace", color: p.signal>=80?"#34d399":p.signal>=70?"#fbbf24":"#444" }}>{p.signal}</div>
                    <div style={{ fontSize:10, color: p.status==="Active"?"#34d399":p.status==="Queued"?"#fbbf24":"#333", textTransform:"uppercase", letterSpacing:"0.08em" }}>{p.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lead Detail Modal */}
      {selected && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.85)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div style={{ background:"#0d0d0d", border:"1px solid #2a2a2a", borderRadius:18, width:"100%", maxWidth:560, maxHeight:"85vh", overflow:"auto" }}>
            <div style={{ padding:"18px 20px", borderBottom:"1px solid #1a1a1a", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <p style={{ fontSize:15, fontWeight:700, color:"#ccc", margin:0 }}>{selected.business_name}</p>
                <p style={{ fontSize:11, color:"#555", margin:"4px 0 0" }}>{selected.suburb} · {selected.business_type}</p>
              </div>
              <button onClick={() => setSelected(null)} style={{ background:"none", border:"none", color:"#555", fontSize:18, cursor:"pointer" }}>✕</button>
            </div>

            <div style={{ padding:"18px 20px" }}>
              {/* Status update */}
              <div style={{ marginBottom:16 }}>
                <p style={{ fontSize:11, fontWeight:700, color:"#444", textTransform:"uppercase", letterSpacing:"0.1em", margin:"0 0 8px" }}>Status</p>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  {STATUSES.map(st => (
                    <button key={st} onClick={() => setEditData(d => ({...d, status:st}))}
                      style={{ background: editData.status===st?"#1a1a1a":"transparent", border:`1px solid ${editData.status===st?STATUS_COLOR[st]:"#222"}`, color: editData.status===st?STATUS_COLOR[st]:"#444", borderRadius:8, padding:"5px 10px", fontSize:11, cursor:"pointer" }}>
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reply logging */}
              <div style={{ marginBottom:16 }}>
                <p style={{ fontSize:11, fontWeight:700, color:"#444", textTransform:"uppercase", letterSpacing:"0.1em", margin:"0 0 8px" }}>Reply Sentiment</p>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:10 }}>
                  {SENTIMENTS.map(s => (
                    <button key={s} onClick={() => setEditData(d => ({...d, reply_sentiment:s}))}
                      style={{ background: editData.reply_sentiment===s?"#111":"transparent", border:`1px solid ${editData.reply_sentiment===s?SENTIMENT_COLOR[s]:"#222"}`, color: editData.reply_sentiment===s?SENTIMENT_COLOR[s]:"#444", borderRadius:8, padding:"4px 10px", fontSize:10, cursor:"pointer" }}>
                      {s}
                    </button>
                  ))}
                </div>
                <textarea
                  value={editData.reply_text}
                  onChange={e => setEditData(d => ({...d, reply_text:e.target.value}))}
                  placeholder="Paste their reply here — feeds the feedback loop..."
                  style={{ width:"100%", background:"#080808", border:"1px solid #1a1a1a", color:"#aaa", borderRadius:8, padding:"10px 12px", fontSize:12, lineHeight:1.6, minHeight:80, resize:"vertical", boxSizing:"border-box" }}
                />
              </div>

              {/* Pivot suggestion */}
              {editData.reply_sentiment && PIVOT_TEMPLATES[editData.reply_sentiment] && (
                <div style={{ background:"#0f0a00", border:"1px solid #2a2000", borderRadius:10, padding:"12px 14px", marginBottom:16 }}>
                  <p style={{ fontSize:10, fontWeight:700, color:"#6a5020", textTransform:"uppercase", letterSpacing:"0.1em", margin:"0 0 6px" }}>Auto Pivot → {PIVOT_TEMPLATES[editData.reply_sentiment].label}</p>
                  <p style={{ fontSize:12, color:"#7a6030", margin:0, fontStyle:"italic", lineHeight:1.65 }}>"{PIVOT_TEMPLATES[editData.reply_sentiment].hook}"</p>
                </div>
              )}

              <div style={{ marginBottom:16 }}>
                <p style={{ fontSize:11, fontWeight:700, color:"#444", textTransform:"uppercase", letterSpacing:"0.1em", margin:"0 0 8px" }}>Notes</p>
                <textarea
                  value={editData.notes}
                  onChange={e => setEditData(d => ({...d, notes:e.target.value}))}
                  placeholder="Any notes..."
                  style={{ width:"100%", background:"#080808", border:"1px solid #1a1a1a", color:"#aaa", borderRadius:8, padding:"10px 12px", fontSize:12, lineHeight:1.6, minHeight:60, resize:"vertical", boxSizing:"border-box" }}
                />
              </div>

              {editData.status === "Closed" && (
                <div style={{ marginBottom:16 }}>
                  <p style={{ fontSize:11, fontWeight:700, color:"#444", textTransform:"uppercase", letterSpacing:"0.1em", margin:"0 0 8px" }}>Revenue ($)</p>
                  <input type="number" value={editData.revenue}
                    onChange={e => setEditData(d => ({...d, revenue:parseFloat(e.target.value)}))}
                    style={{ background:"#080808", border:"1px solid #1a1a1a", color:"#34d399", borderRadius:8, padding:"8px 12px", fontSize:14, fontWeight:700, width:120, fontFamily:"monospace" }}
                  />
                </div>
              )}

              <button onClick={saveEdit} disabled={saving}
                style={{ width:"100%", background:"#1a0f2e", border:"1px solid #5b21b6", color:"#a78bfa", borderRadius:10, padding:"12px", fontSize:13, fontWeight:700, cursor:"pointer" }}>
                {saving ? "Saving…" : "Save + Inject Feedback Loop"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
