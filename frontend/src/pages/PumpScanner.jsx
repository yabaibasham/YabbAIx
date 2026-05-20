import { useState, useEffect } from "react";
import axios from "axios";
import { BarChart3, ExternalLink, TrendingUp, TrendingDown, Minus } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const MOMENTUM_ICON = { UP: TrendingUp, DOWN: TrendingDown, FLAT: Minus };
const RISK_COLOR = { LOW: "#22C55E", MED: "#F7B731", HIGH: "#EF4444" };

export default function PumpScanner() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/yabbai/pump-scanner`).then((r) => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const tokens = data?.tokens || [];

  return (
    <div data-testid="pump-scanner-page" className="max-w-6xl mx-auto px-4 py-6 space-y-5">
      <div>
        <h1 className="text-2xl font-black tracking-tight" style={{ fontFamily: "'Orbitron', monospace", color: "#6B2FFF" }}>Pump Scanner</h1>
        <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>6-factor scoring across YABBAI ecosystem tokens</p>
      </div>

      <div className="space-y-2">
        {tokens.sort((a, b) => b.score - a.score).map((t) => {
          const MIcon = MOMENTUM_ICON[t.momentum] || Minus;
          return (
            <div key={t.symbol} data-testid={`token-${t.symbol}`}
              className="rounded-sm p-5 transition-all hover:translate-y-[-1px]"
              style={{ background: "rgba(255,255,255,0.02)", border: `1px solid rgba(107,47,255,0.15)` }}>
              <div className="flex items-center gap-4">
                <div className="text-3xl font-black font-mono" style={{ color: t.score >= 80 ? "#22C55E" : t.score >= 70 ? "#F7B731" : "#EF4444" }}>
                  {t.score}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-black font-mono" style={{ color: "#F9FAFB" }}>${t.symbol}</span>
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{t.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-sm font-mono" style={{ color: RISK_COLOR[t.risk], background: `${RISK_COLOR[t.risk]}15` }}>
                      {t.risk}
                    </span>
                    <MIcon size={14} style={{ color: t.momentum === "UP" ? "#22C55E" : t.momentum === "DOWN" ? "#EF4444" : "#F7B731" }} />
                  </div>
                  <div className="flex gap-4 text-[11px] font-mono" style={{ color: "rgba(255,255,255,0.4)" }}>
                    <span>Vol: ${(t.volume_24h / 1000).toFixed(0)}K</span>
                    <span>Holders: {t.holders.toLocaleString()}</span>
                    <span>Liq: ${(t.liquidity / 1000).toFixed(0)}K</span>
                  </div>
                </div>
                <a href={t.jupiter_link} target="_blank" rel="noopener noreferrer" data-testid={`swap-${t.symbol}`}
                  className="flex items-center gap-1.5 text-[11px] font-bold px-4 py-2 rounded-sm transition-all"
                  style={{ background: "rgba(107,47,255,0.15)", color: "#6B2FFF", border: "1px solid rgba(107,47,255,0.3)" }}>
                  Swap on Jupiter <ExternalLink size={12} />
                </a>
              </div>

              {/* Score Factors */}
              <div className="grid grid-cols-6 gap-2 mt-3">
                {[
                  { l: "Volume", v: Math.min(100, (t.volume_24h / 1500)) },
                  { l: "Holders", v: Math.min(100, (t.holders / 30)) },
                  { l: "Liquidity", v: Math.min(100, (t.liquidity / 1000)) },
                  { l: "Momentum", v: t.momentum === "UP" ? 90 : t.momentum === "FLAT" ? 50 : 20 },
                  { l: "Risk Adj", v: t.risk === "LOW" ? 90 : t.risk === "MED" ? 60 : 30 },
                  { l: "Overall", v: t.score },
                ].map((f) => (
                  <div key={f.l}>
                    <div className="flex justify-between text-[9px] font-mono mb-0.5">
                      <span style={{ color: "rgba(255,255,255,0.3)" }}>{f.l}</span>
                      <span style={{ color: "#6B2FFF" }}>{Math.round(f.v)}</span>
                    </div>
                    <div className="h-1 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }}>
                      <div className="h-full rounded-full" style={{ width: `${f.v}%`, background: "#6B2FFF" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
