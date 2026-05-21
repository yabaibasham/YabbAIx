import { useState, useEffect, useCallback, useMemo } from "react";
import { Lead, Signal } from "@/api/entities";
import logger from "@/utils/logger";

const STATUSES = ["Discovered", "Email Drafted", "Sent", "Opened", "Replied", "Closed", "Dead"];
const SENTIMENTS = ["Positive", "Negative", "Objection-HasTool", "Objection-Budget", "Objection-Timing", "Neutral"];
const STATUS_COLOR = { Discovered: "#52525b", "Email Drafted": "#60a5fa", Sent: "#a78bfa", Opened: "#fbbf24", Replied: "#f97316", Closed: "#22c55e", Dead: "#333" };
const SENTIMENT_COLOR = { Positive: "#22c55e", Negative: "#ef4444", "Objection-HasTool": "#f97316", "Objection-Budget": "#fbbf24", "Objection-Timing": "#a78bfa", Neutral: "#52525b" };
const PIVOTS = {
  "Objection-HasTool": { label: "AI Integration Audit", hook: "I saw you already have an AI tool — 80% of firms leave the biggest gains on the table because integration wasn't mapped to workflow. $97 audit tells you exactly what's missing." },
  "Objection-Budget": { label: "ROI-First Pitch", hook: "Completely understand. Free 5-minute diagnostic — just a number. If it isn't bigger than our fee, save your money." },
  "Objection-Timing": { label: "Timing Follow-Up", hook: "No rush — check back in 30 days. Firms that move first own the AI-advantage for 18 months." },
};

export default function StrikeDeck() {
  const [leads, setLeads] = useState([]);
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("pipeline");

  const load = useCallback(async () => {
    try {
      const [l, s] = await Promise.all([Lead.list(), Signal.list()]);
      setLeads(Array.isArray(l) ? l : []);
      setSignals(Array.isArray(s) ? s : []);
    } catch (e) { logger.warn("StrikeDeck load failed", e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = leads;
  const pipelineStats = useMemo(() => {
    const closed = filtered.filter((l) => l.status === "Closed");
    const revenue = closed.reduce((s, l) => s + (l.revenue || 1500), 0);
    const sent = filtered.filter((l) => ["Sent", "Opened", "Replied", "Closed"].includes(l.status));
    const replied = filtered.filter((l) => l.status === "Replied");
    const replyRate = sent.length > 0 ? Math.round((replied.length + closed.length) / sent.length * 100) : 0;
    return { closed, revenue, sent, replied, replyRate };
  }, [filtered]);
  const { closed, revenue, sent, replied, replyRate } = pipelineStats;

  const groupedLeads = useMemo(() => {
    const groups = {};
    for (const lead of filtered) {
      const st = lead.status || "Discovered";
      if (!groups[st]) groups[st] = [];
      groups[st].push(lead);
    }
    return groups;
  }, [filtered]);

  const openLead = (lead) => {
    setSelected(lead);
    setEditData({ status: lead.status, reply_text: lead.reply_text || "", reply_sentiment: lead.reply_sentiment || "", notes: lead.notes || "", revenue: lead.revenue || 1500 });
  };

  const saveEdit = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await Lead.update(selected.id, editData);
      if (editData.reply_sentiment?.startsWith("Objection")) {
        await Signal.create({ signal_type: "UserInput", source: `Lead feedback: ${selected.business_name}`, raw_data: `Objection: ${editData.reply_sentiment}. Reply: ${editData.reply_text}`, score: 40, processed: false });
      }
      if (editData.reply_sentiment === "Positive" || editData.status === "Closed") {
        await Signal.create({ signal_type: "RevenueEvent", source: `Win: ${selected.business_name}`, raw_data: `Status: ${editData.status}`, score: 95, processed: false });
      }
      load();
      setSelected(null);
    } catch (e) { logger.warn("StrikeDeck save failed", e); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center py-32"><div className="w-5 h-5 border-2 border-white/10 border-t-amber-400 rounded-full animate-spin" /></div>;

  return (
    <div data-testid="strike-deck-page" className="max-w-5xl mx-auto px-4 py-6 space-y-5">
      <div>
        <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "var(--yb-text-muted)" }}>Strike Deck</p>
        <h1 className="text-xl font-black" style={{ color: "var(--yb-text-primary)" }}>Sales Pipeline</h1>
      </div>

      <div className="grid grid-cols-6 gap-2">
        {[
          { v: filtered.length, l: "Total", c: "#a78bfa" },
          { v: sent.length, l: "Sent", c: "#60a5fa" },
          { v: replied.length, l: "Replied", c: "#f97316" },
          { v: `${replyRate}%`, l: "Reply Rate", c: replyRate > 20 ? "#22c55e" : "#fbbf24" },
          { v: closed.length, l: "Closed", c: "#22c55e" },
          { v: `$${revenue.toLocaleString()}`, l: "Earned", c: "var(--yb-gold)" },
        ].map((s) => (
          <div key={s.l} className="rounded-sm p-3 text-center" style={{ background: "var(--yb-surface-1)", border: "1px solid var(--yb-border)" }}>
            <div className="text-lg font-black font-mono" style={{ color: s.c }}>{s.v}</div>
            <div className="text-[9px] uppercase tracking-widest mt-1" style={{ color: "var(--yb-text-muted)" }}>{s.l}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-1 p-1 rounded-sm w-fit" style={{ background: "rgba(255,255,255,0.03)" }}>
        {[["pipeline", "Pipeline"], ["feedback", "Feedback Loop"], ["roi", "ROI"]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} data-testid={`sd-tab-${k}`}
            className="text-xs px-4 py-2 rounded-sm font-medium transition-all"
            style={{ background: tab === k ? "rgba(255,255,255,0.1)" : "transparent", color: tab === k ? "#fff" : "var(--yb-text-muted)" }}>
            {l}
          </button>
        ))}
      </div>

      {tab === "pipeline" && (
        <div className="space-y-4">
          {STATUSES.filter((st) => st !== "Dead").map((status) => {
            const group = groupedLeads[status] || [];
            if (group.length === 0) return null;
            return (
              <div key={status}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: STATUS_COLOR[status] }} />
                  <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--yb-text-muted)" }}>{status} ({group.length})</span>
                </div>
                {group.map((lead) => (
                  <div key={lead.id} onClick={() => openLead(lead)} data-testid={`sd-lead-${lead.id}`}
                    className="rounded-sm p-3 mb-1 flex items-center gap-3 cursor-pointer transition-all hover:border-white/20"
                    style={{ background: "var(--yb-surface-1)", border: "1px solid var(--yb-border)" }}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold" style={{ color: "var(--yb-text-primary)" }}>{lead.business_name || "Unnamed"}</p>
                      <p className="text-[11px]" style={{ color: "var(--yb-text-muted)" }}>{lead.suburb} · gap {lead.gap_score || "—"}</p>
                    </div>
                    {lead.reply_sentiment && (
                      <span className="text-[10px] px-2 py-0.5 rounded-sm" style={{ color: SENTIMENT_COLOR[lead.reply_sentiment], border: `1px solid ${SENTIMENT_COLOR[lead.reply_sentiment]}30` }}>
                        {lead.reply_sentiment}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {tab === "feedback" && (
        <div className="space-y-3">
          {Object.entries(PIVOTS).map(([key, tpl]) => (
            <div key={key} className="rounded-sm p-4" style={{ background: "var(--yb-surface-1)", border: "1px solid var(--yb-border)" }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] px-2 py-0.5 rounded-sm" style={{ color: SENTIMENT_COLOR[key], background: `${SENTIMENT_COLOR[key]}15` }}>{key}</span>
                <span className="text-sm font-bold" style={{ color: "var(--yb-text-primary)" }}>{tpl.label}</span>
              </div>
              <p className="text-xs italic leading-relaxed" style={{ color: "var(--yb-text-secondary)" }}>"{tpl.hook}"</p>
            </div>
          ))}
        </div>
      )}

      {tab === "roi" && (
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-sm p-5" style={{ background: "var(--yb-surface-1)", border: "1px solid var(--yb-border)" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "#22c55e" }}>Revenue</p>
            {[
              { l: "Closed revenue", v: `$${revenue.toLocaleString()}` },
              { l: "Pipeline value", v: `$${(filtered.filter((l) => ["Email Drafted", "Sent", "Opened", "Replied"].includes(l.status)).length * 1500).toLocaleString()}` },
              { l: "Close rate", v: filtered.length > 0 ? `${Math.round(closed.length / filtered.length * 100)}%` : "0%" },
            ].map((r) => (
              <div key={r.l} className="flex justify-between py-2" style={{ borderBottom: "1px solid var(--yb-border)" }}>
                <span className="text-xs" style={{ color: "var(--yb-text-muted)" }}>{r.l}</span>
                <span className="text-xs font-bold font-mono" style={{ color: "#22c55e" }}>{r.v}</span>
              </div>
            ))}
          </div>
          <div className="rounded-sm p-5" style={{ background: "var(--yb-surface-1)", border: "1px solid var(--yb-border)" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "var(--yb-gold)" }}>Expansion Map</p>
            {[
              { phase: "Phase 1", sector: "Legal", status: "Active", signal: 92 },
              { phase: "Phase 2", sector: "Medical/NDIS", status: "Queued", signal: 78 },
              { phase: "Phase 3", sector: "Real Estate", status: "Queued", signal: 71 },
            ].map((p) => (
              <div key={p.phase} className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid var(--yb-border)" }}>
                <div>
                  <span className="text-[10px] font-mono" style={{ color: "var(--yb-text-muted)" }}>{p.phase}</span>
                  <p className="text-xs font-medium" style={{ color: p.status === "Active" ? "var(--yb-text-primary)" : "var(--yb-text-muted)" }}>{p.sector}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black font-mono" style={{ color: p.signal >= 80 ? "#22c55e" : "#fbbf24" }}>{p.signal}</span>
                  <p className="text-[10px]" style={{ color: p.status === "Active" ? "#22c55e" : "var(--yb-text-muted)" }}>{p.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lead Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5" style={{ background: "rgba(0,0,0,0.85)" }}>
          <div className="w-full max-w-lg max-h-[85vh] overflow-auto rounded-sm" style={{ background: "var(--yb-surface-1)", border: "1px solid rgba(255,255,255,0.15)" }}>
            <div className="p-5 flex justify-between items-center" style={{ borderBottom: "1px solid var(--yb-border)" }}>
              <div>
                <p className="text-sm font-bold" style={{ color: "var(--yb-text-primary)" }}>{selected.business_name}</p>
                <p className="text-[11px]" style={{ color: "var(--yb-text-muted)" }}>{selected.suburb}</p>
              </div>
              <button data-testid="close-modal" onClick={() => setSelected(null)} className="text-lg" style={{ color: "var(--yb-text-muted)" }}>x</button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "var(--yb-text-muted)" }}>Status</p>
                <div className="flex gap-1.5 flex-wrap">
                  {STATUSES.map((st) => (
                    <button key={st} onClick={() => setEditData((d) => ({ ...d, status: st }))}
                      className="text-[10px] px-2.5 py-1 rounded-sm transition-all"
                      style={{ background: editData.status === st ? "var(--yb-surface-2)" : "transparent", border: `1px solid ${editData.status === st ? STATUS_COLOR[st] : "var(--yb-border)"}`, color: editData.status === st ? STATUS_COLOR[st] : "var(--yb-text-muted)" }}>
                      {st}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "var(--yb-text-muted)" }}>Sentiment</p>
                <div className="flex gap-1.5 flex-wrap mb-2">
                  {SENTIMENTS.map((s) => (
                    <button key={s} onClick={() => setEditData((d) => ({ ...d, reply_sentiment: s }))}
                      className="text-[10px] px-2 py-1 rounded-sm"
                      style={{ border: `1px solid ${editData.reply_sentiment === s ? SENTIMENT_COLOR[s] : "var(--yb-border)"}`, color: editData.reply_sentiment === s ? SENTIMENT_COLOR[s] : "var(--yb-text-muted)" }}>
                      {s}
                    </button>
                  ))}
                </div>
                <textarea value={editData.reply_text} onChange={(e) => setEditData((d) => ({ ...d, reply_text: e.target.value }))} placeholder="Paste reply..." rows={3}
                  className="w-full rounded-sm px-3 py-2 text-xs resize-none focus:outline-none" style={{ background: "#0a0a0a", border: "1px solid var(--yb-border)", color: "var(--yb-text-primary)" }} />
              </div>
              {editData.reply_sentiment && PIVOTS[editData.reply_sentiment] && (
                <div className="rounded-sm p-3" style={{ background: "rgba(255,184,0,0.05)", border: "1px solid rgba(255,184,0,0.1)" }}>
                  <p className="text-[10px] font-bold" style={{ color: "var(--yb-gold)" }}>Pivot: {PIVOTS[editData.reply_sentiment].label}</p>
                  <p className="text-xs italic mt-1" style={{ color: "var(--yb-text-secondary)" }}>"{PIVOTS[editData.reply_sentiment].hook}"</p>
                </div>
              )}
              <button data-testid="save-lead" onClick={saveEdit} disabled={saving}
                className="w-full text-sm font-bold py-3 rounded-sm transition-all"
                style={{ background: "var(--yb-gold)", color: "#000" }}>
                {saving ? "Saving..." : "Save + Inject Feedback"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
