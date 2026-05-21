import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { Target, Zap, Play, RefreshCw } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const STRATEGIES = [
  { id: "testnet", name: "Testnet Farming", color: "#00F0FF", apy: "12.5%" },
  { id: "perp_dex", name: "DEX Points", color: "#6B2FFF", apy: "8.2%" },
  { id: "prediction", name: "Prediction Markets", color: "#F7B731", apy: "15.0%" },
  { id: "stablecoin", name: "Stablecoin Quests", color: "#22C55E", apy: "6.5%" },
];

export default function YabbaiMissions() {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("Alpha Mission");
  const [risk, setRisk] = useState(5);
  const [creating, setCreating] = useState(false);
  const tickRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/yabbai/missions`);
      setMissions(Array.isArray(res.data) ? res.data : []);
    } catch (e) { console.warn(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Tick yields every 10 seconds
  useEffect(() => {
    tickRef.current = setInterval(async () => {
      for (const m of missions) {
        if (m.status === "active") {
          try { await axios.post(`${API}/yabbai/missions/${m.id}/tick`); } catch (err) { console.error(`Tick failed for mission ${m.id}:`, err); }
        }
      }
      load();
    }, 10000);
    return () => clearInterval(tickRef.current);
  }, [missions, load]);

  const createMission = async () => {
    setCreating(true);
    try {
      await axios.post(`${API}/yabbai/missions`, { name, risk_level: risk, deposit_amount: 0, token: "YABBAI" });
      load();
      setName("Alpha Mission");
    } catch (e) { console.warn(e); }
    finally { setCreating(false); }
  };

  const apyLow = risk * 8 + 200;
  const apyHigh = risk * 15 + 400;

  return (
    <div data-testid="missions-page" className="max-w-6xl mx-auto px-4 py-6 space-y-5">
      <div>
        <h1 className="text-2xl font-black tracking-tight" style={{ fontFamily: "'Orbitron', monospace", color: "#00F0FF" }}>Missions</h1>
        <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>Launch autonomous DeFi missions with $0 capital background strategies</p>
      </div>

      {/* Mission Creator */}
      <div className="rounded-sm p-5" style={{ background: "rgba(0,240,255,0.03)", border: "1px solid rgba(0,240,255,0.15)" }}>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: "#00F0FF" }}>New Mission</p>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-[10px] uppercase tracking-widest block mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>Mission Name</label>
            <input data-testid="mission-name" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full rounded-sm px-3 py-2 text-sm font-mono focus:outline-none" style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,240,255,0.2)", color: "#F9FAFB" }} />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest block mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>Risk Level: {risk}/10</label>
            <input data-testid="mission-risk" type="range" min="1" max="10" value={risk} onChange={(e) => setRisk(parseInt(e.target.value))}
              className="w-full mt-2" style={{ accentColor: "#00F0FF" }} />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest block mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>Projected APY</label>
            <p className="text-xl font-black font-mono mt-1" style={{ color: "#00F0FF" }}>{apyLow}% - {apyHigh}%</p>
          </div>
        </div>
        <button data-testid="create-mission" onClick={createMission} disabled={creating}
          className="flex items-center gap-2 text-sm font-bold px-6 py-2.5 rounded-sm transition-all disabled:opacity-50"
          style={{ background: "#00F0FF", color: "#050808" }}>
          <Play size={14} /> {creating ? "Deploying..." : "Deploy Mission"}
        </button>
      </div>

      {/* Active Missions */}
      {missions.map((m) => (
        <div key={m.id} data-testid={`mission-${m.id}`} className="rounded-sm overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(0,240,255,0.1)" }}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target size={16} style={{ color: "#00F0FF" }} />
                <span className="text-sm font-bold" style={{ color: "#F9FAFB" }}>{m.name}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-sm" style={{ color: "#22C55E", background: "rgba(34,197,94,0.1)" }}>{m.status}</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-black font-mono" style={{ color: "#F7B731" }}>{(m.reward_tokens || 0).toFixed(4)}</span>
                <span className="text-[10px] font-mono ml-1" style={{ color: "rgba(255,255,255,0.4)" }}>YABBAI tokens</span>
              </div>
            </div>

            <div className="text-[10px] font-mono mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>
              Risk: {m.risk_level}/10 | APY: {m.apy_range} | Token: ${m.token}
            </div>

            {/* Strategy Yields */}
            <div className="grid grid-cols-4 gap-2">
              {STRATEGIES.map((s) => {
                const strat = m.strategies?.[s.id] || {};
                return (
                  <div key={s.id} className="rounded-sm p-3" style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${s.color}15` }}>
                    <p className="text-[9px] font-mono truncate mb-1" style={{ color: s.color }}>{s.name}</p>
                    <p className="text-sm font-black font-mono" style={{ color: "#F9FAFB" }}>
                      {(strat.tokens_earned || 0).toFixed(4)}
                    </p>
                    <div className="flex justify-between mt-1">
                      <span className="text-[8px]" style={{ color: "rgba(255,255,255,0.3)" }}>tokens</span>
                      <span className="text-[8px] font-mono" style={{ color: s.color }}>{s.apy} APY</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}

      {missions.length === 0 && !loading && (
        <div className="text-center py-16">
          <Target size={32} className="mx-auto mb-3" style={{ color: "rgba(0,240,255,0.3)" }} />
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>No missions deployed. Create your first mission above.</p>
        </div>
      )}
    </div>
  );
}
