import { useState, useEffect } from "react";
import axios from "axios";
import { Zap, TrendingUp } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function YabbaiYield() {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get(`${API}/yabbai/yield-summary`).then((r) => setData(r.data)).catch(() => {});
  }, []);

  const d = data || {};
  const strategies = [
    { id: "testnet", name: "Testnet & Incentivized Network Farming", color: "#00F0FF" },
    { id: "perp_dex", name: "Perp DEX / DEX Points Farming", color: "#6B2FFF" },
    { id: "prediction", name: "Prediction Market Participation", color: "#F7B731" },
    { id: "stablecoin", name: "Passive Stablecoin Wrappers + Cross-Chain", color: "#22C55E" },
  ];

  return (
    <div data-testid="yield-page" className="max-w-5xl mx-auto px-4 py-6 space-y-5">
      <div>
        <h1 className="text-2xl font-black tracking-tight" style={{ fontFamily: "'Orbitron', monospace", color: "#22C55E" }}>Yield Dashboard</h1>
        <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>YABBAI Reward Token accrual across all strategies</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-sm p-5" style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.2)" }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "#22C55E" }}>Total Reward Tokens</p>
          <p className="text-3xl font-black font-mono" style={{ color: "#22C55E" }}>{(d.total_reward_tokens || 0).toFixed(4)}</p>
          <p className="text-[10px] font-mono mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>~$0.001 per token (simulated)</p>
        </div>
        <div className="rounded-sm p-5" style={{ background: "rgba(247,183,49,0.05)", border: "1px solid rgba(247,183,49,0.2)" }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "#F7B731" }}>Estimated USD Value</p>
          <p className="text-3xl font-black font-mono" style={{ color: "#F7B731" }}>${(d.reward_token_value_usd || 0).toFixed(6)}</p>
          <p className="text-[10px] font-mono mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>at current simulated rate</p>
        </div>
        <div className="rounded-sm p-5" style={{ background: "rgba(0,240,255,0.05)", border: "1px solid rgba(0,240,255,0.2)" }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "#00F0FF" }}>Active Missions</p>
          <p className="text-3xl font-black font-mono" style={{ color: "#00F0FF" }}>{d.missions_count || 0}</p>
          <p className="text-[10px] font-mono mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>generating rewards</p>
        </div>
      </div>

      {/* Strategy Breakdown */}
      <div className="rounded-sm p-5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>Strategy Breakdown</p>
        <div className="space-y-3">
          {strategies.map((s) => {
            const tokens = (d.by_strategy || {})[s.id] || 0;
            const maxTokens = Math.max(1, ...Object.values(d.by_strategy || {}));
            return (
              <div key={s.id}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Zap size={12} style={{ color: s.color }} />
                    <span className="text-xs font-medium" style={{ color: "#F9FAFB" }}>{s.name}</span>
                  </div>
                  <span className="text-xs font-black font-mono" style={{ color: s.color }}>{tokens.toFixed(4)}</span>
                </div>
                <div className="h-2 rounded-full" style={{ background: "rgba(255,255,255,0.04)" }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${(tokens / maxTokens) * 100}%`, background: s.color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="rounded-sm p-4" style={{ background: "rgba(247,183,49,0.03)", border: "1px solid rgba(247,183,49,0.1)" }}>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#F7B731" }}>Simulated vs Real</p>
        <p className="text-[11px] leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
          Reward tokens shown are <strong style={{ color: "#F7B731" }}>simulated projections</strong>. They accrue YABBAI Reward Tokens at ~$0.001 each.
          These can eventually be minted into real tokens when the ecosystem launches on Solana mainnet.
          Not financial advice. DYOR.
        </p>
      </div>
    </div>
  );
}
