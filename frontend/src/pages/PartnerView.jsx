import { useState } from "react";
import { Users, Lock } from "lucide-react";

const KEY = "BASHAM2026";
const FIRMS = [
  { n: "Blackburn Law Group", s: "Blackburn", t: "Corporate & M&A", sc: 95, h: 15, c: 7200 },
  { n: "Eastfield Law", s: "Croydon", t: "Commercial Litigation", sc: 94, h: 12, c: 5760 },
  { n: "Collins Street Barristers", s: "Melbourne CBD", t: "Commercial Arbitration", sc: 93, h: 13, c: 6240 },
  { n: "Maroondah Lawyers", s: "Ringwood", t: "Conveyancing", sc: 91, h: 8, c: 3840 },
  { n: "Fitzroy Street Legal", s: "St Kilda", t: "Criminal Defence", sc: 90, h: 11, c: 5280 },
  { n: "Ringwood Legal", s: "Ringwood", t: "Family Law", sc: 88, h: 6, c: 2880 },
  { n: "Box Hill Community Legal", s: "Box Hill", t: "Immigration", sc: 89, h: 10, c: 4800 },
];

export default function PartnerView() {
  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : { get: () => null };
  const [unlocked, setUnlocked] = useState(params.get("key") === KEY);
  const [input, setInput] = useState("");
  const [err, setErr] = useState(false);
  const [open, setOpen] = useState(null);

  const tryKey = () => {
    if (input.trim().toUpperCase() === KEY) setUnlocked(true);
    else { setErr(true); setTimeout(() => setErr(false), 2000); }
  };

  if (!unlocked) return (
    <div data-testid="partner-login" className="flex items-center justify-center py-32">
      <div className="text-center">
        <div className="w-12 h-12 rounded-sm mx-auto mb-4 flex items-center justify-center" style={{ background: "var(--yb-gold)" }}>
          <Lock size={20} color="#000" />
        </div>
        <h2 className="text-lg font-black mb-1" style={{ color: "var(--yb-text-primary)" }}>Partner Portal</h2>
        <p className="text-sm mb-6" style={{ color: "var(--yb-text-muted)" }}>Enter access key</p>
        <div className="flex gap-2 justify-center">
          <input data-testid="partner-key-input" value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") tryKey(); }}
            placeholder="Access key..." className="rounded-sm px-3 py-2 text-sm w-40 focus:outline-none"
            style={{ background: "var(--yb-surface-1)", border: `1px solid ${err ? "#ef4444" : "var(--yb-border)"}`, color: "var(--yb-text-primary)" }} />
          <button data-testid="partner-submit" onClick={tryKey} className="rounded-sm px-4 py-2 text-sm font-bold"
            style={{ background: "var(--yb-gold)", color: "#000" }}>Enter</button>
        </div>
        {err && <p className="text-xs mt-2" style={{ color: "#ef4444" }}>Invalid key</p>}
      </div>
    </div>
  );

  const totalC = FIRMS.reduce((s, f) => s + f.c, 0);
  return (
    <div data-testid="partner-view-page" className="max-w-5xl mx-auto px-4 py-6">
      <div className="mb-6">
        <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "var(--yb-text-muted)" }}>YABAI Partner View</p>
        <h1 className="text-xl font-black" style={{ color: "var(--yb-text-primary)" }}>Melbourne Law Firm Pipeline</h1>
        <p className="text-xs mt-1" style={{ color: "var(--yb-text-muted)" }}>14 firms · ${totalC.toLocaleString()}/mo lost · Recoverable MRR</p>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-6">
        {[
          { v: "14", l: "Firms", c: "#a78bfa" },
          { v: `${FIRMS.reduce((s, f) => s + f.h, 0)}h`, l: "Wasted/wk", c: "#ef4444" },
          { v: `$${totalC.toLocaleString()}`, l: "Lost/mo", c: "#22c55e" },
          { v: "$58,560", l: "Recoverable", c: "var(--yb-gold)" },
        ].map((s) => (
          <div key={s.l} className="rounded-sm p-3 text-center" style={{ background: "var(--yb-surface-1)", border: "1px solid var(--yb-border)" }}>
            <div className="text-lg font-black font-mono" style={{ color: s.c }}>{s.v}</div>
            <div className="text-[9px] uppercase tracking-widest mt-1" style={{ color: "var(--yb-text-muted)" }}>{s.l}</div>
          </div>
        ))}
      </div>

      <div className="space-y-1">
        {FIRMS.map((a, i) => (
          <div key={`firm-${a.n}`} data-testid={`partner-firm-${i}`} className="rounded-sm overflow-hidden" style={{ background: open === i ? "var(--yb-surface-1)" : "var(--yb-bg)", border: `1px solid ${open === i ? "rgba(255,255,255,0.15)" : "var(--yb-border)"}` }}>
            <div onClick={() => setOpen(open === i ? null : i)} className="px-4 py-3 flex items-center gap-3 cursor-pointer">
              <span className="text-[10px] font-mono w-5" style={{ color: "var(--yb-text-muted)" }}>{String(i + 1).padStart(2, "0")}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: "var(--yb-text-primary)" }}>{a.n}</p>
                <p className="text-[11px]" style={{ color: "var(--yb-text-muted)" }}>{a.s} · {a.t} · {a.h}h/wk · ${a.c.toLocaleString()}/mo</p>
              </div>
              <span className="text-xl font-black font-mono" style={{ color: a.sc >= 90 ? "#ef4444" : a.sc >= 80 ? "#f97316" : "#fbbf24" }}>{a.sc}</span>
            </div>
            {open === i && (
              <div className="px-4 pb-4 pt-2 grid grid-cols-3 gap-2" style={{ borderTop: "1px solid var(--yb-border)" }}>
                {[{ l: "Audit", v: "$97", s: "One-time" }, { l: "Implementation", v: "$1,500", s: "48hr" }, { l: "Their ROI", v: `$${a.c.toLocaleString()}`, s: "Per month" }].map((s) => (
                  <div key={s.l} className="rounded-sm p-3 text-center" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid var(--yb-border)" }}>
                    <div className="text-lg font-black font-mono" style={{ color: "var(--yb-text-primary)" }}>{s.v}</div>
                    <div className="text-[10px]" style={{ color: "var(--yb-text-muted)" }}>{s.l}</div>
                    <div className="text-[9px]" style={{ color: "var(--yb-text-muted)" }}>{s.s}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
