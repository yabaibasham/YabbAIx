import { useState, useEffect, useCallback } from "react";
import { Lead, createCheckout } from "@/api/entities";
import { Copy, Check, Trash2, Send, MessageSquare, Download, CreditCard } from "lucide-react";
import logger from "@/utils/logger";

const LAW_AUDITS = {
  "blackburn law group": { hours: 15, cost: "$7,200", score: 95, type: "Corporate & M&A", gap: "Due diligence document review is 100% manual", fix: "M&A due diligence AI" },
  "collins street barristers": { hours: 13, cost: "$6,240", score: 93, type: "Commercial Arbitration", gap: "Manually extracting findings from arbitration awards", fix: "AI synthesis layer" },
  "eastfield law": { hours: 12, cost: "$5,760", score: 94, type: "Commercial Litigation", gap: "12+ hours per case doing discovery", fix: "AI discovery engine" },
  "fitzroy street legal": { hours: 11, cost: "$5,280", score: 90, type: "Criminal Defence", gap: "Manually reviewing police brief materials", fix: "Brief analysis AI" },
  "box hill community legal": { hours: 10, cost: "$4,800", score: 89, type: "Immigration", gap: "Manually searching VCAT/AAT decisions", fix: "AI precedent finder" },
  "maroondah lawyers": { hours: 8, cost: "$3,840", score: 91, type: "Conveyancing", gap: "Manually cross-checking title searches", fix: "AI overlay matcher" },
  "ringwood legal": { hours: 6, cost: "$2,880", score: 88, type: "Family Law", gap: "Manually reviewing parenting agreements", fix: "AI contract review" },
};

function getLawAudit(name) {
  const key = (name || "").toLowerCase().trim();
  for (const [k, v] of Object.entries(LAW_AUDITS)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return null;
}

function buildEmail(lead) {
  const biz = lead.business_name || "your firm";
  const suburb = lead.suburb || "Melbourne";
  return {
    subject: `Quick question about ${biz}`,
    body: `Hi,\n\nI'm Thomas — based in Melbourne. I've been looking at how local law firms show up when potential clients use AI search tools like ChatGPT and Perplexity.\n\nI ran a check on ${biz} and found something specific I thought you'd want to know about.\n\nI've put together a one-page summary — would it be alright if I sent it through?\n\nThomas Basham\nMelbourne, VIC`,
  };
}

const STRIKE_TARGETS = [
  { business_name: "Blackburn Law Group", suburb: "Blackburn", business_type: "lawyer", google_rating: 4.8, review_count: 142, has_schema: false, gap_score: 95, status: "Scouted", sector: "Legal" },
  { business_name: "Collins Street Barristers", suburb: "Melbourne CBD", business_type: "lawyer", google_rating: 4.9, review_count: 88, has_schema: false, gap_score: 93, status: "Scouted", sector: "Legal" },
  { business_name: "Eastfield Law", suburb: "Croydon", business_type: "lawyer", google_rating: 4.7, review_count: 94, has_schema: false, gap_score: 94, status: "Scouted", sector: "Legal" },
  { business_name: "Fitzroy Street Legal", suburb: "St Kilda", business_type: "lawyer", google_rating: 4.8, review_count: 76, has_schema: false, gap_score: 90, status: "Scouted", sector: "Legal" },
  { business_name: "Maroondah Lawyers", suburb: "Ringwood", business_type: "lawyer", google_rating: 4.6, review_count: 110, has_schema: false, gap_score: 91, status: "Scouted", sector: "Legal" },
  { business_name: "Ringwood Legal", suburb: "Ringwood", business_type: "lawyer", google_rating: 4.7, review_count: 98, has_schema: false, gap_score: 88, status: "Scouted", sector: "Legal" },
  { business_name: "Box Hill Community Legal", suburb: "Box Hill", business_type: "lawyer", google_rating: 4.7, review_count: 83, has_schema: false, gap_score: 89, status: "Scouted", sector: "Legal" },
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

  const showToast = (m, t = "ok") => { setToast({ m, t }); setTimeout(() => setToast(null), 3500); };
  const copyText = (text, key) => { navigator.clipboard?.writeText(text); setCopied(key); setTimeout(() => setCopied(null), 2500); };

  const load = useCallback(async () => {
    try { const data = await Lead.list(); setLeads(Array.isArray(data) ? data : []); }
    catch (e) { logger.warn("Lead load failed", e); setLeads([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const loadTargets = async () => {
    const existing = new Set(leads.map((l) => (l.business_name || "").toLowerCase()));
    let added = 0;
    for (const t of STRIKE_TARGETS) {
      if (existing.has(t.business_name.toLowerCase())) continue;
      try { await Lead.create(t); added++; } catch (e) { logger.warn("Lead create failed", e); }
    }
    showToast(`${added} Capital Colony targets loaded`);
    load();
  };

  const draftAll = async () => {
    const undrafted = leads.filter((l) => l.status === "Scouted");
    let done = 0;
    for (const lead of undrafted) {
      const { subject, body } = buildEmail(lead);
      try { await Lead.update(lead.id, { email_subject: subject, email_body: body, status: "Email Drafted" }); done++; }
      catch (e) { logger.warn("Email draft failed", e); }
    }
    showToast(`${done} emails drafted`);
    load();
  };

  const updateStatus = async (lead, status, extra = {}) => {
    try { await Lead.update(lead.id, { status, ...extra }); showToast(`${lead.business_name} → ${status}`); load(); }
    catch { showToast("Failed", "err"); }
  };

  const deleteLead = async (lead) => {
    try { await Lead.delete(lead.id); showToast("Removed"); setActive(null); load(); }
    catch { showToast("Failed", "err"); }
  };

  const scouted = leads.filter((l) => l.status === "Scouted").length;
  const drafted = leads.filter((l) => l.status === "Email Drafted").length;
  const revenue = leads.filter((l) => l.status === "Closed").reduce((s, l) => s + (l.revenue || 200), 0);

  const targets = leads.filter((l) => getLawAudit(l.business_name)).length > 0
    ? [...leads].filter((l) => getLawAudit(l.business_name)).sort((a, b) => (b.gap_score || 0) - (a.gap_score || 0))
    : STRIKE_TARGETS.map((t, i) => ({ ...t, id: `preview-${i}`, _preview: true }));

  return (
    <div data-testid="control-room-page" className="max-w-5xl mx-auto px-4 py-6 space-y-5">
      {toast && (
        <div className="fixed top-16 right-4 z-50 px-4 py-2.5 rounded-sm text-sm font-medium" style={{
          background: toast.t === "err" ? "#1a0505" : "#051a0a",
          border: `1px solid ${toast.t === "err" ? "rgba(239,68,68,0.3)" : "rgba(34,197,94,0.3)"}`,
          color: toast.t === "err" ? "#fca5a5" : "#6ee7b7",
        }}>
          {toast.m}
        </div>
      )}

      <div>
        <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "var(--yb-text-muted)" }}>Hybrid Strike Protocol</p>
        <h1 className="text-xl font-black" style={{ color: "var(--yb-text-primary)" }}>Control Room</h1>
        <p className="text-xs mt-1" style={{ color: "var(--yb-text-muted)" }}>Thomas from Melbourne — 14 law firms — first reply = $97 audit — upsell to $1,500/mo</p>
      </div>

      {/* Pipeline Stats */}
      <div className="grid grid-cols-6 gap-2">
        {[
          { l: "Total", v: leads.length },
          { l: "Drafted", v: drafted },
          { l: "Contacted", v: leads.filter((l) => l.status === "Contacted").length },
          { l: "Replied", v: leads.filter((l) => l.status === "Replied").length },
          { l: "Closed", v: leads.filter((l) => l.status === "Closed").length },
          { l: "Revenue", v: `$${revenue}` },
        ].map((s) => (
          <div key={s.l} className="rounded-sm p-3 text-center" style={{ background: "var(--yb-surface-1)", border: "1px solid var(--yb-border)" }}>
            <div className="text-lg font-black font-mono" style={{ color: "var(--yb-text-primary)" }}>{s.v}</div>
            <div className="text-[9px] uppercase tracking-widest mt-1" style={{ color: "var(--yb-text-muted)" }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-sm w-fit" style={{ background: "rgba(255,255,255,0.03)" }}>
        {[["strike", "Strike Targets"], ["closer", "Email Closer"], ["scout", "Add Leads"]].map(([id, l]) => (
          <button key={id} onClick={() => setTab(id)} data-testid={`cr-tab-${id}`}
            className="text-xs px-4 py-2 rounded-sm font-medium transition-all"
            style={{ background: tab === id ? "rgba(255,255,255,0.1)" : "transparent", color: tab === id ? "#fff" : "var(--yb-text-muted)" }}>
            {l}
          </button>
        ))}
      </div>

      {/* Strike Tab */}
      {tab === "strike" && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold" style={{ color: "var(--yb-text-secondary)" }}>{targets.length} Capital Colony Targets</p>
            <div className="flex gap-2">
              {leads.filter((l) => getLawAudit(l.business_name)).length === 0 && (
                <button onClick={loadTargets} data-testid="load-targets-btn"
                  className="text-[11px] font-medium px-3 py-1.5 rounded-sm transition-all"
                  style={{ background: "rgba(255,184,0,0.1)", color: "var(--yb-gold)", border: "1px solid rgba(255,184,0,0.2)" }}>
                  Load 7 targets into CRM
                </button>
              )}
              {scouted > 0 && (
                <button onClick={draftAll} data-testid="draft-all-btn"
                  className="text-[11px] font-medium px-3 py-1.5 rounded-sm transition-all"
                  style={{ background: "rgba(96,165,250,0.1)", color: "#60a5fa", border: "1px solid rgba(96,165,250,0.2)" }}>
                  Draft all emails
                </button>
              )}
            </div>
          </div>

          {targets.map((lead, i) => {
            const audit = getLawAudit(lead.business_name);
            const open = active === (lead.id || i);
            const { subject, body } = buildEmail(lead);
            return (
              <div key={lead.id || i} className="rounded-sm overflow-hidden" style={{ background: "var(--yb-surface-1)", border: open ? "1px solid rgba(255,255,255,0.15)" : "1px solid var(--yb-border)" }}>
                <div onClick={() => setActive(open ? null : (lead.id || i))} className="px-4 py-3 flex items-center gap-3 cursor-pointer">
                  <span className="text-[10px] font-mono w-5 shrink-0" style={{ color: "var(--yb-text-muted)" }}>{String(i + 1).padStart(2, "0")}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold" style={{ color: "var(--yb-text-primary)" }}>{lead.business_name}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: "var(--yb-text-muted)" }}>{lead.suburb} {audit ? `· ${audit.type} · ${audit.hours}h/wk · ${audit.cost}/mo` : ""}</p>
                  </div>
                  {lead._preview && <span className="text-[10px] px-2 py-0.5 rounded-sm" style={{ color: "var(--yb-gold)", border: "1px solid rgba(255,184,0,0.2)" }}>Preview</span>}
                  {!lead._preview && lead.status !== "Scouted" && <span className="text-[10px] px-2 py-0.5 rounded-sm" style={{ color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)" }}>{lead.status}</span>}
                  <div className="text-xl font-black font-mono shrink-0" style={{ color: (lead.gap_score || 85) >= 90 ? "#ef4444" : (lead.gap_score || 85) >= 80 ? "#f97316" : "#fbbf24" }}>
                    {lead.gap_score || 85}
                  </div>
                </div>
                {open && (
                  <div className="px-4 pb-4 pt-3" style={{ borderTop: "1px solid var(--yb-border)" }}>
                    {audit && (
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="rounded-sm p-3" style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.1)" }}>
                          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#ef4444" }}>The Gap</p>
                          <p className="text-xs" style={{ color: "var(--yb-text-secondary)" }}>{audit.gap}</p>
                        </div>
                        <div className="rounded-sm p-3" style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.1)" }}>
                          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#22c55e" }}>The Fix</p>
                          <p className="text-xs" style={{ color: "var(--yb-text-secondary)" }}>{audit.fix}</p>
                        </div>
                      </div>
                    )}
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--yb-gold)" }}>Email</p>
                        <button onClick={() => copyText(`Subject: ${subject}\n\n${body}`, `email-${i}`)} className="text-[10px] px-2 py-1 rounded-sm" style={{ color: "var(--yb-text-muted)", background: "rgba(255,255,255,0.04)" }}>
                          {copied === `email-${i}` ? <Check size={10} /> : <Copy size={10} />}
                        </button>
                      </div>
                      <div className="rounded-sm p-3" style={{ background: "#0a0a0a", border: "1px solid var(--yb-border)" }}>
                        <p className="text-[11px] font-mono mb-2" style={{ color: "var(--yb-gold)" }}>Subject: {subject}</p>
                        <pre className="text-xs whitespace-pre-wrap font-sans leading-relaxed" style={{ color: "var(--yb-text-secondary)" }}>{body}</pre>
                      </div>
                    </div>
                    {!lead._preview && (
                      <div className="flex gap-2 flex-wrap">
                        {lead.status === "Scouted" && <button onClick={() => { const e = buildEmail(lead); Lead.update(lead.id, { email_subject: e.subject, email_body: e.body, status: "Email Drafted" }).then(load); }} className="text-[11px] px-3 py-1.5 rounded-sm" style={{ background: "rgba(96,165,250,0.08)", color: "#60a5fa", border: "1px solid rgba(96,165,250,0.2)" }}>Draft email</button>}
                        {lead.status === "Email Drafted" && <button onClick={() => updateStatus(lead, "Contacted")} className="text-[11px] px-3 py-1.5 rounded-sm" style={{ background: "rgba(251,191,36,0.08)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.2)" }}>Mark sent</button>}
                        <button onClick={() => updateStatus(lead, "Replied")} className="text-[11px] px-3 py-1.5 rounded-sm" style={{ background: "rgba(167,139,250,0.08)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.2)" }}>Got reply</button>
                        {["Contacted", "Replied"].includes(lead.status) && (
                          <>
                            <button onClick={() => updateStatus(lead, "Closed", { revenue: 1500 })} className="text-[11px] px-3 py-1.5 rounded-sm" style={{ background: "rgba(34,197,94,0.08)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)" }}>Closed $1,500</button>
                            <button data-testid={`invoice-audit-${lead.id}`} onClick={async () => { try { const r = await createCheckout("audit", lead.id); if (r.url) window.open(r.url, "_blank"); } catch (e) { showToast("Payment error", "err"); } }}
                              className="flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-sm" style={{ background: "rgba(255,184,0,0.08)", color: "var(--yb-gold)", border: "1px solid rgba(255,184,0,0.2)" }}>
                              <CreditCard size={10} /> $97 Audit
                            </button>
                            <button data-testid={`invoice-retainer-${lead.id}`} onClick={async () => { try { const r = await createCheckout("retainer", lead.id); if (r.url) window.open(r.url, "_blank"); } catch (e) { showToast("Payment error", "err"); } }}
                              className="flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-sm" style={{ background: "rgba(255,184,0,0.12)", color: "var(--yb-gold)", border: "1px solid rgba(255,184,0,0.3)" }}>
                              <CreditCard size={10} /> $1,500 Retainer
                            </button>
                          </>
                        )}
                        <button onClick={() => deleteLead(lead)} className="text-[11px] px-3 py-1.5 rounded-sm ml-auto" style={{ color: "var(--yb-text-muted)" }}><Trash2 size={12} /></button>
                      </div>
                    )}
                    {lead._preview && <button onClick={loadTargets} className="text-[11px] px-3 py-1.5 rounded-sm" style={{ background: "rgba(255,184,0,0.1)", color: "var(--yb-gold)", border: "1px solid rgba(255,184,0,0.2)" }}>Load into CRM →</button>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Closer Tab */}
      {tab === "closer" && (
        <div className="space-y-1.5">
          {leads.filter((l) => ["Email Drafted", "Contacted", "Replied"].includes(l.status)).map((lead) => (
            <div key={lead.id} className="rounded-sm p-4" style={{ background: "var(--yb-surface-1)", border: "1px solid var(--yb-border)" }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold" style={{ color: "var(--yb-text-primary)" }}>{lead.business_name}</p>
                <span className="text-[10px] px-2 py-0.5 rounded-sm" style={{ color: "#60a5fa", border: "1px solid rgba(96,165,250,0.2)" }}>{lead.status}</span>
              </div>
              {lead.email_subject && <p className="text-xs font-mono mb-1" style={{ color: "var(--yb-gold)" }}>Subject: {lead.email_subject}</p>}
              {lead.email_body && <pre className="text-xs whitespace-pre-wrap font-sans leading-relaxed mb-3" style={{ color: "var(--yb-text-secondary)" }}>{lead.email_body}</pre>}
              <div className="flex gap-2">
                {lead.status === "Email Drafted" && <button onClick={() => updateStatus(lead, "Contacted")} className="text-[11px] px-3 py-1.5 rounded-sm" style={{ background: "rgba(251,191,36,0.08)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.2)" }}>Mark sent</button>}
                <button onClick={() => updateStatus(lead, "Replied")} className="text-[11px] px-3 py-1.5 rounded-sm" style={{ background: "rgba(167,139,250,0.08)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.2)" }}>Got reply</button>
              </div>
            </div>
          ))}
          {leads.filter((l) => ["Email Drafted", "Contacted", "Replied"].includes(l.status)).length === 0 && (
            <p className="text-center py-16 text-sm" style={{ color: "var(--yb-text-muted)" }}>No emails drafted yet.</p>
          )}
        </div>
      )}

      {/* Scout Tab */}
      {tab === "scout" && (
        <div className="rounded-sm p-5" style={{ background: "var(--yb-surface-1)", border: "1px solid var(--yb-border)" }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "var(--yb-text-muted)" }}>Add new leads</p>
          <textarea
            data-testid="scout-input"
            value={pasteInput}
            onChange={(e) => setPasteInput(e.target.value)}
            placeholder="Business Name | Rating | Reviews"
            rows={5}
            className="w-full rounded-sm px-4 py-3 text-sm font-mono resize-none focus:outline-none mb-3"
            style={{ background: "#0a0a0a", border: "1px solid var(--yb-border)", color: "var(--yb-text-primary)" }}
          />
          <div className="flex gap-3 items-end">
            <div>
              <label className="text-[10px] uppercase tracking-widest block mb-1" style={{ color: "var(--yb-text-muted)" }}>Suburb</label>
              <input value={suburb} onChange={(e) => setSuburb(e.target.value)} className="rounded-sm px-3 py-2 text-sm" style={{ background: "#0a0a0a", border: "1px solid var(--yb-border)", color: "var(--yb-text-primary)" }} />
            </div>
            <button
              data-testid="scout-btn"
              onClick={async () => {
                const lines = pasteInput.split("\n").map((l) => l.trim()).filter((l) => l.length > 2);
                const existing = new Set(leads.map((l) => (l.business_name || "").toLowerCase()));
                let added = 0;
                for (const line of lines) {
                  const parts = line.split(/[|,\t]/).map((p) => p.trim());
                  const name = parts[0];
                  if (!name || existing.has(name.toLowerCase())) continue;
                  const rating = parseFloat(parts[1]) || 4.5;
                  const reviews = parseInt(parts[2]) || 50;
                  await Lead.create({ business_name: name, suburb, business_type: "local_business", google_rating: rating, review_count: reviews, has_schema: false, gap_score: 75, status: "Scouted", sector: "Legal" });
                  added++;
                }
                showToast(`${added} leads added`);
                setPasteInput("");
                load();
              }}
              className="text-sm font-bold px-6 py-2 rounded-sm"
              style={{ background: "var(--yb-gold)", color: "#000" }}
            >
              Scout Leads
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
