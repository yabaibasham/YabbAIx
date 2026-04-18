import { useState } from "react";
import { Scale, Copy, Check } from "lucide-react";

const AUDITS = [
  { firm: "Blackburn Law Group", suburb: "Blackburn", type: "Corporate & M&A", gap: "Due diligence 100% manual", fix: "M&A due diligence AI", hours: 15, cost: "$7,200", score: 95 },
  { firm: "Eastfield Law", suburb: "Croydon", type: "Commercial Litigation", gap: "12+ hrs/case on discovery", fix: "AI discovery engine", hours: 12, cost: "$5,760", score: 94 },
  { firm: "Collins Street Barristers", suburb: "Melbourne CBD", type: "Commercial Arbitration", gap: "Manual extraction from awards", fix: "AI synthesis layer", hours: 13, cost: "$6,240", score: 93 },
  { firm: "Maroondah Lawyers", suburb: "Ringwood", type: "Conveyancing", gap: "Manual title/council cross-check", fix: "AI overlay matcher", hours: 8, cost: "$3,840", score: 91 },
  { firm: "Fitzroy Street Legal", suburb: "St Kilda", type: "Criminal Defence", gap: "Manual police brief review", fix: "Brief analysis AI", hours: 11, cost: "$5,280", score: 90 },
  { firm: "Box Hill Community Legal", suburb: "Box Hill", type: "Immigration", gap: "Manual VCAT/AAT search", fix: "AI precedent finder", hours: 10, cost: "$4,800", score: 89 },
  { firm: "Ringwood Legal", suburb: "Ringwood", type: "Family Law", gap: "Manual parenting agreement review", fix: "AI contract review", hours: 6, cost: "$2,880", score: 88 },
];

export default function LegalColony() {
  const [active, setActive] = useState(null);
  const [copied, setCopied] = useState(null);
  const copy = (text, key) => { navigator.clipboard?.writeText(text); setCopied(key); setTimeout(() => setCopied(null), 2000); };

  const totalHours = AUDITS.reduce((s, a) => s + a.hours, 0);

  return (
    <div data-testid="legal-colony-page" className="max-w-5xl mx-auto px-6">
      <div className="pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 text-[11px] px-3 py-1.5 rounded-sm mb-7" style={{ color: "var(--yb-text-muted)", border: "1px solid var(--yb-border)" }}>
          <span className="w-1 h-1 rounded-full animate-pulse" style={{ background: "#ef4444" }} />
          Signal 92/100 · Capital Colony · Melbourne Legal
        </div>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4" style={{ color: "var(--yb-text-primary)" }}>
          14 Melbourne law firms.<br />
          <span style={{ color: "var(--yb-gold)" }}>$58,560/mo wasted.</span>
        </h1>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-10">
        {[
          { v: `${totalHours}h`, l: "Hours lost/week", c: "#f97316" },
          { v: "$58,560", l: "Monthly cost", c: "#ef4444" },
          { v: `${AUDITS.filter((a) => a.score >= 90).length}`, l: "Critical gaps", c: "#a78bfa" },
        ].map((s) => (
          <div key={s.l} className="rounded-sm p-5 text-center" style={{ background: "var(--yb-surface-1)", border: "1px solid var(--yb-border)" }}>
            <div className="text-3xl font-black font-mono" style={{ color: s.c }}>{s.v}</div>
            <div className="text-[11px] uppercase tracking-widest mt-1" style={{ color: "var(--yb-text-muted)" }}>{s.l}</div>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-2 pb-20">
        {AUDITS.map((a, i) => {
          const open = active === i;
          return (
            <div key={i} data-testid={`audit-${i}`} className="rounded-sm overflow-hidden transition-all" style={{ background: "var(--yb-surface-1)", border: `1px solid ${a.score >= 90 ? "rgba(239,68,68,0.2)" : "var(--yb-border)"}` }}>
              <div className="p-4 cursor-pointer" onClick={() => setActive(open ? null : i)}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--yb-text-primary)" }}>{a.firm}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--yb-text-muted)" }}>{a.suburb} · {a.type}</p>
                  </div>
                  <div className="text-2xl font-black font-mono" style={{ color: a.score >= 90 ? "#ef4444" : a.score >= 80 ? "#f97316" : "#fbbf24" }}>{a.score}</div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <div className="rounded-sm px-3 py-2" style={{ background: "rgba(0,0,0,0.3)" }}>
                    <p className="text-[10px]" style={{ color: "var(--yb-text-muted)" }}>Hours/week</p>
                    <p className="text-sm font-bold" style={{ color: "#f97316" }}>{a.hours}h</p>
                  </div>
                  <div className="rounded-sm px-3 py-2" style={{ background: "rgba(0,0,0,0.3)" }}>
                    <p className="text-[10px]" style={{ color: "var(--yb-text-muted)" }}>Cost/month</p>
                    <p className="text-sm font-bold" style={{ color: "#ef4444" }}>{a.cost}</p>
                  </div>
                </div>
              </div>
              {open && (
                <div className="px-4 pb-4 pt-3 space-y-2" style={{ borderTop: "1px solid var(--yb-border)" }}>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#ef4444" }}>Gap</p>
                    <p className="text-xs mt-1" style={{ color: "var(--yb-text-secondary)" }}>{a.gap}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#22c55e" }}>Fix</p>
                    <p className="text-xs mt-1" style={{ color: "var(--yb-text-secondary)" }}>{a.fix}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
