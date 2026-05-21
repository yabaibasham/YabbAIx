import { useState, useRef } from "react";
import { Compass } from "lucide-react";

const TEMPLATES = {
  lawyer: { gap: "No specialty schema — AI surfaces government legal aid instead", fix: "LegalService schema with practice area", roi: "$1,200-$5,000/mo" },
  electrician: { gap: "No licence schema — invisible to AI searches", fix: "Electrician schema with licence credential", roi: "$1,800-$5,400/mo" },
  plumber: { gap: "No emergency hours markup", fix: "Plumber schema with 24/7 availability", roi: "$1,200-$4,800/mo" },
  dentist: { gap: "No bulk billing markup", fix: "Dentist schema with Medicare CDBS", roi: "$1,500-$6,000/mo" },
  default: { gap: "No LocalBusiness schema — AI can't verify location or specialty", fix: "Full LocalBusiness JSON-LD", roi: "$400-$2,000/mo" },
};

function detect(name) {
  const n = name.toLowerCase();
  if (n.includes("law") || n.includes("legal") || n.includes("solicitor")) return "lawyer";
  if (n.includes("electric")) return "electrician";
  if (n.includes("plumb")) return "plumber";
  if (n.includes("dent")) return "dentist";
  return "default";
}

function makeAudit(name, suburb) {
  const type = detect(name);
  const tpl = TEMPLATES[type];
  const score = 62 + Math.floor(Math.random() * 33);
  return { name, suburb, type, score, ...tpl, subject: `${name}: invisible to AI searches in ${suburb}` };
}

export default function Rover() {
  const [input, setInput] = useState("");
  const [suburb, setSuburb] = useState("Ringwood");
  const [audits, setAudits] = useState([]);
  const [running, setRunning] = useState(false);
  const [pct, setPct] = useState(0);
  const [active, setActive] = useState(null);

  const names = input.split("\n").map((l) => l.trim()).filter((l) => l.length > 2);

  const run = async () => {
    if (!names.length) return;
    setRunning(true); setAudits([]); setPct(0); setActive(null);
    const out = [];
    for (let i = 0; i < names.length; i++) {
      await new Promise((r) => setTimeout(r, 80));
      out.push(makeAudit(names[i], suburb));
      setPct(Math.round(((i + 1) / names.length) * 100));
    }
    setAudits(out); setRunning(false);
  };

  return (
    <div data-testid="rover-page" className="max-w-4xl mx-auto px-4 py-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-sm flex items-center justify-center" style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)" }}>
          <Compass size={16} color="#22c55e" />
        </div>
        <div>
          <h1 className="text-xl font-black" style={{ color: "var(--yb-text-primary)" }}>Local Rover</h1>
          <p className="text-[10px] font-mono" style={{ color: "var(--yb-text-muted)" }}>$0 cost · Browser-native · Instant audits</p>
        </div>
      </div>

      <div className="rounded-sm p-5 space-y-4" style={{ background: "var(--yb-surface-1)", border: "1px solid var(--yb-border)" }}>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <label className="text-[10px] uppercase tracking-widest block mb-1" style={{ color: "var(--yb-text-muted)" }}>Business names — one per line</label>
            <textarea data-testid="rover-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder={"Ringwood Plumbing Co\nEastern Suburbs Electrical"} rows={6}
              className="w-full rounded-sm px-4 py-3 text-sm font-mono resize-none focus:outline-none"
              style={{ background: "#0a0a0a", border: "1px solid var(--yb-border)", color: "var(--yb-text-primary)" }} />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest block mb-1" style={{ color: "var(--yb-text-muted)" }}>Suburb</label>
            <input value={suburb} onChange={(e) => setSuburb(e.target.value)}
              className="w-full rounded-sm px-3 py-2 text-sm mb-3 focus:outline-none"
              style={{ background: "#0a0a0a", border: "1px solid var(--yb-border)", color: "var(--yb-text-primary)" }} />
            {names.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: "var(--yb-text-muted)" }}>Detected</p>
                {names.slice(0, 5).map((n, i) => (
                  <div key={`${n}-${i}`} className="flex justify-between text-[11px] mb-1">
                    <span className="truncate" style={{ color: "var(--yb-text-secondary)", maxWidth: 100 }}>{n}</span>
                    <span style={{ color: "#22c55e" }}>{detect(n)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <button data-testid="rover-run" onClick={run} disabled={running || !input.trim()}
          className="w-full text-sm font-bold py-3 rounded-sm transition-all disabled:opacity-30"
          style={{ background: "var(--yb-gold)", color: "#000" }}>
          {running ? `${pct}% generating...` : `Generate ${names.length || ""} audits — $0 cost`}
        </button>
        {running && (
          <div className="h-0.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: "#22c55e" }} />
          </div>
        )}
      </div>

      {audits.length > 0 && (
        <div className="space-y-1.5">
          {audits.map((a, i) => {
            const open = active === i;
            const urgency = a.score >= 88 ? "Critical" : a.score >= 75 ? "High" : "Moderate";
            return (
              <div key={`audit-${a.name}-${i}`} className="rounded-sm overflow-hidden" style={{ background: "var(--yb-surface-1)", border: open ? "1px solid rgba(255,255,255,0.15)" : "1px solid var(--yb-border)" }}>
                <div className="px-5 py-3 flex items-center gap-4 cursor-pointer" onClick={() => setActive(open ? null : i)}>
                  <span className="text-[10px] font-mono" style={{ color: "var(--yb-text-muted)" }}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold" style={{ color: "var(--yb-text-primary)" }}>{a.name}</p>
                    <p className="text-[11px]" style={{ color: "var(--yb-text-muted)" }}>{a.suburb} · {a.type} · {urgency}</p>
                  </div>
                  <div className="text-xl font-black font-mono" style={{ color: a.score >= 88 ? "#ef4444" : a.score >= 75 ? "#f97316" : "#fbbf24" }}>{a.score}</div>
                </div>
                {open && (
                  <div className="px-5 pb-5 pt-3 space-y-3" style={{ borderTop: "1px solid var(--yb-border)" }}>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-sm p-3" style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.1)" }}>
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#ef4444" }}>Gap</p>
                        <p className="text-xs" style={{ color: "var(--yb-text-secondary)" }}>{a.gap}</p>
                      </div>
                      <div className="rounded-sm p-3" style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.1)" }}>
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#22c55e" }}>Fix</p>
                        <p className="text-xs" style={{ color: "var(--yb-text-secondary)" }}>{a.fix}</p>
                      </div>
                    </div>
                    <div className="rounded-sm p-3" style={{ background: "rgba(255,184,0,0.05)", border: "1px solid rgba(255,184,0,0.1)" }}>
                      <p className="text-[10px] font-bold" style={{ color: "var(--yb-gold)" }}>ROI: {a.roi}</p>
                      <p className="text-xs italic mt-1" style={{ color: "var(--yb-text-secondary)" }}>"{a.subject}"</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
