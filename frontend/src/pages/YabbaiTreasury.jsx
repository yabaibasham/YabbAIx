import { useState, useEffect } from "react";
import axios from "axios";
import { Wallet, Copy, ExternalLink, ArrowDownToLine } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function YabbaiTreasury() {
  const [data, setData] = useState(null);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    axios.get(`${API}/yabbai/treasury`).then((r) => setData(r.data)).catch(() => {});
  }, []);

  const copy = (text, key) => { navigator.clipboard?.writeText(text); setCopied(key); setTimeout(() => setCopied(null), 2000); };

  const wallets = data?.wallets || {};
  const tokens = data?.tokens || {};
  const stats = data?.ecosystem_stats || {};

  return (
    <div data-testid="yabbai-treasury-page" className="max-w-5xl mx-auto px-4 py-6 space-y-5">
      <div>
        <h1 className="text-2xl font-black tracking-tight" style={{ fontFamily: "'Orbitron', monospace", color: "#00D4AA" }}>Treasury / Cashout</h1>
        <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>YABBAI ecosystem wallets and fund management</p>
      </div>

      {/* Wallet Cards */}
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(wallets).map(([key, w]) => (
          <div key={key} className="rounded-sm p-5" style={{
            background: key === "holding" ? "rgba(0,212,170,0.05)" : "rgba(0,240,255,0.03)",
            border: `1px solid ${key === "holding" ? "rgba(0,212,170,0.2)" : "rgba(0,240,255,0.15)"}`,
          }}>
            <div className="flex items-center gap-2 mb-3">
              <Wallet size={16} style={{ color: key === "holding" ? "#00D4AA" : "#00F0FF" }} />
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: key === "holding" ? "#00D4AA" : "#00F0FF" }}>
                {w.label}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <code className="text-[11px] font-mono flex-1 truncate" style={{ color: "rgba(255,255,255,0.6)" }}>
                {w.address || "Not configured"}
              </code>
              {w.address && (
                <button data-testid={`copy-${key}`} onClick={() => copy(w.address, key)}
                  className="shrink-0 p-1.5 rounded-sm" style={{ background: "rgba(255,255,255,0.04)" }}>
                  {copied === key ? <span className="text-[10px]" style={{ color: "#22C55E" }}>Copied</span> : <Copy size={12} style={{ color: "rgba(255,255,255,0.4)" }} />}
                </button>
              )}
            </div>
            {w.address && (
              <a href={`https://solscan.io/account/${w.address}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>
                View on Solscan <ExternalLink size={10} />
              </a>
            )}
            {key === "holding" && (
              <p className="text-[10px] mt-2" style={{ color: "rgba(0,212,170,0.6)" }}>
                Long-term secure storage. Send earned funds here for cold storage.
              </p>
            )}
            {key === "transacting" && (
              <p className="text-[10px] mt-2" style={{ color: "rgba(0,240,255,0.6)" }}>
                Active trading wallet. Used for mission execution and DeFi operations.
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Token Ecosystem */}
      <div className="rounded-sm p-5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>Token Ecosystem</p>
        <div className="grid grid-cols-5 gap-2">
          {Object.entries(tokens).map(([sym, t]) => (
            <div key={sym} className="rounded-sm p-3 text-center" style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${t.color}20` }}>
              <p className="text-sm font-black font-mono" style={{ color: t.color }}>{t.name}</p>
              <p className="text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>{t.role}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Ecosystem Stats */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { v: stats.total_missions || 0, l: "Total Missions", c: "#00F0FF" },
          { v: stats.active_missions || 0, l: "Active", c: "#22C55E" },
          { v: stats.total_users || 0, l: "Users", c: "#6B2FFF" },
          { v: stats.total_early_access || 0, l: "Early Access", c: "#F7B731" },
        ].map((s) => (
          <div key={s.l} className="rounded-sm p-3" style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${s.c}15` }}>
            <div className="text-lg font-black font-mono" style={{ color: s.c }}>{s.v}</div>
            <div className="text-[9px] uppercase tracking-widest mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>{s.l}</div>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-center" style={{ color: "rgba(255,255,255,0.15)" }}>
        YABBAI v5 Treasury. Use your connected Phantom wallet to send funds to the Secure Holding Wallet.
        Never share your private keys.
      </p>
    </div>
  );
}
